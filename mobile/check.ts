import { createAuthClient } from 'better-auth/client';
const client = createAuthClient();
type SignInSocial = Parameters<typeof client.signIn.social>[0];
let p: SignInSocial;
