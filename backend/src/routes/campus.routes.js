import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";

const router = Router();

router.get("/principal", requireAuth, asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM principal_presence ORDER BY updated_at DESC LIMIT 1");
  res.json({ principal: rows[0] || null });
}));

router.patch("/principal", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  const payload = z.object({
    principalName: z.string().min(2).optional(),
    isOnCampus: z.boolean().optional(),
    currentLocation: z.string().optional(),
    nextAvailableSlot: z.string().optional(),
    notes: z.string().optional()
  }).parse(req.body);

  await query(
    `UPDATE principal_presence SET
      principal_name = COALESCE(:principalName, principal_name),
      is_on_campus = COALESCE(:isOnCampus, is_on_campus),
      current_location = COALESCE(:currentLocation, current_location),
      next_available_slot = COALESCE(:nextAvailableSlot, next_available_slot),
      notes = COALESCE(:notes, notes)
     ORDER BY updated_at DESC LIMIT 1`,
    {
      principalName: payload.principalName ?? null,
      isOnCampus: payload.isOnCampus ?? null,
      currentLocation: payload.currentLocation ?? null,
      nextAvailableSlot: payload.nextAvailableSlot ?? null,
      notes: payload.notes ?? null
    }
  );
  res.json({ message: "Principal status updated" });
}));

router.get("/buses", requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT b.*, bl.latitude, bl.longitude, bl.recorded_at
    FROM buses b
    LEFT JOIN bus_locations bl ON bl.id = (
      SELECT id FROM bus_locations WHERE bus_id = b.id ORDER BY recorded_at DESC LIMIT 1
    )
    ORDER BY b.code
  `);
  res.json({ buses: rows.map((bus) => ({ ...bus, stops: typeof bus.stops === "string" ? JSON.parse(bus.stops) : bus.stops })) });
}));

router.post("/buses/:id/location", requireAuth, requireRole("Admin", "Faculty"), asyncHandler(async (req, res) => {
  const payload = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    status: z.enum(["On Route", "Delayed", "Arriving", "Idle", "Offline"]).optional(),
    nextStop: z.string().optional(),
    etaMinutes: z.number().int().min(0).optional(),
    speedKmph: z.number().int().min(0).optional()
  }).parse(req.body);

  await query("INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES (:busId, :latitude, :longitude)", {
    busId: req.params.id,
    latitude: payload.latitude,
    longitude: payload.longitude
  });

  await query(
    `UPDATE buses SET
      status = COALESCE(:status, status),
      next_stop = COALESCE(:nextStop, next_stop),
      eta_minutes = COALESCE(:etaMinutes, eta_minutes),
      speed_kmph = COALESCE(:speedKmph, speed_kmph)
     WHERE id = :busId`,
    {
      busId: req.params.id,
      status: payload.status ?? null,
      nextStop: payload.nextStop ?? null,
      etaMinutes: payload.etaMinutes ?? null,
      speedKmph: payload.speedKmph ?? null
    }
  );

  res.status(201).json({ message: "Bus GPS location updated" });
}));

export default router;
