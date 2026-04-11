import { createAuthClient } from 'better-auth/react';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // By omitting baseURL, the client uses the same origin as the browser window.
  // This is much safer for cross-origin cookie support in Dev.
  baseURL: undefined,
  plugins: [
    phoneNumberClient(),
  ],
});

// Re-export commonly used hooks and actions for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
