import { motion } from "framer-motion";
import LogoMark from "../layout/Logo";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2.5"
    >
      <LogoMark size={28} />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-surface-border bg-white px-4 py-3.5 shadow-card">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-slate-light"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
