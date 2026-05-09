import { Router } from "express";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";

const router = Router();

router.get("/overview", requireAuth, requireRole("Admin"), asyncHandler(async (req, res) => {
  const [totals] = await query(`
    SELECT
      COUNT(*) totalBookings,
      SUM(status = 'Pending') pendingApprovals,
      SUM(status = 'Approved') approvedBookings,
      SUM(status = 'Cancelled') cancelledBookings
    FROM bookings
  `);

  const peakHours = await query(`
    SELECT DATE_FORMAT(start_time, '%l %p') hour, COUNT(*) usage_count
    FROM bookings
    GROUP BY HOUR(start_time), DATE_FORMAT(start_time, '%l %p')
    ORDER BY HOUR(start_time)
  `);

  const utilization = await query(`
    SELECT type, COUNT(*) total, ROUND(AVG(utilization), 0) avg_utilization
    FROM resources
    GROUP BY type
    ORDER BY avg_utilization DESC
  `);

  const mostUsed = await query(`
    SELECT r.type, COUNT(*) booking_count
    FROM bookings b
    JOIN resources r ON r.id = b.resource_id
    GROUP BY r.type
    ORDER BY booking_count DESC
    LIMIT 1
  `);

  const [checkinStats] = await query(`
    SELECT
      COUNT(*) approved,
      SUM(c.id IS NULL) no_shows
    FROM bookings b
    LEFT JOIN checkins c ON c.booking_id = b.id
    WHERE b.status = 'Approved'
  `);

  const noShowRate = checkinStats?.approved ? Number(((checkinStats.no_shows / checkinStats.approved) * 100).toFixed(1)) : 0;

  res.json({ totals, peakHours, utilization, mostUsed: mostUsed[0] || null, noShowRate });
}));

export default router;
