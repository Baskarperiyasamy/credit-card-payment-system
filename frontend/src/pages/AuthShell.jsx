import { useTheme } from "../theme.jsx";

export default function AuthShell({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: "var(--page)", color: "var(--ink)" }}>
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="auth-aside relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-base font-black text-white">L</span>
              <span className="text-xl font-extrabold tracking-tight">Ledgerly</span>
            </div>
          </div>
          <div className="relative max-w-lg">
            <p className="section-label">Personal finance platform</p>
            <h2 className="mt-4 text-5xl font-black leading-[1.05]">Every payment, accounted for.</h2>
            <p className="auth-copy-muted mt-5 max-w-md text-base leading-7">
              Save cards securely, make payments in one step, and keep your transaction history organized in one place.
            </p>
          </div>
          <p className="auth-copy-muted relative text-sm">Demo environment. No real money moves.</p>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <button
            onClick={toggleTheme}
            className="absolute right-5 top-5 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:-translate-y-px sm:right-8 sm:top-8"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--ink)" }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀ Light" : "◐ Dark"}
          </button>
          <div className="w-full max-w-md">
            <div className="panel p-6 sm:p-8">
              <div className="mb-7">
                <p className="section-label">Welcome to Ledgerly</p>
                <h1 className="mt-2 text-3xl font-black">{title}</h1>
                <p className="theme-muted mt-2 text-sm leading-6">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
