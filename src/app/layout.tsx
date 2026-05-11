import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Dashboard",
  description: "Minecraft Server Dashboard",
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
