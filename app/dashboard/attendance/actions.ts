"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";

function toDate(dateStr: string): Date {
  // "YYYY-MM-DD" -> Date tại UTC 00:00, khớp @db.Date (không giờ)
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function saveDayAttendanceAction(formData: FormData) {
  const centerId = await requireCenterId();
  const date = toDate(formData.get("date") as string);
  const subjectIndex = Number(formData.get("subjectIndex"));
  const submittedIds = formData.getAll("studentId") as string[];
  const owned = await prisma.student.findMany({
    where: { id: { in: submittedIds }, centerId },
    select: { id: true },
  });
  const studentIds = owned.map((s) => s.id);

  await prisma.$transaction(
    studentIds.map((id) => {
      const present = formData.get(`present-${id}`) === "yes";
      return prisma.attendance.upsert({
        where: { studentId_date_subjectIndex: { studentId: id, date, subjectIndex } },
        update: { present },
        create: { studentId: id, date, subjectIndex, present },
      });
    })
  );

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/students");
}

export async function saveBulkAttendanceAction(formData: FormData) {
  const centerId = await requireCenterId();
  const subjectIndex = Number(formData.get("subjectIndex"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const submittedIds = formData.getAll("studentId") as string[];
  const owned = await prisma.student.findMany({
    where: { id: { in: submittedIds }, centerId },
    select: { id: true },
  });
  const studentIds = owned.map((s) => s.id);

  const start = toDate(`${year}-${String(month).padStart(2, "0")}-01`);
  const lastDay = new Date(year, month, 0).getDate();
  const end = toDate(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);

  const checkedCells: { studentId: string; date: Date }[] = [];
  for (const studentId of studentIds) {
    for (let day = 1; day <= lastDay; day++) {
      if (formData.get(`cell-${studentId}-${day}`) === "1") {
        checkedCells.push({ studentId, date: toDate(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`) });
      }
    }
  }

  await prisma.$transaction([
    prisma.attendance.deleteMany({
      where: { studentId: { in: studentIds }, subjectIndex, date: { gte: start, lte: end } },
    }),
    prisma.attendance.createMany({
      data: checkedCells.map((c) => ({
        studentId: c.studentId,
        date: c.date,
        subjectIndex,
        present: true,
      })),
    }),
  ]);

  revalidatePath("/dashboard/attendance/bulk");
  revalidatePath("/dashboard/students");
}
