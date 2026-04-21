"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import API from "@/app/api/axios";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setLoading(true);
    setError("");
    try {
      await API.post("/feedback", { rating, comment });
      setSuccess(true);
      setRating(0);
      setComment("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to submit feedback.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body text-on-surface">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">Leave Feedback</h1>
          <p className="text-on-surface-variant text-sm mt-1">Help us improve HairVision with your thoughts.</p>
        </div>

        <div className="max-w-lg">
          {success ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <h2 className="font-headline font-bold text-on-surface text-xl">Thank you!</h2>
              <p className="text-on-surface-variant text-sm">Your feedback has been submitted successfully.</p>
              <button
                onClick={() => setSuccess(false)}
                className="text-primary font-bold text-sm hover:underline"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-6">
              {/* Star rating */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <span
                        className={`material-symbols-outlined text-3xl transition-colors ${star <= rating ? "text-yellow-400" : "text-outline-variant"}`}
                        style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label htmlFor="comment" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Comments (optional)
                </label>
                <textarea
                  id="comment"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think about HairVision…"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all placeholder:text-outline resize-none text-sm"
                />
              </div>

              {error && (
                <p className="text-xs text-error bg-error-container px-3 py-2 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl font-headline font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
