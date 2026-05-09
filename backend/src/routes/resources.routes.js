import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import { toResource } from "../utils/mappers.js";

const router = Router();

const resourceSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["Classroom", "Lab", "Seminar Hall", "Court", "Equipment"]),
  capacity: z.number().int().positive(),
  location: z.string().min(2),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["Available", "Pending", "Booked", "Maintenance"]).default("Available"),
  projectorStatus: z.enum(["Working properly", "Needs maintenance", "Unavailable", "Not applicable"]).default("Not applicable"),
  imageUrl: z.string().url().optional(),
  utilization: z.number().int().min(0).max(100).default(0)
});

router.get("/", asyncHandler(async (req, res) => {
  const { type, status, search, projectorStatus } = req.query;
  const params = {};
  const where = [];

  if (type) {
    where.push("type = :type");
    params.type = type;
  }
  if (status) {
    where.push("status = :status");
    params.status = status;
  }
  if (projectorStatus) {
    where.push("projector_status = :projectorStatus");
    params.projectorStatus = projectorStatus;
  }
  if (search) {
    where.push("(name LIKE :search OR location LIKE :search OR type LIKE :search OR status LIKE :search OR projector_status LIKE :search)");
    params.search = `%${search}%`;
  }

  const sql = `SELECT * FROM resources ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY type, name`;
  const rows = await query(sql, params);
  res.json({ resources: rows.map(toResource) });
}));

router.get("/summary", asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT
      type,
      COUNT(*) total,
      SUM(status = 'Available') available,
      SUM(status = 'Pending') pending,
      SUM(status = 'Booked') booked,
      SUM(type = 'Classroom' AND projector_status = 'Working properly') projectors_working
    FROM resources
    GROUP BY type
    ORDER BY type
  `);
  res.json({ summary: rows });
}));

router.post("/", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  const payload = resourceSchema.parse(req.body);
  const result = await query(
    `INSERT INTO resources (name, type, capacity, location, amenities, status, projector_status, image_url, utilization)
     VALUES (:name, :type, :capacity, :location, CAST(:amenities AS JSON), :status, :projectorStatus, :imageUrl, :utilization)`,
    { ...payload, amenities: JSON.stringify(payload.amenities), imageUrl: payload.imageUrl || null }
  );
  res.status(201).json({ id: result.insertId, ...payload });
}));

router.put("/:id", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  const payload = resourceSchema.partial().parse(req.body);
  const fields = [];
  const params = { id: req.params.id };

  const fieldMap = {
    projectorStatus: "projector_status",
    imageUrl: "image_url"
  };

  for (const [key, value] of Object.entries(payload)) {
    const dbKey = fieldMap[key] || key;
    fields.push(`${dbKey} = :${key}`);
    params[key] = key === "amenities" ? JSON.stringify(value) : value;
  }

  if (!fields.length) return res.status(400).json({ message: "No fields to update" });
  await query(`UPDATE resources SET ${fields.join(", ")} WHERE id = :id`, params);
  res.json({ message: "Resource updated" });
}));

router.delete("/:id", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  await query("DELETE FROM resources WHERE id = :id", { id: req.params.id });
  res.json({ message: "Resource deleted" });
}));

export default router;
