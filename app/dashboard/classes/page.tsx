import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { ClassForm } from "./class-form";
import { deleteClassAction } from "./actions";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { TrashIcon } from "@/components/icons";

export default async function ClassesPage() {
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({
    where: { centerId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Quản lý lớp" />

      <Card>
        <ClassForm />
      </Card>

      {classes.length === 0 ? (
        <EmptyState>Chưa có lớp nào. Tạo lớp đầu tiên ở form trên.</EmptyState>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Lớp</th>
                <th className="px-4 py-3 font-medium">Số học sinh</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c._count.students}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteClassAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 ml-auto"
                        aria-label="Xoá lớp"
                      >
                        <TrashIcon />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
