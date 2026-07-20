import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BarChart3,
  CalendarDays,
  Users,
  Bell,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const ICONS = { Sparkles, BarChart3, CalendarDays, Users, Bell, Briefcase };

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function FeatureCard({ feature, index }) {
  const Icon = ICONS[feature.icon];
  const isActive = feature.status === "active";

  const content = (
    <>
      <div className="mb-4 flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isActive ? "bg-primary text-white" : "bg-surface text-slate-light"
          }`}
        >
          <Icon size={20} />
        </span>
        {isActive ? (
          <span className="badge">
            <span className="node-dot" /> Active
          </span>
        ) : (
          <span className="badge-muted">Coming soon</span>
        )}
      </div>

      <h3 className={`font-display text-base font-semibold ${isActive ? "text-ink" : "text-slate-light"}`}>
        {feature.title}
      </h3>
      <p className={`mt-1.5 text-sm leading-relaxed ${isActive ? "text-slate" : "text-slate-light"}`}>
        {feature.description}
      </p>

      {isActive && (
        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary">
          {feature.cta}
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  );

  const baseClasses = "group block p-6";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={isActive ? "card-glow" : "card opacity-70"}
    >
      {isActive ? (
        <Link to={feature.to} className={baseClasses}>
          {content}
        </Link>
      ) : (
        <div className={`${baseClasses} cursor-not-allowed select-none`}>{content}</div>
      )}
    </motion.div>
  );
}
