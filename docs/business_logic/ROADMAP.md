# Investio Roadmap to MVP

**Start Date**: January 7, 2026  
**Target MVP Launch**: Mid-June 2026 (~22 weeks)  
**Status**: Planning → Development

This document outlines the feature-based release strategy for Investio from foundation to MVP production launch.

---

## Release Philosophy

Each release focuses on **one core feature** to:
- ✅ Enable incremental testing and validation
- ✅ Gather early user feedback
- ✅ Reduce deployment risk
- ✅ Demonstrate progress to stakeholders
- ✅ Allow flexible re-prioritization

---

## Release Timeline Overview

| Release | Feature | Status | Duration | Target Date |
|---------|---------|--------|----------|-------------|
| v0.1.0-alpha | Foundation | 📋 Planned | 3 weeks | Jan 28, 2026 |
| v0.2.0-alpha | Portfolio Management | 📋 Planned | 3 weeks | Feb 18, 2026 |
| v0.3.0-alpha | Trading Journal | 📋 Planned | 3 weeks | Mar 11, 2026 |
| v0.4.0-alpha | Ideas Tracking | 📋 Planned | 2 weeks | Mar 25, 2026 |
| v0.5.0-beta | Multi-Tenancy | 📋 Planned | 4 weeks | Apr 22, 2026 |
| v0.6.0-beta | AI Coaching | 📋 Planned | 2 weeks | May 6, 2026 |
| v0.7.0-beta | Learn & Education | 📋 Planned | 2 weeks | May 20, 2026 |
| v0.8.0-rc | Polish & Performance | 📋 Planned | 2 weeks | Jun 3, 2026 |
| **v1.0.0** | **MVP Production Launch** | 📋 Planned | 1 week | **Jun 10, 2026** |

**Total Development Time**: 22 weeks (5.5 months)

---

## Detailed Release Plans

### 🔧 v0.1.0-alpha - Foundation
**Theme**: Backend Infrastructure & Authentication  
**Target Date**: January 28, 2026  
**Duration**: 3 weeks

#### Objectives
Set up the foundational architecture for all future features.

#### Scope
- [ ] Neon PostgreSQL database setup (production-ready)
- [ ] Drizzle ORM configuration and initial schema
- [ ] Database tables:
  - `tenants` - Community/organization data
  - `memberships` - User-tenant relationships with roles
  - `users` - User profiles and metadata
- [ ] Clerk authentication integration
  - Replace mock sign-in/sign-up pages
  - Implement Clerk Organizations for multi-tenancy
  - Add middleware for authentication enforcement
- [ ] Multi-tenant middleware
  - Inject tenant context into all requests
  - Validate tenant access permissions
- [ ] Row-Level Security (RLS) policies in PostgreSQL
- [ ] Basic API route structure (`/api/auth/*`)
- [ ] Environment variable management (`.env.local` template)
- [ ] Database migration workflow

#### Success Criteria
- ✅ Users can sign up with email or OAuth (Google/GitHub)
- ✅ Users can sign in and see their profile
- ✅ All database queries are tenant-scoped (no data leaks)
- ✅ Middleware enforces authentication on protected routes
- ✅ Database schema supports multi-tenancy

#### Technical Debt
- None (clean foundation)

---

### 📊 v0.2.0-alpha - Portfolio Management
**Theme**: Core Portfolio Tracking  
**Target Date**: February 18, 2026  
**Duration**: 3 weeks

#### Objectives
Enable users to manually track investment portfolios and holdings.

#### Scope
- [ ] Database tables:
  - `portfolios` - User portfolio metadata
  - `holdings` - Current positions in stocks/assets
  - `transactions` - Historical buy/sell records
- [ ] API routes:
  - `POST /api/portfolios` - Create portfolio
  - `GET /api/portfolios` - List user portfolios
  - `PUT /api/portfolios/:id` - Update portfolio
  - `DELETE /api/portfolios/:id` - Delete portfolio
  - `POST /api/transactions` - Add buy/sell transaction
  - `GET /api/holdings/:portfolioId` - Get current holdings
- [ ] Stock data integration (Finnhub API)
  - Real-time stock prices
  - Quote endpoint for tickers
  - API key management
- [ ] Portfolio overview cards (replace mock data)
  - Total portfolio value
  - Today's change ($ and %)
  - All-time return (%)
  - Top gainers/losers
- [ ] Holdings table (replace mock data)
  - Real holdings from database
  - Live price updates
  - Gain/loss calculations
  - Allocation percentages
- [ ] Transaction form
  - Add buy/sell transactions
  - Ticker autocomplete
  - Date picker
  - Cost basis tracking
