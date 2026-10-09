import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorText } from "../api.js";
import { AreaChart, DonutChart, Gauge, Legend, ProgressBar, StackedBarChart, inr } from "../components/Charts.jsx";
import { ErrorBox, FraudBadge, PageHeader, Pager, RoleBadge, Skeleton, StatCard, StatusBadge, Table, money, when } from "../components/Ui.jsx";

const TABS = ["Overview", "Users", "Cards", "Transactions", "Admin logs", "Fraud logs", "System health", "Roles & access"];

const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

/* ---------------------------------------------------------------- Overview */
function Overview() {
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.summary().then(setSummary).catch((e) => setError(errorText(e.data)));
    api.admin.health().then(setHealth).catch(() => {});
  }, []);

  const daily = useMemo(() => (summary?.daily || []).slice().reverse(), [summary]);
  const collected = daily.map((d) => ({ label: dayLabel(d.day), value: Number(d.success_amount) }));
  const volume = daily.map((d) => ({ label: dayLabel(d.day), success: d.success, failed: d.failed, pending: d.pending }));
  const mix = [
    { label: "Success", value: daily.reduce((s, d) => s + d.success, 0), color: "#10b981" },
    { label: "Failed", value: daily.reduce((s, d) => s + d.failed, 0), color: "#f87171" },
    { label: "Pending", value: daily.reduce((s, d) => s + d.pending, 0), color: "#fbbf24" },
  ];
  const collectedTotal = daily.reduce((s, d) => s + Number(d.success_amount), 0);
  const loading = !summary && !error;

  return (
    <div className="space-y-6">
      <ErrorBox message={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard loading={loading} label="Users" value={summary?.totals.users} hint="Registered accounts" icon="👥" tone="indigo" />
        <StatCard loading={loading} label="Cards" value={summary?.totals.cards} hint="Saved payment cards" icon="▭" />
        <StatCard loading={loading} label="Transactions" value={summary?.totals.transactions} hint="All time" icon="#" tone="amber" />
        <StatCard loading={loading} label="Collected (30 days)" value={money(collectedTotal)} hint="Successful payments" icon="₹" tone="green" />
        <StatCard loading={loading && !health} label="Fraud flagged (24h)" value={health?.fraud_flagged_24h ?? 0} hint="Rule-based detection" icon="⚠" tone={health?.fraud_flagged_24h ? "red" : "green"} />
      </div>

      <section className="panel chart-panel">
        <p className="section-label">Revenue</p>
        <h2 className="mt-1 text-lg font-bold">Collected per day</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Successful payment volume over the last 30 days of activity.</p>
        <div className="mt-4">{loading ? <Skeleton className="h-[280px] w-full" /> : <AreaChart data={collected} ariaLabel="Line chart of daily collected amount" />}</div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel chart-panel">
          <p className="section-label">Volume</p>
          <h2 className="mt-1 text-lg font-bold">Payments per day by outcome</h2>
          <div className="mt-3"><Legend items={[{ label: "Success", color: "#10b981" }, { label: "Failed", color: "#f87171" }, { label: "Pending", color: "#fbbf24" }]} /></div>
          <div className="mt-3">
            {loading ? <Skeleton className="h-[280px] w-full" /> : (
              <StackedBarChart data={volume} height={280} ariaLabel="Stacked bar chart of daily payments"
                series={[{ key: "success", label: "Success", color: "#10b981" }, { key: "failed", label: "Failed", color: "#f87171" }, { key: "pending", label: "Pending", color: "#fbbf24" }]} />
            )}
          </div>
        </section>
        <section className="panel chart-panel">
          <p className="section-label">Health</p>
          <h2 className="mt-1 text-lg font-bold">Outcome mix</h2>
          <div className="mt-4">
            {loading ? <Skeleton className="h-[220px] w-full" /> : <DonutChart data={mix} centerBottom="payments" format={(v) => String(v)} ariaLabel="Pie chart of payment outcomes" />}
          </div>
        </section>
      </div>

      <section className="panel !p-0 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800"><p className="section-label">Daily summary</p><h2 className="mt-1 text-lg font-bold">Last 30 days</h2></div>
        <Table head={["Day", "Payments", "Success", "Failed", "Pending", "Collected"]} empty="No payments yet.">
          {(summary?.daily || []).map((d) => (
            <tr key={d.day}>
              <td className="td font-medium">{d.day}</td>
              <td className="td">{d.total}</td>
              <td className="td text-emerald-600 font-semibold">{d.success}</td>
              <td className="td text-red-600 font-semibold">{d.failed}</td>
              <td className="td text-amber-600 font-semibold">{d.pending}</td>
              <td className="td font-semibold">{money(d.success_amount)}</td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Paged helper */
function Paged({ load, head, row, empty, toolbar, deps = [], refreshKey = 0 }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const depKey = JSON.stringify(deps);

  useEffect(() => { setPage(1); }, [depKey]);

  const fetchPage = useCallback(() => {
    let live = true;
    setLoading(true);
    load(page)
      .then((d) => { if (live) { setData(d); setError(""); } })
      .catch((e) => { if (live) setError(errorText(e.data)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, depKey, refreshKey]);
  useEffect(fetchPage, [fetchPage]);

  return (
    <div className="space-y-4">
      {toolbar}
      <ErrorBox message={error} />
      <div className="panel !p-0 overflow-hidden" aria-busy={loading}>
        <Table head={head} empty={loading ? "Loading…" : empty}>{data.results.map((r) => row(r))}</Table>
        <Pager page={page} count={data.count} onPage={setPage} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Users */
function Users() {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  async function toggle(u) {
    setError("");
    try { await api.admin.setActive(u.id, !u.is_active); setRefresh((v) => v + 1); }
    catch (e) { setError(errorText(e.data)); }
  }
  async function changeRole(u, role) {
    setError("");
    try { await api.admin.setRole(u.id, role); setRefresh((v) => v + 1); }
    catch (e) { setError(errorText(e.data)); }
  }

  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <Paged
        deps={[term]} refreshKey={refresh}
        load={(page) => api.admin.users({ page, search: term })}
        head={["ID", "User", "Role", "Cards", "Payments", "Joined", "Status"]}
        empty="No users found."
        toolbar={
          <form onSubmit={(e) => { e.preventDefault(); setTerm(search); }} className="flex flex-wrap gap-3">
            <input aria-label="Search users" placeholder="Search by username or email" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <button className="btn">Search</button>
            {term && <button type="button" className="btn-ghost" onClick={() => { setSearch(""); setTerm(""); }}>Clear</button>}
          </form>
        }
        row={(u) => (
          <tr key={u.id}>
            <td className="td">{u.id}</td>
            <td className="td"><div className="font-semibold">{u.username}</div><div className="text-xs text-slate-500">{u.email}</div></td>
            <td className="td">
              <div className="flex items-center gap-2">
                <RoleBadge role={u.role || (u.is_staff ? "ADMIN" : "CUSTOMER")} />
                <select aria-label={`Role for ${u.username}`} className="!w-auto !py-1.5" value={u.role || (u.is_staff ? "ADMIN" : "CUSTOMER")} onChange={(e) => changeRole(u, e.target.value)}>
                  <option value="ADMIN">Admin</option><option value="SUPPORT">Support</option><option value="READ_ONLY">Read-only</option><option value="CUSTOMER">Customer</option>
                </select>
              </div>
            </td>
            <td className="td">{u.card_count}</td>
            <td className="td">{u.transaction_count}</td>
            <td className="td whitespace-nowrap">{when(u.date_joined)}</td>
            <td className="td">
              <button className={u.is_active ? "btn-ghost !px-3 !py-1.5" : "btn !px-3 !py-1.5"} onClick={() => toggle(u)}>{u.is_active ? "Deactivate" : "Activate"}</button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- Cards */
function Cards() {
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");

  async function update(card, body) {
    setError("");
    try { await api.admin.updateCard(card.id, body); setRefresh((v) => v + 1); }
    catch (e) { setError(errorText(e.data)); setRefresh((v) => v + 1); }
  }
  function toggleBlock(c) {
    const verb = c.is_blocked ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${verb} ${c.brand} ${c.masked_number} (${c.username})? This is recorded in the audit log.`)) update(c, { is_blocked: !c.is_blocked });
  }

  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <Paged
        refreshKey={refresh}
        load={(page) => api.admin.cards({ page })}
        head={["User", "Card", "Credit limit", "Utilization", "Status", "Activity", "Action"]}
        empty="No cards saved."
        row={(c) => {
          const limit = Number(c.credit_limit) || 0;
          const pct = limit ? Math.min(100, (Number(c.successful_spend || 0) / limit) * 100) : 0;
          return (
            <tr key={`${c.id}-${c.credit_limit}-${c.is_blocked}`}>
              <td className="td font-semibold">{c.username}</td>
              <td className="td">
                <div className="font-semibold">{c.brand}</div>
                <div className="font-mono text-xs text-slate-500">{c.masked_number}</div>
                <div className="text-xs text-slate-500">{c.cardholder_name} · {String(c.expiry_month).padStart(2, "0")}/{String(c.expiry_year).slice(-2)}</div>
              </td>
              <td className="td">
                <input aria-label={`Credit limit for card ${c.id}`} type="number" min="100" step="100" defaultValue={c.credit_limit} className="max-w-[9rem]"
                  onBlur={(e) => { const value = Number(e.target.value); if (value && value !== limit) update(c, { credit_limit: value }); }} />
                <p className="mt-1 text-[11px] text-slate-500">Edit and click away to save</p>
              </td>
              <td className="td min-w-[9rem]">
                <ProgressBar percent={pct} />
                <p className="mt-1 text-xs text-slate-500">{pct.toFixed(1)}% · {money(c.successful_spend ?? 0)}</p>
              </td>
              <td className="td">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${c.is_blocked ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>{c.is_blocked ? "BLOCKED" : "ACTIVE"}</span>
              </td>
              <td className="td"><div className="font-semibold">{c.transaction_count ?? 0} transactions</div><div className="text-xs text-slate-500">{c.blocked_at ? `Blocked ${when(c.blocked_at)}` : c.last_activity ? `Last used ${when(c.last_activity)}` : "No activity yet"}</div></td>
              <td className="td"><button className={c.is_blocked ? "btn" : "btn-ghost"} onClick={() => toggleBlock(c)}>{c.is_blocked ? "Unblock" : "Block"}</button></td>
            </tr>
          );
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ Transactions */
function AllTransactions() {
  const [status, setStatus] = useState("");
  const [fraud, setFraud] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function download() {
    setError(""); setBusy(true);
    try { await api.admin.exportCsv({ status, fraud_status: fraud }); }
    catch (e) { setError(errorText(e.data)); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <Paged
        deps={[status, fraud]}
        load={(page) => api.admin.transactions({ page, status, fraud_status: fraud })}
        head={["Date", "User", "Card", "Amount", "Status", "Fraud", "Reference"]}
        empty="No transactions."
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[10rem]">
              <option value="">All statuses</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="PENDING">Pending</option>
            </select>
            <select aria-label="Filter by fraud status" value={fraud} onChange={(e) => setFraud(e.target.value)} className="max-w-[10rem]">
              <option value="">Any fraud state</option><option value="FLAGGED">Flagged</option><option value="CLEAR">Clear</option>
            </select>
            <button className="btn" disabled={busy} onClick={download}>{busy ? "Exporting…" : "⬇ Export CSV"}</button>
          </div>
        }
        row={(t) => (
          <tr key={t.id}>
            <td className="td whitespace-nowrap">{when(t.created_at)}</td>
            <td className="td font-medium">{t.username}</td>
            <td className="td font-mono">{t.card_last4 ? `•••• ${t.card_last4}` : "-"}</td>
            <td className="td font-semibold">{money(t.amount)}</td>
            <td className="td"><StatusBadge status={t.status} /></td>
            <td className="td"><FraudBadge status={t.fraud_status} reason={t.fraud_reason} /></td>
            <td className="td font-mono text-xs">{t.reference.slice(0, 8)}</td>
          </tr>
        )}
      />
    </div>
  );
}

/* -------------------------------------------------------------- Audit logs */
const ACTION_TONE = (a) => /BLOCK|DEACTIV/.test(a) ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  : /ROLE/.test(a) ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
  : /EXPORT/.test(a) ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
  : /LOGIN/.test(a) ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

function Logs() {
  return (
    <Paged
      load={(page) => api.admin.logs({ page })}
      head={["When", "Admin", "Action", "Details"]}
      empty="No admin activity yet."
      row={(l) => (
        <tr key={l.id}>
          <td className="td whitespace-nowrap">{when(l.created_at)}</td>
          <td className="td font-semibold">{l.admin}</td>
          <td className="td"><span className={`inline-flex rounded-md px-2 py-1 font-mono text-[11px] font-bold ${ACTION_TONE(l.action)}`}>{l.action}</span></td>
          <td className="td">{l.details}</td>
        </tr>
      )}
    />
  );
}

function FraudLogs() {
  const [uid, setUid] = useState("");
  const [term, setTerm] = useState("");
  return (
    <Paged
      deps={[term]}
      load={(page) => api.admin.fraudLogs({ page, user_id: term })}
      head={["When", "User ID", "Transaction", "Reason", "Location", "Device"]}
      empty="No fraud events detected."
      toolbar={
        <form onSubmit={(e) => { e.preventDefault(); setTerm(uid.trim()); }} className="flex flex-wrap gap-3">
          <input aria-label="Filter by user ID" inputMode="numeric" placeholder="Filter by user ID" value={uid} onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))} className="max-w-[12rem]" />
          <button className="btn">Filter</button>
          {term && <button type="button" className="btn-ghost" onClick={() => { setUid(""); setTerm(""); }}>Clear</button>}
        </form>
      }
      row={(l) => (
        <tr key={l.id}>
          <td className="td whitespace-nowrap">{when(l.created_at)}</td>
          <td className="td">{l.user_id}</td>
          <td className="td font-mono text-xs">#{l.transaction_id}</td>
          <td className="td"><span className="inline-flex rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">⚠ {l.reason}</span></td>
          <td className="td">{l.location || "-"}</td>
          <td className="td font-mono text-xs">{l.device_id || "-"}</td>
        </tr>
      )}
    />
  );
}

/* ----------------------------------------------------------- System health */
function SystemHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);

  const load = useCallback(() => {
    api.admin.health().then((d) => { setData(d); setError(""); }).catch((e) => setError(errorText(e.data)));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [auto, load]);

  const ok = data?.status === "ok";
  const tx = data?.transactions_24h || 0;
  const failRate = tx ? Math.round((data.failed_transactions_24h / tx) * 1000) / 10 : 0;
  const fraudRate = tx ? Math.round((data.fraud_flagged_24h / tx) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <ErrorBox message={error} />
      <section className="panel chart-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`relative grid h-14 w-14 place-items-center rounded-2xl text-2xl ${!data ? "bg-slate-100 dark:bg-slate-800" : ok ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" : "bg-red-100 text-red-600 dark:bg-red-950"}`}>
              {!data ? "…" : ok ? "✓" : "!"}
              {ok && <span className="absolute inset-0 animate-ping rounded-2xl bg-emerald-400/20" />}
            </span>
            <div>
              <p className="section-label">Service status</p>
              <h2 className="text-2xl font-black">{!data ? "Checking…" : ok ? "All systems operational" : "Degraded performance"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{data?.generated_at ? `Last checked ${when(data.generated_at)}` : "Fetching live metrics"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="mb-0 inline-flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="!w-4" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-refresh (30s)</label>
            <button className="btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={!data} label="Database" value={data?.database === "ok" ? "Connected" : data?.database} hint="Live connectivity check" icon="⛁" tone={data?.database === "ok" ? "green" : "red"} />
        <StatCard loading={!data} label="Transactions (24h)" value={data?.transactions_24h} hint="Processed in the last day" icon="#" tone="indigo" />
        <StatCard loading={!data} label="Failed (24h)" value={data?.failed_transactions_24h} hint={`${failRate}% failure rate`} icon="✕" tone={failRate > 20 ? "red" : "amber"} />
        <StatCard loading={!data} label="Fraud flagged (24h)" value={data?.fraud_flagged_24h} hint={`${fraudRate}% of traffic`} icon="⚠" tone={data?.fraud_flagged_24h ? "red" : "green"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel chart-panel text-center">
          <p className="section-label">Reliability</p><h3 className="mt-1 text-lg font-bold">Failure rate (24h)</h3>
          <div className="mt-4"><Gauge percent={failRate} label="Failure rate" /></div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{data ? `${data.failed_transactions_24h} of ${tx} payments failed` : ""}</p>
        </section>
        <section className="panel chart-panel text-center">
          <p className="section-label">Risk</p><h3 className="mt-1 text-lg font-bold">Fraud-flag rate (24h)</h3>
          <div className="mt-4"><Gauge percent={fraudRate} label="Fraud rate" /></div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{data ? `${data.fraud_flagged_24h} of ${tx} payments flagged` : ""}</p>
        </section>
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        API response times and 5xx failures are recorded by the server request-metrics middleware in the <code className="font-mono">api.monitoring</code> log stream (view with <code className="font-mono">docker compose logs django</code>).
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Roles/RBAC */
const MATRIX = [
  ["View own cards, transactions & analytics", [1, 1, 1, 1]],
  ["Download monthly statement", [1, 1, 1, 1]],
  ["Add / delete cards", [1, 0, 0, 1]],
  ["Make payments", [1, 0, 0, 1]],
  ["Open the admin dashboard", [1, 0, 0, 0]],
  ["Block / unblock cards", [1, 0, 0, 0]],
  ["Update credit limits", [1, 0, 0, 0]],
  ["Change user roles / activate users", [1, 0, 0, 0]],
  ["View audit, fraud & health logs", [1, 0, 0, 0]],
  ["Export all transactions (CSV)", [1, 0, 0, 0]],
];

function Roles() {
  const cols = ["ADMIN", "SUPPORT", "READ_ONLY", "CUSTOMER"];
  return (
    <section className="panel !p-0 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <p className="section-label">RBAC</p>
        <h2 className="mt-1 text-lg font-bold">Roles &amp; permissions</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enforced server-side on the card, transaction and admin APIs. Change a user's role from the Users tab.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/40"><tr><th className="th">Permission</th>{cols.map((c) => <th key={c} className="th text-center"><RoleBadge role={c} /></th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MATRIX.map(([label, vals]) => (
              <tr key={label}>
                <td className="td font-medium">{label}</td>
                {vals.map((v, i) => <td key={i} className="td text-center">{v ? <span className="font-black text-emerald-600">✓</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Page */
export default function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0]);
  const views = { Overview: <Overview />, Users: <Users />, Cards: <Cards />, Transactions: <AllTransactions />, "Admin logs": <Logs />, "Fraud logs": <FraudLogs />, "System health": <SystemHealth />, "Roles & access": <Roles /> };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Admin control center" subtitle="Monitor users, cards, payments, fraud and system health in one place." />
      <div role="tablist" className="tabbar">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "is-active" : ""}>{t}</button>
        ))}
      </div>
      {views[tab]}
    </div>
  );
}
