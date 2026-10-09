import { useId, useState } from "react";

/* Dependency-free SVG charts (line/area, bar, stacked bar, donut, gauge).
   They read the Ledgerly CSS variables, so light/dark mode works automatically. */

export const PALETTE = ["#0f9488", "#6366f1", "#f59e0b", "#ec4899", "#22c55e", "#06b6d4", "#a855f7", "#ef4444"];

export const inr = (v, compact = false) =>
  Number(v || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  });

export function niceMax(max) {
  if (!max || max <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * p;
}

function smoothPath(pts, floor, ceil) {
  if (pts.length < 2) return "";
  const clamp = (y) => Math.min(floor, Math.max(ceil, y));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, clamp(p1[1] + (p2[1] - p0[1]) * t)];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, clamp(p2[1] - (p3[1] - p1[1]) * t)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const W = 640;
const PAD = { l: 58, r: 18, t: 18, b: 34 };

function Axes({ H, max, format, ticks = 4 }) {
  const innerH = H - PAD.t - PAD.b;
  return (
    <g>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = PAD.t + innerH - (i / ticks) * innerH;
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--line)" strokeDasharray={i === 0 ? "0" : "3 5"} />
            <text x={PAD.l - 10} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{format((max / ticks) * i)}</text>
          </g>
        );
      })}
    </g>
  );
}

function Tip({ x, y, lines, H }) {
  const w = Math.max(...lines.map((l) => l.length)) * 6.6 + 22;
  const h = lines.length * 17 + 14;
  const left = Math.min(Math.max(x - w / 2, 4), W - w - 4);
  const top = y - h - 12 < 0 ? y + 14 : y - h - 12;
  return (
    <g pointerEvents="none">
      <rect x={left} y={Math.min(top, H - h - 2)} width={w} height={h} rx="10" fill="var(--ink)" opacity="0.94" />
      {lines.map((l, i) => (
        <text key={i} x={left + 11} y={Math.min(top, H - h - 2) + 22 + i * 17} fontSize="11.5" fontWeight={i === 0 ? 700 : 500} fill="var(--surface)">{l}</text>
      ))}
    </g>
  );
}

export function EmptyChart({ title = "No data yet", hint = "Data will appear here once available.", icon = "◌" }) {
  return (
    <div className="chart-empty">
      <span className="chart-empty-icon">{icon}</span>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{hint}</p>
    </div>
  );
}

/* data: [{ label, value }] */
export function AreaChart({ data, height = 280, color = "#0f9488", format = (v) => inr(v, true), tipFormat = (v) => inr(v), ariaLabel = "Line chart" }) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState(null);
  if (!data?.length) return <EmptyChart />;
  const H = height;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const x = (i) => PAD.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => PAD.t + innerH - (v / max) * innerH;
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const line = smoothPath(pts, PAD.t + innerH, PAD.t);
  const area = pts.length > 1 ? `${line} L${pts[pts.length - 1][0]},${PAD.t + innerH} L${pts[0][0]},${PAD.t + innerH} Z` : "";
  const step = Math.ceil(data.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="chart-svg" onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <Axes H={H} max={max} format={format} />
      {area && <path d={area} fill={`url(#g${gid})`} />}
      {line && <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      {hover !== null && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD.t} y2={PAD.t + innerH} stroke={color} strokeOpacity=".35" strokeDasharray="4 4" />}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 6 : 4} fill="var(--surface)" stroke={color} strokeWidth="2.5" />
      ))}
      {data.map((d, i) => (i % step === 0 || i === data.length - 1) && (
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>
      ))}
      {data.map((d, i) => (
        <rect key={i} x={x(i) - innerW / data.length / 2} y={PAD.t} width={Math.max(innerW / data.length, 24)} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} />
      ))}
      {hover !== null && <Tip x={pts[hover][0]} y={pts[hover][1]} H={H} lines={[data[hover].label, tipFormat(data[hover].value)]} />}
    </svg>
  );
}

/* data: [{ label, value }] */
export function BarChart({ data, height = 280, color = "#0f9488", format = (v) => inr(v, true), tipFormat = (v) => inr(v), ariaLabel = "Bar chart" }) {
  const [hover, setHover] = useState(null);
  if (!data?.length) return <EmptyChart />;
  const H = height;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const slot = innerW / data.length;
  const bw = Math.min(54, slot * 0.58);
  const step = Math.ceil(data.length / 10);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="chart-svg" onMouseLeave={() => setHover(null)}>
      <Axes H={H} max={max} format={format} />
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * innerH);
        const cx = PAD.l + slot * i + slot / 2;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}>
            <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={innerH} fill="transparent" />
            <rect x={cx - bw / 2} y={PAD.t + innerH - h} width={bw} height={h} rx="7" fill={d.color || color} opacity={hover === null || hover === i ? 1 : 0.45} />
            {(i % step === 0) && <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>}
          </g>
        );
      })}
      {hover !== null && <Tip x={PAD.l + slot * hover + slot / 2} y={PAD.t + innerH - Math.max(2, (data[hover].value / max) * innerH)} H={H} lines={[data[hover].label, tipFormat(data[hover].value)]} />}
    </svg>
  );
}

