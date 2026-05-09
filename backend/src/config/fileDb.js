import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../database/local-db.json");

const images = {
  classroom: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
  lab: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80",
  hall: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  court: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80"
};

const seed = {
  nextIds: { users: 4, resources: 8, bookings: 4, checkins: 1, buses: 4, bus_locations: 4 },
  users: [
    { id: 1, name: "Student Demo", email: "student@campusbook.edu", password: "$2a$10$E36VVI2RABYs2l0I4ZWPq.a1Q70kVkeUYrmNKoHy/GoPfm2GOhYr6", role: "Student" },
    { id: 2, name: "Faculty Demo", email: "faculty@campusbook.edu", password: "$2a$10$JZBa3EGSfyldZWEYGl8yku8Z1IBvcBLYEEiahi1k51Z65ByDb34iG", role: "Faculty" },
    { id: 3, name: "Admin Demo", email: "admin@campusbook.edu", password: "$2a$10$Wz1f.Dl21DLcwLAu7k3y8es3BVS2UW/bN.oo0ly6ABaZF0CAw8fma", role: "Admin" }
  ],
  resources: [
    { id: 1, name: "Classroom 1", type: "Classroom", capacity: 56, location: "Academic Block, Floor 1", amenities: ["Smart Board", "Projector", "WiFi"], status: "Available", projector_status: "Working properly", image_url: images.classroom, utilization: 42 },
    { id: 2, name: "Classroom 2", type: "Classroom", capacity: 64, location: "Academic Block, Floor 1", amenities: ["Whiteboard", "Podium", "AC"], status: "Booked", projector_status: "Working properly", image_url: images.classroom, utilization: 77 },
    { id: 3, name: "Classroom 3", type: "Classroom", capacity: 72, location: "Academic Block, Floor 2", amenities: ["Projector", "Recording", "WiFi"], status: "Pending", projector_status: "Needs maintenance", image_url: images.classroom, utilization: 61 },
    { id: 4, name: "CS Lab 1", type: "Lab", capacity: 40, location: "Research Block, Floor 1", amenities: ["GPU Workstations", "Projector", "High-speed WiFi"], status: "Available", projector_status: "Not applicable", image_url: images.lab, utilization: 70 },
    { id: 5, name: "CS Lab 2", type: "Lab", capacity: 48, location: "Research Block, Floor 2", amenities: ["Lab Benches", "Safety Kit", "Whiteboard"], status: "Booked", projector_status: "Not applicable", image_url: images.lab, utilization: 82 },
    { id: 6, name: "Seminar Hall A", type: "Seminar Hall", capacity: 180, location: "Admin Block, Floor 1", amenities: ["Stage", "Audio System", "Recording"], status: "Pending", projector_status: "Not applicable", image_url: images.hall, utilization: 64 },
    { id: 7, name: "Basketball Court", type: "Court", capacity: 30, location: "Sports Complex, Floor 1", amenities: ["Floodlights", "Changing Room", "Scoreboard"], status: "Available", projector_status: "Not applicable", image_url: images.court, utilization: 49 }
  ],
  bookings: [
    { id: 1, user_id: 2, resource_id: 4, start_time: "2026-05-10 10:00:00", end_time: "2026-05-10 12:00:00", purpose: "ML workshop", status: "Approved", priority: "Faculty priority", qr_payload: "BK-1-CSLAB1", admin_notes: null },
    { id: 2, user_id: 1, resource_id: 6, start_time: "2026-05-10 14:00:00", end_time: "2026-05-10 16:00:00", purpose: "Club orientation", status: "Pending", priority: "Normal", qr_payload: null, admin_notes: null },
    { id: 3, user_id: 1, resource_id: 7, start_time: "2026-05-11 17:00:00", end_time: "2026-05-11 18:30:00", purpose: "Inter-department practice", status: "Approved", priority: "Normal", qr_payload: "BK-3-COURT", admin_notes: null }
  ],
  checkins: [],
  principal_presence: [
    { id: 1, principal_name: "Dr. Meera Krishnan", is_on_campus: true, current_location: "Administration Block, Principal Office", next_available_slot: "2:30 PM - 3:15 PM", notes: "Available for approved student/faculty appointments after lunch.", updated_at: new Date().toISOString() }
  ],
  buses: [
    { id: 1, code: "BUS-01", route_name: "Hostel Loop", driver_name: "Ravi Kumar", status: "On Route", next_stop: "Library Gate", eta_minutes: 6, speed_kmph: 28, occupancy: "34/48", stops: ["Main Gate", "Admin Block", "Library Gate", "Hostel A", "Sports Complex"] },
    { id: 2, code: "BUS-02", route_name: "City Pickup", driver_name: "Anita Rao", status: "Delayed", next_stop: "Main Gate", eta_minutes: 14, speed_kmph: 18, occupancy: "41/48", stops: ["City Stop", "Metro Point", "Main Gate", "Academic Block", "Labs Block"] },
    { id: 3, code: "BUS-03", route_name: "Labs Express", driver_name: "Suresh Nair", status: "Arriving", next_stop: "Research Block", eta_minutes: 2, speed_kmph: 12, occupancy: "22/42", stops: ["Main Gate", "CSE Block", "Research Block", "Seminar Hall", "Parking Bay"] }
  ],
  bus_locations: [
    { id: 1, bus_id: 1, latitude: 17.445, longitude: 78.349, recorded_at: new Date().toISOString() },
    { id: 2, bus_id: 2, latitude: 17.452, longitude: 78.356, recorded_at: new Date().toISOString() },
    { id: 3, bus_id: 3, latitude: 17.441, longitude: 78.346, recorded_at: new Date().toISOString() }
  ]
};

