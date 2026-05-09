import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { api, saveSession } from "../services/api";

const demoCredentials = [
  { role: "Student", email: "student@campusbook.edu", password: "student123", name: "Student Demo" },
  { role: "Faculty", email: "faculty@campusbook.edu", password: "faculty123", name: "Faculty Demo" },
  { role: "Admin", email: "admin@campusbook.edu", password: "admin123", name: "Admin Demo" }
];

export function LandingPage({ setActivePage, setAuthFormData, theme, setTheme }) {
  return (
    <main className="min-h-screen bg-campus-cloud">
      <div className="fixed right-5 top-5 z-30 flex rounded-2xl border border-white/20 bg-white/90 p-1 shadow-soft backdrop-blur">
        {["default", "light", "dark"].map((item) => (
          <button
            key={item}
            onClick={() => setTheme(item)}
            className={`rounded-xl px-4 py-2 text-sm font-black capitalize transition ${theme === item ? "bg-campus-blue text-white" : "text-slate-600 hover:bg-campus-cloud"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="relative overflow-hidden bg-campus-ink text-white">
        <img className="absolute inset-0 h-full w-full object-cover opacity-25" src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80" alt="Modern campus" />
        <div className="absolute inset-0 bg-gradient-to-r from-campus-ink via-campus-ink/90 to-campus-teal/70" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">Book classrooms, labs, halls, courts, and equipment without chaos.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">A centralized booking system that prevents double bookings, speeds up approvals, generates QR check-ins, and gives administrators real utilization analytics.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setAuthFormData({ email: "student@campusbook.edu", password: "student123", role: "Student", name: "Student Demo" });
                  setActivePage("login");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-campus-gold px-6 py-3 font-black text-campus-ink shadow-soft transition hover:-translate-y-0.5">
                Login to dashboard <ArrowRight size={18} />
              </button>
              <button onClick={() => setActivePage("register")} className="rounded-xl border border-white/25 px-6 py-3 font-extrabold text-white transition hover:bg-white/10">Create account</button>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-5 text-campus-ink shadow-soft">
            <div className="grid gap-4">
              {demoCredentials.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setAuthFormData(account);
                    setActivePage("login");
                  }}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5">
                  <div>
                    <p className="font-black">{account.role} Login</p>
                    <p className="text-sm text-slate-500">{account.email}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Demo</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-16 md:grid-cols-3">
        {[
          [CalendarClock, "Real-time availability", "Instantly see free rooms, blocked slots, and upcoming reservations."],
          [ShieldCheck, "Approval workflow", "Faculty priority, admin decisions, and transparent booking statuses."],
          [Zap, "QR verification", "Approved users get QR codes for fast check-in and usage tracking."]
        ].map(([Icon, title, copy]) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-soft transition hover:-translate-y-1">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-campus-mint text-campus-teal"><Icon /></div>
            <h3 className="text-xl font-black">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

export function LoginPage({ setActivePage, setRole, setUser, initialAuthData, setAuthFormData }) {
  return (
    <AuthCard
      title="Welcome back"
      button="Login"
      setActivePage={setActivePage}
      setRole={setRole}
      setUser={setUser}
      initialAuthData={initialAuthData}
      setAuthFormData={setAuthFormData}
    />
  );
}

export function RegisterPage({ setActivePage, setRole, setUser, initialAuthData, setAuthFormData }) {
  return (
    <AuthCard
      title="Create account"
      button="Create account"
      register
      setActivePage={setActivePage}
      setRole={setRole}
      setUser={setUser}
      initialAuthData={initialAuthData}
      setAuthFormData={setAuthFormData}
    />
  );
}

function AuthCard({ title, button, register, setActivePage, setRole, setUser, initialAuthData, setAuthFormData }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(demoCredentials[0].email);
  const [password, setPassword] = useState(demoCredentials[0].password);
  const [selectedRole, setSelectedRole] = useState("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAuthData) {
      setName(initialAuthData.name || "");
      setEmail(initialAuthData.email || "");
      setPassword(initialAuthData.password || "");
      setSelectedRole(initialAuthData.role || "Student");
      setError("");
      setAuthFormData?.(null);
    }
  }, [initialAuthData, setAuthFormData]);

  function fillCredential(account) {
    setName(account.name);
    setEmail(account.email);
    setPassword(account.password);
    setSelectedRole(account.role);
    setError("");
  }

  async function submitAuth() {
    setError("");
    setLoading(true);

    try {
      const data = register
        ? await api.register({ name, email, password, role: selectedRole })
        : await api.login({ email, password, role: selectedRole });

      saveSession(data);
      setUser(data.user);
      setRole(data.user.role);
      setActivePage("dashboard");
    } catch (error) {
      if (error.status === 409) {
        setError("Email already exists. Please login with this account.");
      } else {
        setError(`${error.message}. Make sure the backend is running and MySQL is seeded.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-campus-cloud px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="mb-8 text-center"><CheckCircle2 className="mx-auto mb-3 text-campus-teal" size={38} /><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 text-sm text-slate-500">Database-backed authentication</p></div>
          <div className="space-y-4">
            {register && <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-campus-blue" placeholder="Full name" />}
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-campus-blue" placeholder="Email address" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-campus-blue" placeholder="Password" type="password" />
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-campus-blue"><option>Student</option><option>Faculty</option><option>Admin</option></select>
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
            <button onClick={submitAuth} disabled={loading} className="w-full rounded-xl bg-campus-blue px-4 py-3 font-black text-white shadow-soft disabled:opacity-60">{loading ? "Connecting..." : button}</button>
            <button onClick={() => setActivePage(register ? "login" : "register")} className="w-full text-sm font-bold text-campus-blue">{register ? "Already have an account? Login" : "New here? Register"}</button>
            <button onClick={() => setActivePage("landing")} className="w-full text-sm font-bold text-slate-500">Back to landing</button>
          </div>
        </div>

        <div className="rounded-3xl bg-campus-ink p-8 text-white shadow-soft">
          <p className="text-sm font-black uppercase tracking-wide text-campus-gold">Demo credentials</p>
          <h2 className="mt-2 text-3xl font-black">Use these accounts to enter the dashboard</h2>
          <div className="mt-6 grid gap-4">
            {demoCredentials.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  if (register) {
                    setAuthFormData?.(account);
                    setActivePage("login");
                  } else {
                    fillCr