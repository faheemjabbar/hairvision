"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import API from "@/app/api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  user?: { name: string; email: string };
}

type Tab = "users" | "feedback";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const endpoint = tab === "users" ? "/admin/users" : "/admin/feedback";
    API.get(endpoint)
      .then((res) => {
        if (tab === "users") setUsers(res.data);
        else setFeedbacks(res.data);
      })
      .catch(() => setError(`Failed to load ${tab}.`))
      .finally(() => setLoading(false));
  }, [tab]);

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body text-on-surface">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">Admin Panel</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage users and review platform feedback.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-surface-container-low p-1 rounded-xl w-fit">
          {(["users", "feedback"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                tab === t
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-error bg-error-container px-4 py-3 rounded-xl max-w-md">{error}</p>
        )}

        {/* Users table */}
        {!loading && tab === "users" && users.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden max-w-5xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-container-highest">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-bold">Name</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-bold">Email</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-bold">Role</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-bold">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-surface-container-highest last:border-0 hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-3 font-medium text-on-surface">{u.name}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-error hover:bg-error-container p-1.5 rounded-lg transition-colors"
                          aria-label="Delete user"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback list */}
        {!loading && tab === "feedback" && (
          <div className="flex flex-col gap-4 max-w-3xl">
            {feedbacks.length === 0 && (
              <p className="text-on-surface-variant text-sm">No feedback submitted yet.</p>
            )}
            {feedbacks.map((f) => (
              <div key={f._id} className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface text-sm">{f.user?.name ?? "Anonymous"}</p>
                    <p className="text-xs text-on-surface-variant">{f.user?.email ?? ""}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`material-symbols-outlined text-lg ${s <= f.rating ? "text-yellow-400" : "text-outline-variant"}`}
                        style={{ fontVariationSettings: s <= f.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                {f.comment && (
                  <p className="text-sm text-on-surface-variant leading-relaxed">{f.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
