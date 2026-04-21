"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import API from "@/app/api/axios";

interface Report {
  _id: string;
  condition: string;
  conditionPlain?: string;
  confidence: number;
  severity: string;
  createdAt: string;
  upload?: { fileUrl: string };
}

const severityConfig: Record<string, { badge: string; border: string; dot: string }> = {
  healthy:  { badge: "text-primary bg-primary/10",       border: "border-l-primary",       dot: "bg-primary" },
  mild:     { badge: "text-yellow-600 bg-yellow-50",     border: "border-l-yellow-400",     dot: "bg-yellow-400" },
  moderate: { badge: "text-orange-600 bg-orange-50",     border: "border-l-orange-400",     dot: "bg-orange-400" },
  severe:   { badge: "text-red-600 bg-red-50",           border: "border-l-red-500",        dot: "bg-red-500" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "timeline">("grid");

  useEffect(() => {
    API.get("/reports/my")
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body text-on-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Analysis History</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {reports.length > 0 ? `${reports.length} scan${reports.length > 1 ? "s" : ""} total` : "All your past scalp analyses."}
            </p>
          </div>
          {reports.length > 0 && (
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
              {(["grid", "timeline"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${view === v ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"}`}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-error bg-error-container px-4 py-3 rounded-xl max-w-md">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant">history</span>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface">No analyses yet</p>
              <p className="text-on-surface-variant text-sm mt-1">Upload your first image to get started.</p>
            </div>
            <Link href="/dashboard"
              className="bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base">add_photo_alternate</span>Start Analysis
            </Link>
          </div>
        )}

        {/* Grid view */}
        {!loading && reports.length > 0 && view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl">
            {reports.map((r) => {
              const sc = severityConfig[r.severity] ?? severityConfig.mild;
              return (
                <Link key={r._id} href={`/report/${r._id}`}
                  className={`bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group border-l-4 ${sc.border}`}>
                  {/* Thumbnail */}
                  <div className="h-36 bg-surface-container overflow-hidden">
                    {r.upload?.fileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`http://localhost:5000/${r.upload.fileUrl}`} alt="Scalp scan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-outline-variant">image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-headline font-bold text-on-surface">{r.conditionPlain || r.condition}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{timeAgo(r.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${sc.badge}`}>
                        {r.severity}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Confidence</span>
                        <span className="font-bold text-primary">{r.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.confidence}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-primary font-bold group-hover:underline">View Report →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Timeline view */}
        {!loading && reports.length > 0 && view === "timeline" && (
          <div className="max-w-2xl flex flex-col">
            {reports.map((r, i) => {
              const sc = severityConfig[r.severity] ?? severityConfig.mild;
              return (
                <div key={r._id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 mt-5 ${sc.dot}`} />
                    {i < reports.length - 1 && <div className="w-0.5 flex-1 bg-surface-container-highest mt-1" />}
                  </div>
                  {/* Card */}
                  <Link href={`/report/${r._id}`}
                    className="flex-1 mb-4 bg-surface-container-lowest rounded-2xl shadow-sm p-4 hover:shadow-md transition-all group flex items-center gap-4">
                    {r.upload?.fileUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`http://localhost:5000/${r.upload.fileUrl}`} alt="scan"
                        className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-on-surface truncate">{r.conditionPlain || r.condition}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${sc.badge}`}>{r.severity}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{timeAgo(r.createdAt)} · {r.confidence}% confidence</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
