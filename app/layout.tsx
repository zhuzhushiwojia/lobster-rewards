import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lobster Rewards - Earn Crypto on Solana",
  description: "Complete tasks, refer friends, and earn DeAura tokens on Solana. Join the Lobster Rewards community and start earning today! 🦞",
  keywords: ["Solana", "DeAura", "Crypto Rewards", "DeFi", "TokenTon26"],
  openGraph: {
    title: "Lobster Rewards - Earn Crypto on Solana",
    description: "Complete tasks, refer friends, and earn DeAura tokens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
