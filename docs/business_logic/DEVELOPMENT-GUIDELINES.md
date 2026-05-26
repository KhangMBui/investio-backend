# Development Guidelines

**Version**: 1.0  
**Last Updated**: January 7, 2026  
**Status**: Living Document

This document outlines the development standards, workflows, and best practices for contributing to Investio. These guidelines are inspired by industry standards from Google, Microsoft, Amazon, and other leading tech companies.

---

## Table of Contents

1. [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [Commit Message Standards](#commit-message-standards)
4. [Code Review Process](#code-review-process)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [Code Quality Standards](#code-quality-standards)
8. [Security Practices](#security-practices)
9. [Documentation Requirements](#documentation-requirements)
10. [CI/CD Pipeline](#cicd-pipeline)

---

## Git Workflow & Branching Strategy

### Branch Hierarchy

```
main (production)
  └── release/* (release candidates)
       └── develop (integration)
            └── feature/* (new features)
            └── bugfix/* (bug fixes)
            └── hotfix/* (urgent production fixes)
```

### Branch Purposes

| Branch Type | Purpose | Protected | Lifespan | Merge To |
|-------------|---------|-----------|----------|----------|
| `main` | Production-ready code | ✅ Yes | Permanent | - |
| `release/*` | Release candidates | ✅ Yes | Until deployed | `main` |
| `develop` | Integration branch | ✅ Yes | Permanent | `release/*` |
| `feature/*` | New features | ❌ No | Until merged | `develop` |
| `bugfix/*` | Non-urgent fixes | ❌ No | Until merged | `develop` |
| `hotfix/*` | Critical production fixes | ❌ No | 1-2 days | `main` + `develop` |

### Workflow Steps

#### 1. Feature Development

```bash
# Start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/portfolio-tracking

# Work on your feature
git add .
git commit -m "feat: add portfolio value calculation"

# Push to remote
git push origin feature/portfolio-tracking

# Create PR: feature/portfolio-tracking → develop
```

#### 2. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Final testing and bug fixes on release branch
# Bump version numbers, update CHANGELOG.md

# Merge to main (via PR)
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop (to include any release fixes)
git checkout develop
git merge release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

#### 3. Hotfix Process

```bash
# Create hotfix from main (production is broken!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-bug

# Fix the bug quickly
git commit -m "fix: resolve authentication bypass vulnerability"

# Merge to main (via expedited PR)
git checkout main
git merge hotfix/critical-auth-bug
git tag -a v1.2.1 -m "Hotfix: critical auth bug"
git push origin main --tags

# Merge to develop (keep branches in sync)
git checkout develop
git merge hotfix/critical-auth-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-auth-bug
```

---

## Branch Naming Conventions

### Format: `type/short-description`

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New features or enhancements | `feature/ai-coaching` |
| `bugfix/` | Bug fixes (non-urgent) | `bugfix/portfolio-calculation` |
| `hotfix/` | Critical production fixes | `hotfix/security-patch` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/database-queries` |
| `docs/` | Documentation updates | `docs/api-reference` |
| `test/` | Test additions or fixes | `test/portfolio-unit-tests` |
| `chore/` | Tooling, dependencies, config | `chore/update-dependencies` |
| `perf/` | Performance improvements | `perf/optimize-holdings-table` |

### Rules

- **Use lowercase and hyphens**: `feature/add-portfolio-tracking` ✅
- **Avoid underscores or camelCase**: `feature/Add_Portfolio_Tracking` ❌
- **Keep it short but descriptive**: `feature/portfolio` ❌ → `feature/add-portfolio-tracking` ✅
- **Use ticket numbers when applicable**: `feature/INV-123-portfolio-tracking`

---

## Commit Message Standards

We follow the **Conventional Commits** specification ([conventionalcommits.org](https://www.conventionalcommits.org/)).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(portfolio): add holdings table` |
| `fix` | Bug fix | `fix(auth): resolve logout redirect` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `style` | Code style (formatting, no logic change) | `style(header): fix indentation` |
| `refactor` | Code refactoring | `refactor(db): optimize tenant queries` |
| `test` | Add or update tests | `test(portfolio): add unit tests for calculations` |
| `chore` | Maintenance tasks | `chore(deps): update next to 15.1.0` |
| `perf` | Performance improvement | `perf(api): add caching layer` |
| `ci` | CI/CD changes | `ci(github): add automated testing workflow` |
| `build` | Build system changes | `build(webpack): optimize bundle size` |
| `revert` | Revert previous commit | `revert: feat(portfolio): add holdings table` |

### Examples

**Good Commits:**

```bash
feat(auth): add Google OAuth integration

Implemented Google sign-in using Clerk provider.
Supports both sign-in and sign-up flows.

Closes #42
```

```bash
fix(portfolio): correct calculation for total returns

Previous calculation didn't account for dividends.
Now includes dividend yield in total return %.

Fixes #128
```

```bash
refactor(db): migrate from Prisma to Drizzle ORM

- Removed Prisma dependencies
- Created Drizzle schema for all tables
- Updated all queries to use Drizzle
- Performance improved by ~30%
```

**Bad Commits:**

```bash
# Too vague
Update files

# No type
Added new feature

# Not descriptive
fix: bug

# Wrong type
feat: fixed typo in README
```

### Commit Message Rules

1. **Use imperative mood**: "add feature" not "added feature"
2. **First line ≤ 72 characters**: Keep subject concise
3. **Separate subject from body**: Blank line between them
4. **Explain the "why" in body**: Not just "what" changed
5. **Reference issues**: Use `Closes #123`, `Fixes #456`, `Relates to #789`

---

## Code Review Process

### Before Requesting Review

- [ ] Code compiles without errors
- [ ] All tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript type checking passes (`npm run type-check`)
- [ ] No console.log() or debugging code
- [ ] Self-review completed (read your own diff)
- [ ] Documentation updated if needed
- [ ] Screenshots/videos attached (for UI changes)

### Review Requirements

| Branch | Required Reviewers | Approval Needed | Auto-Merge |
|--------|-------------------|-----------------|------------|
| `main` | 2 senior engineers | Both approvals | ❌ No |
| `release/*` | 1 senior engineer | 1 approval | ❌ No |
| `develop` | 1 team member | 1 approval | ✅ Yes (after CI) |
| `feature/*` | 1 team member | 1 approval | ✅ Yes (after CI) |

### Reviewer Responsibilities

**As a Reviewer:**

1. **Respond within 24 hours** (sooner for urgent PRs)
2. **Test the code locally** if UI or critical logic
3. **Check for:**
   - Correctness and logic errors
   - Code readability and maintainability
   - Performance implications
   - Security vulnerabilities
   - Multi-tenant data isolation (critical for Investio!)
   - Test coverage
4. **Be constructive**: Suggest improvements, don't just criticize
5. **Approve or request changes**: Don't leave PRs in limbo

**Review Priorities:**

| Priority | Response Time | Examples |
|----------|---------------|----------|
| 🔴 P0 - Critical | < 2 hours | Production hotfixes, security patches |
| 🟠 P1 - High | < 4 hours | Blocking features, critical bugs |
| 🟡 P2 - Normal | < 24 hours | Regular features, non-blocking bugs |
| 🟢 P3 - Low | < 48 hours | Documentation, refactoring, chores |

### Review Comment Conventions

Use these prefixes to clarify intent:

| Prefix | Meaning | Action Required |
|--------|---------|-----------------|
| `[nit]` | Nitpick (optional suggestion) | Optional |
| `[question]` | Seeking clarification | Response needed |
| `[suggestion]` | Suggested improvement | Consider it |
| `[blocking]` | Must be fixed before merge | Required |
| `[security]` | Security concern | Required |
| `[performance]` | Performance issue | Consider it |

**Example:**

```
[blocking] This query is missing tenant_id filter, which would leak data between communities.

[suggestion] Consider extracting this logic into a reusable hook: usePortfolioCalculations()

[nit] Add a semicolon here for consistency
```

---

## Pull Request Guidelines

### PR Title Format

Use the same format as commit messages:

```
feat(portfolio): add real-time stock price updates
```

### PR Description Template

```markdown
## Description
Brief summary of what this PR does.

## Type of Change
- [ ] 🚀 New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Documentation update
- [ ] 🔨 Refactoring
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition/update
- [ ] 🔧 Chore/tooling

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added XYZ component
- Updated ABC service
- Refactored DEF function

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Tested on Chrome, Safari, Firefox

## Screenshots (if applicable)
[Attach before/after screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors
- [ ] Multi-tenant data isolation verified
- [ ] Performance impact considered
```

### PR Size Guidelines

| Size | Lines Changed | Review Time | Recommendation |
|------|---------------|-------------|----------------|
| XS | < 50 | < 15 min | ✅ Ideal |
| S | 50-200 | 30 min | ✅ Good |
| M | 200-500 | 1 hour | ⚠️ Consider splitting |
| L | 500-1000 | 2+ hours | ⚠️ Should split |
| XL | > 1000 | 4+ hours | ❌ Must split |

**Large PRs slow down reviews. Break them into smaller, logical chunks.**

### PR Labels

Use GitHub labels to categorize PRs:

| Label | Color | Usage |
|-------|-------|-------|
| `feature` | 🟢 Green | New features |
| `bug` | 🔴 Red | Bug fixes |
| `documentation` | 🔵 Blue | Docs updates |
| `refactor` | 🟡 Yellow | Code refactoring |
| `dependencies` | 🟣 Purple | Dependency updates |
| `breaking-change` | 🔴 Red | Breaking API changes |
| `needs-review` | 🟠 Orange | Awaiting review |
| `wip` | ⚫ Gray | Work in progress (do not merge) |
| `urgent` | 🔴 Red | Needs immediate attention |

---

## Testing Requirements

### Test Coverage Targets

| Code Type | Minimum Coverage | Target Coverage |
|-----------|------------------|-----------------|
| Business Logic | 80% | 90%+ |
| API Routes | 70% | 85%+ |
| Utility Functions | 90% | 100% |
| UI Components | 60% | 75%+ |
| Overall Project | 75% | 85%+ |

### Testing Pyramid

```
       /\
      /  \  E2E Tests (10%)
     /----\
    / Unit \ Integration Tests (30%)
   /  Tests \
  /----------\ Unit Tests (60%)
```

### Test Types

**1. Unit Tests (Vitest)**

```typescript
// Example: Portfolio calculation test
import { describe, it, expect } from 'vitest';
import { calculateTotalReturn } from '@/lib/portfolio';

describe('calculateTotalReturn', () => {
  it('should calculate positive return correctly', () => {
    const result = calculateTotalReturn({
      currentValue: 11000,
      totalInvested: 10000,
    });
    expect(result).toBe(10); // 10% return
  });

  it('should handle negative returns', () => {
    const result = calculateTotalReturn({
      currentValue: 9000,
      totalInvested: 10000,
    });
    expect(result).toBe(-10); // -10% loss
  });
});
```

**2. Integration Tests (Vitest + Testing Library)**

```typescript
// Example: Component integration test
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';

describe('PortfolioOverview', () => {
  it('should display portfolio value correctly', async () => {
    render(<PortfolioOverview />);
    
    expect(screen.getByText('$24,532.18')).toBeInTheDocument();
    expect(screen.getByText('+$342.50')).toBeInTheDocument();
  });
});
```

**3. E2E Tests (Playwright)**

```typescript
// Example: End-to-end test
import { test, expect } from '@playwright/test';

test('user can create portfolio and add holdings', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  
  // Create portfolio
  await page.click('text=Add Transaction');
  await page.fill('input[name="ticker"]', 'AAPL');
  await page.fill('input[name="shares"]', '10');
  await page.click('button[type="submit"]');
  
  // Verify portfolio updated
  await expect(page.locator('text=AAPL')).toBeVisible();
});
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode (interactive)
npm run test:e2e:ui

# Type checking
npm run type-check

# Linting
npm run lint

# Full pre-commit check
npm run pre-commit
```

### Required Tests Before Merging

- [ ] All existing tests pass
- [ ] New features have unit tests
- [ ] New API routes have integration tests
- [ ] Critical user flows have E2E tests
- [ ] Test coverage doesn't decrease

---

## Code Quality Standards

### TypeScript Guidelines

**1. Use Strict Mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**2. Prefer Interfaces for Objects**

```typescript
// ✅ Good
interface Portfolio {
  id: string;
  userId: string;
  tenantId: string;
  totalValue: number;
}

// ❌ Avoid
type Portfolio = {
  id: string;
  // ...
};
```

**3. Avoid `any`**

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataInput {
  value: number;
}

function processData(data: DataInput) {
  return data.value;
}
```

**4. Use Type Guards**

```typescript
function isPortfolio(obj: unknown): obj is Portfolio {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'tenantId' in obj
  );
}
```

### React/Next.js Guidelines

**1. Component Naming**

```typescript
// ✅ PascalCase for components
export function PortfolioOverview() { }

// ✅ camelCase for utilities
export function calculateReturn() { }

// ✅ UPPER_SNAKE_CASE for constants
export const MAX_PORTFOLIO_SIZE = 100;
```

**2. Use Server Components by Default**

```typescript
// ✅ Server Component (default)
export default async function DashboardPage() {
  const data = await fetchPortfolios();
  return <div>{data}</div>;
}

// Only use "use client" when needed
'use client';
export function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**3. Collocate Styles with Components**

```typescript
// ✅ Tailwind classes inline for small components
<button className="px-4 py-2 bg-primary text-white rounded-md">
  Click me
</button>

// ✅ Extract complex styles to CSS modules for large components
import styles from './Portfolio.module.css';
<div className={styles.container}>...</div>
```

**4. Extract Reusable Logic to Hooks**

```typescript
// ✅ Custom hook for portfolio calculations
export function usePortfolioCalculations(portfolioId: string) {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => fetchPortfolio(portfolioId),
    select: (data) => ({
      totalValue: calculateTotalValue(data),
      totalReturn: calculateTotalReturn(data),
    }),
  });
}
```

### Performance Best Practices

**1. Lazy Load Heavy Components**

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
});
```

**2. Memoize Expensive Calculations**

```typescript
import { useMemo } from 'react';

function PortfolioStats({ holdings }) {
  const totalValue = useMemo(
    () => holdings.reduce((sum, h) => sum + h.value, 0),
    [holdings]
  );
  
  return <div>{totalValue}</div>;
}
```

**3. Optimize Database Queries**

```typescript
// ❌ N+1 query problem
const portfolios = await db.query.portfolios.findMany();
for (const p of portfolios) {
  const holdings = await db.query.holdings.findMany({
    where: eq(holdings.portfolioId, p.id),
  });
}

// ✅ Use joins
const portfolios = await db.query.portfolios.findMany({
  with: {
    holdings: true,
  },
});
```

### File Organization

```typescript
// ✅ Group related code
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   └── (dashboard)/
│       ├── dashboard/
│       └── portfolio/
├── components/
│   ├── ui/              # shadcn components
│   ├── layout/          # Header, Sidebar, Footer
│   └── features/        # Feature-specific components
│       ├── portfolio/
│       ├── journal/
│       └── ideas/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
└── hooks/
    ├── usePortfolio.ts
    └── useTenant.ts
```

---

## Security Practices

### Critical Security Rules

**1. ALWAYS Scope Queries by Tenant ID**

```typescript
// ❌ SECURITY VULNERABILITY - Data leak!
const portfolios = await db.query.portfolios.findMany();

// ✅ CORRECT - Tenant-scoped
const portfolios = await db.query.portfolios.findMany({
  where: eq(portfolios.tenantId, currentTenantId),
});
```

**2. Validate All User Input**

```typescript
import { z } from 'zod';

// Define schema
const createPortfolioSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
});

// Validate before using
export async function createPortfolio(input: unknown) {
  const validated = createPortfolioSchema.parse(input); // Throws if invalid
  // ... safe to use validated data
}
```

**3. Sanitize User Content**

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML before rendering
const sanitizedHTML = DOMPurify.sanitize(userContent);
```

**4. Never Expose Secrets**

```typescript
// ❌ Bad - Secret in client code
const apiKey = 'sk_live_abc123';

// ✅ Good - Secret in environment variable
const apiKey = process.env.STRIPE_SECRET_KEY;

// ✅ Good - Use server actions for sensitive operations
'use server';
export async function processPayment() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // ...
}
```

**5. Implement Rate Limiting**

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: Request) {
  const { success } = await ratelimit.limit(req.headers.get('x-forwarded-for') || 'anonymous');
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // ... handle request
}
```

### Security Checklist

Before merging, verify:

- [ ] All queries scoped by `tenant_id`
- [ ] All user input validated with Zod
- [ ] No secrets in client-side code
- [ ] Authentication required for protected routes
- [ ] Authorization checked (user has permission)
- [ ] SQL injection prevented (using ORM, not raw SQL)
- [ ] XSS prevented (sanitize HTML, escape user content)
- [ ] CSRF tokens implemented (Next.js handles this)
- [ ] Rate limiting on API routes
- [ ] Sensitive operations logged

---

## Documentation Requirements

### Code Comments

**When to Comment:**

✅ **DO comment:**
- Complex algorithms or business logic
- Non-obvious workarounds or hacks
- Why a particular approach was chosen
- TODOs with issue numbers

❌ **DON'T comment:**
- Obvious code that explains itself
- What the code does (code should be self-explanatory)
- Commented-out code (delete it instead)

**Examples:**

```typescript
// ❌ Bad comment (obvious)
// Increment counter by 1
counter++;

