import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorText } from "../api.js";
import { ErrorBox, FraudBadge, PageHeader, Pager, Skeleton, StatusBadge, Table, money, when } from "../components/Ui.jsx";

const EMPTY = { date_from: "", date_to: "", min_amount: "", max_amount: "", status: "", masked_card: "", search: "", fraud_status: "", ordering: "-created_at" };
const STATUS_TABS = [["", "All"], ["SUCCESS", "Success"], ["FAILED", "Failed"], ["PENDING", "Pending"]];
const LABELS = { date_from: "From", date_to: "To", min_amount: "Min ₹", max_amount: "Max ₹", status: "Status", masked_card: "Card", search: "Search", fraud_status: "Fraud" };

export default function Transactions() {
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let live = true;
    setLoading(true);
    api.transactions({ ...applied, page })
      .then((d) => { if (live) { setData(d); setError(""); } })
      .catch((e) => { if (live) setError(errorText(e.data)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [applied, page]);

  useEffect(load, [load]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const chips = useMemo(() => Object.entries(applied).filter(([k, v]) => v && k !== "ordering"), [applied]);

  function apply(e) { e?.preventDefault(); setPage(1); setApplied(filters); }
  function reset() { setFilters(EMPTY); setApplied(EMPTY); setPage(1); }
  function quickStatus(status) { const next = { ...applied, status }; setFilters(next); setApplied(next); setPage(1); }
  function sortBy(ordering) { const next = { ...applied, ordering }; setFilters(next); setApplied(next); setPage(1); }
  function removeChip(k) { const next = { ...applied, [k]: "" }; setFilters(next); setApplied(next); setPage(1); }

  const flagged = data.results.filter((t) => t.fraud_status && t.fraud_status !== "CLEAR").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Transactions"
        subtitle="Search, filter and sort every payment. Filtering and pagination run on the server."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="seg" role="tablist" aria-label="Quick status filter">
          {STATUS_TABS.map(([v, label]) => (
            <button key={v || "all"} type="button" role="tab" aria-selected={applied.status === v} className={applied.status === v ? "is-active" : ""} onClick={() => quickStatus(v)}>{label}</button>
          ))}
        </div>
        {flagged > 0 && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">⚠ {flagged} flagged on this page</span>}
      </div>

      <form onSubmit={apply} className="panel grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2"><label htmlFor="search">Search reference / description</label><input id="search" value={filters.search} onChange={set("search")} placeholder="e.g. Amazon, a1b2c3d4" /></div>
        <div><label htmlFor="masked">Masked card (last 4)</label><input id="masked" inputMode="numeric" maxLength="4" value={filters.masked_card} onChange={(e) => setFilters({ ...filters, masked_card: e.target.value.replace(/\D/g, "") })} placeholder="•••• 1234" /></div>
        <div><label htmlFor="fraud">Fraud status</label><select id="fraud" value={filters.fraud_status} onChange={set("fraud_status")}><option value="">Any</option><option value="CLEAR">Clear</option><option value="FLAGGED">Flagged</option></select></div>
        <div><label htmlFor="df">From date</label><input id="df" type="date" value={filters.date_from} onChange={set("date_from")} /></div>
        <div><label htmlFor="dt">To date</label><input id="dt" type="date" value={filters.date_to} onChange={set("date_to")} /></div>
        <div><label htmlFor="min">Min amount</label><input id="min" type="number" min="0" step="0.01" value={filters.min_amount} onChange={set("min_amount")} /></div>
        <div><label htmlFor="max">Max amount</label><input id="max" type="number" min="0" step="0.01" value={filters.max_amount} onChange={set("max_amount")} /></div>
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3">
          <button className="btn">Apply filters</button>
          <button type="button" className="btn-ghost" onClick={reset}>Clear all</button>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map(([k, v]) => (
                <button key={k} type="button" className="chip" onClick={() => removeChip(k)} aria-label={`Remove ${LABELS[k]} filter`}>
                  {LABELS[k]}: <strong>{v}</strong> ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <ErrorBox message={error} />

      <div className="panel !p-0 overflow-hidden" aria-busy={loading}>
        <Table
          head={[{ label: "Date", key: "created_at" }, "Reference", "Card", "Description", { label: "Amount", key: "amount" }, { label: "Status", key: "status" }, "Fraud"]}
          empty={loading ? "" : "No transactions match these filters."}
          ordering={applied.ordering}
          onSort={sortBy}
        >
          {loading && data.results.length === 0
            ? Array.from({ length: 6 }, (_, i) => <tr key={i}>{Array.from({ length: 7 }, (_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[8rem]" /></td>)}</tr>)
            : data.results.map((t) => (
              <tr key={t.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="td whitespace-nowrap">{when(t.created_at)}</td>
                <td className="td font-mono text-xs">{t.reference.slice(0, 8)}</td>
                <td className="td font-mono">{t.card_last4 ? `•••• ${t.card_last4}` : "-"}</td>
                <td className="td max-w-[16rem] truncate" title={t.description}>{t.description || "-"}{t.category && <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">{t.category}</span>}</td>
                <td className="td whitespace-nowrap font-semibold">{money(t.amount)}</td>
                <td className="td">
                  <StatusBadge status={t.status} />
                  {t.failure_reason && <p className="mt-1 max-w-[14rem] text-xs text-slate-500">{t.failure_reason}</p>}
                </td>
                <td className="td"><FraudBadge status={t.fraud_status} reason={t.fraud_reason} /></td>
              </tr>
            ))}
        </Table>
        <Pager page={page} count={data.count} onPage={setPage} />
      </div>
    </div>
  );
}
