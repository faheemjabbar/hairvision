"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import API from "@/app/api/axios";

const navItems = [
  { href: "/dashboard", icon: "dashboard",    label: "Dashboard" },
  { href: "/history",   icon: "history",      label: "My History" },
  { href: "/feedback",  icon: "rate_review",  label: "Feedback" },
];

const adminItems = [
  { href: "/admin", icon: "admin_panel_settings", label: "Admin Panel" },
];

interface Stats {
  total: number;
  lastScan: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, lastScan: null });

  useEffect(() => {
    API.get("/reports/my")
      .then((res) => {
        const reports = res.data;
        setStats({
          total:    reports.length,
          lastScan: reports.length > 0 ? reports[0].createdAt : null,
        });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); router.push("/login"); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 shrink-0 h-screen bg-surface-container-low flex flex-col border-r border-surface-container-highest">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-container-highest flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
        <div>
          <span className="text-base font-headline font-bold text-teal-800 tracking-tight">HairVision</span>
          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">AI Scalp Analysis</p>
        </div>
      </div>

      {/* User pill */}
      <div className="px-4 py-4 border-b border-surface-container-highest">
        <div className="flex items-center gap-3 bg-surface-container px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{user?.name ?? "User"}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

      {/* Stats widget */}
      <div className="px-4 py-3 border-b border-surface-container-highest">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-lg font-headline font-extrabold text-primary">{stats.total}</p>
            <p className="text-[10px] text-on-surface-variant">Total Scans</p>
          </div>
          <div className="bg-surface-container rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-sm font-headline font-extrabold text-on-surface truncate">
              {stats.lastScan ? timeAgo(stats.lastScan) : "—"}
            </p>
            <p className="text-[10px] text-on-surface-variant">Last Scan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}>
            <span className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="mt-4 mb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-surface-container-highest">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
