import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MC Panel - Admin",
  description: "Minecraft Server Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
