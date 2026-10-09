export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
      {message}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

const STYLES = {
  SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

export function FraudBadge({ status, reason }) {
  const s = String(status || "CLEAR").toUpperCase();
  if (s === "CLEAR") return <span className="text-xs text-slate-400">Clear</span>;
  return (
    <span title={reason || "Flagged by fraud rules"} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
      ⚠ {s}
    </span>
  );
}

const ROLE_STYLES = {
  ADMIN: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  SUPPORT: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  READ_ONLY: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CUSTOMER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};
export const ROLE_LABEL = { ADMIN: "Admin", SUPPORT: "Support", READ_ONLY: "Read-only", CUSTOMER: "Customer" };

export const roleOf = (user) => user?.role || (user?.is_staff ? "ADMIN" : "CUSTOMER");
export const isViewOnly = (user) => ["SUPPORT", "READ_ONLY"].includes(roleOf(user));

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${ROLE_STYLES[role] || ROLE_STYLES.CUSTOMER}`}>
      {ROLE_LABEL[role] || role}
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="section-label">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, loading, tone = "brand", delta }) {
  const tones = {
    brand: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base font-black ${tones[tone]}`}>{icon}</span>
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-32" /> : <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {delta != null && !loading && (
          <span className={`font-bold ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</span>
        )}
        {loading ? <Skeleton className="h-3 w-24" /> : <span>{hint}</span>}
      </div>
    </div>
  );
}

export const money = (v) =>
  Number(v || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

export const when = (iso) => {
  if (!iso) return "-";
  const safe = /(Z|[+-]\d\d:\d\d)$/i.test(iso) ? iso : `${iso}Z`;
  return new Date(safe).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page, page - 1, page + 1]);
  const list = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => { if (i && p - list[i - 1] > 1) out.push("…"); out.push(p); });
  return out;
}

export function Pager({ page, count, size = 10, onPage }) {
  const pages = Math.max(1, Math.ceil(count / size));
  const from = count === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, count);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <span>Showing <strong>{from}–{to}</strong> of <strong>{count}</strong> {count === 1 ? "record" : "records"}</span>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">‹</button>
        {pageList(page, pages).map((p, i) => p === "…" ? <span key={`e${i}`} className="px-1.5">…</span> : (
          <button key={p} className={`page-btn ${p === page ? "is-active" : ""}`} aria-current={p === page ? "page" : undefined} onClick={() => onPage(p)}>{p}</button>
        ))}
        <button className="page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">›</button>
      </nav>
    </div>
  );
}

/* head: string[] or { label, key }[]; key makes a column sortable via ordering/onSort */
export function Table({ head, children, empty, ordering, onSort }) {
  const rows = Array.isArray(children) ? children.length : children ? 1 : 0;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-950/40">
          <tr>
            {head.map((h) => {
              const label = typeof h === "string" ? h : h.label;
              const key = typeof h === "string" ? null : h.key;
              if (!key || !onSort) return <th key={label} className="th">{label}</th>;
              const asc = ordering === key;
              const desc = ordering === `-${key}`;
              return (
                <th key={label} className="th" aria-sort={asc ? "ascending" : desc ? "descending" : "none"}>
                  <button type="button" className="sort-btn" onClick={() => onSort(desc ? key : `-${key}`)}>
                    {label}<span className={asc || desc ? "text-brand" : "opacity-40"}>{asc ? "▲" : desc ? "▼" : "↕"}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
      </table>
      {rows === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">{empty}</p>}
    </div>
  );
}
