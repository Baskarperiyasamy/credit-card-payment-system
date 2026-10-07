import { useCallback, useEffect, useState } from "react";
import { api, errorText } from "../api.js";
import { ErrorBox, Pager, StatusBadge, Table, money, when } from "../components/Ui.jsx";

const EMPTY = { date_from: "", date_to: "", min_amount: "", max_amount: "", status: "" };

export default function Transactions() {
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ count: 0, results: [] });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.transactions({ ...applied, page })
      .then((d) => { setData(d); setError(""); })
      .catch((e) => setError(errorText(e.data)));
  }, [applied, page]);

  useEffect(load, [load]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  function apply(e) {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  }

  function reset() {
    setFilters(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction history</h1>
      <form onSubmit={apply} className="panel grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div><label htmlFor="df">From date</label><input id="df" type="date" value={filters.date_from} onChange={set("date_from")} /></div>
        <div><label htmlFor="dt">To date</label><input id="dt" type="date" value={filters.date_to} onChange={set("date_to")} /></div>
        <div><label htmlFor="min">Min amount</label><input id="min" type="number" min="0" step="0.01" value={filters.min_amount} onChange={set("min_amount")} /></div>
        <div><label htmlFor="max">Max amount</label><input id="max" type="number" min="0" step="0.01" value={filters.max_amount} onChange={set("max_amount")} /></div>
        <div>
          <label htmlFor="st">Status</label>
          <select id="st" value={filters.status} onChange={set("status")}>
            <option value="">All</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-5">
          <button className="btn">Apply filters</button>
          <button type="button" className="btn-ghost" onClick={reset}>Clear</button>
        </div>
      </form>
      <ErrorBox message={error} />
      <div className="panel !p-0 overflow-hidden">
        <Table head={["Date", "Reference", "Card", "Description", "Amount", "Status"]} empty="No transactions match these filters.">
          {data.results.map((t) => (
            <tr key={t.id}>
              <td className="td whitespace-nowrap">{when(t.created_at)}</td>
              <td className="td font-mono text-xs">{t.reference.slice(0, 8)}</td>
              <td className="td font-mono">{t.card_last4 ? `•••• ${t.card_last4}` : "-"}</td>
              <td className="td">{t.description || "-"}</td>
              <td className="td font-medium">{money(t.amount)}</td>
              <td className="td">
                <StatusBadge status={t.status} />
                {t.failure_reason && <p className="mt-1 text-xs text-slate-500">{t.failure_reason}</p>}
              </td>
            </tr>
          ))}
        </Table>
        <Pager page={page} count={data.count} onPage={setPage} />
      </div>
    </div>
  );
}
