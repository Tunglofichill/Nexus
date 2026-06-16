import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import MainLayoutWrapper from "@/components/MainLayoutWrapper";

export const metadata: Metadata = {
  title: "Nexus TV OS",
  description: "Virtual YouTuber Society OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-nexus-accent selection:text-white bg-nexus-bg text-white">
        <Toaster position="top-right" />
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}
