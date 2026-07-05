"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";

const schema = z.object({
  displayName: z.string().optional(),
  type: z.enum(["EN", "MATH", "ART", "PRIMARY", "CODING", "CUSTOM"]),
  remarkLabel1: z.string().min(1),
  remarkLabel2: z.string().min(1),
  defaultTheme: z.string().min(1),
  bankBin: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountName: z.string().optional(),
});

export type SettingsState = { error?: string; ok?: boolean } | undefined;

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const parsed = schema.safeParse({
    displayName: formData.get("displayName") || undefined,
    type: formData.get("type"),
    remarkLabel1: formData.get("remarkLabel1"),
    remarkLabel2: formData.get("remarkLabel2"),
    defaultTheme: formData.get("defaultTheme"),
    bankBin: formData.get("bankBin") || undefined,
    bankAccount: formData.get("bankAccount") || undefined,
    bankAccountName: formData.get("bankAccountName") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const centerId = await requireCenterId();
  await prisma.center.update({ where: { id: centerId }, data: parsed.data });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
