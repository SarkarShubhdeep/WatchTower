import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-geist-pixel-square",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WatchTower — Local-first activity tracking",
  description:
    "Privacy-first, local-only time tracking. All data stays on your machine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${pressStart2P.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
