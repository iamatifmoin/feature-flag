import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Public_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "FlagFlow Super Admin",
  description: "Super-admin console for FlagFlow Management SaaS"
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
