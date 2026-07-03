import { Link } from "react-router-dom";
import LogoMark from "../components/layout/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <LogoMark size={40} />
      <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-slate">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
