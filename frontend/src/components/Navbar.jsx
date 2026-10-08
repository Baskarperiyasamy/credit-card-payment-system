import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useTheme } from "../theme.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate("/login");
  }

  const link = ({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""} rounded-xl px-3 py-2 text-sm font-semibold transition`;

  return (
    <header className="app-navbar sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-[1180px] flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
        <NavLink to="/" className="mr-2 flex shrink-0 items-center gap-2.5 rounded-xl px-1.5 py-1">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-base font-black text-white shadow-sm">L</span>
          <span className="text-lg font-extrabold tracking-tight">Ledgerly</span>
        </NavLink>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto pb-0.5 lg:order-2 lg:w-auto" aria-label="Main navigation">
          <NavLink to="/" end className={link}>Dashboard</NavLink>
          <NavLink to="/cards/new" className={link}>Cards</NavLink>
          <NavLink to="/pay" className={link}>Payments</NavLink>
          <NavLink to="/transactions" className={link}>Transactions</NavLink>
          {user?.is_staff && <NavLink to="/admin" className={link}>Admin</NavLink>}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:order-3">
          <span className="hidden max-w-28 truncate text-sm font-medium sm:block" style={{ color: "var(--nav-muted)" }}>{user?.username}</span>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:-translate-y-px"
            style={{ borderColor: "var(--border-strong)", color: "var(--nav-text)", background: "var(--surface)" }}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
            <span className="ml-1 hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button
            onClick={signOut}
            className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:-translate-y-px"
            style={{ borderColor: "var(--border-strong)", color: "var(--nav-text)", background: "var(--surface)" }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
