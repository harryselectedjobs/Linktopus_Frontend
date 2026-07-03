import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";

export default function ComingSoon({ title, description }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          <Compass size={26} />
        </span>
        <span className="badge">Coming soon</span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 text-slate">{description}</p>
        <Link to="/" className="btn-secondary mt-8 inline-flex">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
