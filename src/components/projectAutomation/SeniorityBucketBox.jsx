import { X } from "lucide-react";

export const SENIORITY_BUCKETS = [
  { label: "Owner", value: "owner" },
  { label: "Partner", value: "partner" },
  { label: "CXO", value: "cxo" },
  { label: "VP", value: "vp" },
  { label: "Director", value: "director" },
  { label: "Manager", value: "manager" },
  { label: "Senior", value: "senior" },
  { label: "Entry", value: "entry" },
  { label: "Training", value: "training" },
  { label: "Unpaid", value: "unpaid" },
];

export default function SeniorityBucketBox({ label, selected, onToggle, disabledOptions = [] }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="input-field flex min-h-[46px] flex-wrap items-center gap-1.5 !py-2">
        {selected.length === 0 && (
          <span className="text-slate-light">Click buckets below</span>
        )}
        {selected.map((bucket) => {
          const bucketLabel =
            SENIORITY_BUCKETS.find((b) => b.value === bucket)?.label || bucket;
          return (
            <span
              key={bucket}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-display text-[11px] font-semibold text-white"
            >
              {bucketLabel}
              <button
                type="button"
                onClick={() => onToggle(bucket)}
                aria-label={`Remove ${bucketLabel}`}
                className="transition-opacity hover:opacity-70"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SENIORITY_BUCKETS.map((bucket) => {
          const isSelected = selected.includes(bucket.value);
          const isDisabled = disabledOptions.includes(bucket.value);
          return (
            <button
              key={bucket.value}
              type="button"
              onClick={() => onToggle(bucket.value)}
              disabled={isDisabled}
              className={`rounded-full border px-3 py-1 font-display text-xs font-medium transition-colors ${
                isDisabled
                  ? "cursor-not-allowed border-surface-border bg-surface text-slate-light/50"
                  : isSelected
                  ? "border-primary bg-primary-50 text-primary"
                  : "border-surface-border bg-white text-slate hover:border-primary-300"
              }`}
            >
              {bucket.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
