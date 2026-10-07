export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <span className="text-xl font-bold tracking-tight">Ledgerly</span>
        <div>
          <p className="max-w-sm text-4xl font-semibold leading-tight">Every payment, accounted for.</p>
          <p className="mt-4 max-w-sm text-slate-300">
            Save cards as masked numbers, pay in one step, and see each transaction move from pending to settled.
          </p>
        </div>
        <p className="text-sm text-slate-400">Demo environment. No real money moves.</p>
      </aside>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-600">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
