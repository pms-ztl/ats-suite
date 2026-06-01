import type { Metadata } from "next";
import "./globals.css";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "@/components/shared/client-providers";
import { AuthProvider } from "@/lib/auth-context";

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "CDC ATS · AI-Powered Applicant Tracking System",
    template: "%s | CDC ATS",
  },
  description: "Enterprise-grade AI-powered applicant tracking system for modern hiring teams. Automate sourcing, screening, interviews, and compliance.",
  keywords: ["ATS", "applicant tracking", "recruiting", "HR software", "AI hiring"],
  authors: [{ name: "CDC" }],
  creator: "CDC",
  metadataBase: new URL("https://ats.cdc.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ats.cdc.com",
    title: "CDC ATS · AI-Powered Applicant Tracking System",
    description: "Enterprise-grade AI-powered ATS for modern hiring teams.",
    siteName: "CDC ATS",
  },
  twitter: {
    card: "summary_large_image",
    title: "CDC ATS · AI-Powered Applicant Tracking System",
    description: "Enterprise-grade AI-powered ATS for modern hiring teams.",
  },
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-3 focus-visible:top-3 focus-visible:z-50 focus-visible:rounded-sm focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:shadow-ring"
        >
          Skip to content
        </a>
        <AuthProvider>
          <div id="main">{children}</div>
          <ClientProviders />
        </AuthProvider>
      </body>
    </html>
  );
}
