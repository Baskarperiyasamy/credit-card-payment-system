import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-white/15 text-white" : "text-slate-300 hover:text-white"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="bg-ink">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-4 text-lg font-bold tracking-tight text-white">Ledgerly</span>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/" end className={link}>Dashboard</NavLink>
          <NavLink to="/cards/new" className={link}>Add card</NavLink>
          <NavLink to="/pay" className={link}>Make payment</NavLink>
          <NavLink to="/transactions" className={link}>Transactions</NavLink>
          {user?.is_staff && <NavLink to="/admin" className={link}>Admin</NavLink>}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-300">{user?.username}</span>
          <button onClick={signOut} className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