- [ ] Portfolio performance calculations
  - Total value (current prices × shares)
  - Cost basis (purchase prices × shares)
  - Unrealized gains/losses
  - Percentage returns

#### Success Criteria
- ✅ Users can create multiple portfolios
- ✅ Users can add buy/sell transactions with price and date
- ✅ Dashboard shows real holdings with live stock prices
- ✅ Portfolio value updates automatically
- ✅ Gains/losses calculated correctly
- ✅ Data persists across sessions

#### Technical Debt
- Stock price caching strategy (defer to v0.8.0)
- Historical price data (defer to v0.6.0 for charts)

---

### 📖 v0.3.0-alpha - Trading Journal
**Theme**: Investment Decision Log (Key Differentiator)  
**Target Date**: March 11, 2026  
**Duration**: 3 weeks

#### Objectives
Enable users to journal investment decisions and get AI feedback.

#### Scope
- [ ] Database tables:
  - `journal_entries` - Trade rationale and reflections
  - `entry_tags` - Custom tags for entries
- [ ] Journal page UI
  - Entry list (chronological feed)
  - Entry creation form
  - Entry detail view
  - Rich text editor (markdown support)
- [ ] API routes:
  - `POST /api/journal/entries` - Create entry
  - `GET /api/journal/entries` - List entries
  - `PUT /api/journal/entries/:id` - Update entry
  - `DELETE /api/journal/entries/:id` - Delete entry
- [ ] Entry features:
  - Link entries to specific transactions
  - Tag entries (lessons learned, mistakes, wins, emotional)
  - Attach tickers to entries
  - Add pre-trade and post-trade reflections
  - Edit history (immutable timestamps, see what changed)
- [ ] Weekly AI recap (OpenAI GPT-4o integration)
  - Analyze journal entries from past week
  - Identify patterns (overtrading, emotional decisions)
  - Reflective questions (not buy/sell advice)
  - Behavioral insights
- [ ] Win/loss breakdown dashboard
  - Winning trades count/percentage
  - Losing trades count/percentage
  - Average gain/loss
  - Most common mistakes (from tags)
- [ ] Pattern recognition
  - Detect repeated behaviors (e.g., panic selling)
  - Highlight contradictions (said X, did Y)
  - Track thesis evolution over time

#### Success Criteria
- ✅ Users can create journal entries for trades
- ✅ Entries can be linked to transactions
- ✅ Users can tag entries with custom labels
- ✅ Edit history shows what changed and when
- ✅ Weekly AI recap provides behavioral insights
- ✅ Win/loss dashboard shows performance patterns
- ✅ Journal is private to user (not visible to community yet)

#### Technical Debt
- Public journal sharing (defer to v0.5.0)
- Advanced AI insights (defer to v0.6.0)

---

### 💡 v0.4.0-alpha - Ideas Tracking
**Theme**: Thesis → Outcome (Accountability)  
**Target Date**: March 25, 2026  
**Duration**: 2 weeks

#### Objectives
Enable users to document investment theses and track outcomes publicly.

#### Scope
- [ ] Database tables:
  - `ideas` - Investment thesis records
  - `idea_updates` - Time-stamped thesis updates
- [ ] Ideas page UI
  - Idea creation form
  - Idea feed (community ideas)
  - Idea detail view
  - Outcome resolution interface
- [ ] API routes:
  - `POST /api/ideas` - Create investment idea
  - `GET /api/ideas` - List ideas (user's and community's)
  - `PUT /api/ideas/:id` - Update idea
  - `POST /api/ideas/:id/resolve` - Mark outcome
- [ ] Idea structure:
  - Ticker (required)
  - Thesis (why this will work)
  - Timeframe (when this will play out)
  - Invalidation conditions ("I'm wrong if...")
  - Price target (optional)
  - Risk rating (1-5 scale)
- [ ] Time-stamped edit history
  - Immutable creation timestamp
  - All edits tracked with timestamps
  - Show "edited" indicator
  - View change history
- [ ] Outcome resolution
  - Status: Active → Played Out / Invalidated / Expired
  - Result: Win / Loss / Neutral
  - Reflection notes (what did I learn?)
  - Actual vs expected outcome
- [ ] Idea feed
  - See community ideas (if public)
  - Filter by ticker, outcome, user
  - Sort by created date, resolution date
- [ ] Idea performance metrics
  - Win rate (resolved ideas that played out)
  - Average timeframe accuracy
  - Thesis quality score (based on detail)

#### Success Criteria
- ✅ Users can create investment ideas with thesis and invalidation
- ✅ Ideas are timestamped and edits are tracked
- ✅ Users can mark ideas as resolved with outcome
- ✅ Idea feed shows community ideas (if public)
- ✅ Edit history prevents rewriting past predictions
- ✅ Performance metrics show accountability

