function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: required("BETTER_AUTH_URL"),
  NEXT_PUBLIC_APP_URL: required("NEXT_PUBLIC_APP_URL"),
  RP_ID: required("RP_ID"),
  RP_NAME: required("RP_NAME"),

  // Optional — set when the apps/mobile companion is registering
  // passkeys against this backend. Used to (a) extend the trusted
  // origin list for native WebAuthn ceremonies and (b) serve
  // .well-known/apple-app-site-association + assetlinks.json.
  MOBILE_IOS_BUNDLE_ID: optional("MOBILE_IOS_BUNDLE_ID"),
  MOBILE_IOS_TEAM_ID: optional("MOBILE_IOS_TEAM_ID"),
  MOBILE_ANDROID_PACKAGE: optional("MOBILE_ANDROID_PACKAGE"),
  MOBILE_ANDROID_CERT_SHA256: optional("MOBILE_ANDROID_CERT_SHA256"),
};
