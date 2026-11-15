import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/admin/components/login-form";
import { adminConfigured, isAdmin } from "@/features/admin/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return <LoginForm configured={adminConfigured()} />;
}
