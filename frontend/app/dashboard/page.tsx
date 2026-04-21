"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import API from "@/app/api/axios";
import { useAuth } from "@/context/AuthContext";

interface DetectedCondition {
  name: string;
  condition_plain: string;
  description: string;
  confidence: number;
  severity: string;
}

interface AnalysisResult {
  condition: string;
  conditionPlain: string;
  description: string;
  confidence: number;
  severity: string;
  reportId: string;
  tips: string[];
  conditions: DetectedCondition[];
  low_confidence?: boolean;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: string; gauge: string }> = {
  healthy:  { color: "text-primary",    bg: "bg-primary/10",  border: "border-primary/20",  icon: "check_circle", gauge: "#00685f" },
  mild:     { color: "text-yellow-600", bg: "bg-yellow-50",   border: "border-yellow-200",  icon: "info",         gauge: "#ca8a04" },
  moderate: { color: "text-orange-600", bg: "bg-orange-50",   border: "border-orange-200",  icon: "warning",      gauge: "#ea580c" },
  severe:   { color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200",     icon: "dangerous",    gauge: "#dc2626" },
};

function ConfidenceGauge({ value, severity }: { value: number; severity: string }) {
  const cfg = severityConfig[severity] ?? severityConfig.mild;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e0e3e5" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={cfg.gauge} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="50" y="46" textAnchor="middle" fontSize="16" fontWeight="bold" fill={cfg.gauge}>{value}%</text>
      <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6d7a77">confidence</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(""); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };
  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await API.post("/images/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Analysis failed.";
      setError(msg);
    } finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(""); };
  const cfg = result ? (severityConfig[result.severity] ?? severityConfig.mild) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body text-on-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋</h1>
          <p className="text-on-surface-variant text-sm mt-1">Upload a scalp or hair photo to get your AI analysis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          {/* Upload card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-on-surface">New Analysis</h2>
              {preview && (
                <button onClick={reset} className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">close</span> Clear
                </button>
              )}
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-surface-container-highest bg-surface-container-low"}
                ${preview ? "h-56 cursor-default" : "h-48 hover:border-primary hover:bg-primary/5"}`}
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-10">
                      <div className="scanning-beam" />
                      {/* <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                        <p className="text-white text-xs font-bold tracking-widest uppercase">Scanning…</p>
                      </div> */}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant p-6 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">add_photo_alternate</span>
                  <p className="text-sm font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs">JPG, PNG, WEBP — max 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {error && <p className="text-xs text-error bg-error-container px-3 py-2 rounded-xl">{error}</p>}
            <button onClick={handleAnalyse} disabled={!file || loading}
              className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl font-headline font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Analysing…</>
                : <><span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>Run AI Analysis</>}
            </button>
          </div>

          {/* Result card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h2 className="font-headline font-bold text-on-surface">Analysis Result</h2>
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                <span className="material-symbols-outlined text-5xl text-outline-variant">query_stats</span>
                <p className="text-sm text-on-surface-variant">Your result will appear here after analysis.</p>
              </div>
            )}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-on-surface-variant">AI is analysing your image…</p>
              </div>
            )}
            {result && cfg && (
              <div className="flex flex-col gap-4">
                {result.low_confidence && (
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 px-3 py-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-yellow-600 text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <p className="text-xs text-yellow-700 leading-relaxed">Low confidence — try a closer, well-lit photo of your scalp.</p>
                  </div>
                )}
                {/* Gauge + primary condition */}
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <ConfidenceGauge value={result.confidence} severity={result.severity} />
                  <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${cfg.bg} ${cfg.color}`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                      {result.severity}
                    </div>
                    <p className="font-headline font-extrabold text-on-surface text-lg leading-tight">{result.conditionPlain || result.condition}</p>
                    {result.conditionPlain && <p className="text-[10px] text-on-surface-variant mt-0.5">{result.condition}</p>}
                    {result.description && <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{result.description}</p>}
                  </div>
                </div>
                {/* Secondary conditions */}
                {result.conditions && result.conditions.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Also Detected</p>
                    {result.conditions.slice(1).map((c) => {
                      const cc = severityConfig[c.severity] ?? severityConfig.mild;
                      return (
                        <div key={c.name} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${cc.bg} ${cc.border}`}>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{c.condition_plain || c.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{c.name}</p>
                          </div>
                          <span className={`text-xs font-bold ${cc.color}`}>{c.confidence}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">Recommendation</p>
                    <ul className="flex flex-col gap-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href={`/report/${result.reportId}`}
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  View Full Report
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-4 flex-wrap max-w-5xl">
          <Link href="/history" className="flex items-center gap-2 bg-surface-container-lowest rounded-xl px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-primary text-base">history</span>View Analysis History
          </Link>
          <Link href="/feedback" className="flex items-center gap-2 bg-surface-container-lowest rounded-xl px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-primary text-base">rate_review</span>Leave Feedback
          </Link>
        </div>
      </main>
    </div>
  );
}
