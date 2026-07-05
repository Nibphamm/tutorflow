import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { DayForm } from "./day-form";
import { saveDayAttendanceAction } from "./actions";
import { Button, Card, PageHeader, Select } from "@/components/ui";
import { ClipboardListIcon } from "@/components/icons";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; subjectIndex?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } });

  const classId = sp.classId || classes[0]?.id || "";
  const date = sp.date || todayStr();
  const subjectIndex = Number(sp.subjectIndex || 0);

  let studentRows: { id: string; name: string; present: boolean | null }[] = [];
  if (classId) {
    const students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
    });
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: new Date(`${date}T00:00:00.000Z`),
        subjectIndex,
      },
    });
    const presentMap = new Map(attendances.map((a) => [a.studentId, a.present]));
    studentRows = students.map((s) => ({
      id: s.id,
      name: s.name,
      present: presentMap.has(s.id) ? presentMap.get(s.id)! : null,
    }));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Điểm Danh theo ngày"
        action={
          <Link href="/dashboard/attendance/bulk">
            <Button variant="secondary">
              <ClipboardListIcon /> Điểm danh hàng loạt
            </Button>
          </Link>
        }
      />

      <Card>
        <form className="flex flex-wrap gap-2" method="get">
          <Select name="classId" defaultValue={classId} className="w-auto min-w-[140px]">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
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
        <DayForm date={date} subjectIndex={subjectIndex} students={studentRows} action={saveDayAttendanceAction} />
      )}
    </div>
  );
}
