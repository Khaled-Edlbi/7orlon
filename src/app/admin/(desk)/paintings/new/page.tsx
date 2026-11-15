import { PaintingForm } from "@/features/admin/components/painting-form";
import { requireAdminPage } from "@/features/admin/server";

export const dynamic = "force-dynamic";

export default async function AdminNewPaintingPage() {
  await requireAdminPage();

  return <PaintingForm />;
}
