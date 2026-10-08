const TONES = {
  Visa: "from-ink to-[#1d4e6b]",
  Mastercard: "from-[#2b1b3d] to-[#7a2e4b]",
  Amex: "from-[#0b4a47] to-brand",
  Discover: "from-[#3b2a12] to-[#a4661a]",
  Card: "from-slate-800 to-slate-600",
};

export default function CreditCard({ card, onDelete }) {
  return (
    <article className={`group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[card.brand] || TONES.Card} p-5 text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" aria-hidden="true" />
      <div className="relative flex items-start justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Payment card</p><span className="mt-1 block text-sm font-bold tracking-wide">{card.brand}</span></div>
        {onDelete && <button onClick={() => onDelete(card)} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Delete</button>}
      </div>
      <div className="relative"><p className="font-mono text-lg tracking-[0.22em]">{card.masked_number}</p></div>
      <div className="relative flex items-end justify-between text-sm">
        <div className="min-w-0"><span className="block max-w-[12rem] truncate text-xs font-semibold uppercase tracking-wide">{card.cardholder_name}</span><span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${card.is_blocked ? "bg-red-500/30 text-red-100" : "bg-white/15 text-white"}`}>{card.is_blocked ? "BLOCKED" : "ACTIVE"} · INR {Number(card.credit_limit || 0).toLocaleString("en-IN")}</span></div>
        <span className="font-mono text-xs font-semibold">{String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).slice(-2)}</span>
      </div>
    </article>
  );
}
