# FinTrack Wealth

FinTrack Wealth is a Vite + React personal finance tracker rebuilt around a cleaner architecture, Tailwind-first styling, local account/guest auth, monthly budgets, and analytics.

## Stack

- React 19
- Vite 6
- Tailwind CSS 4
- React Router
- Recharts
- Plain JavaScript with JSDoc where useful

## Folder Structure

```text
.
|-- index.html
|-- jsconfig.json
|-- package.json
|-- src
|   |-- App.jsx
|   |-- assets
|   |   |-- new-icon.png
|   |   |-- new-icon-16.png
|   |   |-- new-icon-32.png
|   |   |-- new-icon-48.png
|   |   |-- new-icon-180.png
|   |   |-- new-icon-192.png
|   |   |-- new-icon-512.png
|   |   |-- new-logo.png
|   |   |-- new-logo-light.png
|   |   `-- new-logo-dark.png
|   |-- components
|   |   |-- auth
|   |   |   `-- AuthFrame.jsx
|   |   |-- budgets
|   |   |   |-- BudgetForm.jsx
|   |   |   `-- BudgetSummaryCard.jsx
|   |   |-- charts
|   |   |   |-- CategoryBreakdownChart.jsx
|   |   |   `-- ExpenseTrendChart.jsx
|   |   |-- common
|   |   |   |-- Button.jsx
|   |   |   |-- Card.jsx
|   |   |   |-- EmptyState.jsx
|   |   |   |-- GuestAccessBanner.jsx
|   |   |   |-- Input.jsx
|   |   |   |-- Loader.jsx
|   |   |   |-- MetricCard.jsx
|   |   |   |-- Modal.jsx
|   |   |   |-- Navbar.jsx
|   |   |   |-- StatTile.jsx
|   |   |   |-- StatusBanner.jsx
|   |   |   |-- ThemedLogo.jsx
|   |   |   `-- PageHeader.jsx
|   |   |-- dashboard
|   |   |   `-- RecentTransactions.jsx
|   |   |-- tutorial
|   |   |   `-- AppTutorialModal.jsx
|   |   `-- transactions
|   |       |-- TransactionFilters.jsx
|   |       |-- TransactionForm.jsx
|   |       `-- TransactionTable.jsx
|   |-- global.css
|   |-- layouts
|   |   `-- AppLayout.jsx
|   |-- main.jsx
|   |-- pages
|   |   |-- Analytics.jsx
|   |   |-- Budgets.jsx
|   |   |-- Dashboard.jsx
|   |   |-- Settings.jsx
|   |   |-- Transactions.jsx
|   |   `-- auth
|   |       |-- AuthLanding.jsx
|   |       |-- Login.jsx
|   |       `-- Register.jsx
|   |-- routes
|   |   |-- AppRouter.jsx
|   |   `-- ProtectedRoute.jsx
|   |-- services
|   |   |-- auth.js
|   |   `-- storage.js
|   |-- state
|   |   |-- useAppStore.js
|   |   `-- useAuthStore.js
|   `-- utils
|       |-- cn.js
|       |-- constants.js
|       |-- finance.js
|       |-- format.js
|       `-- validators.js
`-- vite.config.js
```

## Setup

```bash
pnpm install
pnpm dev
```

To create a production build:

```bash
pnpm build
pnpm preview
```

## Environment Variables

Copy `.env.example` to `.env` if you want to override defaults:

```bash
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
```

Supported variables:

- `VITE_GUEST_TRIAL_DAYS`: Guest trial length in days (default: `7`).
- `VITE_AUTH_MAX_LOGIN_ATTEMPTS`: Max failed login attempts per window (default: `8`).
- `VITE_AUTH_ATTEMPT_WINDOW_MINUTES`: Login throttle window in minutes (default: `10`).

## What Changed