// ✅ Good comment (explains why)
// We need to delay the update to avoid a race condition with the
// portfolio recalculation that happens asynchronously.
setTimeout(() => updatePortfolio(), 100);

// ✅ Good TODO with issue number
// TODO(INV-456): Replace with real-time WebSocket updates
const data = await pollForUpdates();
```

### Function Documentation (JSDoc)

```typescript
/**
 * Calculates the total return percentage for a portfolio.
 * 
 * @param currentValue - The current market value of the portfolio
 * @param totalInvested - The total amount invested (cost basis)
 * @returns The percentage return (positive or negative)
 * 
 * @example
 * ```typescript
 * calculateTotalReturn(11000, 10000); // Returns 10 (10% gain)
 * calculateTotalReturn(9000, 10000);  // Returns -10 (10% loss)
 * ```
 */
export function calculateTotalReturn(
  currentValue: number,
  totalInvested: number
): number {
  if (totalInvested === 0) return 0;
  return ((currentValue - totalInvested) / totalInvested) * 100;
}
```

### README Files

Every major feature should have a README:

```
src/
├── components/
│   └── portfolio/
│       ├── README.md          # Explains portfolio components
│       ├── PortfolioCard.tsx
│       └── HoldingsTable.tsx
```

### API Documentation

Document all API routes:

```typescript
/**
 * GET /api/portfolios
 * 
 * Retrieves all portfolios for the current tenant and user.
 * 
 * @auth Required - Clerk authentication
 * @permission User must be a member of the tenant
 * 
 * @returns {Portfolio[]} Array of portfolio objects
 * 
 * @example
 * ```bash
 * curl -H "Authorization: Bearer token" https://api.investio.com/api/portfolios
 * ```
 */
