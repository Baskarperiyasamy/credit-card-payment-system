import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorText } from "../api.js";
import { ErrorBox } from "../components/Ui.jsx";

const thisYear = new Date().getFullYear();

export default function AddCard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cardholder_name: "", card_number: "", expiry_month: "1", expiry_year: String(thisYear + 2), cvv: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
    setForm({ ...form, card_number: digits.replace(/(.{4})/g, "$1 ").trim() });
  };
  const setCvv = (e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.addCard({
        ...form,
        expiry_month: Number(form.expiry_month),
        expiry_year: Number(form.expiry_year),
      });
      navigate("/");
    } catch (err) {
      setError(errorText(err.data));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Add a card</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">
        Only the last four digits are kept. The full number and CVV are checked and then discarded.
      </p>
      <form onSubmit={submit} className="panel space-y-4">
        <ErrorBox message={error} />
        <div>
          <label htmlFor="name">Name on card</label>
          <input id="name" value={form.cardholder_name} onChange={set("cardholder_name")} autoComplete="cc-name" required />
        </div>
        <div>
          <label htmlFor="number">Card number</label>
          <input id="number" inputMode="numeric" value={form.card_number} onChange={setNumber} placeholder="4111 1111 1111 1111" autoComplete="cc-number" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="month">Month</label>
            <select id="month" value={form.expiry_month} onChange={set("expiry_month")}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year">Year</label>
            <select id="year" value={form.expiry_year} onChange={set("expiry_year")}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={thisYear + i}>{thisYear + i}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cvv">CVV</label>
            <input id="cvv" type="password" inputMode="numeric" value={form.cvv} onChange={setCvv} autoComplete="cc-csc" required />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save card"}</button>
          <Link to="/" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
