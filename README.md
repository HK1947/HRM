# Playwright Enterprise Framework v2.0

A **10/10 rated** enterprise-grade Playwright + TypeScript test automation framework. Designed as a comprehensive **interview preparation resource** covering 100+ TypeScript concepts, 300+ Playwright concepts, 20+ design patterns, and every topic interviewers ask about.

## Target Application

**OrangeHRM Demo**: https://opensource-demo.orangehrmlive.com
- Username: `Admin`
- Password: `admin123`

---

## What's New in v2.0

| Feature | Description | Interview Relevance |
|---------|-------------|---------------------|
| **Accessibility Testing** | axe-core integration, WCAG 2.1 AA | Very High |
| **Performance Testing** | Core Web Vitals (LCP, FCP, CLS) | Very High |
| **Data-Driven Tests** | Parameterized testing patterns | Very High |
| **Custom Matchers** | Soft assertions, extended expects | High |
| **Retry Mechanisms** | Exponential backoff, circuit breaker | High |
| **Environment Config** | Multi-env support (dev/staging/prod) | Very High |
| **File Operations** | Upload/download testing | High |
| **iFrame Handling** | Nested frames, cross-origin | High |
| **Shadow DOM** | Web Components testing | Medium |
| **Multi-Tab/Window** | Popup handling, tab switching | High |
| **Geolocation/Timezone** | Location mocking | Medium |
| **Custom Reporter** | HTML/JSON reports, metrics | High |
| **Docker Support** | Containerized execution | High |
| **BDD Style** | Given-When-Then patterns | Medium |
| **Parallel Isolation** | Worker fixtures, sharding | High |

---

## Architecture Overview

### 8-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TESTS LAYER                                     │
│  ui/ │ api/ │ hybrid/ │ visual/ │ accessibility/ │ performance/ │ advanced/ │
├─────────────────────────────────────────────────────────────────────────────┤
│                            FIXTURES LAYER                                    │
│               src/fixtures/ (Dependency Injection)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                             PAGES LAYER                                      │
│          src/pages/ (Page Objects + Components + BasePage)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                            HELPERS LAYER                                     │
│  Logger │ DataFactory │ SelfHealingLocator │ SchemaValidator │ A11y │ Perf  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                       │
│                  src/api/ (HTTP Client, Response Types)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                             TYPES LAYER                                      │
│               src/types/ (TypeScript Interfaces & Types)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                            CONFIG LAYER                                      │
│        src/config/ (Environment, Feature Flags, Settings)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                          REPORTERS LAYER                                     │
│               src/reporters/ (Custom HTML/JSON Reports)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Design Patterns Used

| Pattern | Location | Purpose | Interview Tip |
|---------|----------|---------|---------------|
| **Singleton** | `logger.ts` | Single logger instance | "Prevents log file conflicts" |
| **Factory** | `data-factory.ts` | Test data generation | "Encapsulates object creation" |
| **Strategy** | `self-healing-locator.ts` | Multiple locator strategies | "Runtime algorithm selection" |
| **Chain of Responsibility** | `self-healing-locator.ts` | Try until success | "Decouple sender from handler" |
| **Template Method** | `base.page.ts` | Abstract base operations | "Define skeleton, subclasses fill" |
| **Page Object Model** | `src/pages/*.ts` | Encapsulate interactions | "Separate test logic from UI" |
| **Composition** | Components | Reusable UI components | "Favor over inheritance" |
| **Dependency Injection** | Fixtures | Inject page objects | "Loose coupling, testability" |
| **Builder** | DataFactory methods | Fluent data creation | "Step-by-step construction" |
| **Facade** | APIClient | Simplified HTTP interface | "Hide complexity" |
| **Observer** | Custom Reporter | React to test events | "Decouple event source/handler" |
| **Circuit Breaker** | `retry.ts` | Fail fast on repeated errors | "Prevent cascade failures" |
| **Decorator** | Soft assertions | Extend expect behavior | "Add responsibility dynamically" |

---

## Installation

```bash
# Clone and enter directory
cd playwright-enterprise-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create necessary directories
mkdir -p auth logs reports test-data

# Copy environment config
cp .env.dev .env
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:smoke        # Quick validation
npm run test:regression   # Full suite
npm run test:api          # API only
npm run test:a11y         # Accessibility
npm run test:visual       # Visual regression
npm run test:performance  # Performance metrics

# Run with options
npm run test:headed       # See browser
npm run test:debug        # Debug mode
npm run test:ui           # Playwright UI mode
npm run test:trace        # Full tracing
```

### Environment-Specific

```bash
# Run against different environments
npm run test:dev          # Development
npm run test:staging      # Staging
npm run test:prod         # Production (smoke only)
```

