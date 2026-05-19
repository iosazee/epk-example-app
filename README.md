# epk-example-app

End-to-end reference monorepo for
[`expo-passkey`](https://github.com/iosazee/expo-passkey) and
[`expo-passkey-liveness`](https://github.com/iosazee/expo-passkey-liveness).
Two apps, one backend.

| Workspace | What it is | Demonstrates |
|---|---|---|
| [`apps/web`](./apps/web) | Next.js + Better Auth + Prisma | Server config wiring both plugins, browser WebAuthn ceremonies, debug surface, deploys to Vercel |
| [`apps/mobile`](./apps/mobile) | Expo SDK 55 app (iOS + Android) | Native passkey ceremony, real face-liveness camera step, debug screen — built against the same backend |

The web app exercises everything **except** the native camera (it uses
a demo `customProvider` that auto-passes). The mobile app fills that
gap by running the real PAD ceremony on a physical device.

## Layout

```
epk-example-app/
├── apps/
│   ├── web/                # Next.js — server + browser
│   └── mobile/             # Expo SDK 55 — iOS + Android
├── package.json            # npm workspaces root
├── tsconfig.base.json
└── README.md               # ← you are here
```

## Quick start

### 1. Install

```bash
git clone <this-repo>
cd epk-example-app
npm install --legacy-peer-deps
```

The two libraries are installed from npm:

- `expo-passkey@^0.3.12`
- `expo-passkey-liveness@0.1.0-alpha.0` (alpha — pinned exactly)

### 2. Run the web app

```bash
cp apps/web/.env.example apps/web/.env
npm run db:push                    # creates SQLite at apps/web/prisma/dev.db
npm run dev:web                    # http://localhost:3000
```

Open <http://localhost:3000/test> for the browser flow.

### 3. Run the mobile app

The mobile app talks to the web app's API. Point it at your machine's
LAN IP so physical devices can reach it:

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Edit apps/mobile/.env:
#   EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
#   EXPO_PUBLIC_RP_ID=192.168.1.10   # or your tunneled hostname

npm run dev:mobile                 # expo start
```

Native passkeys require a development build (not Expo Go). The first
time you build, run `npm run ios` or `npm run android` from
`apps/mobile/` to do an `expo prebuild` + native install.

## What the apps demonstrate

### `apps/web` — server + browser

**From `expo-passkey`:**
- Cross-platform passkey registration via WebAuthn (Touch ID, Windows
  Hello, platform authenticator)
- Sign-in via passkey assertion against the unified passkey table
- Custom schema mapping (`authPasskey` → `passkey`,
  `passkeyChallenge` → `passkeyChallenge`)
- Serverless-friendly config (`cleanup.disableInterval`) for Vercel

**From `expo-passkey-liveness`:**
- Both plugins composed in one `betterAuth()` call (see
  [`apps/web/lib/auth.ts`](./apps/web/lib/auth.ts))
- `/expo-passkey/liveness/session` and `/expo-passkey/liveness/verify`
  endpoints reachable end-to-end
- Enforcement hook validates `livenessToken` on register and
  authenticate (`required: "both"`)
- Audit slice written into `passkey.metadata.liveness`
- Demo `customProvider` auto-passes — no third-party credentials
  needed to see the full server flow

### `apps/mobile` — native ceremony

- Email/password sign-up + sign-in via `@better-auth/expo`, session
  persisted in `expo-secure-store`
- **Register passkey + liveness** — runs the real `expo-passkey-liveness`
  native module (camera ceremony), then registers a platform passkey
  bound to the device's secure enclave
- **Sign in with passkey + liveness** — assertion ceremony with the
  same liveness gate
- **Standalone liveness** — Mode 1 from the docs: runs `verifyLiveness`
  on its own, useful for step-up flows
- **Debug screen** — pulls `/api/debug/passkeys` and
  `/api/debug/liveness-sessions` from the backend so you can see the
  rows the ceremony just created

## Wiring the mobile app to the web backend

Native passkeys need three pieces of cross-app setup beyond the env
vars. The example handles all three:

1. **Trusted origin** — `apps/web/lib/auth.ts` adds `https://<rpId>`
   (iOS native) and `android:apk-key-hash:<sha256>` (when Android cert
   fingerprint is set) to the `expoPasskey({ origin })` list.
2. **Apple App Site Association** — `apps/web/app/.well-known/apple-app-site-association/route.ts`
   serves `{ webcredentials: { apps: [<TeamID>.<BundleID>] } }` when
   `MOBILE_IOS_BUNDLE_ID` + `MOBILE_IOS_TEAM_ID` are set.
3. **Android assetlinks** — `apps/web/app/.well-known/assetlinks.json/route.ts`
   serves the digital asset link record when `MOBILE_ANDROID_PACKAGE` +
   `MOBILE_ANDROID_CERT_SHA256` are set.

## Scripts

```bash
# Web
npm run dev:web                    # next dev
npm run build:web                  # prisma generate && next build
npm run db:push                    # prisma db push (apps/web)
npm run db:studio                  # prisma studio (apps/web)

# Mobile
npm run dev:mobile                 # expo start
npm run -w @epk-example/mobile ios          # expo run:ios
npm run -w @epk-example/mobile android      # expo run:android
npm run -w @epk-example/mobile build:prod:ios       # eas build production iOS
npm run -w @epk-example/mobile build:prod:android   # eas build production Android

# Cross-cutting
npm run type-check                 # tsc in every workspace
npm run lint                       # eslint in every workspace
```

## Deploying

- **Web → Vercel**: see [`apps/web/README.md`](./apps/web/README.md).
- **Mobile → App Store / Play Store**: see
  [`apps/mobile/README.md`](./apps/mobile/README.md). The `eas.json`
  ships with `development` / `preview` / `production` profiles
  modeled on a production-deployed Expo app.

## Related

- [`expo-passkey`](https://github.com/iosazee/expo-passkey) — cross-platform passkey plugin
- [`expo-passkey-liveness`](https://github.com/iosazee/expo-passkey-liveness) — liveness / PAD extension

## License

MIT
