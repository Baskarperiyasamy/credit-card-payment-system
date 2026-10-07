const TONES = {
  Visa: "from-ink to-[#1d4e6b]",
  Mastercard: "from-[#2b1b3d] to-[#7a2e4b]",
  Amex: "from-[#0b4a47] to-brand",
  Discover: "from-[#3b2a12] to-[#a4661a]",
  Card: "from-slate-800 to-slate-600",
};

export default function CreditCard({ card, onDelete }) {
  return (
    <div className={`relative flex h-44 flex-col justify-between rounded-2xl bg-gradient-to-br ${TONES[card.brand] || TONES.Card} p-5 text-white shadow-md`}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold tracking-wide">{card.brand}</span>
        {onDelete && (
          <button onClick={() => onDelete(card)} className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Delete
          </button>
        )}
      </div>
      <p className="font-mono text-lg tracking-widest">{card.masked_number}</p>
      <div className="flex items-end justify-between text-sm">
        <span className="max-w-[60%] truncate">{card.cardholder_name}</span>
        <span className="font-mono">{String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).slice(-2)}</span>
      </div>
    </div>
  );
}
