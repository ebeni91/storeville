import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Prevent Next.js from statically collecting this route during `next build`.
// The auth handler relies on runtime environment variables (e.g., DATABASE_URL).
// force-dynamic ensures this route is always evaluated dynamically at runtime.
export const dynamic = 'force-dynamic';

export const { POST, GET } = toNextJsHandler(auth);