/* data: [{ label, a, b }] -> two stacked series (e.g. success / failed counts) */
export function StackedBarChart({ data, series, height = 280, ariaLabel = "Stacked bar chart" }) {
  const [hover, setHover] = useState(null);
  if (!data?.length) return <EmptyChart />;
  const H = height;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const totals = data.map((d) => series.reduce((s, k) => s + (d[k.key] || 0), 0));
  const max = niceMax(Math.max(...totals, 1));
  const slot = innerW / data.length;
  const bw = Math.min(40, slot * 0.6);
  const step = Math.ceil(data.length / 10);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="chart-svg" onMouseLeave={() => setHover(null)}>
      <Axes H={H} max={max} format={(v) => String(Math.round(v))} />
      {data.map((d, i) => {
        const cx = PAD.l + slot * i + slot / 2;
        let acc = 0;
        return (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={innerH} fill="transparent" />
            {series.map((k) => {
              const v = d[k.key] || 0;
              const h = (v / max) * innerH;
              const yy = PAD.t + innerH - acc - h;
              acc += h;
              return v > 0 ? <rect key={k.key} x={cx - bw / 2} y={yy} width={bw} height={h} fill={k.color} rx="3" opacity={hover === null || hover === i ? 1 : 0.45} /> : null;
            })}
            {(i % step === 0) && <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>}
          </g>
        );
      })}
      {hover !== null && <Tip x={PAD.l + slot * hover + slot / 2} y={PAD.t + innerH - (totals[hover] / max) * innerH} H={H} lines={[data[hover].label, ...series.map((k) => `${k.label}: ${data[hover][k.key] || 0}`)]} />}
    </svg>
  );
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-2"><i className="legend-dot" style={{ background: i.color }} />{i.label}</span>
      ))}
    </div>
  );
}

/* data: [{ label, value, color? }] */
export function DonutChart({ data, centerTop, centerBottom = "total", format = (v) => inr(v, true), ariaLabel = "Donut chart" }) {
  const [hover, setHover] = useState(null);
  const items = (data || []).filter((d) => d.value > 0).map((d, i) => ({ ...d, color: d.color || PALETTE[i % PALETTE.length] }));
  const total = items.reduce((s, d) => s + d.value, 0);
  if (!total) return <EmptyChart title="Nothing to show yet" hint="Complete a payment to see the breakdown." icon="◔" />;
  const R = 62;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const active = hover !== null ? items[hover] : null;
  return (
    <div className="donut-block">
      <div className="donut-wrap">
        <svg viewBox="0 0 160 160" role="img" aria-label={ariaLabel}>
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--line)" strokeWidth="18" />
          {items.map((d, i) => {
            const len = (d.value / total) * C;
            const el = (
              <circle key={d.label} cx="80" cy="80" r={R} fill="none" stroke={d.color} strokeWidth={hover === i ? 22 : 18}
                strokeDasharray={`${Math.max(len - 2, 0.5)} ${C - Math.max(len - 2, 0.5)}`} strokeDashoffset={-offset}
                transform="rotate(-90 80 80)" opacity={hover === null || hover === i ? 1 : 0.4}
                style={{ transition: "all .2s ease" }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
            );
            offset += len;
            return el;
          })}
          <text x="80" y="76" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--ink)">{active ? format(active.value) : centerTop ?? format(total)}</text>
          <text x="80" y="94" textAnchor="middle" fontSize="10" fill="var(--muted)">{active ? active.label.slice(0, 18) : centerBottom}</text>
        </svg>
      </div>
      <ul className="donut-legend">
        {items.map((d, i) => (
          <li key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={hover === i ? "is-active" : ""}>
            <i className="legend-dot" style={{ background: d.color }} />
            <span className="truncate">{d.label}</span>
            <strong>{Math.round((d.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function utilTone(p) {
  if (p >= 80) return { color: "#ef4444", label: "High", cls: "text-red-600 dark:text-red-400" };
  if (p >= 50) return { color: "#f59e0b", label: "Moderate", cls: "text-amber-600 dark:text-amber-400" };
  return { color: "#10b981", label: "Healthy", cls: "text-emerald-600 dark:text-emerald-400" };
}

/* Semi-circle gauge, percent 0-100 */
export function Gauge({ percent = 0, label }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const tone = utilTone(p);
  const R = 52;
  const arc = Math.PI * R;
  return (
    <svg viewBox="0 0 140 86" role="img" aria-label={`${label || "Utilization"} ${p}%`} className="mx-auto w-full max-w-[190px]">
      <path d="M18,76 A52,52 0 0 1 122,76" fill="none" stroke="var(--line)" strokeWidth="12" strokeLinecap="round" />
      <path d="M18,76 A52,52 0 0 1 122,76" fill="none" stroke={tone.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(p / 100) * arc} ${arc}`} style={{ transition: "stroke-dasharray .6s ease" }} />
      <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">{p}%</text>
    </svg>
  );
}

export function ProgressBar({ percent, color }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(p, p > 0 ? 2 : 0)}%`, background: color || utilTone(p).color }} />
    </div>
  );
}
