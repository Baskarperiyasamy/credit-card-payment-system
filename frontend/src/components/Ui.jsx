export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}

const STYLES = {
  SUCCESS: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

export const money = (v) =>
  Number(v).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const when = (iso) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function Pager({ page, count, size = 10, onPage }) {
  const pages = Math.max(1, Math.ceil(count / size));
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
      <span>{count} {count === 1 ? "record" : "records"}</span>
      <div className="flex items-center gap-2">
        <button className="btn-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn-ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function Table({ head, children, empty }) {
  const rows = Array.isArray(children) ? children.length : children ? 1 : 0;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {rows === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">{empty}</p>}
    </div>
  );
}
