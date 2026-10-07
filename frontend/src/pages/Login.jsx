import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorText } from "../api.js";
import { useAuth } from "../auth.jsx";
import { ErrorBox } from "../components/Ui.jsx";
import AuthShell from "./AuthShell.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(form.username.trim(), form.password);
      navigate(user.is_staff ? "/admin" : "/");
    } catch (err) {
      setError(err.status === 401 ? "Username or password is incorrect." : errorText(err.data));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Use your username and password.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox message={error} />
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" value={form.username} onChange={set("username")} autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set("password")} autoComplete="current-password" required />
        </div>
        <button className="btn w-full" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
