import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Share2, CalendarClock, Loader2 } from "lucide-react";

export default function VariationCard({ index, text, onShare, onSchedule }) {
  const [editedText, setEditedText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  async function handleShare() {
    setIsSharing(true);
    setShareStatus(null);
    try {
      await onShare(editedText);
      setShareStatus("success");
    } catch {
      setShareStatus("error");
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareStatus(null), 2500);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col rounded-2xl border border-surface-border bg-white shadow-card"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-white">
            V{index}
          </span>
          <div className="leading-tight">
            <p className="section-label !text-[11px]">Variation {index}</p>
            <p className="text-xs text-slate-light">LinkedIn Post</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className="inline-flex items-center gap-1 font-display text-xs font-semibold text-slate transition-colors hover:text-primary"
        >
          {isEditing ? <Check size={14} /> : <Pencil size={14} />}
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="px-5 py-4">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={9}
            className="input-field w-full resize-y text-sm leading-relaxed"
            autoFocus
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
            {editedText}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2.5 border-t border-surface-border px-5 py-4">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing || isEditing || !editedText.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 font-display text-xs font-semibold text-white transition-all duration-200 hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Share2 size={14} />
          )}
          {isSharing ? "Sharing…" : "Share Now"}
        </button>
        <button
          type="button"
          onClick={() => onSchedule(editedText)}
          disabled={isEditing || !editedText.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-surface-border bg-surface px-4 py-2 font-display text-xs font-semibold text-ink transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarClock size={14} />
          Schedule
        </button>

        {shareStatus === "success" && (
          <span className="font-display text-xs font-semibold text-primary">
            Shared successfully
          </span>
        )}
        {shareStatus === "error" && (
          <span className="font-display text-xs font-semibold text-spark">
            Couldn't share, try again
          </span>
        )}
      </div>
    </motion.div>
  );
}
