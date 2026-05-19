import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Fingerprint,
  KeyRound,
  Layers,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

function Github(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.39.97 0 1.95.13 2.86.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-gradient-to-b from-primary/5 via-background to-background" />

      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" />
          EPK Example
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="https://github.com/iosazee/epk-example-app"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <Github className="h-4 w-4 mr-1.5" />
            GitHub
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            Sign in
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </nav>
      </header>

      <section className="container mx-auto max-w-6xl px-4 pt-12 pb-20 text-center">
        <Badge variant="secondary" className="mb-6">
          <Sparkles className="h-3 w-3 mr-1.5" />
          v0.1.0-alpha · live demo
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
          Passkeys + face liveness,{" "}
          <span className="text-primary">end to end</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          The reference monorepo for{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm">
            expo-passkey
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm">
            expo-passkey-liveness
          </code>
          . One Better Auth backend serves a Next.js web client and an Expo
          native client, both running real WebAuthn ceremonies gated by face
          PAD.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Try the demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/iosazee/epk-example-app"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            <Github className="h-4 w-4" />
            View source
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {[
            "Next.js 15",
            "Expo SDK 55",
            "Better Auth",
            "Prisma + Postgres",
            "WebAuthn / FIDO2",
            "ISO 30107 PAD",
          ].map((b) => (
            <Badge key={b} variant="outline" className="px-2.5 py-1 text-xs">
              {b}
            </Badge>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Fingerprint className="h-5 w-5" />}
            title="Cross-platform passkeys"
            body={
              <>
                <code>expo-passkey</code> drives WebAuthn on web, iOS 16+ and
                Android 10+ against a single unified passkey table. Touch ID,
                Windows Hello, Face ID, fingerprint — same code path.
              </>
            }
          />
          <FeatureCard
            icon={<Camera className="h-5 w-5" />}
            title="Face liveness gating"
            body={
              <>
                <code>expo-passkey-liveness</code> adds an enforcement hook
                that validates a signed liveness token on register and
                authenticate. Audit slice written to{" "}
                <code>passkey.metadata.liveness</code>.
              </>
            }
          />
          <FeatureCard
            icon={<KeyRound className="h-5 w-5" />}
            title="Passwordless by default"
            body={
              <>
                No passwords stored, ever. Passkey-first, email OTP as a
                fallback. Strong identity binding without the
                phishing-friendly anti-pattern.
              </>
            }
          />
          <FeatureCard
            icon={<Layers className="h-5 w-5" />}
            title="One backend, two clients"
            body={
              <>
                Next.js + Better Auth serves both the browser and the Expo
                native client. Same endpoints, same Postgres rows, mobile and
                web passkeys interoperate.
              </>
            }
          />
          <FeatureCard
            icon={<Smartphone className="h-5 w-5" />}
            title="Real device camera"
            body={
              <>
                Web demo uses an auto-passing provider for determinism. The
                Expo app runs the actual presentation-attack-detection
                ceremony against the same backend.
              </>
            }
          />
          <FeatureCard
            icon={<Mail className="h-5 w-5" />}
            title="Email OTP fallback"
            body={
              <>
                First-time users sign in via a 6-digit code (Resend), then
                bind a passkey from the dashboard. No password reset paths
                because there are no passwords.
              </>
            }
          />
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>How to try it</CardTitle>
            <CardDescription>
              90 seconds. No password needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Step
              n={1}
              body={
                <>
                  Click{" "}
                  <Link href="/login" className="underline font-medium">
                    Sign in
                  </Link>{" "}
                  and request a code. Check your inbox for a 6-digit OTP.
                </>
              }
            />
            <Step
              n={2}
              body={
                <>
                  Enter the code. You land on the dashboard signed in — no
                  password ever created.
                </>
              }
            />
            <Step
              n={3}
              body={
                <>
                  Click <strong>Register passkey</strong>. Your browser runs
                  the WebAuthn ceremony (Touch ID / Windows Hello), the server
                  validates a liveness token (auto-pass demo provider), and
                  the audit slice lands in{" "}
                  <code className="text-xs">passkey.metadata.liveness</code>.
                </>
              }
            />
            <Step
              n={4}
              body={
                <>
                  Sign out, then sign back in via the{" "}
                  <strong>Passkey</strong> tab — full assertion flow, no email
                  needed.
                </>
              }
            />
          </CardContent>
        </Card>
      </section>

      <footer className="border-t mt-8">
        <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
          <p>
            Open source — MIT licensed. Built by{" "}
            <Link
              href="https://github.com/iosazee"
              className="underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              @iosazee
            </Link>
            .
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/iosazee/expo-passkey"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              expo-passkey
            </Link>
            <Link
              href="https://github.com/iosazee/expo-passkey-liveness"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              expo-passkey-liveness
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <Card className="hover:border-foreground/20 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function Step({ n, body }: { n: number; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
        {n}
      </span>
      <p className="text-sm leading-relaxed pt-0.5">{body}</p>
    </div>
  );
}
