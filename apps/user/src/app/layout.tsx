import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@repo/ui/globals.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Turbo Platform",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): ReactElement {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} font-sans antialiased text-foreground bg-background`}>
        {children}
      </body>
    </html>
  );
}
