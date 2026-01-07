import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileTopBar } from "@/components/mobile-top-bar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { DesktopHeader } from "@/components/desktop-header";
import { ServiceWorkerRegister, InstallPrompt } from "@/components/pwa";
import { UserValidation } from "@/components/auth/user-validation";

import {
  defaultMetadata,
  siteConfig,
  generateWebsiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/seo";
import { ProfileSelectorWrapper } from "@/components/auth/profile-selector-wrapper";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...defaultMetadata,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
  other: {
    "fb:app_id": process.env.FACEBOOK_APP_ID || "",
    "pinterest-rich-pin": "true",
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationJsonLd()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <QueryProvider>
          <UserValidation>
            <ServiceWorkerRegister />

            <ProfileSelectorWrapper />

            {/* Desktop Layout */}
            <DesktopSidebar />
            <DesktopHeader />

            {/* Mobile Layout */}
            <MobileTopBar />
            <MobileBottomNav />

            {/* Main Content - Responsive padding */}
            <main className="pt-header-safe pb-nav-safe lg:pt-16 lg:pb-0 lg:ml-64">
              {children}
            </main>

            <InstallPrompt />
          </UserValidation>
        </QueryProvider>
      </body>
    </html>
  );
}
