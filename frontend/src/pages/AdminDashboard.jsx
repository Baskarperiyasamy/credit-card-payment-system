import { useCallback, useEffect, useState } from "react";
import { api, errorText } from "../api.js";
import { ErrorBox, Pager, StatusBadge, Table, money, when } from "../components/Ui.jsx";

const TABS = ["Daily summary", "Users", "Cards", "Transactions", "Admin logs"];

function Summary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.admin.summary().then(setData).catch((e) => setError(errorText(e.data)));
  }, []);
  if (error) return <ErrorBox message={error} />;
  if (!data) return <p className="text-sm text-slate-500">Loading...</p>;
  const totals = [["Users", data.totals.users], ["Cards", data.totals.cards], ["Transactions", data.totals.transactions]];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {totals.map(([label, value]) => (
          <div key={label} className="panel">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="panel !p-0 overflow-hidden">
        <Table head={["Day", "Payments", "Success", "Failed", "Pending", "Collected"]} empty="No payments yet.">
          {data.daily.map((d) => (
            <tr key={d.day}>
              <td className="td font-medium">{d.day}</td>
              <td className="td">{d.total}</td>
              <td className="td text-emerald-700">{d.success}</td>
              <td className="td text-red-700">{d.failed}</td>
              <td className="td text-amber-700">{d.pending}</td>
              <td className="td font-medium">{money(d.success_amount)}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}

function Paged({ load, head, row, empty, toolbar, deps = [] }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ count: 0, results: [] });
  const [error, setError] = useState("");
  const fetchPage = useCallback(() => {
    load(page).then((d) => { setData(d); setError(""); }).catch((e) => setError(errorText(e.data)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...deps]);
  useEffect(() => { fetchPage(); }, [fetchPage]);
  return (
    <div className="space-y-4">
      {toolbar}
      <ErrorBox message={error} />
      <div className="panel !p-0 overflow-hidden">
        <Table head={head} empty={empty}>{data.results.map((r) => row(r, fetchPage))}</Table>
        <Pager page={page} count={data.count} onPage={setPage} />
      </div>
    </div>
  );
}

function Users() {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");

  async function toggle(u, reload) {
    setError("");
    try {
      await api.admin.setActive(u.id, !u.is_active);
      reload();
    } catch (e) {
      setError(errorText(e.data));
    }
  }

  return (
    <>
      <ErrorBox message={error} />
      <Paged
        deps={[term]}
        load={(page) => api.admin.users({ page, search: term })}
        head={["ID", "Username", "Email", "Role", "Cards", "Payments", "Joined", "Status"]}
        empty="No users found."
        toolbar={
          <form onSubmit={(e) => { e.preventDefault(); setTerm(search); }} className="flex gap-3">
            <input aria-label="Search users" placeholder="Search by username or email" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <button className="btn">Search</button>
          </form>
        }
        row={(u, reload) => (
          <tr key={u.id}>
            <td className="td">{u.id}</td>
            <td className="td font-medium">{u.username}</td>
            <td className="td">{u.email}</td>
            <td className="td">{u.is_staff ? "Admin" : "Customer"}</td>
            <td className="td">{u.card_count}</td>
            <td className="td">{u.transaction_count}</td>
            <td className="td whitespace-nowrap">{when(u.date_joined)}</td>
            <td className="td">
              <button className="btn-ghost !px-3 !py-1" onClick={() => toggle(u, reload)}>
                {u.is_active ? "Deactivate" : "Activate"}
              </button>
            </td>
          </tr>
        )}
      />
    </>
  );
}

function Cards() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  async function update(card, body) {
    setError("");
    try {
      await api.admin.updateCard(card.id, body);
      setRefreshKey(v => v + 1);
    } catch (e) { setError(errorText(e.data)); }
  }

  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <Paged
        key={refreshKey}
        load={(page) => api.admin.cards({ page })}
        head={["ID", "User", "Card", "Credit limit", "Status", "Activity", "Action"]}
        empty="No cards saved."
        row={(c) => (
          <tr key={c.id}>
            <td className="td">{c.id}</td>
            <td className="td font-medium">{c.username}</td>
            <td className="td">
              <div className="font-semibold">{c.brand}</div>
              <div className="font-mono text-xs text-slate-500">{c.masked_number}</div>
              <div className="text-xs text-slate-500">{c.cardholder_name} · {String(c.expiry_month).padStart(2, "0")}/{String(c.expiry_year).slice(-2)}</div>
            </td>
            <td className="td">
              <input
                aria-label={`Credit limit for card ${c.id}`}
                type="number" min="100" step="100"
                defaultValue={c.credit_limit}
                className="max-w-[9rem]"
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (value && value !== Number(c.credit_limit)) update(c, { credit_limit: value });
                }}
              />
            </td>
            <td className="td">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${c.is_blocked ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                {c.is_blocked ? "BLOCKED" : "ACTIVE"}
              </span>
            </td>
            <td className="td"><div className="font-semibold">{c.transaction_count ?? 0} transactions</div><div className="text-xs text-slate-500">Spend: {money(c.successful_spend ?? 0)}</div><div className="text-xs text-slate-500">{c.blocked_at ? `Blocked ${when(c.blocked_at)}` : c.last_activity ? `Last used ${when(c.last_activity)}` : "No activity yet"}</div></td>
            <td className="td">
              <button
                className={c.is_blocked ? "btn" : "btn-ghost"}
                onClick={() => update(c, { is_blocked: !c.is_blocked })}
              >
                {c.is_blocked ? "Unblock" : "Block"}
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function AllTransactions() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function download() {
    setError("");
    try {
      await api.admin.exportCsv({ status });
    } catch (e) {
      setError(errorText(e.data));
    }
  }

  return (
    <>
      <ErrorBox message={error} />
      <Paged
        deps={[status]}
        load={(page) => api.admin.transactions({ page, status })}
        head={["Date", "User", "Card", "Amount", "Status", "Reference"]}
        empty="No transactions."
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[10rem]">
              <option value="">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <button className="btn" onClick={download}>Export CSV</button>
          </div>
        }
        row={(t) => (
          <tr key={t.id}>
            <td className="td whitespace-nowrap">{when(t.created_at)}</td>
            <td className="td font-medium">{t.username}</td>
            <td className="td font-mono">{t.card_last4 ? `•••• ${t.card_last4}` : "-"}</td>
            <td className="td font-medium">{money(t.amount)}</td>
            <td className="td"><StatusBadge status={t.status} /></td>
            <td className="td font-mono text-xs">{t.reference.slice(0, 8)}</td>
          </tr>
        )}
      />
    </>
  );
}

function Logs() {
  return (
    <Paged
      load={(page) => api.admin.logs({ page })}
      head={["When", "Admin", "Action", "Details"]}
      empty="No admin activity yet."
      row={(l) => (
        <tr key={l.id}>
          <td className="td whitespace-nowrap">{when(l.created_at)}</td>
          <td className="td font-medium">{l.admin}</td>
          <td className="td font-mono text-xs">{l.action}</td>
          <td className="td">{l.details}</td>
        </tr>
      )}
    />
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0]);
  const views = { "Daily summary": <Summary />, Users: <Users />, Cards: <Cards />, Transactions: <AllTransactions />, "Admin logs": <Logs /> };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Admin control center</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor users, cards, payments and security events.</p>
      </div>
      <div role="tablist" className="flex flex-wrap gap-2 border-b border-slate-300">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {views[tab]}
    </div>
  );
}
