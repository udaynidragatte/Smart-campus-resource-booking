import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, CalendarDays, Check, Clock, DoorOpen, Filter, MapPin, Plus, QrCode, Search, Users, X, Bus, Navigation, UserCheck, Radio, Timer, Route } from "lucide-react";
import { bookings as mockBookings, calendarEvents, campusBuses as mockCampusBuses, chartData, peakHours as mockPeakHours, principalStatus as mockPrincipalStatus, resources as mockResources } from "../data/mockData";
import { api, getStoredSession } from "../services/api";

const statusStyle = {
  Available: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Booked: "bg-red-100 text-red-700",
  Reserved: "bg-blue-100 text-blue-700",
  Occupied: "bg-red-100 text-red-700",
  "Approval Needed": "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-slate-100 text-slate-700"
};

const statusFilters = [
  { id: "all", label: "All" },
  { id: "available", label: "Available", statuses: ["Available"] },
  { id: "pending", label: "Pending", statuses: ["Pending", "Reserved", "Approval Needed"] },
  { id: "booked", label: "Booked", statuses: ["Booked", "Occupied"] }
];

const resourceCategories = [
  {
    id: "classrooms",
    label: "Classrooms",
    types: ["Classroom"],
    description: "Lecture rooms and smart classrooms",
    accent: "from-blue-600 to-cyan-500"
  },
  {
    id: "labs",
    label: "Labs",
    types: ["Lab"],
    description: "Computer, research, and innovation labs",
    accent: "from-violet-600 to-fuchsia-500"
  },
  {
    id: "seminar-halls",
    label: "Seminar Halls",
    types: ["Seminar Hall"],
    description: "Auditoriums and event halls",
    accent: "from-amber-500 to-orange-500"
  },
  {
    id: "courts",
    label: "Courts",
    types: ["Court"],
    description: "Indoor and outdoor sports courts",
    accent: "from-emerald-600 to-teal-500"
  }
];

function normalizeResource(resource) {
  return {
    ...resource,
    image: resource.image || resource.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    amenities: Array.isArray(resource.amenities) ? resource.amenities : []
  };
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).replace(",", "");
}

function normalizeBooking(booking) {
  return {
    ...booking,
    resource: booking.resource || booking.resourceName,
    user: booking.user || booking.userName || "Current user",
    role: booking.role || booking.userRole || "",
    start: booking.start || formatDateTime(booking.startTime),
    end: booking.end || formatDateTime(booking.endTime)
  };
}

function normalizeBus(bus) {
  return {
    id: bus.id,
    name: bus.name || bus.code,
    route: bus.route || bus.route_name,
    driver: bus.driver || bus.driver_name,
    status: bus.status,
    eta: bus.eta || `${bus.eta_minutes ?? 0} min`,
    speed: bus.speed || `${bus.speed_kmph ?? 0} km/h`,
    occupancy: bus.occupancy,
    latitude: bus.latitude,
    longitude: bus.longitude,
    nextStop: bus.nextStop || bus.next_stop,
    stops: Array.isArray(bus.stops) ? bus.stops : []
  };
}