#### Technical Debt
- Idea comments/discussion (defer to v0.5.0)
- Idea voting/ranking (defer to v0.5.0)

---

### 👥 v0.5.0-beta - Multi-Tenancy & Communities
**Theme**: Social Features & Tenant Management  
**Target Date**: April 22, 2026  
**Duration**: 4 weeks

#### Objectives
Enable community creation, membership management, and social features.

#### Scope
- [ ] Tenant creation flow
  - Onboarding wizard (name, slug, description)
  - Branding settings (logo, colors)
  - Privacy settings (public/private)
- [ ] Database tables:
  - `posts` - Community feed posts
  - `comments` - Post comments
  - `reactions` - Likes, bookmarks
  - `invitations` - Tenant invitations
- [ ] Community feed
  - Create posts (text, images, ticker tags)
  - Comment on posts
  - React to posts (like, bookmark)
  - Tag tickers in posts (link to stock page)
- [ ] Role-based access control (RBAC)
  - Roles: Owner, Moderator, Member
  - Permissions matrix
  - Invite-only vs open communities
- [ ] API routes:
  - `POST /api/tenants` - Create tenant
  - `POST /api/tenants/:id/invite` - Invite members
  - `POST /api/posts` - Create post
  - `GET /api/posts` - Get community feed
  - `POST /api/comments` - Add comment
- [ ] Tenant switching
  - Dropdown in Header (replace mock)
  - Switch active tenant context
  - See memberships across tenants
- [ ] Member directory
  - List tenant members
  - View member profiles
  - See member portfolios (if public)
- [ ] Private groups/channels (optional)
  - Create sub-groups within tenant
  - Private discussions
  - Gated content

#### Success Criteria
- ✅ Users can create new tenants/communities
- ✅ Owners can invite members via email
- ✅ Members can post to community feed
- ✅ Users can belong to multiple tenants
- ✅ Tenant switching works seamlessly
- ✅ Roles enforce permissions correctly
- ✅ All data is tenant-scoped (verified with tests)

#### Technical Debt
- Tenant analytics dashboard (defer to v0.8.0)
- Advanced moderation tools (defer to post-MVP)

---

### 🤖 v0.6.0-beta - AI Coaching
**Theme**: Personalized Investment Insights  
**Target Date**: May 6, 2026  
**Duration**: 2 weeks

#### Objectives
Provide weekly AI-powered coaching and insights to users.

#### Scope
- [ ] OpenAI GPT-4o integration
  - Weekly portfolio recap generation
  - Behavioral analysis from journal entries
  - Risk assessment prompts
- [ ] Database tables:
  - `ai_insights` - Generated insights history
  - `coaching_sessions` - Weekly coaching records
- [ ] Weekly recap email/notification
  - Portfolio performance summary
  - Behavioral highlights (from journal)
  - Reflective questions
  - Risk alerts
- [ ] AI insights panel (on dashboard)
  - Latest insights
  - Risk concentration warnings
  - Performance attribution (what drove returns)
  - Sector exposure analysis
- [ ] Behavioral coaching
  - Pattern detection (overtrading, FOMO)
  - Emotional state analysis (from journal tone)
  - Questions, not advice ("Why did you sell early?")
- [ ] AI chat interface (optional)
  - Ask questions about portfolio
  - Get educational explanations
  - No buy/sell recommendations (compliance)
- [ ] Reflection prompts
  - Weekly check-in questions
  - Monthly review prompts
  - Goal progress tracking

#### Success Criteria
- ✅ Users receive weekly AI recap via email
- ✅ AI insights appear on dashboard
- ✅ Risk alerts trigger for concentration (>30% in one stock)
- ✅ Behavioral patterns identified from journal
- ✅ AI provides questions, NOT buy/sell advice
- ✅ Insights are personalized to user's portfolio

#### Technical Debt
- Advanced performance attribution (defer to post-MVP)
- Multi-asset class support (defer to post-MVP)

---

### 📚 v0.7.0-beta - Learn & Education
**Theme**: Curated Investment Education  
**Target Date**: May 20, 2026  
**Duration**: 2 weeks

#### Objectives
Provide educational content to help users learn investing concepts.

#### Scope
- [ ] Database tables:
  - `courses` - Educational course metadata
  - `lessons` - Individual lessons/modules
  - `user_progress` - Track completion
- [ ] Learn page UI
  - Course catalog
  - Course detail view
  - Lesson viewer (markdown/video)
  - Progress tracker
