import { useEffect, useMemo, useState } from "react";
import { api, errorText } from "../api.js";
import { AreaChart, BarChart, DonutChart, EmptyChart, Gauge, PALETTE, ProgressBar, inr, utilTone } from "../components/Charts.jsx";
import { ErrorBox, PageHeader, Skeleton, StatCard, money } from "../components/Ui.jsx";

const monthLabel = (iso) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
};

function Toggle({ value, onChange, options }) {
  return (
    <div className="seg" role="group">
      {options.map(([k, label]) => (
        <button key={k} type="button" className={value === k ? "is-active" : ""} aria-pressed={value === k} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [trend, setTrend] = useState("line");
  const [catView, setCatView] = useState("donut");

  useEffect(() => {
    api.analytics().then(setData).catch((e) => setError(errorText(e.data)));
  }, []);

  const monthly = useMemo(() => (data?.monthly_spending || []).map((m) => ({ label: monthLabel(m.month), value: Number(m.total) })), [data]);
  const categories = useMemo(() => (data?.category_spending || []).map((c, i) => ({ label: c.category || "Other", value: Number(c.total), color: PALETTE[i % PALETTE.length] })), [data]);
  const cards = data?.credit_utilization || [];

  const total = monthly.reduce((s, m) => s + m.value, 0);
  const last = monthly[monthly.length - 1]?.value ?? 0;
  const prev = monthly[monthly.length - 2]?.value;
  const delta = prev ? ((last - prev) / prev) * 100 : null;
  const top = categories[0];
  const avgUtil = cards.length ? cards.reduce((s, c) => s + Number(c.utilization_percent || 0), 0) / cards.length : 0;
  const loading = !data && !error;

  async function exportAs(fmt) {
    setBusy(fmt); setError("");
    try { await api.exportAnalytics(fmt); }
    catch (e) { setError(errorText(e.data)); }
    finally { setBusy(""); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Spending analytics"
        subtitle="Monthly trends, category breakdown and credit utilization from your successful payments."
        actions={<>
          <button className="btn-ghost" disabled={!!busy} onClick={() => exportAs("pdf")}>{busy === "pdf" ? "Preparing…" : "⬇ Export PDF"}</button>
          <button className="btn" disabled={!!busy} onClick={() => exportAs("csv")}>{busy === "csv" ? "Preparing…" : "⬇ Export CSV"}</button>
        </>}
      />
      <ErrorBox message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Total spend" value={money(total)} hint={`${monthly.length} month${monthly.length === 1 ? "" : "s"} of activity`} icon="₹" />
        <StatCard loading={loading} label="Latest month" value={money(last)} hint={monthly.length > 1 ? "vs previous month" : "Current period"} delta={delta} icon="◷" tone="indigo" />
        <StatCard loading={loading} label="Top category" value={top?.label || "—"} hint={top ? money(top.value) : "No category data yet"} icon="★" tone="amber" />
        <StatCard loading={loading} label="Avg. credit utilization" value={`${avgUtil.toFixed(1)}%`} hint={cards.length ? `${cards.length} saved card${cards.length === 1 ? "" : "s"} · ${utilTone(avgUtil).label}` : "No saved cards"} icon="◔" tone={avgUtil >= 80 ? "red" : avgUtil >= 50 ? "amber" : "green"} />
      </div>

      <section className="panel chart-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label">Trend</p>
            <h2 className="mt-1 text-lg font-bold">Monthly spending summary</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hover a point to see the exact amount.</p>
          </div>
          <Toggle value={trend} onChange={setTrend} options={[["line", "Line"], ["bar", "Bar"]]} />
        </div>
        <div className="mt-4">
          {loading ? <Skeleton className="h-[280px] w-full" /> : monthly.length === 0
            ? <EmptyChart title="No spending data yet" hint="Make a successful payment to start your trend." icon="↗" />
            : trend === "line"
              ? <AreaChart data={monthly} ariaLabel="Line chart of monthly spending" />
              : <BarChart data={monthly} ariaLabel="Bar chart of monthly spending" />}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel chart-panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-label">Breakdown</p>
              <h2 className="mt-1 text-lg font-bold">Category-wise expenses</h2>
            </div>
            <Toggle value={catView} onChange={setCatView} options={[["donut", "Pie"], ["bar", "Bars"]]} />
          </div>
          <div className="mt-4">
            {loading ? <Skeleton className="h-[240px] w-full" /> : categories.length === 0
              ? <EmptyChart title="No category data yet" hint="Categories appear after your first successful payment." icon="◔" />
              : catView === "donut"
                ? <DonutChart data={categories} centerBottom="total spend" ariaLabel="Pie chart of spending by category" />
                : <BarChart data={categories} height={260} ariaLabel="Bar chart of spending by category" />}
          </div>
          {categories.length > 0 && (
            <ul className="mt-5 divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {categories.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 py-2">
                  <span className="inline-flex items-center gap-2"><i className="legend-dot" style={{ background: c.color }} />{c.label}</span>
                  <strong>{money(c.value)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel chart-panel">
          <p className="section-label">Credit</p>
          <h2 className="mt-1 text-lg font-bold">Credit utilization</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Spend as a share of each card's credit limit. Keeping it under 30% is ideal.</p>
          <div className="mt-5 space-y-6">
            {loading && <Skeleton className="h-40 w-full" />}
            {!loading && cards.length === 0 && <EmptyChart title="No saved cards" hint="Add a card to track utilization." icon="▭" />}
            {cards.map((c) => {
              const pct = Number(c.utilization_percent || 0);
              const tone = utilTone(pct);
              return (
                <div key={c.card} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold tracking-wider">{c.card}</span>
                    <span className={`text-xs font-bold ${tone.cls}`}>{tone.label}</span>
                  </div>
                  <Gauge percent={Math.round(pct * 10) / 10} label={`Utilization for ${c.card}`} />
                  <ProgressBar percent={pct} />
                  <p className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{inr(c.spent)} used</span><span>Limit {inr(c.limit)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
