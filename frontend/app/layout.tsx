import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquiHire AI | Interview Bias & Hiring Risk Intelligence",
  description: "Detect hidden bias in interview questions using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={inter.className}>
          <ClerkProvider>
            {children}
          </ClerkProvider>
        </body>
      </html>
  );
}
