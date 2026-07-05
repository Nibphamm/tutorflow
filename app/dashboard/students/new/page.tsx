import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { StudentForm } from "../student-form";
import { createStudentAction } from "../actions";
import { PageHeader } from "@/components/ui";

export default async function NewStudentPage() {
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({
    where: { centerId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Thêm học sinh" />
      <StudentForm classes={classes} action={createStudentAction} submitLabel="Thêm học sinh" />
    </div>
  );
}
