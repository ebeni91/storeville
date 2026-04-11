import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { phoneNumber } from 'better-auth/plugins';
import { Pool } from 'pg';

// Construct connection string — works both locally and inside Docker
// Inside Docker: postgres service is reachable at hostname "postgres"
// Locally: use DATABASE_URL from .env.local (points to localhost:5432)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://storeville_user:super_secure_password@postgres:5432/storeville_db',
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
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // 🌟 LAN IP for mobile dev — phone on same network uses this to reach the server
    'http://10.17.127.123:3000',
    // 🌟 ngrok tunnel for Google OAuth (bypasses IP-address restriction)
    'https://anthological-defectively-suzette.ngrok-free.dev',
    'storeville://',
    'storeville://*',
    // Expo development exp:// scheme
    ...(process.env.NODE_ENV === 'development'
      ? [
          'exp://',
          'exp://**',
          'exp://192.168.*.*:*/**',
          'exp://10.*.*.*:*/**',
        ]
      : []),
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

  // ── Cookies ───────────────────────────────────────────────────────────────
  cookies: {
    sessionToken: {
      options: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  }
});

export type Auth = typeof auth;
