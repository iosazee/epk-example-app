"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Fingerprint, Mail, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  authenticateWithPasskey,
  emailOtp,
  signIn,
} from "@/lib/auth-client";
import { verifyLivenessWeb } from "@/lib/liveness-web";

type OtpStep = "email" | "code";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 px-4 py-12">
      <a
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </a>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign in to EPK Example
          </CardTitle>
          <CardDescription>
            Passwordless. Pick a passkey (preferred) or have us email you a code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="passkey">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="passkey">
                <Fingerprint className="h-4 w-4 mr-1.5" />
                Passkey
              </TabsTrigger>
              <TabsTrigger value="otp">
                <Mail className="h-4 w-4 mr-1.5" />
                Email code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="passkey" className="mt-4">
              <PasskeyTab onSuccess={() => router.push("/dashboard")} />
            </TabsContent>
            <TabsContent value="otp" className="mt-4">
              <OtpTab onSuccess={() => router.push("/dashboard")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PasskeyTab({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAuthenticate() {
    setBusy(true);
    setError(null);
    try {
      const live = await verifyLivenessWeb({ challenge: "authentication" });
      if (live.error || !live.data) {
        setError(live.error?.message ?? "Liveness check failed");
        return;
      }
      const r = await authenticateWithPasskey({
        livenessToken: live.data.livenessToken,
      });
      if (r.error) {
        setError(r.error.message ?? r.error.code ?? "Sign in failed");
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use Touch ID, Windows Hello, or any platform authenticator already
        bound to this site. Liveness is verified as part of the ceremony.
      </p>
      <Button
        className="w-full"
        onClick={handleAuthenticate}
        disabled={busy}
        size="lg"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <Fingerprint className="h-4 w-4" />
            Sign in with passkey
          </>
        )}
      </Button>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          New here? Sign in via email code first — you can register a passkey
          from the dashboard.
        </p>
      )}
    </div>
  );
}

function OtpTab({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      if (r.error) {
        setError(r.error.message ?? r.error.code ?? "Couldn't send code");
        return;
      }
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await signIn.emailOtp({ email, otp });
      if (r.error) {
        setError(r.error.message ?? r.error.code ?? "Invalid code");
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSend} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy || !email} size="lg">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send code
            </>
          )}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">6-digit code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Sent to <span className="font-medium">{email}</span>. Check your spam
          folder if it doesn&rsquo;t arrive within a minute.
        </p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={busy || otp.length !== 6}
        size="lg"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify and sign in"
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          setStep("email");
          setOtp("");
          setError(null);
        }}
        disabled={busy}
      >
        Use a different email
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
