import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorText } from "../api.js";
import { useAuth } from "../auth.jsx";
import { ErrorBox } from "../components/Ui.jsx";
import AuthShell from "./AuthShell.jsx";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      await login(form.username.trim(), form.password);
      navigate("/");
    } catch (err) {
      setError(errorText(err.data));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Passwords need 8+ characters and can't be common or all numbers.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox message={error} />
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" value={form.username} onChange={set("username")} autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
        </div>
        <div>
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
        </div>
        <button className="btn w-full" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
