import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { saveRemarksAction } from "./actions";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { SaveIcon, SendIcon } from "@/components/icons";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function RemarksPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const [classes, center] = await Promise.all([
    prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } }),
    prisma.center.findUnique({ where: { id: centerId } }),
  ]);
  const classId = sp.classId || classes[0]?.id || "";
  const date = sp.date || todayStr();

  let rows: {
    id: string;
    name: string;
    score1: number | null;
    score2: number | null;
    comment: string | null;
    status: "DRAFT" | "SENT" | null;
  }[] = [];

  if (classId) {
    const students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
    });
    const remarks = await prisma.remark.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: new Date(`${date}T00:00:00.000Z`),
      },
    });
    const byStudent = new Map(remarks.map((r) => [r.studentId, r]));
    rows = students.map((s) => {
      const r = byStudent.get(s.id);
      return {
        id: s.id,
        name: s.name,
        score1: r?.score1 ?? null,
        score2: r?.score2 ?? null,
        comment: r?.comment ?? null,
        status: r?.status ?? null,
      };
    });
  }

  const label1 = center?.remarkLabel1 ?? "Điểm 1";
  const label2 = center?.remarkLabel2 ?? "Điểm 2";

  return (
    <div className="space-y-5">
      <PageHeader title="Nhận Xét" />

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
          <Button type="submit">Xem</Button>
        </form>
      </Card>

      {classes.length === 0 ? (
        <p className="text-slate-500">Chưa có lớp nào, tạo lớp trước.</p>
      ) : rows.length === 0 ? (
        <EmptyState>Lớp chưa có học sinh.</EmptyState>
      ) : (
        <form action={saveRemarksAction} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          {rows.map((r) => (
            <input key={r.id} type="hidden" name="studentId" value={r.id} />
          ))}

          {/* Mobile: thẻ từng học sinh */}
          <div className="grid gap-3 sm:hidden">
            {rows.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{r.name}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{label1}</label>
                    <Input type="number" name={`score1-${r.id}`} defaultValue={r.score1 ?? ""} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{label2}</label>
                    <Input type="number" name={`score2-${r.id}`} defaultValue={r.score2 ?? ""} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Nhận xét</label>
                  <Input type="text" name={`comment-${r.id}`} defaultValue={r.comment ?? ""} />
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: bảng */}
          <Card padded={false} className="hidden overflow-hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Học sinh</th>
                  <th className="px-4 py-3 font-medium">{label1}</th>
                  <th className="px-4 py-3 font-medium">{label2}</th>
                  <th className="px-4 py-3 font-medium">Nhận xét</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-2.5">
                      <Input type="number" name={`score1-${r.id}`} defaultValue={r.score1 ?? ""} className="w-20" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input type="number" name={`score2-${r.id}`} defaultValue={r.score2 ?? ""} className="w-20" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input type="text" name={`comment-${r.id}`} defaultValue={r.comment ?? ""} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" name="intent" value="draft">
              <SaveIcon /> Lưu Tạm
            </Button>
            <Button type="submit" name="intent" value="sent" variant="primary">
              <SendIcon /> Gửi Điểm
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "DRAFT" | "SENT" | null }) {
  if (status === "SENT") return <Badge tone="success">Đã gửi</Badge>;
  if (status === "DRAFT") return <Badge tone="warning">Nháp</Badge>;
  return <Badge>Chưa có</Badge>;
}
