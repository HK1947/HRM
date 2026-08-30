# Test Tagging Strategy

> **INTERVIEW TIP:** "Tags let us run subsets of tests - smoke on every PR, regression nightly, a11y weekly"

## Tag Reference

| Tag | When to Use | CI Trigger |
|-----|-------------|------------|
| `@smoke` | Critical happy paths, <5 min | Every PR |
| `@regression` | Full feature coverage | Nightly, merge to main |
| `@accessibility` | WCAG compliance tests | Weekly, a11y changes |
| `@performance` | Core Web Vitals, load time | Weekly, perf changes |
| `@visual` | Screenshot comparison | Nightly |
| `@api` | Backend API tests | Every PR (fast) |
| `@e2e` | Full user flows | Nightly |
| `@flaky` | Known flaky (skip in CI) | Manual only |

## Feature Tags

| Tag | Feature Area |
|-----|--------------|
| `@auth` | Login, logout, session |
| `@pim` | Employee management |
| `@leave` | Leave requests |
| `@admin` | Admin functions |
| `@dashboard` | Dashboard widgets |

## Priority Tags

| Tag | Meaning |
|-----|---------|
| `@critical` | Site is broken if this fails |
| `@high` | Major feature broken |
| `@medium` | Feature degraded |
| `@low` | Minor/cosmetic issue |

## Usage Examples

```typescript
// Single tag
test.describe('Login Tests @smoke @auth', () => {

// Multiple tags
test('should login with valid credentials @smoke @critical @auth', async ({ page }) => {

// Skip in CI (flaky)
test('intermittent network issue @flaky @regression', async ({ page }) => {
```

## Running by Tag

```bash
# Smoke tests only
npm run test:smoke

# Regression excluding flaky
npx playwright test --grep @regression --grep-invert @flaky

# Auth feature tests
npx playwright test --grep @auth

# Critical smoke tests
npx playwright test --grep="(?=.*@smoke)(?=.*@critical)"
```

## CI/CD Tag Strategy

```
PR Created → @smoke (5 min)
     ↓
PR Approved → @smoke + @api (10 min)
     ↓
Merge to main → @regression (30 min, sharded)
     ↓
Nightly → @regression + @visual + @e2e (full suite)
     ↓
Weekly → @accessibility + @performance
```

## Tag Hygiene Rules

1. **Every test needs at least 2 tags:** suite type + feature area
2. **@smoke tests must be fast:** <30 seconds each
3. **@flaky tests must have a ticket:** Track for fix
4. **New features start as @regression:** Promote to @smoke after stable

## Interview Questions This Answers

- **"How do you organize tests?"** → Tags for suite type + feature + priority
- **"How do you handle flaky tests?"** → @flaky tag, excluded from CI, tracked for fix
- **"What runs on every PR?"** → @smoke only (fast feedback)
- **"How do you prioritize test runs?"** → @critical > @high > @medium > @low
