"use client";

import { useState } from "react";
import Link from "next/link";
import API from "@/app/api/axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password });
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
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

        {/* ── Left: Visual Panel ── */}
        <section className="hidden md:flex w-1/2 bg-surface-container-high relative overflow-hidden flex-col items-center justify-center gap-6 p-8">

          {/* Abstract bg texture */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNFjIJv_4bLDYYqsdjzZcBg6l9ONwGoIU8AYvUETBVN3IBIXdF5X0TjBIKaeiGeTwlKKKIE-6rK8v-yIhYNCJFNUagPhg2S5pJJY5wFoQjobuzQq5ruQ7lx3lKrlrur04GqX0ZWyeRAqyFTTXcil9BWvLjc-ZbAg8hArXQe7gdEzKrP8lm8NimOP5NjaQgVNGFsmu45QSE3GYWksD1aG01JidmGacetGw5bTxXooWqfKYujTOYMMweCziB016J05N4q7cB4rVgEGSj')",
            }}
          />

          {/* Scanning visual */}
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="relative w-56 h-64 bg-surface-container-lowest rounded-full flex items-center justify-center overflow-hidden"
              style={{ boxShadow: "0 12px 32px rgba(25,28,30,0.06)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATfqY8ZNcCAMhAlHXgR1HqZEbSwby4sze_pfSCdr0G4H6U-yFHXdNrXBphS_pDCh4FC2G_IRUSJE8oUdWxToe5IX0Ug5H2prKOwp-LQruo4Ccdr8ua4WmoHmGac02DxBV728Ua42LO-OZzlM45QoNWepHIYI6lFDtORD_RKGQeRaajXcoNKz1f6v25_dwx8aawNgPdNloHLjvh2uGOrtiFwYbIeUth1toWbTcLJkdpisdFQFxOKPV2iwcRz5OKW4MQ-u1Bk1pHtsNy"
                alt="Clinical top-down view of a head silhouette"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="scanning-beam" />
              <div className="absolute top-1/4 w-24 h-24 rounded-full bg-primary/10 border-2 border-primary-fixed-dim animate-pulse" />
            </div>

            {/* Floating: Hair Density */}
            <div className="absolute -top-3 -right-6 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-2 rounded-xl border border-primary/20 flex flex-col gap-0.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Hair Density</span>
              <span className="text-lg font-headline font-extrabold text-on-surface">94.2%</span>
            </div>

            {/* Floating: Scalp Health */}
            <div className="absolute top-1/2 -left-10 -translate-y-1/2 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-2 rounded-xl border border-tertiary/20 flex flex-col gap-0.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-widest text-tertiary font-bold">Scalp Health</span>
              <span className="text-lg font-headline font-extrabold text-on-surface">OPTIMAL</span>
            </div>

            {/* AI badge */}
            <div className="absolute -bottom-4 right-0 bg-primary-container px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <span className="material-symbols-outlined text-on-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="text-xs font-label font-medium text-on-primary-container pr-1">AI Detection Active</span>
            </div>
          </div>

          {/* Bottom copy */}
          <div className="relative z-10 text-center max-w-xs">
            <h2 className="text-2xl font-headline font-bold text-teal-900 leading-tight">
              Advanced Follicular Intelligence.
            </h2>
            <p className="mt-1.5 text-on-surface-variant text-sm">
              The world&apos;s most precise non-invasive scalp analysis technology.
            </p>
          </div>
        </section>

        {/* ── Right: Register Form ── */}
        <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-8 md:px-16 overflow-y-auto">
          <div className="w-full max-w-sm py-6">
            <header className="mb-7">
              <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
                Begin Your Analysis
              </h1>
              <p className="text-on-surface-variant font-label text-sm">
                Join HairVision to access professional-grade scalp insights.
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  id="name" type="text" placeholder="Dr. Julian Thorne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email Address
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
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Secure Password
                </label>
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
                {loading ? "Creating account…" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-container-highest flex flex-col items-center gap-3">
              <p className="text-sm text-on-surface-variant">Already have an account?</p>
              <Link href="/login" className="text-primary font-bold hover:text-primary-container transition-colors tracking-tight text-sm">
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
