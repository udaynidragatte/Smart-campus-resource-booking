import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { pool } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import authRoutes from "./routes/auth.routes.js";
import resourceRoutes from "./routes/resources.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import checkinRoutes from "./routes/checkins.routes.js";
import campusRoutes from "./routes/campus.routes.js";

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }
    return callback(null, config.clientUrl);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", service: "CampusBook API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/campus", campusRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`CampusBook API running on http://localhost:${config.port}`);
});

