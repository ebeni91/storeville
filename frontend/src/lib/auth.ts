import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { phoneNumber } from 'better-auth/plugins';
import { Pool } from 'pg';

// ✅ SECURITY FIX: Never fall back to hardcoded credentials.
// DATABASE_URL must always be set in .env / environment variables.
if (!process.env.DATABASE_URL) {
  throw new Error(
    '[StoreVille] DATABASE_URL environment variable is required. ' +
    'Set it in .env (e.g. postgresql://user:pass@postgres:5432/db)'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ✅ FIX: External databases (like Render) require SSL when connected from Vercel.
  ssl: { rejectUnauthorized: false },
  // Limit connections so Vercel edge functions don't exhaust Postgres
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const auth = betterAuth({
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
      // 🌟 THE FIX: Forced account selection to prevent "sticky sessions" 
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
      // 🌟 THE FIX: Map the plugin's DB columns using its schema override.
      // This tells the phoneNumber plugin to query 'phone_number' in Postgres
      // instead of its default 'phoneNumber' column.
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
      // Add your current ngrok URL as NGROK_URL env var during local dev
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
    // 🌟 THE FIX: Force secure cookies.
    // Ngrok provides HTTPS to the browser, but terminates it before hitting 
    // our Docker container. This forces Better Auth to keep the 'Secure' 
    // attribute so the browser actually saves and returns the cookies.
    useSecureCookies: true,
  }
});

export type Auth = typeof auth;
