import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useTheme } from "../theme.jsx";
import { RoleBadge, roleOf } from "./Ui.jsx";

const link = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function signOut() { await logout(); navigate("/login"); }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-2 px-4 py-2 lg:px-6">
        <div className="mr-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white font-black">L</div>
          <span className="text-lg font-extrabold tracking-tight text-white">Ledgerly</span>
        </div>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/" end className={link}>Dashboard</NavLink>
          <NavLink to="/cards/new" className={link}>Cards</NavLink>
          <NavLink to="/pay" className={link}>Payments</NavLink>
          <NavLink to="/transactions" className={link}>Transactions</NavLink>
          <NavLink to="/analytics" className={link}>Analytics</NavLink>
          {user?.is_staff && <NavLink to="/admin" className={link}>Admin</NavLink>}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10">
            {theme === "dark" ? "☀ Light" : "◐ Dark"}
          </button>
          <span className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">{user?.username}<RoleBadge role={roleOf(user)} /></span>
          <button onClick={signOut} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">Log out</button>
        </div>
      </div>
    </header>
  );
}
