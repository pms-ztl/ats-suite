import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "@/components/shared/client-providers";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "CDC ATS — AI-Powered Applicant Tracking System",
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
    title: "CDC ATS — AI-Powered Applicant Tracking System",
    description: "Enterprise-grade AI-powered ATS for modern hiring teams.",
    siteName: "CDC ATS",
  },
  twitter: {
    card: "summary_large_image",
    title: "CDC ATS — AI-Powered Applicant Tracking System",
    description: "Enterprise-grade AI-powered ATS for modern hiring teams.",
  },
  robots: {
    index: false, // internal enterprise app
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ClientProviders />
        </AuthProvider>
      </body>
    </html>
  );
}
