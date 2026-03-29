/**
 * Global layout component.
 * Responsibility: Provide the common structure (navigation, footer) for all pages.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WANINARU - 学びは繋がり、知識は輪になる",
  description: "資格試験の過去問解説や解法を共有し、学習者同士でインサイトを高め合う学習特化型SNSプラットフォームです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          {children}
        </main>
        <footer className="border-t py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2026 WANINARU. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
