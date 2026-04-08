# Repository Map

```
reconbanker/
├── src/                                    # Backend source
│   ├── index.ts                            # Entry point - servers, workers, event handlers
│   ├── api/
│   │   ├── server.ts                       # Express app, CORS, route registration
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts          # JWT verification
│   │   │   └── error.middleware.ts         # Global error handler
│   │   └── routes/
│   │       ├── auth.routes.ts              # POST /auth/register, /auth/login
│   │       ├── accounts.routes.ts          # /accounts - CRUD + config + scrape trigger
│   │       ├── banks.routes.ts             # /banks - CRUD + scripts
│   │       ├── conciliation.routes.ts      # /conciliation - requests, manual run, poll
│   │       └── scripts.routes.ts           # /scripts - list, detail, promote
│   ├── contexts/
│   │   ├── account/                        # Account & Bank bounded context
│   │   │   ├── domain/
│   │   │   │   ├── Account.ts
│   │   │   │   ├── Bank.ts
│   │   │   │   ├── IAccountRepository.ts
│   │   │   │   └── IBankRepository.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── AccountRepository.ts
│   │   │   │   └── BankRepository.ts
│   │   │   └── application/
│   │   │       └── CreateAccountUseCase.ts
│   │   ├── banking/                        # Bank scraping bounded context
│   │   │   ├── domain/
│   │   │   │   ├── BankTransaction.ts
│   │   │   │   ├── IBankTransactionRepository.ts
│   │   │   │   ├── IScrapeRunRepository.ts
│   │   │   │   └── IScriptEnginePort.ts    # Port abstraction
│   │   │   ├── infrastructure/
│   │   │   │   ├── BankTransactionRepository.ts
│   │   │   │   ├── ScrapeRunRepository.ts
│   │   │   │   └── ScriptEngineAdapter.ts
│   │   │   └── application/
│   │   │       └── RunBankScrapeUseCase.ts
│   │   ├── conciliation/                   # Reconciliation bounded context
│   │   │   ├── domain/
│   │   │   │   ├── ConciliationEngine.ts   # Core matching logic
│   │   │   │   ├── ConciliationRequest.ts
│   │   │   │   ├── MatchResult.ts
│   │   │   │   ├── rules/
│   │   │   │   │   ├── ExactAmountRule.ts
│   │   │   │   │   └── DateWindowRule.ts
│   │   │   │   └── heuristics/
│   │   │   │       └── FuzzySenderHeuristic.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── ConciliationRequestRepository.ts
│   │   │   │   ├── ConciliatedTransactionRepository.ts
│   │   │   │   └── ConciliationAttemptRepository.ts
│   │   │   └── application/
│   │   │       ├── RunConciliationUseCase.ts
│   │   │       ├── PollPendingOrdersUseCase.ts
│   │   │       └── NotifyWebhookUseCase.ts
│   │   └── script-engine/                  # Playwright script management
│   │       ├── domain/
│   │       │   ├── BankScript.ts
│   │       │   └── IBankScriptRepository.ts
│   │       ├── infrastructure/
│   │       │   ├── PlaywrightRunner.ts
│   │       │   ├── ScriptLoader.ts
│   │       │   ├── BankScriptRepository.ts
│   │       │   └── scripts/
│   │       │       ├── itau/               # Itaú automation scripts
│   │       │       └── mi-dinero/          # Mi Dinero automation scripts
│   │       └── application/
│   │           └── PromoteScriptUseCase.ts
│   └── shared/
│       ├── domain/
│       │   ├── AggregateRoot.ts            # Base class with domain events
│       │   ├── Entity.ts
│       │   └── ValueObject.ts
│       ├── infrastructure/
│       │   └── db/
│       │       ├── client.ts               # PostgreSQL pool
│       │       ├── migrate.ts              # Migration runner
│       │       └── migrations/             # 16 ordered SQL files
│       ├── queues/
│       │   ├── QueueRegistry.ts            # BullMQ queue definitions
│       │   ├── Scheduler.ts                # Cron-based job scheduler
│       │   └── workers/
│       │       ├── order-ingestion.worker.ts
│       │       ├── bank-scrape.worker.ts
│       │       └── conciliation.worker.ts
│       └── events/
│           ├── EventBus.ts                 # In-memory pub/sub
│           ├── DomainEvent.ts
│           └── events/
│               ├── AccountCreated.event.ts
│               ├── TransactionIngested.event.ts
│               ├── ConciliationMatched.event.ts
│               ├── ConciliationFailed.event.ts
│               └── ScrapeRunFailed.event.ts
├── client/                                 # Frontend (React + Vite)
│   └── src/
│       ├── App.tsx                         # Route definitions
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Banks.tsx
│       │   ├── Accounts.tsx
│       │   ├── AccountConfig.tsx
│       │   ├── Conciliations.tsx
│       │   └── Scripts.tsx
│       ├── components/
│       │   ├── layout/AppLayout.tsx        # Sidebar nav + header
│       │   └── ui/                         # shadcn/ui components
│       ├── lib/
│       │   ├── auth.tsx                    # Auth context + JWT handling
│       │   ├── api.ts                      # Axios client (base URL, interceptors)
│       │   └── utils.ts
│       └── i18n/
│           └── index.ts                    # i18next config
├── docs/                                   # Project documentation
├── docker-compose.yml                      # PostgreSQL 16 + Redis 7
├── setup.sh                                # One-command setup script
├── package.json                            # Backend scripts + dependencies
├── pnpm-workspace.yaml                     # Monorepo workspace config
└── .env.example                            # Environment variable template
```
