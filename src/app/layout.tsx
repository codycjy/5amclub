// src/app/layout.tsx
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider"; // 新增

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://5amclub.life"),
  title: {
    default: "5AM Club - Transform Your Life Through Early Rising",
    template: "%s | 5AM Club",
  },
  description:
    "Join 5AM Club to unlock your potential through early rising. Track your sleep schedule, build lasting habits, and connect with a global community of early risers.",
  keywords: [
    "early rising",
    "morning routine",
    "habit building",
    "productivity",
    "wellness",
    "self-improvement",
    "community",
    "sleep tracking",
  ],
  authors: [{ name: "5AM Club Team" }],
  creator: "5AM Club",
  publisher: "5AM Club",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "5AM Club - Rise Early, Rise Together",
    description:
      "Join thousands of early risers in building life-changing morning routines",
    url: "https://5amclub.life",
    siteName: "5AM Club",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="overflow-y-scroll">
      <body className={inter.className}>
        <Navbar />
        <ClientProvider>
          <main className="pt-16 min-h-screen container mx-auto">
            {children}
          </main>
        </ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
