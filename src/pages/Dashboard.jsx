import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { dashboardFeatures } from "../data/dashboardFeatures";
import FeatureCard from "../components/dashboard/FeatureCard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { email } = useAuth();
  const firstName = email?.split("@")[0]?.split(/[.\-_]/)[0] || "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="section-label">Dashboard</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold text-ink sm:text-4xl">
          {getGreeting()}, {displayName} <span aria-hidden="true">👋</span>
        </h1>
        {/* <p className="mt-2 text-slate">
          You have 3 posts scheduled this week. What would you like to create today?
        </p> */}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardFeatures.map((feature, i) => (
          <FeatureCard key={feature.key} feature={feature} index={i} />
        ))}
      </div>
    </div>
  );
}
