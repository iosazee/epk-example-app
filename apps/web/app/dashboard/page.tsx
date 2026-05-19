"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Fingerprint,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  registerPasskey,
  signOut,
  useSession,
  $fetch,
} from "@/lib/auth-client";
import { verifyLivenessWeb } from "@/lib/liveness-web";

interface PasskeyRow {
  id: string;
  credentialId: string;
  platform: string;
  lastUsed: string;
  createdAt: string;
  metadata: {
    liveness?: {
      provider?: string;
      score?: number;
      padLevel?: string;
      registeredModality?: string;
    };
  } | null;
}

interface LivenessRow {
  id: string;
  provider: string;
  status: string;
  score: number | null;
  challenge: string;
  createdAt: string;
}

export default function DashboardPage() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user ?? null;

  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([]);
  const [livenessSessions, setLivenessSessions] = useState<LivenessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.data === null && !session.error) {
      router.replace("/login");
    }
  }, [session.data, session.error, router]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [pk, ls] = await Promise.all([
        $fetch<{ passkeys: PasskeyRow[] }>("/api/debug/passkeys", { method: "GET" }),
        $fetch<{ sessions: LivenessRow[] }>("/api/debug/liveness-sessions", { method: "GET" }),
      ]);
      setPasskeys(pk.data?.passkeys ?? []);
      setLivenessSessions(ls.data?.sessions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleRegisterPasskey() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const live = await verifyLivenessWeb({ challenge: "registration" });
      if (live.error || !live.data) {
        setError(live.error?.message ?? "Liveness check failed");
        return;
      }
      const r = await registerPasskey({
        userId: user.id,
        userName: user.email,
        displayName: user.name ?? user.email,
        rpId: window.location.hostname,
        rpName: "EPK Example",
        livenessToken: live.data.livenessToken,
      });
      if (r.error) {
        setError(r.error.message ?? r.error.code ?? "Passkey registration failed");
        return;
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b bg-background/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold">EPK Example</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name ?? user.email.split("@")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your passkeys and inspect the server-side audit trail.
          </p>
        </section>

        {error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-4 w-4" />
                Your passkeys
              </CardTitle>
              <CardDescription>
                Bound to this device with liveness verification
              </CardDescription>
            </div>
            <Button onClick={handleRegisterPasskey} disabled={busy} size="sm">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" />
                  Register passkey
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <PasskeySkeleton />
            ) : passkeys.length === 0 ? (
              <EmptyState
                title="No passkeys yet"
                body="Register one to skip the email-code step next time. The ceremony binds the credential to this device with a liveness check."
              />
            ) : (
              <ul className="divide-y divide-border">
                {passkeys.map((p) => (
                  <PasskeyRow key={p.id} row={p} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent liveness sessions</CardTitle>
            <CardDescription>
              Server-side audit trail from <code>/expo-passkey/liveness/verify</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <PasskeySkeleton />
            ) : livenessSessions.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                body="They&rsquo;ll appear here after you register a passkey or sign in with one."
              />
            ) : (
              <div className="space-y-2">
                {livenessSessions.slice(0, 8).map((s) => (
                  <LivenessSessionRow key={s.id} row={s} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PasskeyRow({ row }: { row: PasskeyRow }) {
  const liveness = row.metadata?.liveness;
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{row.platform}</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {row.credentialId.slice(0, 18)}…
          </span>
        </div>
        {liveness ? (
          <p className="text-xs text-muted-foreground">
            verified via{" "}
            <span className="font-medium text-foreground">{liveness.provider}</span>{" "}
            · score {liveness.score} · {liveness.padLevel}
            {liveness.registeredModality ? (
              <> · modality {liveness.registeredModality}</>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">no liveness slice</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {new Date(row.createdAt).toLocaleString()}
      </span>
    </li>
  );
}

function LivenessSessionRow({ row }: { row: LivenessRow }) {
  const color =
    row.status === "verified"
      ? "default"
      : row.status === "failed"
        ? "destructive"
        : "secondary";
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Badge variant={color}>{row.status}</Badge>
        <span className="text-muted-foreground">{row.challenge}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs text-muted-foreground truncate">
          {row.provider} · score {row.score ?? "—"}
        </span>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {new Date(row.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}

function PasskeySkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-12 rounded-md bg-muted/40 animate-pulse" />
      ))}
    </div>
  );
}
