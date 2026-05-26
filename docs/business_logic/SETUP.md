# Environment Setup & Configuration

This guide covers all environment variables, configuration files, and service setup required for Investio.

---

## 📝 Environment Variables

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# ============================================
# Database (PostgreSQL - Neon)
# ============================================
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# ============================================
# Authentication (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional Clerk URLs (for custom domains)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# ============================================
# Application
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ============================================
# Optional - Add Later
# ============================================

# Payments (Stripe) - Add when implementing monetization
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# AI (OpenAI) - Add when implementing AI coaching
# OPENAI_API_KEY="sk-..."

# AWS (Rekognition, S3) - Add when implementing KYC
# AWS_ACCESS_KEY_ID="..."
# AWS_SECRET_ACCESS_KEY="..."
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET_NAME="investio-uploads"

# Email (Resend) - Add when implementing transactional emails
# RESEND_API_KEY="re_..."

# Analytics (PostHog) - Add when implementing product analytics
# NEXT_PUBLIC_POSTHOG_KEY="phc_..."
# NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## 🗄️ Database Setup (Neon)

### 1. Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Free tier includes: 0.5GB storage, 3 projects

### 2. Create New Project

1. Click "Create Project"
2. **Project Name**: `investio`
3. **Region**: Choose closest to your users
4. **Postgres Version**: 16 (latest)

### 3. Get Connection String

1. Click on your project
2. Go to "Connection Details"
3. **Copy the connection string** (select "Pooled connection")
4. Example format:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 4. Add to Environment

```env
DATABASE_URL="your-neon-connection-string-here"
```

### 5. Configure Row-Level Security (Later)

Once you have data, you can enable RLS for additional tenant isolation:

```sql
-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant_id')::uuid);
```

---

## 🔐 Authentication Setup (Clerk)

### 1. Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up with GitHub or email
3. Free tier includes: 10,000 MAUs (Monthly Active Users)

### 2. Create Application

1. Click "Add Application"
2. **Application Name**: `Investio`
3. **Sign-in Options**: Enable:
   - Email
   - Google (recommended)
   - GitHub (optional)

### 3. Enable Organizations

Organizations are **required** for multi-tenancy:

1. Go to **Settings** → **Organizations**
2. Toggle **"Enable Organizations"** to ON
3. Configure:
   - ✅ Allow users to create organizations
   - ✅ Allow users to leave organizations
   - Set **Default role**: `member`

### 4. Get API Keys

1. Go to **API Keys** in the left sidebar
2. Copy your keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### 5. Add to Environment

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 6. Configure Clerk Settings (Optional)

**Custom Branding:**
- Go to **Customization** → **Theme**
- Upload logo, set brand colors

**Email Templates:**
- Go to **Messaging** → **Email**
- Customize sign-in, sign-up, verification emails

**Webhooks (for syncing data):**
- Go to **Webhooks**
- Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- Subscribe to: `user.created`, `organization.created`, `organizationMembership.created`

---

## 💳 Payment Setup (Stripe) - Optional

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up and verify your email
3. Use **Test Mode** for development

### 2. Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy **Secret Key** and **Publishable Key**
3. For webhooks: **Developers** → **Webhooks** → **Add endpoint**

### 3. Enable Stripe Connect (for tenant payouts)

1. Go to **Settings** → **Connect**
2. Enable **Express** or **Standard** accounts
3. Configure platform settings

### 4. Add to Environment

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🤖 AI Setup (OpenAI) - Optional

### 1. Create OpenAI Account

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up and add payment method
3. Start with **$5-10 credit** for testing

### 2. Create API Key

1. Go to **API Keys**
2. Click **Create new secret key**
3. Name it: `investio-dev`
4. Copy the key (shown only once!)

### 3. Add to Environment

```env
OPENAI_API_KEY="sk-..."
```

### 4. Set Usage Limits (Recommended)

1. Go to **Usage Limits**
2. Set **Monthly Budget**: $20
3. Set **Alerts** at 50%, 75%, 90%

---

## 📦 Additional Service Setup

### Redis (Upstash) - For Caching

1. Go to [https://upstash.com](https://upstash.com)
2. Create Redis database (free tier: 10,000 requests/day)
3. Copy connection string

```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Email (Resend) - For Transactional Emails

1. Go to [https://resend.com](https://resend.com)
2. Create account (free tier: 100 emails/day)
3. Get API key

```env
RESEND_API_KEY="re_..."
```

### File Storage (AWS S3 or Cloudflare R2)

**Option A: AWS S3**
```env
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="investio-uploads"
```

**Option B: Cloudflare R2** (cheaper, S3-compatible)
```env
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="investio-uploads"
```

---

## 🔧 Configuration Files

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Config (`.eslintrc.json`)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier Config (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 🚀 Deployment Configuration

### Vercel (Recommended)

1. **Install Vercel CLI**: `npm install -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: `vercel`

**Environment Variables on Vercel:**
1. Go to project settings
2. Add all `.env.local` variables
3. Set **Production**, **Preview**, and **Development** scopes

### Environment-Specific URLs

```env
# Development
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Preview (Vercel)
NEXT_PUBLIC_APP_URL="https://investio-git-branch.vercel.app"

# Production
NEXT_PUBLIC_APP_URL="https://investio.com"
```

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Database connection works (`npm run db:studio`)
- [ ] Clerk authentication loads
- [ ] Environment variables are set
- [ ] TypeScript compiles (`npm run tsc --noEmit`)
- [ ] Development server runs (`npm run dev`)
- [ ] No console errors on homepage

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys** regularly (every 90 days)
3. **Use environment-specific keys** (test keys for dev, prod keys for production)
4. **Enable MFA** on all service accounts (Clerk, Stripe, AWS, etc.)
5. **Set usage limits** on paid APIs (OpenAI, AWS, etc.)

---

## 📚 Service Documentation Links

- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)

---

## 💡 Tips

- Use **Vercel's env variable pull**: `vercel env pull .env.local`
- Test webhooks locally with **ngrok** or **Vercel dev**
- Monitor API usage in each service's dashboard
- Set up alerts for quota limits

---

Need help? See [GETTING-STARTED.md](./GETTING-STARTED.md) for step-by-step setup instructions.
