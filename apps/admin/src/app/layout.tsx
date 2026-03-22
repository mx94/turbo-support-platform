import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@repo/ui/globals.css";
import { type ReactElement } from "react";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Turbo Admin",
  description: "Admin dashboard for AI-powered customer support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} font-sans antialiased text-foreground bg-background`}>{children}</body>
    </html>
  );
}
