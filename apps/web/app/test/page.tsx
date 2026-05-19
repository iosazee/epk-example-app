"use client";

import { useState } from "react";

import {
  authClient,
  authenticateWithPasskey,
  registerPasskey,
  signIn,
  signOut,
  signUp,
  useSession,
} from "@/lib/auth-client";
import { verifyLivenessWeb } from "@/lib/liveness-web";

type Log = { ts: string; text: string; level: "info" | "ok" | "err" };

export default function TestPage() {
  const session = useSession();
  const user = session.data?.user ?? null;

  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [logs, setLogs] = useState<Log[]>([]);
  const [busy, setBusy] = useState(false);

  const log = (text: string, level: Log["level"] = "info") =>
    setLogs((prev) =>
      [{ ts: new Date().toLocaleTimeString(), text, level }, ...prev].slice(0, 60)
    );

  async function handleSignUp() {
    setBusy(true);
    try {
      const r = await signUp.email({ email, password, name: email });
      if (r.error) {
        log(`signUp error: ${r.error.message}`, "err");
      } else {
        log(`signed up as ${email}`, "ok");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignIn() {
    setBusy(true);
    try {
      const r = await signIn.email({ email, password });
      if (r.error) {
        log(`signIn error: ${r.error.message}`, "err");
      } else {
        log(`signed in as ${email}`, "ok");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
      log("signed out", "ok");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegisterPasskey() {
    if (!user) {
      log("Need to be signed in first", "err");
      return;
    }
    setBusy(true);
    try {
      log("creating liveness session…");
      const live = await verifyLivenessWeb({ challenge: "registration" });
      if (live.error || !live.data) {
        log(`liveness failed: ${live.error?.message ?? "unknown"}`, "err");
        return;
      }
      log(
        `liveness token issued: score=${live.data.score} provider=${live.data.provider}`,
        "ok"
      );

      log("requesting WebAuthn challenge…");
      const challengeRes = await authClient.$fetch<{ challenge: string }>(
        "/expo-passkey/challenge",
        {
          method: "POST",
          body: { type: "registration" },
          throw: false,
        }
      );
      if (challengeRes.error || !challengeRes.data) {
        log(
          `challenge fetch failed: ${challengeRes.error?.message ?? "unknown"}`,
          "err"
        );
        return;
      }

      log("invoking browser WebAuthn registration…");
      const { startRegistration } = await import("@simplewebauthn/browser");
      const credential = await startRegistration({
        optionsJSON: {
          challenge: challengeRes.data.challenge,
          rp: { name: "expo-passkey-liveness demo", id: location.hostname },
          user: {
            id: stringToBase64Url(user.id),
            name: user.email,
            displayName: user.name ?? user.email,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
          },
        },
      });
      log("WebAuthn credential created locally — posting to /register");

      const r = await registerPasskey({
        userId: user.id,
        userName: user.email,
        displayName: user.name ?? user.email,
        rpId: location.hostname,
        rpName: "expo-passkey-liveness demo",
        platform: "web",
        // upstream livenessToken pass-through — this is the field the
        // expo-passkey schema accepts and the liveness hook reads.
        livenessToken: live.data.livenessToken,
        metadata: { biometricType: "face", appVersion: "demo" },
        credential,
      } as Parameters<typeof registerPasskey>[0]);
      if (r.error) {
        log(`registerPasskey error: ${r.error.message}`, "err");
      } else {
        log("registerPasskey OK — passkey persisted with liveness slice", "ok");
      }
    } catch (err) {
      log(`registerPasskey threw: ${(err as Error).message}`, "err");
    } finally {
      setBusy(false);
    }
  }

  async function handleAuthWithPasskey() {
    setBusy(true);
    try {
      log("creating liveness session for authentication…");
      const live = await verifyLivenessWeb({ challenge: "authentication" });
      if (live.error || !live.data) {
        log(`liveness failed: ${live.error?.message ?? "unknown"}`, "err");
        return;
      }
      log(`liveness token issued: score=${live.data.score}`, "ok");

      log("requesting WebAuthn auth challenge…");
      const challengeRes = await authClient.$fetch<{ challenge: string }>(
        "/expo-passkey/challenge",
        {
          method: "POST",
          body: { type: "authentication" },
          throw: false,
        }
      );
      if (challengeRes.error || !challengeRes.data) {
        log(`challenge fetch failed: ${challengeRes.error?.message}`, "err");
        return;
      }

      const { startAuthentication } = await import("@simplewebauthn/browser");
      const credential = await startAuthentication({
        optionsJSON: {
          challenge: challengeRes.data.challenge,
          rpId: location.hostname,
          timeout: 60000,
          userVerification: "preferred",
        },
      });
      log("WebAuthn assertion created locally — posting to /authenticate");

      const r = await authenticateWithPasskey({
        rpId: location.hostname,
        userVerification: "preferred",
        livenessToken: live.data.livenessToken,
        credential,
      } as Parameters<typeof authenticateWithPasskey>[0]);
      if (r.error) {
        log(`authenticateWithPasskey error: ${r.error.message}`, "err");
      } else {
        log("authenticateWithPasskey OK — session minted via passkey", "ok");
      }
    } catch (err) {
      log(`authenticate threw: ${(err as Error).message}`, "err");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegisterWithoutLiveness() {
    if (!user) {
      log("Need to be signed in first", "err");
      return;
    }
    setBusy(true);
    try {
      log("attempting registerPasskey WITHOUT livenessToken (should fail)…");
      const r = (await authClient.$fetch("/expo-passkey/register", {
        method: "POST",
        body: {
          userId: user.id,
          userName: user.email,
          displayName: user.name ?? user.email,
          rpId: location.hostname,
          rpName: "demo",
          platform: "web",
          // No livenessToken — the hook should reject.
        },
        throw: false,
      })) as { data: unknown; error: { code?: string; message?: string } | null };
      if (r.error) {
        log(
          `expected failure: ${r.error.code ?? "no code"} — ${r.error.message ?? "no message"}`,
          "ok"
        );
      } else {
        log("UNEXPECTED: register succeeded without a liveness token", "err");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Integration test</h1>
        <p className="text-sm text-neutral-600">
          {user ? (
            <>
              Signed in as <strong>{user.email}</strong>
            </>
          ) : (
            "Not signed in"
          )}
        </p>
      </header>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-medium">1 — Account</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block text-neutral-600">Email</span>
            <input
              className="mt-1 w-full rounded border border-neutral-300 px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="text-sm">
            <span className="block text-neutral-600">Password</span>
            <input
              className="mt-1 w-full rounded border border-neutral-300 px-2 py-1 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSignUp} disabled={busy}>
            Sign up
          </Button>
          <Button onClick={handleSignIn} disabled={busy}>
            Sign in
          </Button>
          <Button onClick={handleSignOut} disabled={busy || !user}>
            Sign out
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-medium">2 — Passkey + liveness</h2>
        <p className="text-sm text-neutral-600">
          These calls exercise the entire server pipeline: liveness session
          creation, token minting, the enforcement hook on{" "}
          <code className="text-xs">/expo-passkey/register</code>, and metadata
          injection into the persisted passkey row.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleRegisterPasskey} disabled={busy || !user}>
            Register passkey + liveness
          </Button>
          <Button onClick={handleAuthWithPasskey} disabled={busy}>
            Sign in with passkey + liveness
          </Button>
          <Button onClick={handleRegisterWithoutLiveness} disabled={busy || !user}>
            Register WITHOUT token (expects 400)
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-medium">3 — Log</h2>
        <div className="max-h-72 overflow-auto rounded bg-neutral-50 p-3 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-neutral-400">No events yet.</div>
          ) : (
            logs.map((l, i) => (
              <div
                key={i}
                className={
                  l.level === "err"
                    ? "text-red-600"
                    : l.level === "ok"
                    ? "text-green-700"
                    : "text-neutral-700"
                }
              >
                [{l.ts}] {l.text}
              </div>
            ))
          )}
        </div>
        <div className="text-xs text-neutral-500">
          See also{" "}
          <a className="underline" href="/api/debug/passkeys">
            /api/debug/passkeys
          </a>{" "}
          and{" "}
          <a className="underline" href="/api/debug/liveness-sessions">
            /api/debug/liveness-sessions
          </a>
          .
        </div>
      </section>
    </div>
  );
}

function Button({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function stringToBase64Url(s: string): string {
  if (typeof btoa === "function") {
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