export async function GET(req: Request) {
  // ...
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

We use GitHub Actions for continuous integration and deployment.

**Workflow Triggers:**

- Push to `main`, `develop`, `release/*`
- Pull requests to `main`, `develop`
- Manual trigger (workflow_dispatch)

**Pipeline Stages:**

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, release/*]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  deploy:
    needs: [lint, type-check, test, e2e, build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/deploy-action@v1
```

### Pre-commit Hooks (Husky)

Prevent bad commits from being pushed:

```json
// package.json
{
  "scripts": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Status Checks Required Before Merge

All PRs to `main` or `develop` must pass:

- ✅ ESLint (no errors)
- ✅ TypeScript type checking (no errors)
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests (all passing)
- ✅ E2E tests (critical flows passing)
- ✅ Build succeeds
- ✅ Code review approved (1-2 reviewers depending on branch)

---

## Deployment Process

### Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Production** | `main` | `investio.com` | Live users |
| **Staging** | `release/*` | `staging.investio.com` | Pre-release testing |
| **Development** | `develop` | `dev.investio.com` | Integration testing |
| **Preview** | `feature/*` | Auto-generated | PR previews |

### Deployment Checklist

**Before Deploying to Production:**

- [ ] All tests passing in CI
- [ ] Code reviewed and approved
- [ ] Release notes written in `CHANGELOG.md`
- [ ] Database migrations tested on staging
- [ ] Feature flags enabled (if applicable)
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

**After Deployment:**

- [ ] Smoke tests passed
- [ ] Error rates normal (check Sentry)
- [ ] Performance metrics normal (check Vercel Analytics)
- [ ] Database queries performing well
- [ ] No spike in user complaints
- [ ] Tag release in GitHub (`v1.2.0`)

---

## Emergency Procedures

### Reverting a Deployment

If production is broken:

```bash
# Option 1: Revert in Vercel Dashboard (instant)
# Go to Vercel → Deployments → Click previous deployment → "Promote to Production"

# Option 2: Git revert (for permanent fix)
git revert <bad-commit-hash>
git push origin main

# Option 3: Rollback release
git checkout main
git reset --hard <previous-good-commit>
git push origin main --force  # Use with extreme caution!
```

### Incident Response

1. **Alert**: Monitor alerts via Sentry, Vercel, or user reports
2. **Assess**: Determine severity (P0-P3)
3. **Communicate**: Post in #incidents Slack channel
4. **Mitigate**: Roll back or apply hotfix
5. **Resolve**: Fix root cause
6. **Document**: Write post-mortem in `docs/incidents/`

**Severity Levels:**

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| P0 - Critical | Service down, data loss | Immediate | Auth broken, database corrupted |
| P1 - High | Major feature broken | < 1 hour | Portfolios not loading |
| P2 - Medium | Minor feature broken | < 4 hours | Search not working |
| P3 - Low | Cosmetic issue | Next sprint | Typo in UI |

---

## Questions & Clarifications

### Who to Ask

| Topic | Contact | Slack Channel |
|-------|---------|---------------|
| Architecture decisions | Tech Lead | #engineering |
| Product requirements | Product Manager | #product |
| Database schema | Backend Team | #backend |
| UI/UX questions | Design Team | #design |
| DevOps/CI/CD | DevOps Lead | #devops |
| Security concerns | Security Team | #security |

### When in Doubt

1. **Check existing patterns** in the codebase
2. **Ask in Slack** before making big decisions
3. **Document your reasoning** in PR description
4. **Prefer convention over innovation** (unless you have a good reason)

---

## Continuous Improvement

This document is a **living guide** that evolves with the team.

**How to Propose Changes:**

1. Create PR with changes to this document
2. Add rationale in PR description
3. Request review from tech lead
4. Discuss in team meeting if controversial
5. Update version number and last updated date

---

## Acknowledgments

These guidelines are inspired by:

- [Google Engineering Practices](https://google.github.io/eng-practices/)
- [Microsoft's Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/review-code)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitFlow Workflow](https://nvie.com/posts/a-successful-git-branching-model/)
- [The Twelve-Factor App](https://12factor.net/)

---

**Last Updated**: January 7, 2026  
**Version**: 1.0  
**Maintained by**: Engineering Team
