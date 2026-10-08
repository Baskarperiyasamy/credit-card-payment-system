import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

const money = (v) => Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const when = (iso) => new Date(/(Z|[+-]\d\d:\d\d)$/i.test(iso) ? iso : `${iso}Z`).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

const BADGE = {
  SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
};

function Skeleton({ className = "" }) {
  return <div className={`skeleton animate-pulse rounded ${className}`} />;
}

function StatCard({ label, value, hint, loading, mark, tone = "brand" }) {
  return (
    <div className="stat-card group rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="theme-muted text-sm font-semibold">{label}</p>
          {loading ? <Skeleton className="mt-3 h-8 w-32" /> : <p className="mt-2 truncate text-2xl font-black tracking-tight">{value}</p>}
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black ${tone === "green" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-brand-soft text-brand"}`}>
          {mark}
        </span>
      </div>
      {loading ? <Skeleton className="mt-3 h-3 w-28" /> : <p className="theme-muted mt-2 text-xs leading-5">{hint}</p>}
    </div>
  );
}

export default function DashboardStats() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.dashboardSummary()
      .then(setData)
      .catch((e) => setError({ status: e.status, message: e.message }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function signInAgain() {
    await logout();
    navigate("/login");
  }

  if (error) {
    const jwtFailed = error.status === 401;
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        <p className="font-semibold">{jwtFailed ? "Authentication failed" : "Could not load your dashboard"}</p>
        <p className="mt-1 text-sm">{jwtFailed ? "Your session token is invalid or has expired. Please sign in again." : error.message}</p>
        <div className="mt-4">{jwtFailed ? <button className="btn" onClick={signInAgain}>Sign in again</button> : <button className="btn" onClick={load}>Try again</button>}</div>
      </div>
    );
  }

  const last5 = data?.last_5_transactions ?? [];

  return (
    <div className="space-y-6" aria-busy={loading}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={loading} label="Total spent" value={money(data?.total_amount_spent ?? 0)} hint="Successful payments, all time" mark="₹" />
        <StatCard loading={loading} label="Available credit" value={money(data?.available_credit_limit ?? 0)} hint="Current available balance" mark="↗" tone="green" />
        <StatCard loading={loading} label="Total transactions" value={data?.total_transactions ?? 0} hint="Including failed payments" mark="#" />
        <StatCard loading={loading} label="This month" value={money(data?.current_month_spending ?? 0)} hint="Successful payments this month" mark="M" tone="green" />
      </div>

      <section className="table-shell overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-6" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="section-label">Activity</p>
            <h2 className="mt-1 text-xl font-black">Recent transactions</h2>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--surface-3)", color: "var(--muted)" }}>Latest 5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>{["Amount", "Status", "Date", "Masked card"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="table-row border-b">
                  {["w-16", "w-20", "w-32", "w-36"].map((w) => <td key={w} className="px-4 py-4"><Skeleton className={`h-4 ${w}`} /></td>)}
                </tr>
              )) : last5.map((t, i) => (
                <tr key={i} className="table-row border-b transition last:border-0">
                  <td className="td font-bold">{money(t.amount)}</td>
                  <td className="td"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${BADGE[t.status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{t.status}</span></td>
                  <td className="td whitespace-nowrap">{when(t.date)}</td>
                  <td className="td font-mono text-xs tracking-wider">{t.masked_card_number || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && last5.length === 0 && <p className="theme-muted px-4 py-12 text-center text-sm">No transactions yet.</p>}
        </div>
      </section>
    </div>
  );
}
