"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";

export async function saveRemarksAction(formData: FormData) {
  const centerId = await requireCenterId();
  const date = new Date(`${formData.get("date")}T00:00:00.000Z`);
  const status = formData.get("intent") === "sent" ? "SENT" : "DRAFT";
  const submittedIds = formData.getAll("studentId") as string[];

  const owned = await prisma.student.findMany({
    where: { id: { in: submittedIds }, centerId },
    select: { id: true },
  });

  await prisma.$transaction(
    owned.map(({ id }) => {
      const score1Raw = formData.get(`score1-${id}`);
      const score2Raw = formData.get(`score2-${id}`);
      const comment = (formData.get(`comment-${id}`) as string) || null;
      const score1 = score1Raw ? Number(score1Raw) : null;
      const score2 = score2Raw ? Number(score2Raw) : null;

      return prisma.remark.upsert({
        where: { studentId_date: { studentId: id, date } },
        update: { score1, score2, comment, status },
        create: { studentId: id, date, score1, score2, comment, status },
      });
    })
  );

  revalidatePath("/dashboard/remarks");
}
