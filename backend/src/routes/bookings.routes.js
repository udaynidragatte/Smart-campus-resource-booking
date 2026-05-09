import { Router } from "express";
import { z } from "zod";
import QRCode from "qrcode";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import { toBooking, toResource } from "../utils/mappers.js";

const router = Router();

const bookingSchema = z.object({
  resourceId: z.number().int().positive(),
  startTime: z.string().datetime().or(z.string().min(10)),
  endTime: z.string().datetime().or(z.string().min(10)),
  purpose: z.string().min(5),
  priority: z.enum(["Normal", "Faculty priority"]).default("Normal")
});

async function findConflicts(resourceId, startTime, endTime, excludeBookingId = null) {
  const params = { resourceId, startTime, endTime, excludeBookingId };
  return query(
    `SELECT b.*, r.name resource_name
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.resource_id = :resourceId
       AND b.status IN ('Pending', 'Approved')
       AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId)
       AND b.start_time < :endTime
       AND b.end_time > :startTime`,
    params
  );
}

async function findAlternatives(resourceId, startTime, endTime) {
  const resources = await query("SELECT type, capacity FROM resources WHERE id = :resourceId", { resourceId });
  const selected = resources[0];
  if (!selected) return [];

  const rows = await query(
    `SELECT r.*
     FROM resources r
     WHERE r.type = :type
       AND r.id <> :resourceId
       AND r.status = 'Available'
       AND r.capacity >= :minCapacity
       AND NOT EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.resource_id = r.id
           AND b.status IN ('Pending', 'Approved')
           AND b.start_time < :endTime
           AND b.end_time > :startTime
       )
     ORDER BY r.capacity ASC
     LIMIT 6`,
    { type: selected.type, resourceId, minCapacity: Math.max(1, selected.capacity - 20), startTime, endTime }
  );
  return rows.map(toResource);
}

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const params = {};
  const where = [];

  if (req.user.role !== "Admin") {
    where.push("b.user_id = :userId");
    params.userId = req.user.id;
  }

  if (req.query.status) {
    where.push("b.status = :status");
    params.status = req.query.status;
  }

  const rows = await query(
    `SELECT b.*, r.name resource_name, u.name user_name, u.role user_role
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     JOIN users u ON u.id = b.user_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY b.start_time DESC`,
    params
  );
  res.json({ bookings: rows.map(toBooking) });
}));

router.post("/check", requireAuth, asyncHandler(async (req, res) => {
  const payload = bookingSchema.parse(req.body);
  const conflicts = await findConflicts(payload.resourceId, payload.startTime, payload.endTime);
  const alternatives = conflicts.length ? await findAlternatives(payload.resourceId, payload.startTime, payload.endTime) : [];
  res.json({ available: conflicts.length === 0, conflicts: conflicts.map(toBooking), alternatives });
}));

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const payload = bookingSchema.parse(req.body);
  const conflicts = await findConflicts(payload.resourceId, payload.startTime, payload.endTime);

  if (conflicts.length) {
    return res.status(409).json({
      message: "Resource is already booked for this slot",
      conflicts: conflicts.map(toBooking),
      alternatives: await findAlternatives(payload.resourceId, payload.startTime, payload.endTime)
    });
  }

  const status = req.user.role === "Admin" ? "Approved" : "Pending";
  const result = await query(
    `INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose, status, priority)
     VALUES (:userId, :resourceId, :startTime, :endTime, :purpose, :status, :priority)`,
    { userId: req.user.id, ...payload, status }
  );

  res.status(201).json({ id: result.insertId, status, message: "Booking created" });
}));

router.patch("/:id/status", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  const payload = z.object({
    status: z.enum(["Pending", "Approved", "Rejected", "Cancelled"]),
    adminNotes: z.string().optional()
  }).parse(req.body);

  let qrPayload = null;
  if (payload.status === "Approved") {
    qrPayload = JSON.stringify({ bookingId: Number(req.params.id), issuedAt: new Date().toISOString() });
  }

  await query(
    "UPDATE bookings SET status = :status, admin_notes = :adminNotes, qr_payload = COALESCE(:qrPayload, qr_payload) WHERE id = :id",
    { id: req.params.id, status: payload.status, adminNotes: payload.adminNotes || null, qrPayload }
  );

  const qrCode = qrPayload ? await QRCode.toDataURL(qrPayload) : null;
  res.json({ message: "Booking status updated", qrPayload, qrCode });
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const params = { id: req.params.id, userId: req.user.id };
  const condition = req.user.role === "Admin" ? "id = :id" : "id = :id AND user_id = :userId";
  await query(`UPDATE bookings SET status = 'Cancelled' WHERE ${condition}`, params);
  res.json({ message: "Booking cancelled" });
}));

export default router;