- [ ] Educational content library
  - Investing basics (stocks, bonds, ETFs)
  - Portfolio construction
  - Risk management
  - Technical analysis
  - Fundamental analysis
  - Behavioral finance
- [ ] API routes:
  - `GET /api/courses` - List courses
  - `GET /api/courses/:id/lessons` - Get lessons
  - `POST /api/progress/:lessonId` - Mark complete
- [ ] Progress tracking
  - Course completion percentage
  - Badges/achievements (optional)
  - Certificate of completion (optional)
- [ ] Community-contributed guides
  - Users can submit guides (moderated)
  - Upvote/downvote system
  - Curated by tenant owners
- [ ] Glossary of terms
  - Financial terminology
  - Search functionality
  - Link terms in posts/journal
- [ ] Interactive examples (optional)
  - Portfolio simulators
  - Risk calculators
  - Compound interest visualizations

#### Success Criteria
- ✅ Learn page has 5+ courses available
- ✅ Users can complete lessons and track progress
- ✅ Glossary has 100+ financial terms
- ✅ Community guides can be submitted and moderated
- ✅ Content is accessible to beginners

#### Technical Debt
- Video hosting (use YouTube embeds initially)
- Interactive quizzes (defer to post-MVP)
- Certification system (defer to post-MVP)

---

### 🎨 v0.8.0-rc - Polish & Performance
**Theme**: Production Readiness  
**Target Date**: June 3, 2026  
**Duration**: 2 weeks

#### Objectives
Optimize performance, polish UI/UX, and prepare for production launch.

#### Scope
- [ ] Performance optimization
  - Implement caching (Redis/Upstash)
  - Lazy load heavy components
  - Image optimization (Next.js Image)
  - Code splitting
  - Database query optimization
  - API response caching
- [ ] UI/UX refinements
  - Mobile responsiveness audit
  - Accessibility audit (WCAG 2.1 AA)
  - Loading states for all interactions
  - Error states with helpful messages
  - Empty states with clear CTAs
  - Skeleton screens
- [ ] E2E testing suite (Playwright)
  - Critical user flows:
    - Sign up → Create portfolio → Add transaction
    - Create journal entry → Get AI recap
    - Create idea → Resolve outcome
    - Create tenant → Invite member → Post to feed
  - Cross-browser testing (Chrome, Safari, Firefox)
  - Mobile testing (iOS Safari, Chrome Android)
- [ ] Security audit
  - Penetration testing
  - Verify tenant data isolation
  - Check for SQL injection vulnerabilities
  - Validate input sanitization
  - Review authentication flows
  - Test rate limiting
- [ ] Bug fixes from beta feedback
  - Triage user-reported issues
  - Fix critical bugs
  - Address usability concerns
- [ ] Analytics integration (PostHog)
  - Event tracking (page views, button clicks)
  - User journey funnels
  - Error tracking
  - Performance monitoring
- [ ] Documentation finalization
  - User guides
  - API documentation
  - Admin documentation
  - Troubleshooting guides

#### Success Criteria
- ✅ Lighthouse score: 90+ (performance, accessibility, SEO)
- ✅ All E2E tests passing
- ✅ Zero critical security vulnerabilities
- ✅ Page load time < 2 seconds (p95)
- ✅ Mobile responsiveness on all pages
- ✅ No P0/P1 bugs remaining
- ✅ Analytics tracking all key events

#### Technical Debt
- Advanced caching strategies (defer to v1.1.0)
- CDN integration (defer to v1.1.0)

---

### 🚀 v1.0.0 - MVP Production Launch
**Theme**: Monetization & Go-Live  
**Target Date**: June 10, 2026  
**Duration**: 1 week

#### Objectives
Launch production-ready MVP with monetization enabled.

#### Scope
- [ ] Stripe integration
  - Subscription management
  - Pro plan ($9.99/month per user)
  - Payment method handling
  - Invoice generation
- [ ] Stripe Connect (for tenant revenue sharing)
  - Onboarding for tenant owners
  - Revenue split calculations (90/10 or 80/20)
  - Payout scheduling
  - Stripe Identity for KYC
- [ ] Billing management
  - User billing dashboard
  - Cancel/reactivate subscription
  - Payment history
  - Invoices download
- [ ] Database tables:
  - `subscriptions` - User subscription records
  - `payments` - Payment history
  - `payouts` - Tenant owner payouts
- [ ] API routes:
  - `POST /api/billing/subscribe` - Create subscription
  - `POST /api/billing/cancel` - Cancel subscription
  - `GET /api/billing/invoices` - Get invoices
  - `POST /api/webhooks/stripe` - Handle Stripe webhooks
