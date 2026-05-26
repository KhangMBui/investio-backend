# Getting Started with Investio

Welcome to Investio! This guide will walk you through setting up the development environment from scratch.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/investio.git
cd investio
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local
```

Then fill in the values (see [SETUP.md](./SETUP.md) for detailed instructions).

### Step 4: Set Up Database

```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🛠️ Detailed Setup Guide

### 1. Create Next.js Project (If Starting Fresh)

```bash
cd /path/to/your/projects
mkdir investio
cd investio

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app --eslint

# Answer prompts:
# ✔ Use Turbopack? Yes
# ✔ Customize import alias? No
```

### 2. Install Core Dependencies

```bash
# Database & ORM
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install @clerk/nextjs

# Form handling & validation
npm install zod react-hook-form @hookform/resolvers

# Data fetching
npm install @tanstack/react-query

# State management
npm install zustand

# UI Components (shadcn/ui dependencies)
npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-avatar
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install tailwindcss-animate

# Date utilities
npm install date-fns
```

### 3. Initialize shadcn/ui

```bash
npx shadcn@latest init

# Select:
# Style: Default
# Base color: Slate
# CSS variables: Yes
```

Install commonly used components:

```bash
npx shadcn@latest add button card input label dropdown-menu avatar dialog form
```

### 4. Create Project Structure

```bash
# Create folder structure
mkdir -p src/app/\(auth\)
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/api
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/features
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/db
```

### 5. Set Up Database (PostgreSQL on Neon)

1. **Sign up for Neon** (free tier): [https://neon.tech](https://neon.tech)
2. **Create a new project** called "Investio"
3. **Copy the connection string** (looks like: `postgresql://user:password@host/database`)
4. **Add to `.env.local`**:
   ```env
   DATABASE_URL="your-connection-string-here"
   ```

### 6. Set Up Authentication (Clerk)

1. **Sign up for Clerk** (free tier): [https://clerk.com](https://clerk.com)
2. **Create a new application** called "Investio"
3. **Enable Organizations**:
   - Go to Settings → Organizations
   - Toggle "Enable Organizations"
4. **Copy API keys** from dashboard
5. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```

### 7. Configure Database Schema

Create `drizzle.config.ts` in the root:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

Create initial schema at `src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

// Tenants (Communities)
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User-Tenant Memberships
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  role: text('role').notNull(), // 'owner', 'moderator', 'member'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 8. Add Database Scripts to package.json

Add these scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 9. Run Database Migration

```bash
# Generate migration files
npm run db:generate

# Push to database
npm run db:push
```

### 10. Create Database Client

Create `src/lib/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 11. Configure Clerk Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 12. Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Investio - Multi-Tenant Investing Platform',
  description: 'Build and manage investing communities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## ✅ Verify Your Setup

Run these commands to verify everything is working:

```bash
# Check TypeScript compilation
npm run tsc --noEmit

# Check linting
npm run lint

# Run dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the homepage!

---

## 🎯 Next Steps

Now that your environment is set up:

1. **Build the tenant creation flow** - Create your first community
2. **Set up the dashboard** - Design the main UI
3. **Add portfolio tracking** - Core feature implementation
4. **Integrate AI coaching** - Add OpenAI integration

See the [main README](../README.md) for project overview and architecture details.

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npm run db:studio

# This opens Drizzle Studio - if it works, your DB is connected!
```

### Clerk Authentication Issues

- Check that API keys are correctly copied (no extra spaces)
- Ensure Organizations are enabled in Clerk dashboard
- Verify `.env.local` is in the root directory

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)

---

## 💬 Need Help?

- Check [SETUP.md](./SETUP.md) for environment variable details
- Review the [main README](../README.md) for architecture overview
- Open an issue on GitHub for bugs or questions

Happy coding! 🚀
