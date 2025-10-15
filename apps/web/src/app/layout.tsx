import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./contexts/toast-context";
import ChunkErrorBoundary from "../components/chunk-error-boundary";
import { MonitoringBootstrap } from "./monitoring-bootstrap";
import { ServiceWorkerManager } from "../components/service-worker-manager";
import { VersionChecker } from "../components/version-checker";
// Removed DynamicThemeProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boostlly – Daily Motivation",
  description:
    "Tiny words. Big impact. Boostlly delivers a fresh motivational quote every day to keep you inspired.",
  keywords: [
    "Boostlly",
    "daily quotes",
    "motivation",
    "inspiration",
    "productivity",
    "positive mindset",
  ],
  authors: [{ name: "Boostlly Team", url: "https://boostlly.netlify.app" }],
  creator: "Boostlly",
  publisher: "Boostlly",
  metadataBase: new URL("https://boostlly.netlify.app"),

  // Open Graph
  openGraph: {
    title: "Boostlly – Daily Motivation",
    description:
      "Tiny words. Big impact. Discover a motivational quote each day with Boostlly.",
    url: "https://boostlly.netlify.app",
    siteName: "Boostlly",
    images: [
      {
        url: "/boostlly-logo.png",
        width: 1200,
        height: 630,
        alt: "Boostlly Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Boostlly – Daily Motivation",
    description: "Tiny words. Big impact. Stay inspired daily with Boostlly.",
    images: ["/boostlly-logo.png"],
    creator: "@boostlly",
  },

  // Icons
  icons: {
    icon: "/boostlly-logo.png",
    shortcut: "/boostlly-logo.png",
    apple: "/boostlly-logo.png",
  },

  // PWA Manifest
  manifest: "/manifest.json",

  // Prevent extension interference
  other: {
    "boostlly-app": "true",
  },
};

export const viewport = {
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ChunkErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
          <MonitoringBootstrap />
          <ServiceWorkerManager />
          <VersionChecker />
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
