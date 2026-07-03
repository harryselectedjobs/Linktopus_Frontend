import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

export default function ScheduleModal({ onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!date || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(date);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't schedule this post. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl border border-surface-border bg-white p-6 shadow-card-hover"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">
            Schedule Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-light transition-colors hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <label htmlFor="schedule-date" className="field-label">
          Date
        </label>
        <input
          id="schedule-date"
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
        {error && <p className="mt-2 text-xs text-spark">{error}</p>}

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !px-5 !py-2.5 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!date || isSubmitting}
            className="btn-primary !px-5 !py-2.5 text-xs"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
