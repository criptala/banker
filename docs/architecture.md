# Architecture

ReconBanker is a full-stack TypeScript monorepo built around Domain-Driven Design principles with an async job processing backbone.

## Bounded contexts

The backend is organized into four bounded contexts under `src/contexts/`:

### `account`

Manages accounts and banks.

- **Account** - links a customer to a bank, holds status
- **Bank** - defines a supported bank (code, name, login URL)
- **AccountConfig** - per-account webhook URL, polling endpoint, auth settings

### `banking`

Handles bank scraping and transaction ingestion.

- **BankTransaction** - a transaction scraped from a bank account
- **ScrapeRun / ScrapeStep** - audit trail of each scraping execution
- **ScriptEnginePort** - port abstraction; `PlaywrightRunner` is the adapter

### `conciliation`

The reconciliation engine - the core of the product.

- **ConciliationRequest** - an order received from a customer system, to be matched
- **ConciliationAttempt** - each matching attempt with its result and reason
- **ConciliatedTransaction** - the confirmed match between a request and a transaction
- **ConciliationEngine** - runs rules and heuristics to produce a `MatchResult`

### `script-engine`

Manages Playwright automation scripts.

- **BankScript** - versioned script associated with a bank
- Scripts flow from `review` → `active` via `PromoteScriptUseCase`
- Supported banks: Itaú, Mi Dinero

## Reconciliation algorithm

`ConciliationEngine` processes each request in three phases:

1. **Deterministic filters** - applied to all candidate transactions:
   - `ExactAmountRule` - amount must match exactly
   - `DateWindowRule` - transaction must be within 5 days of request creation date

2. **Heuristic scoring** - applied to candidates that pass all filters:
   - `FuzzySenderHeuristic` - fuzzy string match between `sender_name` fields (score 0–1)

3. **Result resolution**:
   - One candidate with best score → `matched`
   - Multiple candidates with equal top score → `ambiguous`
   - No candidates pass filters → `not_found`

## Job queue system

Four BullMQ queues backed by Redis:

```
order-ingestion  →  PollPendingOrdersUseCase
bank-scrape      →  RunBankScrapeUseCase
conciliation     →  RunConciliationUseCase
webhook          →  NotifyWebhookUseCase
```

The Scheduler (`src/shared/queues/Scheduler.ts`) enqueues recurring jobs based on `POLLING_INTERVAL_SECONDS` and `SCRAPE_INTERVAL_SECONDS`.

## Domain event bus

An in-memory pub/sub bus (`EventBus`) connects contexts without direct coupling:

| Event | Published by | Handled by |
|---|---|---|
| `AccountCreated` | `CreateAccountUseCase` | - |
| `TransactionIngested` | `RunBankScrapeUseCase` | Enqueues pending conciliation jobs |
| `ConciliationMatched` | `RunConciliationUseCase` | Enqueues webhook notification |
| `ConciliationFailed` | `RunConciliationUseCase` | - |
| `ScrapeRunFailed` | `RunBankScrapeUseCase` | - |

## Shared kernel

`src/shared/domain/` provides base classes:

- `Entity` - base class with identity and equality
- `AggregateRoot extends Entity` - adds domain event collection and publishing
- `ValueObject` - structural equality helpers

## Database

Raw SQL migrations in `src/shared/infrastructure/db/migrations/`. The migration runner (`migrate.ts`) applies them in filename order and is idempotent.

Key tables:

| Table | Purpose |
|---|---|
| `users` | Authentication |
| `banks` | Supported bank definitions |
| `accounts` | Customer bank accounts |
| `account_config` | Per-account webhook and polling config |
| `bank_credentials` | Encrypted login credentials per account |
| `bank_transactions` | Scraped transactions |
| `bank_scripts` | Playwright scripts (versioned) |
| `bank_scrape_runs` | Scraping execution history |
| `bank_scrape_steps` | Step-level audit trail |
| `conciliation_requests` | Orders pending reconciliation |
| `conciliation_attempts` | Attempt history with reasons |
| `conciliated_transactions` | Confirmed matches |

## Frontend

React 19 SPA in `client/`. Vite dev server proxies `/api` to the backend at `localhost:3000`.

- **Routing**: React Router v7
- **Server state**: TanStack Query (caching, refetch, mutations)
- **Auth**: JWT stored in memory via React context (`lib/auth.tsx`)
- **UI**: shadcn/ui components + Tailwind CSS v4
- **i18n**: i18next with `client/src/i18n/`
