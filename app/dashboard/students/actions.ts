"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";

const baseSchema = z.object({
  name: z.string().min(1, "Tên học sinh không được để trống"),
  classId: z.string().min(1, "Chọn lớp"),
  feeModel: z.enum(["FIXED", "PER_SESSION"]),
  fixedFee: z.coerce.number().optional(),
  subject1Name: z.string().optional(),
  subject1Price: z.coerce.number().optional(),
  subject2Name: z.string().optional(),
  subject2Price: z.coerce.number().optional(),
});

export type StudentFormState = { error?: string } | undefined;

function parseStudentForm(formData: FormData) {
  return baseSchema.safeParse({
    name: formData.get("name"),
    classId: formData.get("classId"),
    feeModel: formData.get("feeModel"),
    fixedFee: formData.get("fixedFee") || undefined,
    subject1Name: formData.get("subject1Name") || undefined,
    subject1Price: formData.get("subject1Price") || undefined,
    subject2Name: formData.get("subject2Name") || undefined,
    subject2Price: formData.get("subject2Price") || undefined,
  });
}

export async function createStudentAction(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parsed = parseStudentForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const centerId = await requireCenterId();
  const d = parsed.data;
  await prisma.student.create({
    data: {
      name: d.name,
      classId: d.classId,
      centerId,
      feeModel: d.feeModel,
      fixedFee: d.feeModel === "FIXED" ? d.fixedFee ?? 0 : null,
      subject1Name: d.feeModel === "PER_SESSION" ? d.subject1Name || "Buổi 1" : null,
      subject1Price: d.feeModel === "PER_SESSION" ? d.subject1Price ?? 0 : null,
      subject2Name: d.feeModel === "PER_SESSION" && d.subject2Name ? d.subject2Name : null,
      subject2Price: d.feeModel === "PER_SESSION" && d.subject2Name ? d.subject2Price ?? 0 : null,
    },
  });
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function updateStudentAction(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const id = formData.get("id") as string;
  const parsed = parseStudentForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const centerId = await requireCenterId();
  const d = parsed.data;
  await prisma.student.updateMany({
    where: { id, centerId },
    data: {
      name: d.name,
      classId: d.classId,
      feeModel: d.feeModel,
      fixedFee: d.feeModel === "FIXED" ? d.fixedFee ?? 0 : null,
      subject1Name: d.feeModel === "PER_SESSION" ? d.subject1Name || "Buổi 1" : null,
      subject1Price: d.feeModel === "PER_SESSION" ? d.subject1Price ?? 0 : null,
      subject2Name: d.feeModel === "PER_SESSION" && d.subject2Name ? d.subject2Name : null,
      subject2Price: d.feeModel === "PER_SESSION" && d.subject2Name ? d.subject2Price ?? 0 : null,
    },
  });
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function deleteStudentAction(formData: FormData) {
  const id = formData.get("id") as string;
  const centerId = await requireCenterId();
  await prisma.student.deleteMany({ where: { id, centerId } });
  revalidatePath("/dashboard/students");
}
