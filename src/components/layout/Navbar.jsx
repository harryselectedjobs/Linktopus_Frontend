import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { initialsFromEmail } from "../../utils/initials";
import LogoMark, { Wordmark } from "./Logo";

const tabs = [
  { to: "/", label: "Posts", end: true },
  // { to: "/schedule", label: "Schedule" },
  // { to: "/drafts", label: "Drafts" },
];

export default function Navbar() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/" className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <Wordmark />
        </NavLink>

        <nav className="hidden items-center gap-1 rounded-full border border-surface-border bg-surface p-1 sm:flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 font-display text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-primary text-white shadow-card"
                    : "text-slate hover:text-ink"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-surface"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 font-display text-xs font-bold text-white">
              {initialsFromEmail(email)}
            </span>
            <span className="hidden font-display text-sm font-medium text-ink sm:inline">
              {email?.split("@")[0]}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-surface-border bg-white shadow-card-hover">
              <p className="truncate border-b border-surface-border px-4 py-2.5 text-xs text-slate">
                {email}
              </p>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                <LogOut size={15} className="text-slate" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-surface-border bg-surface px-6 py-2 sm:hidden">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-1.5 font-display text-sm font-semibold ${
                isActive ? "bg-primary text-white" : "text-slate"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
