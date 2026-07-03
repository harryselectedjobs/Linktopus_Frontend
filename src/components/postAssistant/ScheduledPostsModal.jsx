import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CalendarDays } from "lucide-react";
import { getScheduledPosts } from "../../services/sharePost";

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCreated(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ScheduledPostsModal({ onClose }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getScheduledPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.detail || "Couldn't load scheduled posts."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card-hover"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            Scheduled Posts
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-light">
              <Loader2 size={16} className="animate-spin" />
              Loading scheduled posts…
            </div>
          )}

          {!isLoading && error && (
            <p className="py-10 text-center text-sm text-spark">{error}</p>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-light">
              <CalendarDays size={22} />
              No scheduled posts yet.
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li
                  key={post.post_id}
                  className="rounded-xl border border-surface-border bg-surface px-4 py-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="badge">
                      <CalendarDays size={12} />
                      {formatDate(post.post_date)}
                    </span>
                    <span className="text-[11px] text-slate-light">
                      Created {formatCreated(post.created_date)}
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-slate">
                    {post.post_text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
