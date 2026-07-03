import { motion } from "framer-motion";
import LogoMark from "../layout/Logo";
import { initialsFromEmail } from "../../utils/initials";

export default function ChatBubble({ role, text, email }) {
  const isBot = role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-end gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <span className="mb-1 shrink-0">
          <LogoMark size={28} />
        </span>
      )}

      <div
        className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card sm:max-w-[70%] ${
          isBot
            ? "rounded-bl-sm border border-surface-border bg-white text-ink"
            : "rounded-br-sm bg-primary text-white"
        }`}
      >
        {text}
      </div>

      {!isBot && (
        <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 font-display text-[10px] font-bold text-white">
          {initialsFromEmail(email)}
        </span>
      )}
    </motion.div>
  );
}
