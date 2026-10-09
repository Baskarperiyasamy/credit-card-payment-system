import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api.js";
import { useAuth } from "../auth.jsx";
import CreditCard from "../components/CreditCard.jsx";
import DashboardStats from "../components/DashboardStats.jsx";
import { ErrorBox, RoleBadge, isViewOnly, roleOf } from "../components/Ui.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [statementBusy, setStatementBusy] = useState(false);
  const viewOnly = isViewOnly(user);

  useEffect(() => { api.cards().then(setCards).catch((e) => setError(errorText(e.data))); }, []);

  async function remove(card) {
    if (!window.confirm(`Delete the ${card.brand} card ending ${card.last4}?`)) return;
    try { await api.deleteCard(card.id); setCards((list) => list.filter((c) => c.id !== card.id)); }
    catch (e) { setError(errorText(e.data)); }
  }

  async function statement() {
    const d = new Date(); setStatementBusy(true); setError("");
    try { await api.downloadStatement(d.getFullYear(), d.getMonth() + 1); }
    catch (e) { setError(errorText(e.data)); }
    finally { setStatementBusy(false); }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl hero-gradient text-white shadow-lg">
        <div className="relative p-7 sm:p-9">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Personal finance dashboard</p>
              <h1 className="mt-2 !text-white text-3xl font-black tracking-tight sm:text-4xl">Welcome back, {user.username}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Track spending, monitor available credit, manage saved cards and keep every payment in one secure place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost !border-white/30 !bg-white/10 !text-white hover:!bg-white/20" disabled={statementBusy} onClick={statement}>{statementBusy ? "Generating..." : "Download statement"}</button>
              {!viewOnly && <Link to="/pay" className="btn">Make a payment</Link>}
            </div>
          </div>
        </div>
      </section>

      {viewOnly && <div role="status" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"><RoleBadge role={roleOf(user)} /><span>Your role has view-only access. Card changes and payments are disabled.</span></div>}
      <DashboardStats />
      <ErrorBox message={error} />

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="section-label">Payment methods</p><h2 className="mt-1 text-xl font-bold">Saved cards</h2></div>
          {!viewOnly && <Link to="/cards/new" className="text-sm font-semibold text-brand hover:underline">+ Add a card</Link>}
        </div>
        {cards === null ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /></div> : cards.length === 0 ? (
          <div className="panel text-center"><p className="text-slate-600">{viewOnly ? "No cards saved yet." : "No cards saved yet. Add one to start paying."}</p>{!viewOnly && <Link to="/cards/new" className="btn mt-4">Add your first card</Link>}</div>
        ) : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map((c) => <CreditCard key={c.id} card={c} onDelete={viewOnly ? undefined : remove} />)}</div>}
      </section>
    </div>
  );
}
