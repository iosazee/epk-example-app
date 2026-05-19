import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "expo-passkey-liveness demo",
  description:
    "End-to-end integration of expo-passkey and expo-passkey-liveness against Better Auth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
