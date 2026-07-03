import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Send, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  generatePostVariations,
  publishPost,
  schedulePost,
} from "../services/sharePost";
import ChatBubble from "../components/postAssistant/ChatBubble";
import TypingIndicator from "../components/postAssistant/TypingIndicator";
import PostVariations from "../components/postAssistant/PostVariations";
import ScheduleModal from "../components/postAssistant/ScheduleModal";
import ScheduledPostsModal from "../components/postAssistant/ScheduledPostsModal";
import Toast from "../components/postAssistant/Toast";

const GREETING =
  "Hi there! I'm your LinkedIn content assistant.\n\nTell me what you'd like to post about — for example: \"Create a post about job hunting tips\" — and I'll draft four variations for you to review, edit, share, or schedule.";

export default function PostAssistant() {
  const { email } = useAuth();
  const [messages, setMessages] = useState([
    { id: "greeting", role: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [showScheduledPosts, setShowScheduledPosts] = useState(false);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isGenerating, variations]);

  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  function showToast(type, message) {
    clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setInput("");
    setVariations(null);
    setIsGenerating(true);

    try {
      const posts = await generatePostVariations(trimmed);
      setVariations(posts);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "Here are four variations to choose from. Edit any of them, then share now or schedule for later.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          role: "bot",
          text:
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Something went wrong generating your post variations. Please try again.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  async function handleShare(text) {
    try {
      await publishPost(text);
      showToast("success", "Post shared to LinkedIn.");
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't share this post."
      );
      throw err;
    }
  }

  async function handleConfirmSchedule(dateStr) {
    try {
      await schedulePost(scheduleTarget, dateStr);
      const formatted = new Date(`${dateStr}T00:00:00`).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      showToast("success", `Post scheduled for ${formatted}.`);
      setScheduleTarget(null);
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't schedule this post."
      );
      throw err;
    }
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="border-b border-surface-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-display text-sm font-medium text-slate transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 font-display text-sm font-semibold text-ink">
            <Sparkles size={16} className="text-primary" />
            AI Post Assistant
          </div>
          <button
            type="button"
            onClick={() => setShowScheduledPosts(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-ink transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <CalendarDays size={14} />
            Scheduled Posts
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-4xl flex-col gap-3.5 px-6 py-8">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              email={email}
            />
          ))}

          <AnimatePresence>{isGenerating && <TypingIndicator />}</AnimatePresence>

          {variations && (
            <PostVariations
              posts={variations}
              onShare={handleShare}
              onSchedule={setScheduleTarget}
            />
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-surface-border bg-white px-6 py-4"
      >
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isGenerating}
            placeholder="e.g. Create a post about job hunting tips"
            className="input-field max-h-32 flex-1 resize-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-card transition-all duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-slate-light">
          <kbd className="rounded border border-surface-border bg-surface px-1.5 py-0.5 font-sans">
            Enter
          </kbd>{" "}
          to send
          {" · "}
          <kbd className="rounded border border-surface-border bg-surface px-1.5 py-0.5 font-sans">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
      </form>

      <AnimatePresence>
        {scheduleTarget && (
          <ScheduleModal
            onClose={() => setScheduleTarget(null)}
            onConfirm={handleConfirmSchedule}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduledPosts && (
          <ScheduledPostsModal onClose={() => setShowScheduledPosts(false)} />
        )}
      </AnimatePresence>

      <Toast toast={toast} />
    </div>
  );
}
