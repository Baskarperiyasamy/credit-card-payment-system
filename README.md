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

## Stop

```powershell
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete the database volume.


## Important
Use the 127.0.0.1 addresses above for Windows/Docker Desktop. The Django root URL returns a simple JSON status page; use /api/docs/ for Swagger. The FastAPI root returns a simple JSON status page; use /docs for Swagger.
