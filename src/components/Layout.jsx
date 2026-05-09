import { CalendarCheck, Gauge, LayoutDashboard, LogOut, QrCode, ShieldCheck, Users, Warehouse, BarChart3, CheckSquare, Search, UserCheck, Bus } from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "resources", label: "Resources", icon: Warehouse },
  { id: "booking", label: "Book Slot", icon: CalendarCheck },
  { id: "my-bookings", label: "My Bookings", icon: CheckSquare },
  { id: "principal", label: "Principal Status", icon: UserCheck },
  { id: "bus-tracker", label: "Bus Tracker", icon: Bus },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, admin: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, admin: true },
  { id: "checkin", label: "QR Check-In", icon: QrCode }
];

export function Sidebar({ activePage, setActivePage, role, setRole, theme, setTheme, user, onLogout, mobile = false }) {
  const visibleItems = navItems.filter((item) => !item.admin || role === "Admin");

  return (
    <aside className={`${mobile ? "relative h-full w-full" : "fixed inset-y-0 left-0 z-20 hidden w-72 lg:block"} border-r border-slate-200 bg-white px-5 py-6`}>
      <button onClick={() => setActivePage("landing")} className="mb-8 flex items-center gap-3 text-left">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-campus-blue text-white shadow-soft">
          <Gauge size={22} />
        </div>
        <div>
          <p className="text-lg font-black tracking-tight">CampusBook</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Smart Resource OS</p>
        </div>
      </button>

      <div className="mb-5 rounded-xl bg-campus-cloud p-3">
        <p className="mb-2 text-xs font-bold uppercase text-slate-500">{user ? user.name : "Role preview"}</p>
        <div className="grid grid-cols-3 gap-1">
          {["Student", "Faculty", "Admin"].map((item) => (
            <button
              key={item}
              onClick={() => setRole(item)}
              className={`rounded-lg px-2 py-2 text-xs font-bold transition ${role === item ? "bg-campus-blue text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-campus-cloud p-3">
        <p className="mb-2 text-xs font-bold uppercase text-slate-500">Theme</p>
        <div className="grid grid-cols-3 gap-1">
          {["default", "light", "dark"].map((item) => (
            <button
              key={item}
              onClick={() => setTheme(item)}
              className={`rounded-lg px-2 py-2 text-xs font-bold capitalize transition ${theme === item ? "bg-campus-blue text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${activePage === item.id ? "bg-campus-blue text-white shadow-soft" : "text-slate-600 hover:bg-campus-cloud hover:text-campus-ink"}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className={`${mobile ? "mt-6" : "absolute bottom-6 left-5 right-5"} rounded-2xl bg-campus-ink p-4 text-white`}>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold"><Users size={16} /> Live campus load</div>
        <div className="h-2 rounded-full bg-white/20"><div className="h-2 w-3/4 rounded-full bg-campus-gold" /></div>
        <p className="mt-2 text-xs text-white/70">73% resources occupied during peak hours</p>
        <button onClick={onLogout} className="mt-4 flex items-center gap-2 text-xs font-bold text-white/80"><LogOut size={14} /> Logout</button>
      </div>
    </aside>
  );
}

export function Topbar({ activePage, searchQuery, setSearchQuery }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur lg:ml-72 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-campus-teal">Smart Campus Resource Booking System</p>
          <h1 className="text-xl font-black capitalize text-campus-ink md:text-2xl">{activePage.replace("-", " ")}</h1>
        </div>
        <div className="hidden min-w-80 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 md:flex">
          <Search size={18} className="text-slate-400" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search resources, rooms, status, projector..." />
        </div>
      </div>
    </header>
  );
}


