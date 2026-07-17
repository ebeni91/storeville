import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// ✅ FIX: Prevent Next.js from statically collecting this route during `next build`.
// The auth handler imports auth.ts which throws if DATABASE_URL is missing (build-time env).
// force-dynamic ensures this route is always server-rendered on demand, never pre-rendered.
export const dynamic = 'force-dynamic';

export const { POST, GET } = toNextJsHandler(auth);
