"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import API from "@/app/api/axios"
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Analyses Completed", value: "12,847", icon: "biotech", trend: "+18%" },
  { label: "Avg. Follicle Score", value: "91.3", icon: "monitoring", trend: "+4.2" },
  { label: "Active Users", value: "3,210", icon: "group", trend: "+22%" },
];

const timeline = [
  { month: "Jan", score: 62 },
  { month: "Feb", score: 70 },
  { month: "Mar", score: 75 },
  { month: "Apr", score: 71 },
  { month: "May", score: 83 },
  { month: "Jun", score: 91 },
];

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface font-body text-on-surface antialiased">

      {/* ── Nav ── */}
      <nav className="shrink-0 z-50 bg-surface-container-low flex justify-between items-center w-full px-6 py-3">
        <div className="text-xl font-bold tracking-tight text-teal-800 font-headline">
          HairVision
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-slate-600 text-sm font-medium hover:text-teal-600 transition-colors">
            How it Works
          </a>

          <a href="#" className="material-symbols-outlined text-teal-700">help_outline</a>
        </div>
      </nav>

      {/* ── Split panels ── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── Left: Dashboard Visual ── */}
        <section className="hidden md:flex w-1/2 bg-surface-container-high relative overflow-hidden flex-col items-center justify-center gap-5 p-8">

          {/* Grid bg */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#006a61 0,#006a61 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#006a61 0,#006a61 1px,transparent 1px,transparent 40px)",
            }}
          />

          {/* Dashboard card */}
          <div className="relative z-10 w-full max-w-sm bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl shadow-lg p-5 flex flex-col gap-4">

            {/* Card header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  HairVision Analytics
                </p>
                <h3 className="text-base font-headline font-bold text-on-surface mt-0.5">
                  Your Scalp Report
                </h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  insights
                </span>
              </div>
            </div>

            {/* Mini bar chart */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Follicle Health Score — 6 Months
              </p>
              <div className="flex items-end gap-1.5 h-16">
                {timeline.map((t) => (
                  <div key={t.month} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${(t.score / 100) * 64}px`,
                        background: t.month === "Jun"
                          ? "linear-gradient(to top, #00685f, #6bd8cb)"
                          : "#bcc9c6",
                      }}
                    />
                    <span className="text-[9px] text-on-surface-variant">{t.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-surface-container-highest" />

            {/* Stats */}
            <div className="flex flex-col gap-2.5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-surface-container p-1.5 rounded-lg">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                      >
                        {s.icon}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-headline font-bold text-on-surface">{s.value}</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {s.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validated badge */}
          <div className="relative z-10 flex items-center gap-2.5 bg-surface-container-lowest/80 backdrop-blur-md border border-primary/20 px-4 py-2.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="text-sm font-label font-medium text-on-surface">
              Clinically Validated AI Engine
            </span>
          </div>

          {/* Bottom copy */}
          <div className="relative z-10 text-center max-w-xs">
            <h2 className="text-2xl font-headline font-bold text-teal-900 leading-tight">
              Your Data. Your Insights.
            </h2>
            <p className="mt-1.5 text-on-surface-variant text-sm">
              Pick up right where you left off with your personalised scalp intelligence dashboard.
            </p>
          </div>
        </section>

        {/* ── Right: Login Form ── */}
        <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-8 md:px-16 overflow-y-auto">
          <div className="w-full max-w-sm py-6">
            <header className="mb-7">
              <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
                Welcome Back
              </h1>
              <p className="text-on-surface-variant font-label text-sm">
                Sign in to access your HairVision clinical dashboard.
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email
                </label>
                <input
                  id="email" type="email" placeholder="julian@hairvision.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary font-medium hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                  />
                  <button
                    type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-xs text-on-surface-variant">Keep me signed in</label>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-error bg-error-container px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl font-headline font-bold text-base shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-container-highest flex flex-col items-center gap-3">
              <p className="text-sm text-on-surface-variant">Don&apos;t have an account?</p>
              <Link href="/register" className="text-primary font-bold hover:text-primary-container transition-colors tracking-tight text-sm">
                Create a HairVision Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