async function load() {
  try {
    return JSON.parse(await fs.readFile(dbPath, "utf8"));
  } catch {
    await save(seed);
    return structuredClone(seed);
  }
}

async function save(db) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

function addBookingJoins(db, booking) {
  const resource = db.resources.find((item) => item.id === booking.resource_id);
  const user = db.users.find((item) => item.id === booking.user_id);
  return { ...booking, resource_name: resource?.name, user_name: user?.name, user_role: user?.role };
}

function overlaps(booking, resourceId, startTime, endTime, excludeBookingId = null) {
  return booking.resource_id === Number(resourceId)
    && ["Pending", "Approved"].includes(booking.status)
    && (!excludeBookingId || booking.id !== Number(excludeBookingId))
    && booking.start_time < endTime
    && booking.end_time > startTime;
}

export async function fileQuery(sql, params = {}) {
  const db = await load();
  const normalized = sql.replace(/\s+/g, " ").trim();

  if (normalized === "SELECT 1") return [{ 1: 1 }];

  if (normalized.startsWith("SELECT * FROM users WHERE email")) {
    return db.users.filter((user) => user.email === params.email);
  }

  if (normalized.startsWith("SELECT id, name, email, role FROM users WHERE id")) {
    return db.users.filter((user) => user.id === Number(params.id)).map(({ id, name, email, role }) => ({ id, name, email, role }));
  }

  if (normalized.startsWith("INSERT INTO users")) {
    if (db.users.some((user) => user.email === params.email)) {
      const error = new Error("Email already exists");
      error.status = 409;
      throw error;
    }
    const id = db.nextIds.users++;
    db.users.push({ id, name: params.name, email: params.email, password: params.password, role: params.role });
    await save(db);
    return { insertId: id };
  }

  if (normalized.startsWith("SELECT * FROM resources")) {
    let rows = [...db.resources];
    if (params.type) rows = rows.filter((item) => item.type === params.type);
    if (params.status) rows = rows.filter((item) => item.status === params.status);
    if (params.projectorStatus) rows = rows.filter((item) => item.projector_status === params.projectorStatus);
    if (params.search) {
      const query = params.search.replaceAll("%", "").toLowerCase();
      rows = rows.filter((item) => [item.name, item.location, item.type, item.status, item.projector_status].join(" ").toLowerCase().includes(query));
    }
    return rows.sort((a, b) => `${a.type}${a.name}`.localeCompare(`${b.type}${b.name}`));
  }

  if (normalized.includes("FROM resources") && normalized.includes("GROUP BY type")) {
    return Object.values(db.resources.reduce((acc, item) => {
      acc[item.type] ||= { type: item.type, total: 0, available: 0, pending: 0, booked: 0, projectors_working: 0 };
      acc[item.type].total++;
      if (item.status === "Available") acc[item.type].available++;
      if (item.status === "Pending") acc[item.type].pending++;
      if (item.status === "Booked") acc[item.type].booked++;
      if (item.type === "Classroom" && item.projector_status === "Working properly") acc[item.type].projectors_working++;
      return acc;
    }, {}));
  }

  if (normalized.startsWith("INSERT INTO resources")) {
    const id = db.nextIds.resources++;
    db.resources.push({ id, name: params.name, type: params.type, capacity: params.capacity, location: params.location, amenities: JSON.parse(params.amenities), status: params.status, projector_status: params.projectorStatus, image_url: params.imageUrl, utilization: params.utilization });
    await save(db);
    return { insertId: id };
  }

  if (normalized.startsWith("SELECT type, capacity FROM resources WHERE id")) {
    return db.resources.filter((item) => item.id === Number(params.resourceId)).map(({ type, capacity }) => ({ type, capacity }));
  }

  if (normalized.startsWith("SELECT r.* FROM resources r WHERE")) {
    const selected = db.resources.find((item) => item.id === Number(params.resourceId));
    if (!selected) return [];
    return db.resources
      .filter((item) => item.type === params.type && item.id !== Number(params.resourceId) && item.status === "Available" && item.capacity >= params.minCapacity)
      .filter((item) => !db.bookings.some((booking) => overlaps(booking, item.id, params.startTime, params.endTime)))
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 6);
  }

  if (normalized.startsWith("SELECT b.*, r.name resource_name FROM bookings")) {
    return db.bookings.filter((booking) => overlaps(booking, params.resourceId, params.startTime, params.endTime, params.excludeBookingId)).map((booking) => {
      const resource = db.resources.find((item) => item.id === booking.resource_id);
      return { ...booking, resource_name: resource?.name };
    });
  }

  if (normalized.startsWith("SELECT b.*, r.name resource_name, u.name user_name")) {
    let rows = db.bookings.map((booking) => addBookingJoins(db, booking));
    if (params.userId) rows = rows.filter((item) => item.user_id === Number(params.userId));
    if (params.status) rows = rows.filter((item) => item.status === params.status);
    return rows.sort((a, b) => String(b.start_time).localeCompare(String(a.start_time)));
  }

  if (normalized.startsWith("INSERT INTO bookings")) {
    const id = db.nextIds.bookings++;
    db.bookings.push({ id, user_id: params.userId, resource_id: params.resourceId, start_time: params.startTime, end_time: params.endTime, purpose: params.purpose, status: params.status, priority: params.priority, qr_payload: null, admin_notes: null });
    await save(db);
    return { insertId: id };
  }

  if (normalized.startsWith("UPDATE bookings SET status = :status")) {
    const booking = db.bookings.find((item) => item.id === Number(params.id));
    if (booking) Object.assign(booking, { status: params.status, admin_notes: params.adminNotes, qr_payload: params.qrPayload || booking.qr_payload });
    await save(db);
    return { affectedRows: booking ? 1 : 0 };
  }

  if (normalized.startsWith("UPDATE bookings SET status = 'Cancelled'")) {
    const booking = db.bookings.find((item) => item.id === Number(params.id) && (!params.userId || item.user_id === Number(params.userId)));
    if (booking) booking.status = "Cancelled";
    await save(db);
    return { affectedRows: booking ? 1 : 0 };
  }

  if (normalized.startsWith("SELECT * FROM principal_presence")) {
    return [...db.principal_presence].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at))).slice(0, 1);
  }

  if (normalized.startsWith("SELECT b.*, bl.latitude")) {
    return db.buses.map((bus) => {
      const locations = db.bus_locations.filter((item) => item.bus_id === bus.id).sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at)));
      return { ...bus, ...locations[0] };
    }).sort((a, b) => a.code.localeCompare(b.code));
  }

  if (normalized.startsWith("SELECT COUNT(*) totalBookings")) {
    return [{ totalBookings: db.bookings.length, pendingApprovals: db.bookings.filter((item) => item.status === "Pending").length, approvedBookings: db.bookings.filter((item) => item.status === "Approved").length, cancelledBookings: db.bookings.filter((item) => item.status === "Cancelled").length }];
  }

  if (normalized.includes("DATE_FORMAT(start_time")) return [];
  if (normalized.includes("COUNT(*) approved")) return [{ approved: db.bookings.filter((item) => item.status === "Approved").length, no_shows: 0 }];
  if (normalized.includes("JOIN resources r ON r.id = b.resource_id GROUP BY r.type")) return [];

  throw new Error(`Local database query not implemented: ${normalized}`);
}
