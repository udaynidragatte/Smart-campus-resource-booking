import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";

const router = Router();

router.post("/verify", requireAuth, asyncHandler(async (req, res) => {
  const { qrPayload } = z.object({ qrPayload: z.string().min(1) }).parse(req.body);
  const parsed = JSON.parse(qrPayload);
  const rows = await query(
    `SELECT b.*, r.name resource_name, u.name user_name
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = :bookingId AND b.status = 'Approved'`,
    { bookingId: parsed.bookingId }
  );

  if (!rows.length) return res.status(404).json({ verified: false, message: "Booking not found or not approved" });
  res.json({ verified: true, booking: rows[0] });
}));

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const { bookingId } = z.object({ bookingId: z.number().int().positive() }).parse(req.body);
  const result = await query("INSERT INTO checkins (booking_id) VALUES (:bookingId)", { bookingId });
  res.status(201).json({ id: result.insertId, message: "Check-in confirmed" });
}));

router.patch("/:id/checkout", requireAuth, asyncHandler(async (req, res) => {
  await query("UPDATE checkins SET checkout_time = NOW(), status = 'Checked Out' WHERE id = :id", { id: req.params.id });
  res.json({ message: "Check-out confirmed" });
}));

export default router;
