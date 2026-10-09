import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { AreaChart, DonutChart } from "./Charts.jsx";
import { StatCard as UiStatCard } from "./Ui.jsx";

const money = (v) => Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const when = (iso) => new Date(/(Z|[+-]\d\d:\d\d)$/i.test(iso) ? iso : `${iso}Z`).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

const BADGE = {
  SUCCESS: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
};

function Skeleton({ className = "" }) { return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />; }

function StatCard({ mark, ...props }) { return <UiStatCard icon={mark} {...props} />; }

export default function DashboardStats() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    api.dashboardSummary().then(setData).catch((e) => setError({ status: e.status, message: e.message })).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  async function signInAgain() { await logout(); navigate("/login"); }

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
        <StatCard loading={loading} label="Available credit" value={money(data?.available_credit_limit ?? 0)} hint="Current available balance" mark="↗" />
        <StatCard loading={loading} label="Total transactions" value={data?.total_transactions ?? 0} hint="Including failed payments" mark="#" />
        <StatCard loading={loading} label="This month" value={money(data?.current_month_spending ?? 0)} hint="Successful payments this month" mark="M" />
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel chart-panel">
          <div className="flex items-start justify-between gap-3">
            <div><p className="section-label">Spending overview</p><h2 className="mt-1 text-lg font-bold">Recent payment activity</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Successful and failed payments from your latest activity</p></div>
            <span className="chart-pill">Last {Math.max(last5.length, 0)} payments</span>
          </div>
          {last5.length > 1 ? <div className="mt-4"><AreaChart height={240} ariaLabel="Line chart of recent payment amounts" data={last5.slice().reverse().map((t) => ({ label: new Date(/(Z|[+-]\d\d:\d\d)$/i.test(t.date) ? t.date : `${t.date}Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), value: Math.max(0, Number(t.amount) || 0) }))} /></div>
          : <div className="chart-empty"><span className="chart-empty-icon">↗</span><p className="font-semibold">Your activity chart will appear here</p><p className="mt-1 text-sm">Complete a few payments to build your trend.</p></div>}
        </div>
        <div className="panel chart-panel">
          <p className="section-label">Payment health</p><h2 className="mt-1 text-lg font-bold">Transaction outcomes</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Based on the latest transactions</p>
          {last5.length ? <div className="mt-4"><DonutChart ariaLabel="Donut chart of transaction outcomes" centerBottom="payments" format={(v) => String(v)} data={[
            { label: "Successful", value: last5.filter((t) => String(t.status).toUpperCase() === "SUCCESS").length, color: "#10b981" },
            { label: "Failed", value: last5.filter((t) => String(t.status).toUpperCase() === "FAILED").length, color: "#f87171" },
            { label: "Pending / other", value: last5.filter((t) => !["SUCCESS", "FAILED"].includes(String(t.status).toUpperCase())).length, color: "#fbbf24" },
          ]} /></div> : <div className="chart-empty"><span className="chart-empty-icon">◌</span><p className="font-semibold">No transaction data yet</p><p className="mt-1 text-sm">Your outcome breakdown appears after your first payment.</p></div>}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div><p className="section-label">Activity</p><h2 className="mt-1 text-lg font-semibold">Recent transactions</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Latest 5</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40"><tr>{["Amount", "Status", "Date", "Masked card"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? Array.from({ length: 5 }, (_, i) => <tr key={i}>{["w-16", "w-20", "w-32", "w-36"].map((w) => <td key={w} className="px-4 py-3"><Skeleton className={`h-4 ${w}`} /></td>)}</tr>) : last5.map((t, i) => (
                <tr key={i} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="td font-semibold">{money(t.amount)}</td>
                  <td className="td"><span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[t.status] || "bg-slate-100 text-slate-700"}`}>{t.status}</span></td>
                  <td className="td whitespace-nowrap">{when(t.date)}</td>
                  <td className="td font-mono text-xs tracking-wider">{t.masked_card_number || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && last5.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">No transactions yet.</p>}
        </div>
      </section>
    </div>
  );
}
