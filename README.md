# Credit Card Payment System

A full-stack fintech demo. Users register, save cards (masked only), make simulated payments and review their transaction history. Admins manage users, inspect cards and transactions, export CSV and read a daily payment summary.

No real payment gateway is used. CVV and full card numbers are never stored.

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Auth, cards, transactions, admin | Django 4.2, Django REST Framework, SimpleJWT |
| Payment processing | FastAPI, SQLAlchemy |
| Database | MySQL 8 |
| Deployment | Docker, docker-compose |

## Architecture

```
React (3000) ──► Django API   (8000)  auth, cards, history, admin ──┐
      │                                                             ├──► MySQL (3307 on host)
      └────────► FastAPI      (8001)  payments ─────────────────────┘
```

Django owns the schema and issues JWTs. FastAPI verifies the same JWT (shared `JWT_SECRET`), checks the card belongs to the caller, writes the transaction as `PENDING`, runs the simulated gateway and updates it to `SUCCESS` or `FAILED`.

## Setup with Docker (recommended)

Requirements: Docker Desktop (or Docker Engine + Compose v2).

```bash
git clone <your-repo-url>
cd credit-card-payment-system
docker compose up --build
```

First start takes a few minutes. When the logs settle, open:

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Django Swagger | http://localhost:8000/api/docs/ |
| Django ReDoc | http://localhost:8000/api/redoc/ |
| Django admin site | http://localhost:8000/admin/ |
| FastAPI Swagger | http://localhost:8001/docs |

Admin login (created automatically on start): `admin` / `Admin@12345`

Stop with `Ctrl+C`; `docker compose down -v` also deletes the database volume.

Optional: load the demo data (a `demo` customer with cards and transactions) into a fresh stack:

```bash
docker compose up -d
docker exec -i payments_db mysql -uroot -proot_pass payments < database/payments_dump.sql
```

Demo customer: `demo` / `Demo@Pass123`.

## Dashboard summary API

`GET http://localhost:8001/dashboard/summary` (FastAPI, JWT required: `Authorization: Bearer <access token from Django login>`)

```json
{
  "total_transactions": 10,
  "total_amount_spent": "324.64",
  "current_month_spending": "14.00",
  "available_credit_limit": "29675.36",
  "last_5_transactions": [
    {"amount": "2.00", "masked_card_number": "**** **** **** 1111", "date": "2026-10-05T05:06:21.419843", "status": "SUCCESS"}
  ]
}
```

Rules: `total_amount_spent` and `current_month_spending` add up SUCCESS payments only; `total_transactions` counts every payment. `available_credit_limit` is the sum of the user's card limits (`cards.credit_limit`, default 10000.00 per card) minus total spent, never below 0. Dates are UTC.

Queries (3 per request): one `SELECT COUNT(*), SUM(CASE ...)` over `transactions`, one `SELECT SUM(credit_limit)` over `cards`, and the last five rows with `LEFT JOIN cards ... ORDER BY created_at DESC LIMIT 5`, served by the `tx_user_created_idx` index.

## Setup without Docker

Prerequisites: Python 3.12, Node 20+, MySQL 8 running locally.

```sql
CREATE DATABASE payments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'payments'@'localhost' IDENTIFIED BY 'payments_pass';
GRANT ALL ON payments.* TO 'payments'@'localhost';
```

```bash
# 1) Django (terminal 1)
cd django_service
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_admin                           # admin / Admin@12345
python manage.py runserver 8000

# 2) FastAPI (terminal 2)
cd fastapi_service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="mysql+pymysql://payments:payments_pass@127.0.0.1:3306/payments"   # Windows: set DATABASE_URL=...
uvicorn app.main:app --port 8001

# 3) Frontend (terminal 3)
cd frontend
npm install
npm run dev                                             # http://localhost:5173
```

Run Django first: it creates the tables FastAPI uses.

## Tests

```bash
# Django (uses SQLite so no MySQL is needed)
cd django_service
DB_ENGINE=sqlite coverage run --source=. --omit="*/migrations/*,manage.py,config/wsgi.py" manage.py test
coverage report

# FastAPI
cd fastapi_service
pytest --cov=app --cov-report=term-missing
```

On Windows PowerShell set the variable first: `$env:DB_ENGINE="sqlite"`.

| Suite | Tests | Coverage |
|---|---|---|
| Django (auth, cards, transactions, admin) | 41 | 99% |
| FastAPI (payments) | 16 | 96% |

The requirement is a minimum of 50%.

## API documentation

Interactive docs: Django at `/api/docs/`, FastAPI at `/docs`. A Postman collection is in `postman/Credit_Card_Payment_System.postman_collection.json` (import it, run the folders in order; login requests store the JWT automatically. The Register request only succeeds once per username).

