# Sprint Requirements - Implementation Map

## 1. Automated email notification system

### Requirement: Transaction amount exceeds ₹5000
Implemented in the FastAPI payment flow. A successful or failed payment above ₹5,000 triggers a security email to the authenticated user's registered email address.

### Requirement: Card is blocked
Implemented in the Django admin card-management flow. When an administrator changes a card from ACTIVE to BLOCKED, the card owner receives a security notification.

### Requirement: Available credit falls below 10%
Implemented after a successful payment. The service calculates the remaining credit percentage from the configured card credit limit and successful spending. An email is sent when the remaining percentage is below 10%.

### SMTP / Mailpit
The Docker stack includes Mailpit as the local SMTP server. This satisfies the SMTP-based email requirement without requiring a real mailbox. Messages can be inspected at `http://localhost:8025`.

## 2. Dashboard dark mode with React Context API

- `ThemeProvider` uses React Context API.
- Light/dark mode is toggled from the navigation.
- The preference is stored in `localStorage`.
- The preference is restored on the next session.
- Existing Ledgerly color theme is preserved.
- Dashboard controls use accessible focus states and responsive Tailwind layouts.
- The dashboard typography has been refined with an Inter-first font stack; the existing color palette is intentionally unchanged.

## 3. Monthly statement PDF

Authenticated endpoint:

`GET /api/statements/monthly/?year=YYYY&month=MM`

The generated PDF includes:

- Statement period
- Account holder
- Total successful spending
- Transaction count
- Transaction date/time
- Description
- Masked card details
- Transaction status
- Amount
- Security note

Full card numbers and CVV values are not stored or printed.

## 4. Admin card management

Admin-only APIs and UI support:

- View all cards with masked details
- Block cards
- Unblock cards
- Update credit limits with validation
- Monitor transaction count
- Monitor successful spending
- See latest card activity
- See block timestamp
- Record administrative actions in admin logs

All admin card endpoints require Django `IsAdminUser` permission.

## Security / validation

- Blocked cards cannot make payments.
- Payments cannot exceed available credit.
- Card number uses Luhn validation.
- Card expiry is validated.
- CVV is validated and discarded; it is never stored.
- Admin credit limits have lower and upper validation bounds.
- PDF statements expose masked cards only.
- JWT authentication protects customer/admin APIs.


## Extended implementation
- Role registry and role field: `ADMIN`, `SUPPORT`, `READ_ONLY`, `CUSTOMER`; server-side role permissions are applied to card mutation and transaction endpoints. Admin-only operations remain staff restricted.
- Existing `admin_logs` records admin card changes; fraud metadata is stored on transactions and suspicious velocity is checked by FastAPI.
- Analytics: `/api/analytics/`, `/api/analytics/export/?format=csv|pdf`; system health: `/api/admin/health/`.
- Transaction search supports date range, amount range, status, masked card, free-text reference/description, fraud status and sort order; standard DRF page-number pagination remains enabled.
- Request latency and 5xx failures are logged by `RequestMetricsMiddleware`.
