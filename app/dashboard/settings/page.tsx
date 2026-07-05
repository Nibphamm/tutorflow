import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const centerId = await requireCenterId();
  const center = await prisma.center.findUnique({ where: { id: centerId } });
  if (!center) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">⚙️ Thiết lập trung tâm</h1>
      <SettingsForm center={center} />
    </div>
  );
}