### Django (port 8000)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register/` | none | Create account |
| POST | `/api/auth/login/` | none | Returns `access`, `refresh`, `user` |
| POST | `/api/auth/refresh/` | none | New access token |
| POST | `/api/auth/logout/` | user | Blacklists the refresh token |
| GET | `/api/auth/me/` | user | Current user |
| GET / POST | `/api/cards/` | user | List / add card |
| DELETE | `/api/cards/{id}/` | user | Delete own card |
| GET | `/api/transactions/` | user | History. Filters: `date_from`, `date_to`, `min_amount`, `max_amount`, `status`, `page` |
| GET | `/api/transactions/{id}/` | user | One transaction |
| GET | `/api/admin/users/` | admin | List users (`?search=`) |
| PATCH | `/api/admin/users/{id}/` | admin | Activate or deactivate |
| GET | `/api/admin/cards/` | admin | All cards (masked) |
| GET | `/api/admin/transactions/` | admin | All transactions, same filters |
| GET | `/api/admin/transactions/export/` | admin | CSV download, same filters |
| GET | `/api/admin/summary/` | admin | Totals and daily payment summary |
| GET | `/api/admin/logs/` | admin | Admin activity log |

### FastAPI (port 8001)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/payments/` | user JWT | Body: `card_id`, `amount`, `description`, optional `simulate` (`success` or `failure`) |
| GET | `/api/payments/{reference}` | user JWT | Look up own payment |
| GET | `/health` | none | Health check |

Example payment:

```bash
curl -X POST http://localhost:8001/api/payments/ \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"card_id": 1, "amount": "49.99", "description": "Test", "simulate": "success"}'
```

Without `simulate`, the gateway succeeds about 80% of the time and otherwise fails with a random reason.

## Database schema

MySQL 8, utf8mb4. Tables are created by Django migrations; `database/payments_dump.sql` is a full dump (schema plus admin and demo data).

**users**: `id` PK, `username` unique, `email` unique, `password` (PBKDF2-SHA256 hash), `first_name`, `last_name`, `is_staff`, `is_superuser`, `is_active`, `date_joined`, `last_login`

**cards**: `id` PK, `user_id` FK users (cascade), `cardholder_name`, `brand`, `masked_number` (`**** **** **** 1111`), `last4`, `expiry_month`, `expiry_year`, `created_at`

**transactions**: `id` PK, `reference` unique UUID, `user_id` FK users (cascade), `card_id` FK cards (set null), `card_last4`, `amount` DECIMAL(12,2), `currency`, `description`, `status` (`PENDING`, `SUCCESS`, `FAILED`), `failure_reason`, `created_at`, `updated_at`. Indexes on `status` and `created_at`.

**admin_logs**: `id` PK, `admin_id` FK users (cascade), `action`, `details`, `created_at`

```
users 1 ──< cards 1 ──< transactions >── 1 users
users 1 ──< admin_logs
```

Django also creates its standard tables (`django_migrations`, `auth_*`, `token_blacklist_*`, and so on).

## Security

| Rule | Implementation |
|---|---|
| No CVV storage | The serializer validates the CVV and discards it. There is no CVV column anywhere. |
| No card numbers | Only `masked_number` and `last4` are saved. The full number is checked (Luhn) and discarded. |
| Encrypted passwords | Django PBKDF2-SHA256 hashing, plus Django's password validators. |
| JWT authentication | SimpleJWT (HS256). Access tokens live 30 minutes; logout blacklists the refresh token. FastAPI verifies the same token. |
| Protected routes | API: `IsAuthenticated` / `IsAdminUser`. Frontend: route guards for users and admins. |
| Input validation | DRF serializers and Pydantic models (amount limits, Luhn, expiry, CVV length by brand, name pattern, filter parsing). |
| SQL injection | Django ORM and SQLAlchemy only; every query is parameterised. Tests cover injection attempts. |
| Data isolation | Users only ever query their own cards and transactions; other users' IDs return 404. |
| CSV injection | Exported cells starting with `=`, `+`, `-` or `@` are neutralised. |

Change `JWT_SECRET`, `DJANGO_SECRET_KEY` and `ADMIN_PASSWORD` before any real deployment.

## Project structure

```
django_service/    accounts, cards, transactions, adminpanel, config
fastapi_service/   app (payments, models, security), tests
frontend/          React + Tailwind (src/pages, src/components)
database/          Dockerfile, init.sql, payments_dump.sql
postman/           Postman collection
docs/screenshots/  UI screenshots
docker-compose.yml
```

## Screenshots

Images live in `docs/screenshots/`.

| Page | File |
|---|---|
| Register | `docs/screenshots/01-register.png` |
| Login | `docs/screenshots/02-login.png` |
| Dashboard | `docs/screenshots/03-dashboard.png` |
| Add card | `docs/screenshots/04-add-card.png` |
| Make payment | `docs/screenshots/05-make-payment.png` |
| Transaction history | `docs/screenshots/06-transactions.png` |
| Admin: daily summary | `docs/screenshots/07-admin-summary.png` |
| Admin: users | `docs/screenshots/08-admin-users.png` |
| Admin: transactions and export | `docs/screenshots/09-admin-transactions.png` |
| Django Swagger | `docs/screenshots/10-django-swagger.png` |
| FastAPI Swagger | `docs/screenshots/11-fastapi-swagger.png` |

![Dashboard](docs/screenshots/03-dashboard.png)
