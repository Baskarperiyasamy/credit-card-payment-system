import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api.js";
import { ErrorBox, StatusBadge, money } from "../components/Ui.jsx";

const CATEGORIES = ["Shopping", "Food & Dining", "Travel", "Bills & Utilities", "Entertainment", "Health", "Fuel", "Other"];
const LOCATIONS = ["Chennai", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Kolkata", "Pune"];

function deviceId() {
  try {
    let id = localStorage.getItem("ledgerly-device");
    if (!id) { id = `web-${Math.random().toString(36).slice(2, 8)}`; localStorage.setItem("ledgerly-device", id); }
    return id;
  } catch { return "web-browser"; }
}

export default function MakePayment() {
  const [cards, setCards] = useState(null);
  const [form, setForm] = useState({ card_id: "", amount: "", description: "", simulate: "", category: "Shopping", location: "Chennai", device_id: deviceId() });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.cards()
      .then((c) => {
        setCards(c);
        if (c.length) setForm((f) => ({ ...f, card_id: String(c[0].id) }));
      })
      .catch((e) => setError(errorText(e.data)));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = {
        card_id: Number(form.card_id),
        amount: form.amount,
        description: form.description,
        simulate: form.simulate || null,
        category: form.category,
        location: form.location.trim(),
        device_id: form.device_id.trim(),
      };
      setResult(await api.pay(body));
      setForm((f) => ({ ...f, amount: "", description: "" }));
    } catch (err) {
      setError(errorText(err.data));
    } finally {
      setBusy(false);
    }
  }

  if (cards && cards.length === 0) {
    return (
      <div className="panel mx-auto max-w-lg text-center">
        <p className="text-slate-600">You need a saved card before you can pay.</p>
        <Link to="/cards/new" className="btn mt-4">Add a card</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <h1 className="text-2xl font-bold">Make a payment</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">Payments are simulated. No real gateway is used.</p>
        <form onSubmit={submit} className="panel space-y-4">
          <ErrorBox message={error} />
          <div>
            <label htmlFor="card">Pay with</label>
            <select id="card" value={form.card_id} onChange={set("card_id")} required>
              {(cards || []).map((c) => (
                <option key={c.id} value={c.id}>{c.brand} ending {c.last4}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount">Amount (INR)</label>
            <input id="amount" type="number" min="0.01" max="100000" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" required />
          </div>
          <div>
            <label htmlFor="desc">Description</label>
            <input id="desc" maxLength={255} value={form.description} onChange={set("description")} placeholder="What is this for?" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cat">Category</label>
              <select id="cat" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="loc">Location</label>
              <input id="loc" list="loc-list" maxLength={120} value={form.location} onChange={set("location")} placeholder="e.g. Chennai" />
              <datalist id="loc-list">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
            </div>
          </div>
          <div>
            <label htmlFor="dev">Device ID</label>
            <input id="dev" maxLength={120} value={form.device_id} onChange={set("device_id")} placeholder="e.g. web-ab12cd" />
            <p className="mt-1 text-xs text-slate-500">Fraud check: paying again within 10 minutes from a different location or device flags the payment.</p>
          </div>
          <div>
            <label htmlFor="sim">Simulated outcome</label>
            <select id="sim" value={form.simulate} onChange={set("simulate")}>
              <option value="">Random (80% succeed)</option>
              <option value="success">Always succeed</option>
              <option value="failure">Always fail</option>
            </select>
          </div>
          <button className="btn" disabled={busy || !cards}>{busy ? "Processing..." : "Pay now"}</button>
        </form>
      </div>

      <aside className="md:col-span-2 md:pt-[4.5rem]">
        {result && (
          <div className="panel space-y-3" role="status">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Payment result</h2>
              <StatusBadge status={result.status} />
            </div>
            <p className="text-3xl font-bold">{money(result.amount)}</p>
            {result.fraud_status === "FLAGGED" && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                ⚠ Flagged as suspicious{result.fraud_reason ? `: ${result.fraud_reason}` : ""}. An alert email was sent.
              </div>
            )}
            {result.status === "FAILED" && <p className="text-sm text-red-700 dark:text-red-300">{result.failure_reason}</p>}
            <dl className="space-y-1 text-sm text-slate-600">
              <div className="flex justify-between"><dt>Card</dt><dd className="font-mono">•••• {result.card_last4}</dd></div>
              <div><dt>Reference</dt><dd className="break-all font-mono text-xs">{result.reference}</dd></div>
            </dl>
            <Link to="/transactions" className="text-sm font-semibold text-brand hover:underline">See in history</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
