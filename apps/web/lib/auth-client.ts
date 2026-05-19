"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { expoPasskeyClient } from "expo-passkey/web";

const rawClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [emailOTPClient(), expoPasskeyClient()],
});

/**
 * Better Auth's chained-plugin inference can narrow core methods past
 * the point where property access remains viable. The runtime is
 * unaffected — we widen with a narrow shape covering only what this
 * app touches.
 */
interface SessionResult {
  data:
    | { user: { id: string; email: string; name?: string | null } }
    | null;
  error: { message?: string; code?: string } | null;
}

interface AuthResult<T = unknown> {
  data: T | null;
  error: { message?: string; code?: string } | null;
}

type WidenedClient = Omit<
  typeof rawClient,
  "useSession" | "getSession" | "signIn" | "signOut" | "$fetch"
> & {
  useSession: () => SessionResult;
  getSession: () => Promise<SessionResult>;
  signIn: {
    emailOtp: (input: {
      email: string;
      otp: string;
    }) => Promise<AuthResult>;
  };
  signOut: () => Promise<unknown>;
  emailOtp: {
    sendVerificationOtp: (input: {
      email: string;
      type: "sign-in" | "email-verification" | "forget-password";
    }) => Promise<AuthResult>;
  };
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
  signOut,
  useSession,
  getSession,
  emailOtp,
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
  }) => Promise<AuthResult>;
  authenticateWithPasskey: (input?: {
    rpId?: string;
    userVerification?: "required" | "preferred" | "discouraged";
    livenessToken?: string;
  }) => Promise<AuthResult>;
  isPasskeySupported?: () => Promise<boolean>;
};

const widened = authClient as unknown as PasskeyClientShape;
export const registerPasskey = widened.registerPasskey;
export const authenticateWithPasskey = widened.authenticateWithPasskey;
