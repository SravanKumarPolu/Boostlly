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
  title: "Boostlly – Daily Motivation & Inspiration",
  description:
    "Transform your daily routine with Boostlly's AI-powered motivational quotes, smart collections, and personalized inspiration. Available as web app and browser extension.",
  keywords: [
    "Boostlly",
    "daily quotes",
    "motivation",
    "inspiration",
    "productivity",
    "positive mindset",
    "AI quotes",
    "smart collections",
    "voice commands",
    "browser extension",
    "PWA",
    "personalized inspiration",
    "quote of the day",
    "mindfulness",
    "success quotes",
    "leadership quotes",
    "wellness",
    "mental health",
    "goal setting",
    "achievement",
  ],
  authors: [{ name: "Boostlly Team", url: "https://boostlly.netlify.app" }],
  creator: "Boostlly",
  publisher: "Boostlly",
  metadataBase: new URL("https://boostlly.netlify.app"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },

  // Open Graph
  openGraph: {
    title: "Boostlly – AI-Powered Daily Motivation",
    description:
      "Transform your daily routine with personalized motivational quotes, smart collections, voice commands, and AI-powered insights. Available as web app and browser extension.",
    url: "https://boostlly.netlify.app",
    siteName: "Boostlly",
    images: [
      {
        url: "/boostlly-logo.png",
        width: 1200,
        height: 630,
        alt: "Boostlly - AI-Powered Daily Motivation Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Boostlly – AI-Powered Daily Motivation",
    description: "Transform your daily routine with personalized quotes, smart collections, and AI insights. Web app + browser extension.",
    images: ["/boostlly-logo.png"],
    creator: "@boostlly",
    site: "@boostlly",
  },

  // Icons
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-128.png", sizes: "128x128", type: "image/png" },
    ],
    shortcut: "/icon-32.png",
    apple: [
      { url: "/icon-128.png", sizes: "128x128", type: "image/png" },
    ],
  },

  // PWA Manifest
  manifest: "/manifest.json",

  // Additional SEO
  alternates: {
    canonical: "https://boostlly.netlify.app",
  },

  // Prevent extension interference
  other: {
    "boostlly-app": "true",
    "application-name": "Boostlly",
    "apple-mobile-web-app-title": "Boostlly",
    "msapplication-TileColor": "#7C3AED",
    "theme-color": "#7C3AED",
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
          <ToastProvider>{children as any}</ToastProvider>
          <MonitoringBootstrap />
          <ServiceWorkerManager />
          <VersionChecker />
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