- Migrated the app from Next.js app-router structure to a standard Vite React app.
- Replaced scattered finance state with dedicated auth and app stores.
- Rebuilt navigation and routing around `AppRouter.jsx` and `ProtectedRoute.jsx`.
- Switched styling to Tailwind-first global tokens and reusable common components.
- Added a full budgets workflow with CRUD, progress bars, monthly spend integration, and over-budget warnings.
- Added monthly analytics with last-12-month selection, KPI cards, a donut breakdown, and a trend chart.
- Added dark/light mode with class-based theme persistence.
- Added a 7-day guest trial with expiry lock and read-only fallback.
- Added guest-to-account data migration on signup with retry-safe recovery.
- Hardened local auth with PBKDF2 password hashing and client-side login throttling.
- Added a compact 7-step onboarding tutorial modal with persistent skip/finish state.
- Improved accessibility semantics across forms, navigation, modals, and focus behavior.

## Auth Model

This refactor does **not** add a backend. Authentication is local-only:

- `Guest` mode creates a local session immediately.
- `Register` creates a browser-local account record.
- `Register` migrates current guest data (transactions + budgets) into the new account workspace.
- `Login` checks browser-local account data.
- `Logout` clears the active session.
- Guest and account workspaces are stored in different localStorage namespaces.

Important:

- This is not real server-backed authentication.
- There is no backend API in this build, so database migrations and server-side route middleware are not applicable here.
- Data does not sync across devices.
- The UI clearly labels guest mode and offers a switch-to-account path.

## Data Persistence

Data is stored in browser `localStorage` with versioned keys:

- Theme: persisted separately
- Session: persisted separately
- Accounts: browser-local account registry
- Guest sessions: created/expires/migrated metadata for guest trial enforcement
- Pending migration marker: preserves retry context if guest migration fails
- Login throttle state: tracks recent failed login attempts per email
- App data: namespaced per guest or account session

Current schema version: `v2`

Legacy handling:

- The previous `finance-transactions` key is migrated into the new guest namespace on first load.
- Safe parsing is used for all localStorage reads.
- Invalid or missing data falls back to empty app state.

## Guest Mode (7-day trial)

- Choosing `Continue as Guest` opens the guest workspace immediately.
- Guest access expires exactly 7 days after guest session creation.
- After expiry, write actions are blocked (add/edit/delete/clear) and the app enters read-only guest mode.
- The app shows an expiry banner and modal prompt when guest editing ends.
- On signup, guest data is migrated into the new account workspace and the guest session is marked migrated.
- Migration is idempotent for retries and includes a recovery path if the first attempt fails.

## Security Notes

- Password storage for new accounts uses PBKDF2-SHA256 with per-account salt and high iteration count.
- Legacy SHA-256 account hashes are upgraded to PBKDF2 on successful login.
- Login attempts are rate-limited locally per email within a rolling time window.
- All localStorage reads use safe JSON parsing fallbacks to avoid crashes from malformed data.
- Session/account/workspace records are normalized before use to reduce corruption-related crashes.
- Password digest checks use a constant-time style string comparison in-browser.
- This project has no server, so server-side auth hardening (httpOnly cookies, API rate-limit middleware, DB row-level security) is not present in this frontend-only build.

## Feature Notes

### Budgets

- Budgets are created per category and month.
- Each budget shows monthly limit, spent amount, remaining amount, and progress.
- Expense transactions automatically affect monthly budget usage.
- Duplicate category budgets for the same month are blocked.

### Analytics

- Month selector covers the last 12 months.
- Metrics include income, expenses, savings, savings rate, and top spending category.
- Charts use Recharts for category breakdown and expense trend.

### Theme

- Navbar toggle switches between light and dark mode.
- Theme preference persists in localStorage.
- All pages share the same emerald + amber design system in both themes.

## Validation and Loading States

- Auth, transaction, and budget forms validate required inputs and numeric values.
- Auth buttons show loading states for login/register actions.
- Protected routes and data views show loading states while local session/storage restores.
