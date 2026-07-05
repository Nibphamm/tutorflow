import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { resolvePeriod, monthRange } from "@/lib/period";
import { BulkGrid } from "../bulk-grid";
import { saveBulkAttendanceAction } from "../actions";
import { Button, Card, PageHeader, Select } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/icons";

export default async function BulkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectIndex?: string; month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } });
  const classId = sp.classId || classes[0]?.id || "";
  const subjectIndex = Number(sp.subjectIndex || 0);
  const period = resolvePeriod(sp);

  let students: { id: string; name: string }[] = [];
  const initialChecked: Record<string, boolean> = {};

  if (classId) {
    students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const { start, end } = monthRange(period);
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        subjectIndex,
        present: true,
        date: { gte: start, lte: end },
      },
    });
    for (const a of attendances) {
      const day = a.date.getUTCDate();
      initialChecked[`${a.studentId}-${day}`] = true;
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Điểm danh hàng loạt"
        action={
          <Link href="/dashboard/attendance">
            <Button variant="secondary">
              <ArrowLeftIcon /> Điểm danh theo ngày
            </Button>
          </Link>
        }
      />

      <Card>
        <form className="flex flex-wrap gap-2" method="get">
          <input type="hidden" name="month" value={period.month} />
          <input type="hidden" name="year" value={period.year} />
          <Select name="classId" defaultValue={classId} className="w-auto min-w-[140px]">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select name="subjectIndex" defaultValue={subjectIndex} className="w-auto min-w-[110px]">
            <option value={0}>Buổi 1</option>
            <option value={1}>Buổi 2</option>
          </Select>
          <Button type="submit">Xem</Button>
        </form>
      </Card>

      {classes.length === 0 ? (
        <p className="text-slate-500">Chưa có lớp nào, tạo lớp trước.</p>
      ) : (
        <BulkGrid
          students={students}
          year={period.year}
          month={period.month}
          initialChecked={initialChecked}
          classId={classId}
          subjectIndex={subjectIndex}
          action={saveBulkAttendanceAction}
        />
      )}
    </div>
  );
}
