import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { StudentForm } from "../../student-form";
import { updateStudentAction } from "../../actions";
import { PageHeader } from "@/components/ui";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const centerId = await requireCenterId();
  const [student, classes] = await Promise.all([
    prisma.student.findFirst({ where: { id, centerId } }),
    prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } }),
  ]);

  if (!student) notFound();

  return (
    <div className="space-y-5">
      <PageHeader title="Sửa học sinh" />
      <StudentForm
        classes={classes}
        initial={student}
        action={updateStudentAction}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
