# Playwright Enterprise Framework

A 10/10 rated enterprise-grade Playwright + TypeScript test automation framework demonstrating 80+ TypeScript concepts, 260+ Playwright concepts, 17 design patterns, SOLID principles, and AI-ready features.

## Target Application

**OrangeHRM Demo**: https://opensource-demo.orangehrmlive.com
- Username: `Admin`
- Password: `admin123`

## Architecture Overview

### 6-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TESTS LAYER                              │
│  tests/ui/  │  tests/api/  │  tests/hybrid/  │  tests/visual/   │
├─────────────────────────────────────────────────────────────────┤
│                       FIXTURES LAYER                             │
│           src/fixtures/ (Dependency Injection)                   │
├─────────────────────────────────────────────────────────────────┤
│                        PAGES LAYER                               │
│     src/pages/ (Page Objects + Components + BasePage)           │
├─────────────────────────────────────────────────────────────────┤
│                       HELPERS LAYER                              │
│  Logger │ DataFactory │ SelfHealingLocator │ SchemaValidator    │
├─────────────────────────────────────────────────────────────────┤
│                        TYPES LAYER                               │
│          src/types/ (TypeScript Interfaces & Types)             │
├─────────────────────────────────────────────────────────────────┤
│                       CONFIG LAYER                               │
│         playwright.config.ts + global-setup.ts                  │
└─────────────────────────────────────────────────────────────────┘
```

## Design Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Singleton** | `logger.ts` | Single logger instance across framework |
| **Factory** | `data-factory.ts` | Test data generation with defaults |
| **Strategy** | `self-healing-locator.ts` | Multiple locator strategies |
| **Chain of Responsibility** | `self-healing-locator.ts` | Try strategies until one works |
| **Template Method** | `base.page.ts` | Abstract base with common operations |
| **Page Object Model** | `src/pages/*.ts` | Encapsulate page interactions |
| **Composition** | Components | Sidebar, Table, Toast components |
| **Dependency Injection** | Fixtures | Inject page objects into tests |
| **Builder** | DataFactory methods | Build test data with overrides |
| **Facade** | APIClient | Simplified HTTP interface |

## Code Documentation Format

Every file follows this documentation pattern:

```typescript
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * [COMPONENT NAME] - [Pattern Used]
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * WHAT: What this component does
 * WHY: Why this pattern/approach is used
 * IF NOT USED: Consequences of not using this approach
 * INTERVIEW TIP: Key talking point for interviews
 * ═══════════════════════════════════════════════════════════════════════════
 */
```

## Installation

```bash
# Clone the repository
cd playwright-enterprise-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create auth directory
mkdir -p auth
```

## Running Tests

```bash
# Run all tests
npm test

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run API tests
npm run test:api

# Run tests in headed mode
npm run test:headed

# Run tests with debug
npm run test:debug

