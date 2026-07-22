# CompX API integration

The app runs on bundled demo data (`src/data/`, plus page-local datasets) until a
backend is configured. To integrate:

1. Copy `.env.example` to `.env.local` and set `VITE_API_BASE=https://your-api`.
2. Implement any of the GET endpoints below. Each returns JSON in **exactly the
   shape of the demo value it replaces** — the exported constants in `src/data/`
   are the contract. Endpoints are optional and independent: a missing or failing
   route just keeps that domain's demo data (a warning is logged).

| Endpoint                    | Replaces (module → export)                       |
| --------------------------- | ------------------------------------------------ |
| `GET /payment-cards`        | `data/payments.js` → `monthlyPayCards`           |
| `GET /payment-periods`      | `data/payments.js` → `fullPaymentPeriods`        |
| `GET /payment-history`      | `data/payments.js` → `PAYMENT_HISTORY`           |
| `GET /plan-elements`        | `data/plans.js` → `planElements`                 |
| `GET /goal-tabs`            | `data/plans.js` → `goalTabs`                     |
| `GET /goal-sheets`          | `data/plans.js` → `goalSheetOptions`             |
| `GET /spiff-programs`       | `data/spiffs.js` → `spiffPrograms`               |
| `GET /spiff-highlights`     | `data/spiffs.js` → `spiffBonus`                  |
| `GET /orders`               | `data/orders.js` → `orders`                      |
| `GET /revenue-transactions` | `data/orders.js` → `revenueTxns`                 |
| `GET /insights`             | `data/insights.js` → `insightCards`              |
| `GET /notifications`        | `data/insights.js` → `notifications`             |
| `GET /team/members`         | `pages/team-view/index.jsx` → `teamMembers`      |
| `GET /team/sellers`         | `pages/team-view/index.jsx` → `teamSellers`      |

Hydration runs once in `src/main.jsx` *before* the first render
(`hydrateAppData()` in `src/api/index.js`), so components keep reading the same
imported stores — no loading states were added. Auth headers, retries, or
per-domain polling belong in `src/api/client.js`.

## Bare mode (real devices)

Phone-sized viewports (≤ 520px) automatically render the app full-bleed with no
mock iPhone frame. Overrides: `?bare` forces bare mode on desktop, `?frame`
forces the framed demo on a phone.
