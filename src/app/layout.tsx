import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { APP_NAME, APP_POWERED_BY, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_TAGLINE} A platform that matches users with the right helper for their work.`,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: APP_NAME,
    description: `${APP_TAGLINE} ${APP_POWERED_BY}`,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: `${APP_TAGLINE} ${APP_POWERED_BY}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
