import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">expo-passkey-liveness demo</h1>
        <p className="mt-2 text-sm text-neutral-600">
          End-to-end integration of{" "}
          <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs">expo-passkey</code>{" "}
          and{" "}
          <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs">
            expo-passkey-liveness
          </code>{" "}
          on Better Auth. Deployed as a Next.js app on Vercel.
        </p>
      </header>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-medium">What this demo validates</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-neutral-700">
          <li>Both plugins coexist in one Better Auth instance.</li>
          <li>
            <code className="text-xs">/expo-passkey/liveness/session</code> and{" "}
            <code className="text-xs">/expo-passkey/liveness/verify</code>{" "}
            endpoints work end-to-end.
          </li>
          <li>
            The enforcement hook validates <code className="text-xs">livenessToken</code>{" "}
            on register and authenticate, and injects an audit slice into{" "}
            <code className="text-xs">passkey.metadata</code>.
          </li>
          <li>
            The upstream <code className="text-xs">livenessToken</code> field added to{" "}
            <code className="text-xs">expo-passkey</code> propagates through the
            request body unchanged.
          </li>
        </ul>
        <h2 className="pt-2 font-medium">What it does NOT validate</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-neutral-700">
          <li>
            The native iOS/Android camera ceremony. The server uses a{" "}
            <code className="text-xs">customProvider</code> that auto-passes; the
            web flow skips the native step entirely. Validating the camera path
            requires the Expo companion app on a physical device.
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-medium">Try it</h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-neutral-700">
          <li>
            Open the{" "}
            <Link className="text-blue-600 underline" href="/test">
              /test
            </Link>{" "}
            page.
          </li>
          <li>Sign up with any email + password. You're now logged in.</li>
          <li>Click "Register passkey + liveness". A browser passkey prompt appears.</li>
          <li>
            Once registered, sign out and click "Sign in with passkey + liveness".
          </li>
          <li>
            Hit <code className="text-xs">/api/debug/passkeys</code> to see the
            persisted credential with its{" "}
            <code className="text-xs">metadata.liveness</code> audit slice.
          </li>
        </ol>
      </section>

      <footer className="text-xs text-neutral-500">
        Source: <code>../expo-passkey-liveness-example</code> ·{" "}
        <a className="underline" href="/test">
          /test
        </a>{" "}
        ·{" "}
        <a className="underline" href="/api/debug/passkeys">
          /api/debug/passkeys
        </a>{" "}
        ·{" "}
        <a className="underline" href="/api/debug/liveness-sessions">
          /api/debug/liveness-sessions
        </a>
      </footer>
    </div>
  );
}