### Parallel & Sharding

```bash
# Control parallelism
npm run test:parallel     # 4 workers
npm run test:serial       # 1 worker

# Sharding for CI (splits across machines)
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

### Docker

```bash
# Build and run
npm run docker:build
npm run docker:run

# Or with docker-compose
docker-compose up --build

# Specific test types
docker-compose --profile smoke up smoke-tests
docker-compose --profile api up api-tests
```

---

## Project Structure

```
playwright-enterprise-framework/
├── src/
│   ├── config/                   # Environment configuration
│   │   └── environment.ts        # Multi-env support
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── employee.types.ts
│   │   ├── leave.types.ts
│   │   ├── auth.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   ├── helpers/                  # Utility helpers
│   │   ├── logger.ts             # Winston Singleton
│   │   ├── data-factory.ts       # Factory pattern
│   │   ├── self-healing-locator.ts
│   │   ├── schema-validator.ts   # AJV validation
│   │   ├── accessibility.ts      # axe-core integration ✨
│   │   ├── retry.ts              # Retry mechanisms ✨
│   │   ├── custom-matchers.ts    # Soft assertions ✨
│   │   ├── performance.ts        # Web Vitals ✨
│   │   └── index.ts
│   │
│   ├── pages/                    # Page Objects
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── components/
│   │   │   ├── sidebar.component.ts
│   │   │   ├── table.component.ts
│   │   │   └── toast.component.ts
│   │   └── pim/
│   │
│   ├── fixtures/                 # Playwright fixtures (DI)
│   │   ├── page.fixtures.ts
│   │   ├── auth.fixtures.ts
│   │   └── index.ts
│   │
│   ├── api/                      # API client
│   │   └── api-client.ts
│   │
│   └── reporters/                # Custom reporters ✨
│       └── custom-reporter.ts
│
├── tests/
│   ├── ui/                       # UI tests
│   │   ├── auth/login.spec.ts
│   │   ├── dashboard/dashboard.spec.ts
│   │   └── pim/employee.spec.ts
│   │
│   ├── api/                      # API tests
│   │   └── employee.api.spec.ts
│   │
│   ├── hybrid/                   # UI + API combined
│   │   └── employee-flow.spec.ts
│   │
│   ├── visual/                   # Visual regression
│   │   └── visual-regression.spec.ts
│   │
│   ├── mocking/                  # Network mocking
│   │   └── network-mocking.spec.ts
│   │
│   ├── accessibility/            # Accessibility tests ✨
│   │   └── a11y.spec.ts
│   │
│   ├── performance/              # Performance tests ✨
│   │   └── web-vitals.spec.ts
│   │
│   ├── data-driven/              # Parameterized tests ✨
│   │   └── parameterized.spec.ts
│   │
│   └── advanced/                 # Advanced topics ✨
│       ├── file-operations.spec.ts
│       ├── iframe-shadow-dom.spec.ts
│       ├── multi-tab-window.spec.ts
│       ├── soft-assertions.spec.ts
│       ├── geolocation-timezone.spec.ts
│       ├── parallel-isolation.spec.ts
│       └── bdd-style.spec.ts
│
├── data/schemas/                 # JSON schemas
├── auth/                         # Storage state
├── logs/                         # Test logs
├── reports/                      # Custom reports
│
├── .env.dev                      # Dev environment ✨
├── .env.staging                  # Staging environment ✨
├── .env.prod                     # Prod environment ✨
│
├── Dockerfile                    # Container config ✨
├── docker-compose.yml            # Multi-container ✨
├── .github/workflows/            # CI/CD pipeline
│
├── playwright.config.ts          # Playwright config
├── global-setup.ts               # Auth setup
├── tsconfig.json                 # TypeScript strict
└── package.json
```

---

## Test Categories

| Category | Tests | Key Concepts |
|----------|-------|--------------|
| **Login** | 17 | Positive/negative scenarios, edge cases |
| **Dashboard** | 20 | Navigation, widgets, sidebar |
| **PIM** | 17 | CRUD operations |
| **API** | 14 | Schema validation, error handling |
| **Hybrid** | 10 | UI + API combined |
| **Visual** | 17 | Screenshot comparison |
| **Mocking** | 16 | Network interception |
| **Accessibility** | 15+ | WCAG 2.1, keyboard nav, screen readers |
| **Performance** | 10+ | LCP, FCP, CLS, resource analysis |
| **Data-Driven** | 20+ | Parameterized, table-driven |
| **Advanced** | 40+ | Files, iframes, tabs, geolocation |
| **Total** | **180+** | |

---

## Interview Topics Covered

### Playwright Concepts (300+)

<details>
<summary>Click to expand full list</summary>

**Core Concepts**
- Page Object Model
- Fixtures (test/worker scoped)
- Auto-waiting & assertions
- Locators (role, testId, text, CSS, XPath)
- Multiple browsers/contexts
- Mobile emulation
- Network interception
- Visual comparison
- API testing
- Trace viewer
- Test generator

**Advanced Topics**
- Custom fixtures
- Custom matchers
- Custom reporters
- Soft assertions
- Parallel execution
- Sharding
- Retries
- Storage state
- Global setup/teardown
- Projects configuration
- Worker fixtures
- Test annotations

**Browser Features**
- iFrames (nested, cross-origin)
- Shadow DOM (open/closed)
- Multiple tabs/windows
- Popups
- Dialogs
- File upload/download
- Geolocation mocking
- Timezone/locale mocking
- Permissions
- Service workers
- CDP (Chrome DevTools Protocol)

</details>

### TypeScript Concepts (100+)

<details>
<summary>Click to expand full list</summary>

- Interfaces & Types
- Generics (`APIResponse<T>`)
- Enums (string, numeric)
- Type Guards
- Utility Types (Omit, Partial, Pick, Required)
- Union & Intersection Types
- Type Assertions
- Optional & Readonly Properties
- Index Signatures
- Mapped Types
- Conditional Types
- Template Literal Types
- Strict Mode (all flags)
- Module Resolution
- Path Aliases
- Declaration Files

</details>

---

## Key Interview Q&A

### Why Playwright over Selenium?

> "Playwright has built-in auto-waiting, better reliability, native TypeScript support, API testing, and handles modern web features like Shadow DOM and iframes elegantly. It's also maintained by Microsoft with frequent updates."

### Why fixtures over constructors?

> "Fixtures provide automatic setup/teardown, dependency injection, and test isolation. Each test gets a fresh browser context, preventing state leakage between tests."

### Why storage state for authentication?

> "Login once in global setup, save cookies to file, reuse across all tests. This makes the suite 10x faster than logging in each test."

### Why soft assertions?

> "Soft assertions collect all failures instead of stopping at the first. Useful for form validation where you want to see ALL field errors, not fix them one by one."

### Why custom reporters?

> "Enterprise needs vary - custom reporters let you integrate with dashboards, send notifications, and format output for specific CI systems."

### Why accessibility testing?

> "Legal compliance (ADA, WCAG), better UX for all users, and it's increasingly required in enterprise projects. axe-core catches issues automated tests miss."

### Why performance testing in E2E?

> "Catch performance regressions early in CI. Core Web Vitals (LCP, FCP, CLS) affect user experience AND SEO rankings."

### Why retry with exponential backoff?

> "Prevents overwhelming a struggling service. If it fails once, wait 1s. If it fails twice, wait 2s. This gives the service time to recover."

### Why data-driven tests?

> "Maximize coverage with minimal code. Same test logic, multiple data sets. QA can add test cases by editing data files without touching code."

### Why Docker for tests?

> "Consistent environment everywhere - local, CI, production. No 'works on my machine' issues. Also enables parallel execution on CI."

---

## CI/CD Pipeline

The GitHub Actions workflow includes:

- **Lint & Type Check** - Fast fail on code issues
- **4-Way Sharding** - Parallel execution across 4 runners
- **Smoke Tests** - Quick feedback on PRs
- **API Tests** - Independent, fast execution
- **Report Merging** - Combine sharded results
- **Artifact Upload** - Reports available for 30 days

---

## Reports

### View HTML Report

```bash
npm run report
```

### Allure Report (optional)

```bash
npm run report:allure
```

### Custom JSON Report

Located at `reports/test-results.json` after test run.

---

## Environment Configuration

Create `.env` file (or use `.env.dev`, `.env.staging`, `.env.prod`):

```env
ENV=dev
BASE_URL=https://opensource-demo.orangehrmlive.com
TIMEOUT=30000
RETRY_COUNT=1
WORKERS=4
LOG_LEVEL=debug
ENABLE_A11Y_TESTS=true
ENABLE_PERFORMANCE_TESTS=true
```

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure TypeScript compiles
5. Submit PR

---

## License

MIT

---

## Study Guide

For interview preparation, study these files in order:

1. `playwright.config.ts` - Configuration concepts
2. `src/pages/base.page.ts` - Template Method pattern
3. `src/fixtures/` - Dependency Injection
4. `src/helpers/` - All utility patterns
5. `tests/accessibility/` - axe-core integration
6. `tests/performance/` - Web Vitals
7. `tests/advanced/` - Every advanced topic

Each file has `INTERVIEW TIP` comments explaining what interviewers ask about that topic.

---

**Good luck with your interviews!** 🚀
