import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expoPasskey } from "expo-passkey/server";
import {
  expoPasskeyLiveness,
  customProvider,
  inMemoryReplayStore,
} from "expo-passkey-liveness/server";

import { db } from "./db";
import { env } from "./env";

/**
 * Demo liveness provider that auto-passes every check.
 *
 * In a real deployment you would swap this for `rekognitionProvider`
 * or `iproovProvider`. The auto-passing custom provider lets us
 * exercise the entire server pipeline (endpoints, hook, token
 * signing, audit slice) without needing AWS / iProov credentials.
 *
 * The score is intentionally below 100 so any score-threshold
 * tweaks in the config remain observable.
 */
const demoLivenessProvider = customProvider({
  name: "demo",
  padLevel: "L2",
  minScoreDefault: 90,
  async createSession({ challenge }) {
    return {
      sessionId: `demo-${challenge}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientBootstrap: {
        provider: "demo",
        challenge,
        note: "Demo auto-pass — no camera ceremony is performed",
      },
    };
  },
  async getResults() {
    return {
      score: 95,
      passed: true,
      meta: { reason: "demo auto-pass" },
    };
  },
});

/**
 * Origins that the WebAuthn server will accept for register and
 * authenticate ceremonies. Includes:
 *   - the web origin (browser ceremonies)
 *   - https://<rpId> (iOS native — origin is derived from the
 *     associated-domains `webcredentials:<rpId>` entry)
 *   - android:apk-key-hash:<sha256> (Android native — only when the
 *     signing-cert SHA-256 is configured)
 */
const passkeyOrigins: string[] = [
  env.NEXT_PUBLIC_APP_URL,
  `https://${env.RP_ID}`,
  ...(env.MOBILE_ANDROID_CERT_SHA256
    ? [`android:apk-key-hash:${env.MOBILE_ANDROID_CERT_SHA256}`]
    : []),
];

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  trustedOrigins: passkeyOrigins,
  plugins: [
    expoPasskey({
      rpName: env.RP_NAME,
      rpId: env.RP_ID,
      origin: passkeyOrigins,
      logger: { enabled: process.env.NODE_ENV !== "production" },
      schema: {
        authPasskey: { modelName: "passkey" },
        passkeyChallenge: { modelName: "passkeyChallenge" },
      },
      cleanup: {
        // Serverless on Vercel — skip background timers.
        disableInterval: true,
      },
    }),
    expoPasskeyLiveness({
      rpId: env.RP_ID,
      liveness: {
        required: "both",
        provider: demoLivenessProvider,
        minScore: 90,
        // In production: use redisReplayStore against a real Redis.
        replayStore: inMemoryReplayStore({ cleanupIntervalMs: 0 }),
        modalityMismatch: {
          showExplainer: true,
        },
      },
      cleanup: { disableInterval: true },
    }),
  ],
});
