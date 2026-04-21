"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import API from "@/app/api/axios";

interface Report {
  _id: string;
  condition: string;
  conditionPlain?: string;
  description?: string;
  confidence: number;
  severity: string;
  createdAt: string;
  upload?: { fileUrl: string };
  tips?: string[];
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: string; label: string; meter: number }> = {
  healthy:  { color: "text-primary",    bg: "bg-primary/10",  border: "border-primary/20",  icon: "check_circle", label: "Healthy",  meter: 1 },
  mild:     { color: "text-yellow-600", bg: "bg-yellow-50",   border: "border-yellow-200",  icon: "info",         label: "Mild",     meter: 2 },
  moderate: { color: "text-orange-600", bg: "bg-orange-50",   border: "border-orange-200",  icon: "warning",      label: "Moderate", meter: 3 },
  severe:   { color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200",     icon: "dangerous",    label: "Severe",   meter: 4 },
};

const meterColors = ["bg-primary", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
const meterLabels = ["Healthy", "Mild", "Moderate", "Severe"];

function SeverityMeter({ severity }: { severity: string }) {
  const level = (severityConfig[severity]?.meter ?? 2) - 1;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Severity Scale</p>
      <div className="flex gap-1.5 items-end">
        {meterColors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-full rounded-md transition-all ${i <= level ? color : "bg-surface-container-highest"}`}
              style={{ height: `${(i + 1) * 10 + 8}px` }} />
            <span className={`text-[9px] font-bold ${i === level ? "text-on-surface" : "text-on-surface-variant"}`}>
              {meterLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch(() => setError("Could not load this report."))
      .finally(() => setLoading(false));
  }, [id]);

  const cfg = report ? (severityConfig[report.severity] ?? severityConfig.mild) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body text-on-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-6">
          <Link href="/history" className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Back to History
          </Link>
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">Analysis Report</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-error bg-error-container px-4 py-3 rounded-xl max-w-md">{error}</p>}

        {report && cfg && (
          <div className="max-w-3xl flex flex-col gap-6">
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
                {report.upload?.fileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`http://localhost:5000/${report.upload.fileUrl}`} alt="Scalp scan"
                    className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-surface-container">
                    <span className="material-symbols-outlined text-5xl text-outline-variant">image</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                {/* Condition */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Detected Condition</p>
                  <p className="text-2xl font-headline font-extrabold text-on-surface">
                    {report.conditionPlain || report.condition}
                  </p>
                  {report.conditionPlain && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{report.condition}</p>
                  )}
                  {report.description && (
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{report.description}</p>
                  )}
                </div>

                {/* Severity badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold w-fit ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                  {cfg.label} Severity
                </div>

                {/* Severity meter */}
                <SeverityMeter severity={report.severity} />

                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                    <span>AI Confidence</span>
                    <span className="font-bold text-primary">{report.confidence}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-primary to-primary-fixed-dim rounded-full transition-all"
                      style={{ width: `${report.confidence}%` }} />
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mt-auto">
                  Analysed on {new Date(report.createdAt).toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Tips — grouped */}
            {report.tips && report.tips.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                  </div>
                  <p className="font-headline font-bold text-on-surface">Care Recommendations</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {report.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-surface-container-low rounded-xl px-4 py-3">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-on-surface leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
                {report.severity !== "healthy" && (
                  <p className="text-xs text-on-surface-variant mt-4 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    These are general recommendations. Consult a dermatologist for personalised medical advice.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Link href="/dashboard"
                className="bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-base">add_photo_alternate</span>New Analysis
              </Link>
              <Link href="/history"
                className="bg-surface-container text-on-surface font-bold text-sm px-6 py-3 rounded-xl hover:bg-surface-container-high transition-all">
                All Reports
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
