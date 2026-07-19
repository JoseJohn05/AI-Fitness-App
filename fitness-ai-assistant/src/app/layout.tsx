import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitIntelligence - AI-Health Monitoring System",
  description: "AI-powered blood pressure management and fitness assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
