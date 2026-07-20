import { motion } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";

export default function SearchParameterModal({
  title,
  items,
  isLoading,
  error,
  onSelect,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            {title}
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

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-light">
              <Loader2 size={16} className="animate-spin" />
              Searching…
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-center gap-2 px-3 py-8 text-sm text-spark">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-light">
              No results found.
            </p>
          )}

          {!isLoading &&
            !error &&
            items.map((item, i) => (
              <button
                key={`${item.id}-${i}`}
                type="button"
                onClick={() => onSelect(item)}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-primary-50"
              >
                {item.title}
              </button>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
