import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

const money = (v) => Number(v).toLocaleString("en-US", { style: "currency", currency: "USD" });
// The API returns UTC timestamps without a zone suffix; add one so the browser shows local time.
const when = (iso) =>
  new Date(/(Z|[+-]\d\d:\d\d)$/i.test(iso) ? iso : `${iso}Z`).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

const BADGE = {
  SUCCESS: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
};

const CARD = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function StatCard({ label, value, hint, loading }) {
  return (
    <div className={CARD}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {loading ? (
        <>
          <Skeleton className="mt-3 h-8 w-28" />
          <Skeleton className="mt-3 h-3 w-20" />
        </>
      ) : (
        <>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </>
      )}
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
    api
      .dashboardSummary()
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
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">
          {jwtFailed ? "Authentication failed" : "Could not load your dashboard"}
        </p>
        <p className="mt-1 text-sm">
          {jwtFailed
            ? "Your session token is invalid or has expired. Please sign in again."
            : error.message}
        </p>
        <div className="mt-4">
          {jwtFailed ? (
            <button className="btn" onClick={signInAgain}>Sign in again</button>
          ) : (
            <button className="btn" onClick={load}>Try again</button>
          )}
        </div>
      </div>
    );
  }

  const last5 = data?.last_5_transactions ?? [];

  return (
    <div className="space-y-6" aria-busy={loading}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={loading} label="Total spent" value={money(data?.total_amount_spent ?? 0)} hint="Successful payments, all time" />
        <StatCard loading={loading} label="Available credit" value={money(data?.available_credit_limit ?? 0)} hint="Card limits minus total spent" />
        <StatCard loading={loading} label="Total transactions" value={data?.total_transactions ?? 0} hint="Including failed payments" />
        <StatCard loading={loading} label="This month spending" value={money(data?.current_month_spending ?? 0)} hint="Successful payments this month" />
      </div>

      <section className={`${CARD} !p-0 overflow-hidden`}>
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold">Last 5 transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Amount", "Status", "Date", "Masked card"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      {["w-16", "w-20", "w-32", "w-36"].map((w) => (
                        <td key={w} className="px-4 py-3"><Skeleton className={`h-4 ${w}`} /></td>
                      ))}
                    </tr>
                  ))
                : last5.map((t, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm font-medium">{money(t.amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[t.status] || "bg-slate-100 text-slate-700"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">{when(t.date)}</td>
                      <td className="px-4 py-3 font-mono text-sm">{t.masked_card_number || "-"}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && last5.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No transactions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
