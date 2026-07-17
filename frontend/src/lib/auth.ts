import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { phoneNumber } from 'better-auth/plugins';
import { Pool } from 'pg';


// ✅ BUILD-TIME GUARD: DATABASE_URL is only available at runtime (not in `next build`).
// We create the pool only when the env var exists. During the Docker image build,
// Next.js evaluates this module but DATABASE_URL is absent — the guard returns null
// so betterAuth() is never called. At runtime (container up) DATABASE_URL is always set.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('@postgres:5432') || process.env.DATABASE_URL.includes('@localhost:')
        ? undefined
        : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null

export const auth = pool ? betterAuth({
  database: pool,

  secret: process.env.BETTER_AUTH_SECRET!,

  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  // ── Email + Password (DISABLED) ───────────────────────────────────────────
  emailAndPassword: {
    enabled: false,
  },

  // ── Social Providers ───────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // where Google auto-selects the previous account.
      prompt: 'select_account',
    },
  },

  // ── User Field Mapping ────────────────────────────────────────────────────
  user: {
    // 🌟 THE FIX: Map internal property names to actual DB column names.
    // This ensures that both the core and plugins (like phoneNumber) use 
    // the snake_case columns in our shared Postgres database.
    fields: {},
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'CUSTOMER',
        input: true,
      },
    },
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    // Expo deep-link support for mobile OAuth
    expo(),

    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // TODO: Replace with Africa's Talking or Twilio in production
        console.log(`[DEV OTP] Phone: ${phoneNumber}  Code: ${code}`);
      },
      
      schema: {
        user: {
          fields: {
            phoneNumber: 'phone_number',
            phoneNumberVerified: 'is_phone_verified',
          }
        }
      },
      // OTP expires after 5 minutes
      expiresIn: 300,
    }),
  ],

  // ── Database Hooks ─────────────────────────────────────────────────────────
  // 🌟 USER SYNC: When a new user registers via Better Auth, immediately
  // create a corresponding Django user so they appear in the Admin dashboard.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const djangoUrl = process.env.DJANGO_INTERNAL_URL ?? 'http://backend:8000'
          try {
            await fetch(`${djangoUrl}/api/accounts/sync-user`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                // Internal secret to authenticate this server-to-server call
                'X-Internal-Secret': process.env.INTERNAL_SYNC_SECRET ?? 'dev-sync-secret'
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                role: (user as any).role ?? 'CUSTOMER',
                phone_number: (user as any).phone_number ?? null,
              }),
            })
          } catch (err) {
            // Non-fatal: user will be synced on next API request via middleware
            console.error('[BA Hook] Failed to sync user to Django:', err)
          }
        }
      }
    }
  },

  // ── Trusted Origins for CORS + deep links ─────────────────────────────────
  // ✅ SECURITY FIX: No hardcoded IPs, ngrok URLs, or broad wildcards.
  // All origins are driven by environment variables.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    // Native mobile deep link scheme
    'storeville://',
    // Allow dev origins only in development
    ...(process.env.NODE_ENV === 'development' ? [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // NGROK_URL is set in .env to the static ngrok domain (willette-conclusive-robby.ngrok-free.dev)
      // It gives Google OAuth a real HTTPS domain without hardcoding anything here.
      ...(process.env.NGROK_URL ? [process.env.NGROK_URL] : []),
    ] : []),
  ],

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    // 🌟 THE FIX: Disable cookie cache to prevent stale session data
    cookieCache: {
      enabled: false, 
    },
    // Force fresh check on every request
    freshAge: 0,
  },

  // ── Advanced ──────────────────────────────────────────────────────────────
  advanced: {
    // ✅ FIX: Use Secure cookies whenever the auth URL is served over HTTPS.
    // This covers both production (https://storeville.app) AND local dev via
    // ngrok (https://willette-conclusive-robby.ngrok-free.dev).
    // On plain http://localhost, Secure cookies are NOT set — browsers would
    // silently discard them causing an instant logout loop after OAuth.
    useSecureCookies: (process.env.BETTER_AUTH_URL ?? '').startsWith('https://'),
  }
}) : null as any;

export type Auth = typeof auth;
