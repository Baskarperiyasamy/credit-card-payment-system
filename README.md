# Ledgerly Credit Card Payment System — Sprint Submission

## Run on Windows with Docker Desktop

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Make sure Docker Desktop is running.
4. Run:

```powershell
docker compose up --build -d
```

5. Check:

```powershell
docker compose ps
```

6. Open the application:

- Frontend: http://127.0.0.1:3000
- Django API / Swagger: http://127.0.0.1:8000/api/docs/
- Django Admin: http://127.0.0.1:8000/admin/
- FastAPI Swagger: http://127.0.0.1:8001/docs
- Mailpit: http://127.0.0.1:8025

### Default admin

Username: `admin`
Password: `Admin@12345`

These are development/demo credentials from `.env`. Change them before production use.

## Email / Mailpit

The project uses Mailpit locally. No Gmail password is required.

SMTP host: `mailpit`
SMTP port: `1025`
TLS: disabled
SSL: disabled

Open Mailpit at http://127.0.0.1:8025 to see notification emails.

## Sprint requirements included

- Automated email notification for transactions above ₹5,000.
- Email notification when a card is blocked.
- Email notification when available credit falls below 10%.
- React Context API dark/light theme with localStorage persistence.
- Responsive accessible dashboard styling while preserving the Ledgerly theme.
- Monthly statement PDF endpoint with transaction list, spending total, masked card, and summary.
- Admin card management: view, block/unblock, credit-limit update, and transaction monitoring.
- Django authentication and admin access controls.
- FastAPI payment endpoint and Swagger documentation.
- MySQL database and Mailpit in Docker.

## Added security, analytics and operations features

- Role registry and user role (`ADMIN`, `SUPPORT`, `READ_ONLY`, `CUSTOMER`), plus server-side restrictions on card mutations and transaction reads/writes. Existing admin endpoints remain staff/admin-only.
- Auditing of admin card block/unblock and credit-limit changes in the existing `admin_logs` table.
- Transaction fraud metadata, a dedicated `fraud_logs` table, and FastAPI velocity checks for repeat high-value payments and rapid location/device changes. Flagged payments are declined and marked in transaction responses.
- Per-user analytics at `/api/analytics/` with monthly, category and credit utilization summaries; CSV/PDF exports at `/api/analytics/export/?format=csv` or `?format=pdf`.
- Advanced transaction filters: `date_from`, `date_to`, `min_amount`, `max_amount`, `status`, `masked_card`, `search`, `fraud_status`, `ordering`, and server-side `page` pagination.
- Admin health endpoint `/api/admin/health/` and fraud investigations at `/api/admin/fraud-logs/`; request latency and 5xx failures are written to Django logs.

Rebuild containers after updating so migrations and dependencies are applied:

```powershell
docker compose up --build -d
```

## Stop

```powershell
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete the database volume.


## Important
Use the 127.0.0.1 addresses above for Windows/Docker Desktop. The Django root URL returns a simple JSON status page; use /api/docs/ for Swagger. The FastAPI root returns a simple JSON status page; use /docs for Swagger.


## Local URLs

- Frontend: http://127.0.0.1:3000
- Django API docs: http://127.0.0.1:8000/api/docs/
- Django health: http://127.0.0.1:8000/api/health/
- FastAPI docs: http://127.0.0.1:8001/docs
- Mailpit inbox: http://127.0.0.1:8025
- Django admin: http://127.0.0.1:8000/admin/

## Troubleshooting frontend login

If the frontend says it cannot reach the server, run `docker compose ps` and `docker compose logs --tail=100 django`. This project allows both `localhost` and `127.0.0.1` as browser origins. Rebuild after updating the archive with `docker compose down` followed by `docker compose up --build -d`. Do not run `docker compose down -v` unless you intend to delete the local database volume.

The default demo admin credentials are configured by `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` in `.env`. Change the default password before using this outside a local demo. Mailpit is a local development inbox and does not deliver real external email.
