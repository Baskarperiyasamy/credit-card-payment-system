import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api.js";
import { useAuth } from "../auth.jsx";
import CreditCard from "../components/CreditCard.jsx";
import DashboardStats from "../components/DashboardStats.jsx";
import { ErrorBox } from "../components/Ui.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [statementBusy, setStatementBusy] = useState(false);

  useEffect(() => {
    api.cards().then(setCards).catch((e) => setError(errorText(e.data)));
  }, []);

  async function remove(card) {
    if (!window.confirm(`Delete the ${card.brand} card ending ${card.last4}?`)) return;
    try {
      await api.deleteCard(card.id);
      setCards((list) => list.filter((c) => c.id !== card.id));
    } catch (e) {
      setError(errorText(e.data));
    }
  }

  async function statement() {
    const d = new Date();
    setStatementBusy(true);
    setError("");
    try {
      await api.downloadStatement(d.getFullYear(), d.getMonth() + 1);
    } catch (e) {
      setError(errorText(e.data));
    } finally {
      setStatementBusy(false);
    }
  }

  return (
    <div className="app-page">
      <div className="page-shell space-y-7 sm:space-y-8">
        <section className="hero-card rounded-[28px]">
          <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]" style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Personal finance dashboard
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Welcome back, {user.username}</h1>
              <p className="theme-muted mt-4 max-w-xl text-sm leading-7 sm:text-base">
                Track spending, monitor available credit, manage saved cards and keep every payment organized in one secure place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="btn-ghost" disabled={statementBusy} onClick={statement}>
                {statementBusy ? "Generating..." : "Download statement"}
              </button>
              <Link to="/pay" className="btn">Make a payment</Link>
            </div>
          </div>
        </section>

        <ErrorBox message={error} />
        <DashboardStats />

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">Payment methods</p>
              <h2 className="mt-1 text-2xl font-black">Your saved cards</h2>
              <p className="theme-muted mt-1 text-sm">Securely stored as masked card details.</p>
            </div>
            <Link to="/cards/new" className="btn-ghost">+ Add a card</Link>
          </div>

          {cards === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="skeleton h-48 animate-pulse rounded-2xl" />
              <div className="skeleton h-48 animate-pulse rounded-2xl" />
            </div>
          ) : cards.length === 0 ? (
            <div className="panel text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-2xl font-black text-brand">+</div>
              <h3 className="mt-4 text-lg font-bold">No cards saved yet</h3>
              <p className="theme-muted mt-1 text-sm">Add a card to start making payments from your dashboard.</p>
              <Link to="/cards/new" className="btn mt-5">Add your first card</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => <CreditCard key={c.id} card={c} onDelete={remove} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
