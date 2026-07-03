import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoMark from "../components/layout/Logo";
import NetworkBackdrop from "../components/layout/NetworkBackdrop";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Couldn't sign in with those details. Check your email and password and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <NetworkBackdrop className="opacity-90" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card-hover">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-700 via-primary to-primary-300" />

          <div className="px-8 pb-8 pt-9 sm:px-10">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-display text-xl font-bold text-ink">
                  Linktopus
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-ink">
                Sign in to Linktopus
              </h1>
              {/* <p className="mt-1.5 text-sm text-slate">
                Schedule smarter LinkedIn content with AI
              </p> */}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="field-label">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light transition-colors hover:text-slate"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-spark/10 px-3.5 py-2.5 text-sm text-[#B8402A]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-1">
              {/* <div className="h-px flex-1 bg-surface-border" />
              <span className="text-xs text-slate-light">or continue with</span>
              <div className="h-px flex-1 bg-surface-border" /> */}
            </div>

            {/* <button type="button" className="btn-secondary w-full">
              <GoogleIcon />
              Continue with Google
            </button> */}

            {/* <p className="mt-6 text-center text-sm text-slate">
              No account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-600">
                Start your free trial
              </Link>
            </p> */}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-light">
          By signing in you agree to our{" "}
          <a
            href="#"
            className="underline decoration-slate-light/40 underline-offset-2 hover:text-slate"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline decoration-slate-light/40 underline-offset-2 hover:text-slate"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
