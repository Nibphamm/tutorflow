"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";

const schema = z.object({ name: z.string().min(1, "Tên lớp không được để trống") });

export type ClassFormState = { error?: string } | undefined;

export async function createClassAction(
  _prev: ClassFormState,
  formData: FormData
): Promise<ClassFormState> {
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const centerId = await requireCenterId();
  await prisma.class.create({ data: { name: parsed.data.name, centerId } });
  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard/students");
  return undefined;
}

export async function deleteClassAction(formData: FormData) {
  const id = formData.get("id") as string;
  const centerId = await requireCenterId();
  await prisma.class.deleteMany({ where: { id, centerId } });
  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard/students");
}
