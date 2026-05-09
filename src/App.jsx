import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar, Topbar } from "./components/Layout.jsx";
import { LandingPage, LoginPage, RegisterPage } from "./pages/LandingAuth.jsx";
import { AdminDashboardPage, AnalyticsPage, ApprovalsPage, BookingPage, DashboardPage, MyBookingsPage, QRCheckInPage, ResourceDetailsPage, ResourceGrid, ResourceManagementPage, PrincipalStatusPage, BusTrackerPage } from "./pages/DashboardPages.jsx";
import { clearSession, getStoredSession } from "./services/api.js";

function App() {
  const [activePage, setActivePage] = useState("landing");
  const [role, setRole] = useState("Student");
  const [user, setUser] = useState(() => getStoredSession()?.user || null);
  const [authFormData, setAuthFormData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    document.documentElement.classList.remove("theme-default", "theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    if (user?.role) setRole(user.role);
  }, [user]);

  function logout() {
    clearSession();
    setUser(null);
    setRole("Student");
    setActivePage("landing");
  }

  if (activePage === "landing") return <LandingPage setActivePage={setActivePage} setAuthFormData={setAuthFormData} theme={theme} setTheme={setTheme} />;
  if (activePage === "login") return <LoginPage setActivePage={setActivePage} setRole={setRole} setUser={setUser} initialAuthData={authFormData} setAuthFormData={setAuthFormData} />;
  if (activePage === "register") return <RegisterPage setActivePage={setActivePage} setRole={setRole} setUser={setUser} initialAuthData={authFormData} setAuthFormData={setAuthFormData} />;

  const page = {
    dashboard: role === "Admin" ? <AdminDashboardPage /> : <DashboardPage setActivePage={setActivePage} role={role} searchQuery={searchQuery} />,
    resources: role === "Admin" ? <ResourceManagementPage /> : <ResourceGrid setActivePage={setActivePage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />,
    "resource-details": <ResourceDetailsPage setActivePage={setActivePage} />,
    booking: <BookingPage />,
    "my-bookings": <MyBookingsPage role={role} />,
    approvals: <ApprovalsPage />,
    analytics: <AnalyticsPage />,
    checkin: <QRCheckInPage />,
    principal: <PrincipalStatusPage />,
    "bus-tracker": <BusTrackerPage />
  }[activePage] || <DashboardPage setActivePage={setActivePage} role={role} searchQuery={searchQuery} />;

  return (
    <div className="min-h-screen bg-campus-cloud">
      <Sidebar activePage={activePage} setActivePage={setActivePage} role={role} setRole={setRole} theme={theme} setTheme={setTheme} user={user} onLogout={logout} />
      <div className="lg:hidden">
        <div className="fixed left-4 top-4 z-40">
          <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl bg-campus-ink text-white shadow-soft"><Menu size={22} /></button>
        </div>
        {mobileOpen && <div className="fixed inset-0 z-50 bg-campus-ink/40 backdrop-blur-sm"><div className="h-full w-80 bg-white p-5"><button onClick={() => setMobileOpen(false)} className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-campus-cloud"><X /></button><Sidebar activePage={activePage} setActivePage={(page) => { setActivePage(page); setMobileOpen(false); }} role={role} setRole={setRole} theme={theme} setTheme={setTheme} user={user} onLogout={logout} mobile /></div></div>}
      </div>
      <Topbar activePage={activePage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        {page}
      </main>
    </div>
  );
}

export default App;

