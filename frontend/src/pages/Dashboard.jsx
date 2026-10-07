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

  useEffect(() => {
    api.cards()
      .then(setCards)
      .catch((e) => setError(errorText(e.data)));
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.username}</h1>
          <p className="text-sm text-slate-600">Your card usage at a glance.</p>
        </div>
        <Link to="/pay" className="btn">Make a payment</Link>
      </div>
      <DashboardStats />
      <ErrorBox message={error} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved cards</h2>
          <Link to="/cards/new" className="text-sm font-semibold text-brand hover:underline">Add a card</Link>
        </div>
        {cards === null ? (
          <p className="text-sm text-slate-500">Loading cards...</p>
        ) : cards.length === 0 ? (
          <div className="panel text-center">
            <p className="text-slate-600">No cards saved yet. Add one to start paying.</p>
            <Link to="/cards/new" className="btn mt-4">Add your first card</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => <CreditCard key={c.id} card={c} onDelete={remove} />)}
          </div>
        )}
      </section>
    </div>
  );
}
