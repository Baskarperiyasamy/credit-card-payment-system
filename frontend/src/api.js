const DJANGO = import.meta.env.VITE_DJANGO_URL || "http://localhost:8000";
const FASTAPI = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8001";

export const tokens = {
  get access() { return localStorage.getItem("access"); },
  get refresh() { return localStorage.getItem("refresh"); },
  set({ access, refresh }) {
    if (access) localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  },
  clear() {
    ["access", "refresh", "user"].forEach((k) => localStorage.removeItem(k));
  },
};

export class ApiError extends Error {
  constructor(status, data) {
    super(errorText(data));
    this.status = status;
    this.data = data;
  }
}

function flatten(value, prefix = "") {
  if (typeof value === "string") return [prefix ? `${prefix}: ${value}` : value];
  if (Array.isArray(value)) {
    return value.flatMap((v) =>
      v && typeof v === "object" && !Array.isArray(v) && "msg" in v
        ? [`${v.loc?.slice(1).join(".") || "field"}: ${v.msg}`]
        : flatten(v, prefix)
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      flatten(v, k === "non_field_errors" || k === "detail" ? prefix : k.replace(/_/g, " "))
    );
  }
  return [];
}

export function errorText(data) {
  const lines = flatten(data);
  return lines.length ? lines.join("\n") : "Something went wrong. Please try again.";
}

let refreshing = null;
async function refreshAccess() {
  if (!tokens.refresh) throw new Error("no refresh token");
  refreshing ??= fetch(`${DJANGO}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("refresh failed"))))
    .then((d) => tokens.set({ access: d.access }))
    .finally(() => { refreshing = null; });
  return refreshing;
}

async function raw(base, path, { method = "GET", body, auth = true, redirect = true } = {}, retry = true) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  let res;
  try {
    res = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { detail: "Cannot reach the server. Check that the backend is running." });
  }
  if (res.status === 401 && auth && retry && tokens.refresh) {
    try {
      await refreshAccess();
      return raw(base, path, { method, body, auth, redirect }, false);
    } catch {
      tokens.clear();
      if (redirect) window.location.href = "/login";
      throw new ApiError(401, { detail: "Your session expired. Please sign in again." });
    }
  }
  return res;
}

async function request(base, path, opts) {
  const res = await raw(base, path, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
};

export const api = {
  register: (body) => request(DJANGO, "/api/auth/register/", { method: "POST", body, auth: false }),
  login: (body) => request(DJANGO, "/api/auth/login/", { method: "POST", body, auth: false }),
  logout: () => request(DJANGO, "/api/auth/logout/", { method: "POST", body: { refresh: tokens.refresh } }),
  cards: () => request(DJANGO, "/api/cards/"),
  addCard: (body) => request(DJANGO, "/api/cards/", { method: "POST", body }),
  deleteCard: (id) => request(DJANGO, `/api/cards/${id}/`, { method: "DELETE" }),
  pay: (body) => request(FASTAPI, "/api/payments/", { method: "POST", body }),
  transactions: (params) => request(DJANGO, `/api/transactions/${qs(params)}`),
  // redirect:false -> the dashboard shows its own "JWT failed" message instead of bouncing to /login
  dashboardSummary: () => request(FASTAPI, "/dashboard/summary", { redirect: false }),
  admin: {
    summary: () => request(DJANGO, "/api/admin/summary/"),
    users: (params) => request(DJANGO, `/api/admin/users/${qs(params)}`),
    setActive: (id, is_active) => request(DJANGO, `/api/admin/users/${id}/`, { method: "PATCH", body: { is_active } }),
    cards: (params) => request(DJANGO, `/api/admin/cards/${qs(params)}`),
    transactions: (params) => request(DJANGO, `/api/admin/transactions/${qs(params)}`),
    logs: (params) => request(DJANGO, `/api/admin/logs/${qs(params)}`),
    async exportCsv(params) {
      const res = await raw(DJANGO, `/api/admin/transactions/export/${qs(params)}`);
      if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  },
};
