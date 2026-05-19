"use client";

import { createAuthClient } from "better-auth/react";
import { expoPasskeyClient } from "expo-passkey/web";

const rawClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [expoPasskeyClient()],
});

/**
 * better-auth 1.6+ chained-plugin inference can narrow the client
 * type past the point where core methods (`useSession`, `signIn`,
 * `signUp`, `signOut`, `getSession`) are reachable via property
 * access. The runtime is unaffected. We widen with a narrow shape
 * covering only what this demo touches — same pattern brianni uses.
 */
interface SessionResult {
  data:
    | { user: { id: string; email: string; name?: string | null } }
    | null;
  error: { message?: string; code?: string } | null;
}
// Replace (not intersect) the narrowed core method types so the
// destructured re-exports below have usable shapes.
type WidenedClient = Omit<
  typeof rawClient,
  "useSession" | "getSession" | "signIn" | "signUp" | "signOut" | "$fetch"
> & {
  useSession: () => SessionResult;
  getSession: () => Promise<SessionResult>;
  signIn: {
    email: (input: { email: string; password: string }) => Promise<{
      data: unknown;
      error: { message?: string; code?: string } | null;
    }>;
  };
  signUp: {
    email: (input: {
      email: string;
      password: string;
      name?: string;
    }) => Promise<{
      data: unknown;
      error: { message?: string; code?: string } | null;
    }>;
  };
  signOut: () => Promise<unknown>;
  // `$fetch` is the better-fetch instance — we narrow it to what
  // liveness-web.ts and the test page actually invoke.
  $fetch: <T = unknown>(
    path: string,
    init: {
      method?: "GET" | "POST";
      body?: unknown;
      throw?: boolean;
      headers?: Record<string, string>;
    },
  ) => Promise<{
    data: T | null;
    error: { code?: string; message?: string } | null;
  }>;
};

export const authClient = rawClient as unknown as WidenedClient;

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  $fetch,
} = authClient;

// expo-passkey client actions are added by expoPasskeyClient(). They
// are reachable at runtime; better-auth's plugin-chain typing
// occasionally hides them from TS, so we widen here.
type PasskeyClientShape = typeof authClient & {
  registerPasskey: (input: {
    userId: string;
    userName: string;
    displayName: string;
    rpId: string;
    rpName: string;
    metadata?: Record<string, unknown>;
    livenessToken?: string;
  }) => Promise<{ data: unknown; error: { message?: string; code?: string } | null }>;
  authenticateWithPasskey: (input?: {
    rpId?: string;
    userVerification?: "required" | "preferred" | "discouraged";
    livenessToken?: string;
  }) => Promise<{ data: unknown; error: { message?: string; code?: string } | null }>;
  isPasskeySupported?: () => Promise<boolean>;
};

const widened = authClient as unknown as PasskeyClientShape;
export const registerPasskey = widened.registerPasskey;
export const authenticateWithPasskey = widened.authenticateWithPasskey;