- [ ] Marketing landing page
  - Hero section with value prop
  - Feature showcase
  - Pricing table
  - Testimonials (from beta users)
  - FAQ section
  - CTA to sign up
- [ ] Public documentation
  - Getting started guide
  - Feature walkthroughs
  - API documentation (for future integrations)
  - Troubleshooting guides
- [ ] Production deployment
  - Deploy to Vercel production
  - Neon production tier database
  - Environment variables configured
  - Custom domain setup (investio.com)
  - SSL certificates
  - DNS configuration
- [ ] Launch announcement
  - Product Hunt launch
  - Twitter/X announcement
  - Email to beta users
  - Blog post on launch
  - Press release (optional)
- [ ] Monitoring & alerting
  - Sentry error tracking
  - Vercel Analytics
  - Uptime monitoring (UptimeRobot)
  - Slack alerts for critical issues

#### Success Criteria
- ✅ Production app is live at investio.com
- ✅ Users can subscribe to Pro plan via Stripe
- ✅ Tenant owners can receive payouts
- ✅ Marketing page is live and ranking in search
- ✅ Documentation is complete and accessible
- ✅ Monitoring is active with alerts configured
- ✅ Launch announced on Product Hunt
- ✅ Zero P0 bugs in production

#### Post-Launch Checklist
- [ ] Monitor error rates (target: < 0.1%)
- [ ] Track conversion rates (free → Pro)
- [ ] Gather user feedback (surveys, interviews)
- [ ] Plan v1.1.0 roadmap based on feedback

---

## Success Metrics (KPIs)

### Pre-Launch (v0.1 - v0.8)
- 📊 50+ beta users actively testing
- 📊 1000+ transactions logged
- 📊 500+ journal entries created
- 📊 200+ investment ideas tracked
- 📊 10+ tenants created
- 📊 < 0.5% error rate
- 📊 95+ Lighthouse score

### Post-Launch (v1.0)
- 📊 500 signups in first month
- 📊 10% free → Pro conversion rate
- 📊 80% user retention (30 days)
- 📊 5+ tenant communities live
- 📊 NPS score 40+
- 📊 < 1% churn rate

---

## Risk Management

### High-Risk Items
| Risk | Mitigation | Owner |
|------|------------|-------|
| Tenant data leak | Automated tests, manual audits, RLS policies | Backend Team |
| Poor performance | Load testing, caching strategy, monitoring | DevOps |
| Low user adoption | Beta program, user feedback loops, marketing | Product |
| Stripe integration delays | Start integration early (v0.8), sandbox testing | Backend Team |
| Security vulnerabilities | Security audit (v0.8), penetration testing | Security Team |

### Dependencies
| Dependency | Status | Risk Level | Contingency |
|------------|--------|------------|-------------|
| Neon PostgreSQL | ✅ Available | Low | Migrate to Supabase if needed |
| Clerk Auth | ✅ Available | Low | Fallback to NextAuth.js |
| Finnhub API | ✅ Available | Medium | Fallback to Alpha Vantage |
| OpenAI GPT-4o | ✅ Available | Medium | Reduce AI features or use Claude |
| Stripe | ✅ Available | Low | Delay monetization if issues |

---

## Decision Log

### January 7, 2026
- **Decision**: Feature-based releases instead of milestone-based
- **Rationale**: Better feedback loops, clearer scope, lower risk
- **Approved by**: Product & Engineering

### January 7, 2026
- **Decision**: Target MVP launch for June 10, 2026
- **Rationale**: 5.5 months provides buffer before end-of-2026 deadline
- **Approved by**: Product & Engineering

---

## Release Checklist Template

Use this for each release:

### Pre-Release
- [ ] All features implemented and tested
- [ ] Code review completed
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (critical flows)
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Release notes written
- [ ] Staging deployment successful
- [ ] Beta user testing completed

### Release
- [ ] Create release branch (`release/vX.Y.Z`)
- [ ] Final regression testing
- [ ] Deploy to production
- [ ] Smoke tests passed
- [ ] Monitoring alerts configured
- [ ] Tag release in GitHub
- [ ] Merge to `main`
- [ ] Merge back to `develop`
- [ ] Delete release branch

### Post-Release
- [ ] Monitor error rates (24 hours)
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Address critical bugs (hotfix if needed)
- [ ] Celebrate with team! 🎉

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 7, 2026 | Engineering Team | Initial roadmap created |

---

**Next Steps**: Begin v0.1.0-alpha (Foundation) development on January 8, 2026.

**Questions?** See [DEVELOPMENT-GUIDELINES.md](./DEVELOPMENT-GUIDELINES.md) or ask in #engineering Slack channel.
