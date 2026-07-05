import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { SettingsForm } from "./settings-form";
import { PageHeader } from "@/components/ui";

export default async function SettingsPage() {
  const centerId = await requireCenterId();
  const center = await prisma.center.findUnique({ where: { id: centerId } });
  if (!center) notFound();

  return (
    <div className="space-y-5">
      <PageHeader title="Thiết lập trung tâm" />
      <SettingsForm center={center} />
    </div>
  );
}
