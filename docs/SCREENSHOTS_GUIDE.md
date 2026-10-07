# How to take the submission screenshots

1. Start the stack: `docker compose up --build`
2. Load demo data so the pages are not empty (optional but recommended):
   `docker exec -i payments_db mysql -uroot -proot_pass payments < database/payments_dump.sql`
3. Open http://localhost:3000 in Chrome, zoom 100%, window about 1280px wide.
4. Capture with Windows `Win + Shift + S` (Mac: `Cmd + Shift + 4`) and save each image into `docs/screenshots/` using the exact names below.

| # | File name | What to show |
|---|---|---|
| 1 | 01-register.png | /register page (fill the form, do not submit) |
| 2 | 02-login.png | /login page |
| 3 | 03-dashboard.png | Log in as `demo` / `Demo@Pass123`: saved cards + recent transactions |
| 4 | 04-add-card.png | /cards/new with test card `4111 1111 1111 1111`, any future expiry, CVV `123` |
| 5 | 05-make-payment.png | /pay after submitting: result panel visible (SUCCESS or FAILED) |
| 6 | 06-transactions.png | /transactions with a status filter applied |
| 7 | 07-admin-summary.png | Log in as `admin` / `Admin@12345`: Daily summary tab |
| 8 | 08-admin-users.png | Admin > Users tab |
| 9 | 09-admin-transactions.png | Admin > Transactions tab (Export CSV button visible) |
| 10 | 10-django-swagger.png | http://localhost:8000/api/docs/ |
| 11 | 11-fastapi-swagger.png | http://localhost:8001/docs |

Test cards (all pass validation): Visa `4111 1111 1111 1111`, Mastercard `5555 5555 5555 4444`, Amex `3782 822463 10005` (4-digit CVV).

## Dashboard task screenshots

| # | File name | What to show |
|---|---|---|
| 12 | 12-dashboard-stats.png | / as `demo`: four stat cards and the Last 5 transactions table |
| 13 | 13-dashboard-skeleton.png | Same page while loading (DevTools > Network > Slow 3G, then reload) |
| 14 | 14-dashboard-jwt-error.png | "Authentication failed" panel (console: `localStorage.setItem("access","bad"); localStorage.removeItem("refresh"); location.reload()`) |
| 15 | 15-fastapi-dashboard-swagger.png | http://localhost:8001/docs with `GET /dashboard/summary` expanded |
| 16 | 16-fastapi-dashboard-200.png | Swagger Execute (after Authorize): 200 response body |
| 17 | 17-postman-dashboard-pass.png | Postman: "Dashboard summary (valid JWT)" with Test Results all passed |
| 18 | 18-postman-dashboard-401.png | Postman: "no token -> 401" passed |
| 19 | 19-mysql-check.png | Optional: the same totals computed in MySQL |
