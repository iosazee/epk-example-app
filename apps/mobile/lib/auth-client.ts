import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { expoPasskeyClient } from "expo-passkey/native";
import * as SecureStore from "expo-secure-store";

import { env } from "./env";

const rawClient = createAuthClient({
  baseURL: env.apiUrl,
  plugins: [
    expoClient({
      scheme: "epkexample",
      storagePrefix: "epk_example",
      storage: SecureStore,
    }),
    expoPasskeyClient(),
  ],
});

// Better Auth's chained-plugin inference can narrow core methods past
// the point where property access still works. The runtime is fine;
// we widen the surface this demo touches.
interface SessionData {
  user: { id: string; email: string; name?: string | null };
}
interface SessionResult {
  data: SessionData | null;
  error: { message?: string; code?: string } | null;
}
interface AuthResult {
  data: unknown;
  error: { message?: string; code?: string } | null;
}

type WidenedClient = Omit<
  typeof rawClient,
  "useSession" | "getSession" | "signIn" | "signUp" | "signOut" | "$fetch"
> & {
  useSession: () => SessionResult;
  getSession: () => Promise<SessionResult>;
  signIn: { email: (input: { email: string; password: string }) => Promise<AuthResult> };
  signUp: {
    email: (input: {
      email: string;
      password: string;
      name?: string;
    }) => Promise<AuthResult>;
  };
  signOut: () => Promise<AuthResult>;
  $fetch: (typeof rawClient)["$fetch"];
};

export const authClient = rawClient as unknown as WidenedClient;

export const { useSession, signIn, signUp, signOut, getSession } = authClient;

// expoPasskeyClient adds these — pulled off the underlying client.
export const registerPasskey = (rawClient as unknown as {
  registerPasskey: (opts: {
    userName: string;
    displayName: string;
    livenessToken?: string;
  }) => Promise<AuthResult>;
}).registerPasskey;

export const authenticateWithPasskey = (rawClient as unknown as {
  authenticateWithPasskey: (opts?: { livenessToken?: string }) => Promise<AuthResult>;
}).authenticateWithPasskey;