function useResources() {
  const [items, setItems] = useState(mockResources.map(normalizeResource));

  useEffect(() => {
    let active = true;
    api.resources()
      .then((data) => {
        if (active && data.resources?.length) setItems(data.resources.map(normalizeResource));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return items;
}

function useBookings() {
  const [items, setItems] = useState(mockBookings.map(normalizeBooking));

  useEffect(() => {
    if (!getStoredSession()) return;

    let active = true;
    api.bookings()
      .then((data) => {
        if (active) setItems((data.bookings || []).map(normalizeBooking));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return items;
}

function usePrincipalStatus() {
  const [status, setStatus] = useState(mockPrincipalStatus);

  useEffect(() => {
    if (!getStoredSession()) return;

    let active = true;
    api.principal()
      .then(({ principal }) => {
        if (!active || !principal) return;
        setStatus({
          name: principal.principal_name,
          role: "Principal",
          isOnCampus: Boolean(principal.is_on_campus),
          location: principal.current_location,
          lastUpdated: formatDateTime(principal.updated_at),
          nextAvailableSlot: principal.next_available_slot,
          notes: principal.notes
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return status;
}

function useCampusBuses() {
  const [buses, setBuses] = useState(mockCampusBuses);

  useEffect(() => {
    if (!getStoredSession()) return;

    let active = true;
    api.buses()
      .then((data) => {
        if (active && data.buses?.length) setBuses(data.buses.map(normalizeBus));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return buses;
}

function getCategoryResources(category, resourcesList = mockResources) {
  return resourcesList.filter((resource) => category.types.includes(resource.type));
}

function getCategoryStats(category, resourcesList = mockResources) {
  const categoryResources = getCategoryResources(category, resourcesList);
  return {
    total: categoryResources.length,
    available: categoryResources.filter((resource) => resource.status === "Available").length,
    pending: categoryResources.filter((resource) => ["Pending", "Reserved", "Approval Needed"].includes(resource.status)).length,
    booked: categoryResources.filter((resource) => ["Booked", "Occupied"].includes(resource.status)).length
  };
}

function matchesStatusFilter(resource, filterId) {
  if (filterId === "projector-working") return resource.type === "Classroom" && resource.projectorStatus === "Working properly";
  const filter = statusFilters.find((item) => item.id === filterId);
  return !filter?.statuses || filter.statuses.includes(resource.status);
}

function getProjectorWorkingCount(resourcesList) {
  return resourcesList.filter((resource) => resource.type === "Classroom" && resource.projectorStatus === "Working properly").length;
}

function matchesSearch(resource, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [
    resource.name,
    resource.type,
    resource.status,
    resource.location,
    resource.projectorStatus,
    String(resource.capacity),
    ...resource.amenities
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}
export function StatCard({ icon: Icon, label, value, detail, color = "bg-campus-blue" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-campus-ink">{value}</p></div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${color}`}><Icon size={20} /></div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export function DashboardPage({ setActivePage, role, searchQuery }) {
  const resources = useResources();
  const bookings = useBookings();
  const availableCount = resources.filter((resource) => resource.status === "Available").length;
  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DoorOpen} label="Available resources" value={availableCount} detail={`${resources.length} total resources`} />
        <StatCard icon={CalendarDays} label="Bookings" value={bookings.length} detail="Loaded from MySQL API when available" color="bg-campus-teal" />
        <StatCard icon={Clock} label="Pending approvals" value={pendingCount} detail="Awaiting admin decision" color="bg-campus-gold" />
        <StatCard icon={Users} label="Active users" value="1.8k" detail="Across students and faculty" color="bg-campus-ink" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">Live booking trend</h2><button onClick={() => setActivePage("analytics")} className="text-sm font-bold text-campus-blue">View analytics</button></div>
          <div className="h-72"><ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="bookingFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="day"/><YAxis/><Tooltip/><Area type="monotone" dataKey="bookings" stroke="#2563eb" fill="url(#bookingFill)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-5 text-xl font-black">Upcoming bookings</h2>
          <div className="space-y-3">{bookings.slice(0, 3).map((booking) => <BookingRow key={booking.id} booking={booking} />)}</div>
        </div>
      </div>

      <ResourceGrid setActivePage={setActivePage} compact searchQuery={searchQuery} />
    </div>
  );
}

export function ResourceGrid({ setActivePage, compact = false, searchQuery = "", setSearchQuery }) {
  const resources = useResources();
  const [selectedCategoryId, setSelectedCategoryId] = useState(resourceCategories[0].id);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const selectedCategory = resourceCategories.find((category) => category.id === selectedCategoryId) || resourceCategories[0];
  const selectedStats = useMemo(() => getCategoryStats(selectedCategory, resources), [selectedCategory, resources]);
  const categoryResources = getCategoryResources(selectedCategory, resources);
  const statusMatchedResources = categoryResources.filter((resource) => matchesStatusFilter(resource, selectedStatusFilter));
  const visibleResources = statusMatchedResources.filter((resource) => matchesSearch(resource, searchQuery));
  const isClassroomCategory = selectedCategory.id === "classrooms";
  const classroomStatusFilters = isClassroomCategory ? [...statusFilters, { id: "projector-working", label: "Projectors working" }] : statusFilters;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div><h2 className="text-2xl font-black">Campus resources</h2><p className="text-sm text-slate-500">Choose classrooms, labs, seminar halls, or courts to see total, available, pending, and booked resources.</p></div>
        <div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"><Filter size={16}/> Filters</button><button onClick={() => setActivePage("booking")} className="rounded-xl bg-campus-blue px-4 py-2 text-sm font-black text-white">Book now</button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resourceCategories.map((category) => {
          const stats = getCategoryStats(category, resources);
          const active = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`rounded-2xl p-5 text-left shadow-soft transition hover:-translate-y-1 ${active ? "bg-campus-ink text-white" : "bg-white text-campus-ink"}`}
            >
              <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${category.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{category.label}</h3>
                  <p className={`mt-1 text-sm ${active ? "text-white/70" : "text-slate-500"}`}>{category.description}</p>
                </div>
                <span className={`rounded-xl px-3 py-1 text-sm font-black ${active ? "bg-white/15" : "bg-campus-cloud"}`}>{stats.total}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <CategoryMetric label={`Total ${selectedCategory.label}`} value={selectedStats.total} tone="bg-campus-ink text-white" />
        <CategoryMetric label="Available" value={selectedStats.available} tone="bg-emerald-50 text-emerald-700" />
        <CategoryMetric label="Pending" value={selectedStats.pending} tone="bg-amber-50 text-amber-700" />
        <CategoryMetric label="Booked" value={selectedStats.booked} tone="bg-red-50 text-red-700" />
        {isClassroomCategory && <CategoryMetric label="Projectors working" value={`${getProjectorWorkingCount(categoryResources)}/${selectedStats.total}`} tone="bg-violet-50 text-violet-700" />}
      </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-black">{selectedCategory.label} list</h3>
          <p className="text-sm font-bold text-slate-500">Showing {visibleResources.length} resources{searchQuery ? ` for "${searchQuery}"` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {setSearchQuery && <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold outline-none focus:border-campus-blue md:w-72" placeholder="Search this category..." />}
          {classroomStatusFilters.map((filter) => {
            const active = selectedStatusFilter === filter.id;
            const count = filter.id === "all" ? categoryResources.length : categoryResources.filter((resource) => matchesStatusFilter(resource, filter.id)).length;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedStatusFilter(filter.id)}
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${active ? "bg-campus-blue text-white shadow-soft" : "bg-campus-cloud text-slate-600 hover:bg-slate-200"}`}
              >
                {filter.label} <span className="ml-1 opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleResources.map((resource) => <ResourceCard key={resource.id} resource={resource} setActivePage={setActivePage} />)}
      </div>
      {visibleResources.length === 0 && <div className="rounded-2xl bg-white p-8 text-center shadow-soft"><p className="text-lg font-black text-campus-ink">No resources found</p><p className="mt-2 text-sm text-slate-500">Try another search term or filter.</p></div>}
    </div>
  );
}

function CategoryMetric({ label, value, tone }) {
  return (
    <div className={`rounded-2xl p-5 shadow-soft ${tone}`}>
      <p className="text-sm font-black opacity-75">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function ResourceCard({ resource, setActivePage }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1">
      <img className="h-44 w-full object-cover" src={resource.image} alt={resource.name} />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{resource.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14}/>{resource.location}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle[resource.status] || "bg-slate-100 text-slate-700"}`}>{resource.status}</span></div>
        <div className="mb-4 flex flex-wrap gap-2">{resource.amenities.slice(0, 3).map((item) => <span key={item} className="rounded-lg bg-campus-cloud px-2 py-1 text-xs font-bold text-slate-600">{item}</span>)}</div>
        <div className="mb-4 flex items-center justify-between text-sm"><span className="font-bold text-slate-500">Capacity {resource.capacity}</span><span className="font-bold text-campus-teal">{resource.utilization}% utilized</span></div>{resource.type === "Classroom" && <div className={`mb-4 rounded-xl px-3 py-2 text-sm font-black ${resource.projectorStatus === "Working properly" ? "bg-violet-50 text-violet-700" : resource.projectorStatus === "Needs maintenance" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>Projector: {resource.projectorStatus}</div>}
        <div className="grid gap-2"><button onClick={() => setActivePage("resource-details")} className="w-full rounded-xl bg-campus-ink px-4 py-3 font-black text-white">View details</button>{resource.status === "Booked" && <button onClick={() => setActivePage("booking")} className="w-full rounded-xl border border-campus-blue px-4 py-3 font-black text-campus-blue">View similar {resource.type === "Classroom" ? "classrooms" : `${resource.type.toLowerCase()}s`}</button>}</div>
      </div>
    </div>
  );
}

export function ResourceDetailsPage({ setActivePage }) {
  const resources = useResources();
  const resource = resources[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl bg-white p-5 shadow-soft"><img className="mb-5 h-72 w-full rounded-2xl object-cover" src={resource.image} alt={resource.name}/><h2 className="text-3xl font-black">{resource.name}</h2><p className="mt-2 text-slate-500">{resource.location}</p><div className="mt-5 grid grid-cols-2 gap-3"><Info label="Type" value={resource.type}/><Info label="Capacity" value={resource.capacity}/><Info label="Status" value={resource.status}/><Info label="Utilization" value={`${resource.utilization}%`}/></div><div className="mt-5 flex flex-wrap gap-2">{resource.amenities.map((item) => <span key={item} className="rounded-xl bg-campus-mint px-3 py-2 text-sm font-bold text-campus-teal">{item}</span>)}</div><button onClick={() => setActivePage("booking")} className="mt-6 w-full rounded-xl bg-campus-blue py-3 font-black text-white">Book this resource</button></div>
      <CalendarPanel />
    </div>
  );
}

function CalendarPanel() {
  return <div className="rounded-2xl bg-white p-5 shadow-soft"><h2 className="mb-5 text-xl font-black">Availability calendar</h2><FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" height="auto" events={calendarEvents} headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }} /></div>;
}

function Info({ label, value }) { return <div className="rounded-xl bg-campus-cloud p-4"><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-black">{value}</p></div>; }

export function BookingPage() {
  const resources = useResources();
  const [date, setDate] = useState("2026-05-10");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [priority, setPriority] = useState("Normal");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const firstBookedClassroom = resources.find((resource) => resource.type === "Classroom" && resource.status === "Booked") || resources[0];
  const [selectedResourceId, setSelectedResourceId] = useState(firstBookedClassroom.id);
  const selectedResource = resources.find((resource) => resource.id === Number(selectedResourceId)) || firstBookedClassroom;
  const isBooked = selectedResource.status === "Booked" || selectedResource.status === "Occupied";
  const similarResources = resources
    .filter((resource) => resource.type === selectedResource.type && resource.status === "Available" && resource.id !== selectedResource.id)
    .slice(0, 6);
  const similarLabel = selectedResource.type === "Classroom" ? "classrooms" : `${selectedResource.type.toLowerCase()}s`;

  async function submitBooking() {
    setMessage("");
    if (!getStoredSession()) {
      setMessage("Please login with a database account before creating a booking.");
      return;
    }

    try {
      await api.createBooking({
        resourceId: Number(selectedResourceId),
        startTime: `${date} ${startTime}:00`,
        endTime: `${date} ${endTime}:00`,
        purpose,
        priority
      });
      setMessage("Booking request saved to MySQL.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black">Create booking request</h2><p className="mt-1 text-sm text-slate-500">Conflict detection runs before submission and suggests alternatives automatically.</p>
        <div className="mt-6 space-y-4">
          <FormField label="Resource">
            <select value={selectedResourceId} onChange={(event) => setSelectedResourceId(event.target.value)}>
              {resources.slice(0, 92).map((resource) => (
                <option key={resource.id} value={resource.id}>{resource.name} - {resource.status}</option>
              ))}
            </select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2"><FormField label="Date"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></FormField><FormField label="Priority"><select value={priority} onChange={(event) => setPriority(event.target.value)}><option>Normal</option><option>Faculty priority</option></select></FormField></div>
          <div className="grid gap-4 md:grid-cols-2"><FormField label="Start time"><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></FormField><FormField label="End time"><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></FormField></div>
          <FormField label="Purpose"><textarea rows="4" value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Workshop, lecture, club event, practice session..." /></FormField>

          {isBooked ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="mb-1 flex items-center gap-2 font-black"><AlertTriangle size={16}/> Already booked</div>
              {selectedResource.name} is already booked for this slot. You can pick another slot or view similar {similarLabel} that are available now.
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><div className="mb-1 font-black">Available</div>{selectedResource.name} is available for the selected time slot.</div>
          )}

          {isBooked && (
            <div className="rounded-2xl bg-campus-cloud p-4">
              <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                  <p className="font-black text-campus-ink">Similar available {similarLabel}</p>
                  <p className="text-sm text-slate-500">Same category, available status, ready to select.</p>
                </div>
                <button type="button" className="rounded-xl bg-campus-ink px-4 py-2 text-sm font-black text-white">View similar {similarLabel}</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {similarResources.map((resource) => (
                  <button key={resource.id} type="button" onClick={() => setSelectedResourceId(resource.id)} className="rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-black">{resource.name}</p><p className="mt-1 text-xs text-slate-500">{resource.location} - Capacity {resource.capacity}</p></div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">Available</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {message && <div className="rounded-2xl bg-campus-cloud p-4 text-sm font-black text-campus-ink">{message}</div>}
          <button onClick={submitBooking} className={`w-full rounded-xl py-3 font-black text-white ${isBooked ? "bg-slate-400" : "bg-campus-blue"}`}>{isBooked ? "Choose an available resource" : "Check availability and submit"}</button>
        </div>
      </div>
      <CalendarPanel />
    </div>
  );
}

function FormField({ label, children }) { return <label className="block"><span className="mb-2 block text-sm font-black text-slate-600">{label}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:px-4 [&_input]:py-3 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:px-4 [&_select]:py-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:px-4 [&_textarea]:py-3">{children}</div></label>; }

function BookingRow({ booking }) { return <div className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{booking.resource}</p><p className="text-sm text-slate-500">{booking.start} - {booking.end?.split(" ").at(-1)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle[booking.status] || "bg-slate-100 text-slate-700"}`}>{booking.status}</span></div><p className="mt-2 text-sm text-slate-500">{booking.purpose}</p></div>; }

export function MyBookingsPage({ role }) {
  const bookings = useBookings();
  const showQr = role !== "Admin";
  return <div className="grid gap-5 xl:grid-cols-2">{bookings.map((booking) => <div key={booking.id} className="rounded-2xl bg-white p-5 shadow-soft"><BookingRow booking={booking}/>{showQr && booking.status === "Approved" && <div className="mt-5 flex items-center gap-5 rounded-2xl bg-campus-cloud p-4"><QRCodeSVG value={JSON.stringify({ bookingId: booking.id, resource: booking.resource })} size={96}/><div><p className="font-black">QR check-in ready</p><p className="mt-1 text-sm text-slate-500">Show this QR at the resource entrance for verification.</p></div></div>}<button className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-600">Cancel booking</button></div>)}</div>;
}

export function AdminDashboardPage() {
  const resources = useResources();
  const bookings = useBookings();
  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;
  return (
    <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard icon={CalendarDays} label="Total bookings" value={bookings.length} detail="From booking records"/><StatCard icon={Clock} label="Pending" value={pendingCount} detail="Needs admin decision" color="bg-campus-gold"/><StatCard icon={DoorOpen} label="Resources" value={resources.length} detail="Stored in MySQL resources" color="bg-campus-teal"/><StatCard icon={Check} label="Check-ins" value="Live" detail="QR endpoint connected" color="bg-campus-ink"/></div><AnalyticsPage /></div>
  );
}

export function ResourceManagementPage() {
  const resources = useResources();
  return <div className="rounded-2xl bg-white p-5 shadow-soft"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">Resource management</h2><button className="inline-flex items-center gap-2 rounded-xl bg-campus-blue px-4 py-2 font-black text-white"><Plus size={16}/> Add resource</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-campus-cloud text-xs uppercase text-slate-500"><tr><th className="p-3">Name</th><th>Type</th><th>Capacity</th><th>Status</th><th>Utilization</th><th>Actions</th></tr></thead><tbody>{resources.map((r) => <tr key={r.id} className="border-b border-slate-100"><td className="p-3 font-black">{r.name}</td><td>{r.type}</td><td>{r.capacity}</td><td><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle[r.status]}`}>{r.status}</span></td><td>{r.utilization}%</td><td><button className="font-bold text-campus-blue">Edit</button></td></tr>)}</tbody></table></div></div>;
}

export function ApprovalsPage() {
  const bookings = useBookings();
  return <div className="rounded-2xl bg-white p-5 shadow-soft"><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center"><h2 className="text-2xl font-black">Booking approvals</h2><div className="flex gap-2"><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"><Search size={15} className="inline"/> Search</button><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"><Filter size={15} className="inline"/> Filter</button></div></div><div className="space-y-3">{bookings.map((booking) => <div key={booking.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center"><div><p className="font-black">{booking.resource}</p><p className="text-sm text-slate-500">{booking.user} - {booking.role} - {booking.start}</p><p className="text-sm text-slate-500">{booking.purpose}</p></div><div className="flex gap-2"><button className="rounded-xl bg-emerald-600 px-4 py-2 font-black text-white"><Check size={16}/></button><button className="rounded-xl bg-red-600 px-4 py-2 font-black text-white"><X size={16}/></button></div></div>)}</div></div>;
}

export function AnalyticsPage() {
  const resources = useResources();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-soft"><h2 className="mb-5 text-xl font-black">Peak usage hours</h2><div className="h-72"><ResponsiveContainer><BarChart data={mockPeakHours}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="hour"/><YAxis/><Tooltip/><Bar dataKey="usage" radius={[8,8,0,0]} fill="#2563eb"/></BarChart></ResponsiveContainer></div></div>
      <div className="rounded-2xl bg-white p-5 shadow-soft"><h2 className="mb-5 text-xl font-black">Resource utilization</h2><div className="h-72"><ResponsiveContainer><PieChart><Pie data={resources.slice(0,4)} dataKey="utilization" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>{["#2563eb", "#0f766e", "#f59e0b", "#172033"].map((c) => <Cell key={c} fill={c}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></div>
      <div className="rounded-2xl bg-white p-5 shadow-soft xl:col-span-2"><h2 className="mb-3 text-xl font-black">Reports section</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="No-show rate" value="6.4%"/><Info label="Most used" value="Classrooms"/><Info label="Avg approval" value="18 min"/></div></div>
    </div>
  );
}

export function QRCheckInPage() {
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><div className="rounded-2xl bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">QR scanner</h2><p className="mt-2 text-sm text-slate-500">Camera scanner UI for booking verification and check-in confirmation.</p><div className="mt-6 grid aspect-square place-items-center rounded-3xl border-4 border-dashed border-campus-blue bg-campus-cloud"><QrCode size={96} className="text-campus-blue"/></div><button className="mt-6 w-full rounded-xl bg-campus-blue py-3 font-black text-white">Start scanner</button></div><div className="rounded-2xl bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">Verification result</h2><div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-800"><p className="flex items-center gap-2 text-lg font-black"><Check/> Booking verified</p><p className="mt-2 text-sm">BK-1024 is approved for AI Research Lab, 10:00-12:00. Check-in can be confirmed.</p></div><button className="mt-6 rounded-xl bg-campus-teal px-5 py-3 font-black text-white">Confirm check-in</button></div></div>;
}

export function PrincipalStatusPage() {
  const principalStatus = usePrincipalStatus();
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-campus-teal">Principal Availability</p>
              <h2 className="mt-2 text-3xl font-black text-campus-ink">{principalStatus.name}</h2>
              <p className="text-sm font-bold text-slate-500">{principalStatus.role}</p>
            </div>
            <div className={`rounded-2xl px-4 py-2 text-sm font-black ${principalStatus.isOnCampus ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {principalStatus.isOnCampus ? "On Campus" : "Off Campus"}
            </div>
          </div>
          <div className="grid gap-3">
            <Info label="Current location" value={principalStatus.location} />
            <Info label="Last updated" value={principalStatus.lastUpdated} />
            <Info label="Next available slot" value={principalStatus.nextAvailableSlot} />
          </div>
          <div className="mt-5 rounded-2xl bg-campus-cloud p-4">
            <p className="font-black text-campus-ink">Office note</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{principalStatus.notes}</p>
          </div>
          <button className="mt-5 w-full rounded-xl bg-campus-blue py-3 font-black text-white">Request appointment</button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Campus presence timeline</h2>
          <div className="mt-6 space-y-4">
            {[
              ["09:15 AM", "Entered campus", "Main Gate scan verified"],
              ["10:00 AM", "Academic review meeting", "Conference Room A"],
              ["12:20 PM", "In principal office", "Available for urgent requests"],
              ["02:30 PM", "Student appointment window", "Admin approval required"]
            ].map(([time, title, detail]) => (
              <div key={time} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-campus-mint text-campus-teal"><UserCheck size={18} /></div>
                <div><p className="font-black">{time} - {title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusTrackerPage() {
  const campusBuses = useCampusBuses();
  const [selectedBusId, setSelectedBusId] = useState(campusBuses[0].id);
  const selectedBus = campusBuses.find((bus) => bus.id === selectedBusId) || campusBuses[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Bus} label="Active buses" value={campusBuses.length} detail="Live GPS simulation enabled" />
        <StatCard icon={Timer} label="Nearest ETA" value={selectedBus.eta} detail={`${selectedBus.name} to ${selectedBus.nextStop}`} color="bg-campus-teal" />
        <StatCard icon={Radio} label="Tracking status" value="Live" detail="Coordinates refresh every few seconds in production" color="bg-campus-gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          {campusBuses.map((bus) => (
            <button key={bus.id} onClick={() => setSelectedBusId(bus.id)} className={`w-full rounded-2xl p-5 text-left shadow-soft transition hover:-translate-y-1 ${selectedBusId === bus.id ? "bg-campus-ink text-white" : "bg-white text-campus-ink"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-black">{bus.name}</p>
                  <p className={`mt-1 text-sm ${selectedBusId === bus.id ? "text-white/70" : "text-slate-500"}`}>{bus.route}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${bus.status === "Delayed" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{bus.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="font-black">ETA</p><p className={selectedBusId === bus.id ? "text-white/70" : "text-slate-500"}>{bus.eta}</p></div>
                <div><p className="font-black">Next stop</p><p className={selectedBusId === bus.id ? "text-white/70" : "text-slate-500"}>{bus.nextStop}</p></div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">{selectedBus.name} live GPS tracker</h2>
              <p className="text-sm text-slate-500">Driver: {selectedBus.driver} - Route: {selectedBus.route}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">ETA {selectedBus.eta}</div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-campus-cloud map-grid p-5">
            <div className="absolute left-[12%] top-[25%] rounded-full bg-white px-3 py-2 text-xs font-black shadow-soft">Main Gate</div>
            <div className="absolute left-[42%] top-[18%] rounded-full bg-white px-3 py-2 text-xs font-black shadow-soft">Admin</div>
            <div className="absolute left-[60%] top-[52%] rounded-full bg-white px-3 py-2 text-xs font-black shadow-soft">Library</div>
            <div className="absolute left-[28%] top-[70%] rounded-full bg-white px-3 py-2 text-xs font-black shadow-soft">Hostel</div>
            <div className="absolute left-[48%] top-[42%] grid h-16 w-16 place-items-center rounded-full bg-campus-blue text-white shadow-soft">
              <Bus size={28} />
            </div>
            <div className="absolute bottom-5 left-5 rounded-2xl bg-white p-4 shadow-soft">
              <p className="font-black">GPS Coordinates</p>
              <p className="mt-1 text-sm text-slate-500">Lat {selectedBus.latitude}, Lng {selectedBus.longitude}</p>
              <p className="mt-1 text-sm text-slate-500">Speed {selectedBus.speed} - Occupancy {selectedBus.occupancy}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-campus-cloud p-4">
            <div className="mb-3 flex items-center gap-2 font-black"><Route size={18} /> Route stops</div>
            <div className="grid gap-2 md:grid-cols-5">
              {selectedBus.stops.map((stop, index) => (
                <div key={stop} className={`rounded-xl p-3 text-sm font-black ${stop === selectedBus.nextStop ? "bg-campus-blue text-white" : "bg-white text-slate-600"}`}>
                  {index + 1}. {stop}
                </div>
              ))}
            </div>
          </div>

          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-campus-ink px-5 py-3 font-black text-white"><Navigation size={18} /> Track my assigned bus</button>
        </div>
      </div>
    </div>
  );
}