# View test report
npm run report
```

## Project Structure

```
playwright-enterprise-framework/
├── src/
│   ├── types/                    # TypeScript type definitions
│   │   ├── employee.types.ts     # Employee entity types
│   │   ├── leave.types.ts        # Leave management types
│   │   ├── auth.types.ts         # Authentication types
│   │   ├── api.types.ts          # API response types
│   │   └── index.ts              # Barrel export
│   │
│   ├── helpers/                  # Utility helpers
│   │   ├── logger.ts             # Winston Singleton logger
│   │   ├── data-factory.ts       # Factory pattern test data
│   │   ├── self-healing-locator.ts  # AI-ready locator strategies
│   │   ├── schema-validator.ts   # AJV JSON schema validation
│   │   └── index.ts              # Barrel export
│   │
│   ├── pages/                    # Page Objects
│   │   ├── base.page.ts          # Template Method base class
│   │   ├── login.page.ts         # Login page object
│   │   ├── dashboard.page.ts     # Dashboard page object
│   │   ├── components/           # Reusable components
│   │   │   ├── sidebar.component.ts
│   │   │   ├── table.component.ts
│   │   │   └── toast.component.ts
│   │   ├── pim/                  # PIM module pages
│   │   │   ├── pim.page.ts
│   │   │   └── add-employee.page.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── fixtures/                 # Playwright fixtures (DI)
│   │   ├── page.fixtures.ts      # Page object fixtures
│   │   ├── auth.fixtures.ts      # Authentication fixtures
│   │   └── index.ts              # Merged test export
│   │
│   └── api/                      # API client
│       ├── api-client.ts         # HTTP request wrapper
│       └── index.ts              # Barrel export
│
├── tests/
│   ├── ui/
│   │   ├── auth/login.spec.ts         # 17 login tests
│   │   ├── dashboard/dashboard.spec.ts # 20 dashboard tests
│   │   └── pim/employee.spec.ts       # 17 PIM tests
│   ├── api/employee.api.spec.ts       # 14 API tests
│   ├── hybrid/employee-flow.spec.ts   # 10 hybrid tests
│   ├── visual/visual-regression.spec.ts # 17 visual tests
│   └── mocking/network-mocking.spec.ts  # 16 mocking tests
│
├── data/schemas/                 # JSON schemas for validation
│   ├── employee.schema.json
│   └── leave.schema.json
│
├── auth/                         # Storage state files
├── logs/                         # Test execution logs
├── .github/workflows/            # CI/CD pipeline
│   └── playwright.yml            # GitHub Actions with sharding
│
├── playwright.config.ts          # Playwright configuration
├── global-setup.ts               # Authentication setup
├── tsconfig.json                 # TypeScript config (strict)
└── package.json                  # Dependencies
```

## Test Categories

| Category | Count | Description |
|----------|-------|-------------|
| Login Tests | 17 | Positive, negative, edge cases |
| Dashboard Tests | 20 | Navigation, widgets, sidebar |
| PIM Tests | 17 | Employee CRUD operations |
| API Tests | 14 | Schema validation, error handling |
| Hybrid Tests | 10 | UI + API combined |
| Visual Tests | 17 | Screenshot comparisons |
| Mocking Tests | 16 | Network interception |
| **Total** | **111** | |

## Key Features

### Self-Healing Locators (AI-Ready)

```typescript
// Multiple strategies tried in priority order
const result = await selfHealingLocator.findElement(page, {
    testId: 'submit-btn',          // Priority 1
    role: 'button',                // Priority 2
    text: 'Submit',                // Priority 3
    css: '.submit-button'          // Priority 6
}, 'Submit Button');
```

### Schema Validation

```typescript
// Validate API responses against JSON schemas
const isValid = schemaValidator.validate('employee', apiResponse);
```

### Fixtures (Dependency Injection)

```typescript
// Tests declare what they need
test('should create employee', async ({ pimPage, addEmployeePage }) => {
    await pimPage.navigate();
    await pimPage.clickAddEmployee();
    // Page objects automatically injected
});
```

### Network Mocking

```typescript
// Mock API responses for edge cases
await page.route('**/api/employees**', async route => {
    await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' })
    });
});
```

## CI/CD Pipeline

GitHub Actions workflow with:
- **4-way sharding** for parallel execution
- **Smoke tests** on PRs (fast feedback)
- **Full regression** on main branch
- **Artifact upload** for reports
- **Report merging** across shards

## TypeScript Concepts Used

- Interfaces & Types
- Generics (`APIResponse<T>`)
- Enums
- Type Guards
- Utility Types (Omit, Partial, Pick)
- Union Types
- Intersection Types
- Type Assertions
- Optional Properties
- Readonly Properties
- Index Signatures
- Mapped Types
- Conditional Types
- Template Literal Types
- Strict Mode

## Playwright Concepts Used

- Page Object Model
- Fixtures & Workers
- Auto-waiting
- Locator Strategies (getByRole, getByTestId, getByText)
- Network Interception (page.route)
- Visual Comparison (toHaveScreenshot)
- Storage State (authentication)
- Multiple Browsers
- Mobile Viewports
- Tracing & Screenshots
- Parallel Execution
- Sharding
- Global Setup/Teardown
- Custom Reporters
- API Testing (request)
- Expect Assertions

## Interview Tips

1. **Why fixtures over constructors?** "Fixtures provide automatic setup/teardown and dependency injection - cleaner than manual instantiation"

2. **Why self-healing locators?** "Tests break when UI changes - multiple strategies auto-recover, reducing maintenance"

3. **Why storageState?** "Login once, reuse cookies across tests - 10x faster than logging in each test"

4. **Why sharding?** "4 shards = 4 parallel runners = 4x faster CI execution"

5. **Why schema validation?** "Catch API contract violations early - prevents silent failures from bad data"

## License

MIT
