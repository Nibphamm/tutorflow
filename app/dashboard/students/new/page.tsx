import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { StudentForm } from "../student-form";
import { createStudentAction } from "../actions";

export default async function NewStudentPage() {
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({
    where: { centerId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Thêm học sinh</h1>
      <StudentForm classes={classes} action={createStudentAction} submitLabel="Thêm học sinh" />
    </div>
  );
}
