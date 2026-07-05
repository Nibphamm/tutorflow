import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { resolvePeriod, monthRange } from "@/lib/period";
import { computeTuition } from "@/lib/fees";
import { buildVietQrUrl } from "@/lib/vietqr";
import { InvoiceCard } from "./invoice-card";

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; year?: string; theme?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const period = resolvePeriod(sp);
  const { start, end } = monthRange(period);

  const [student, center] = await Promise.all([
    prisma.student.findFirst({ where: { id, centerId }, include: { class: true } }),
    prisma.center.findUnique({ where: { id: centerId } }),
  ]);
  if (!student) notFound();

  const attendances = await prisma.attendance.findMany({
    where: { studentId: id, date: { gte: start, lte: end } },
  });

  const tuition = computeTuition(student, attendances);
  const days = Array.from(
    new Set(
      attendances
        .filter((a) => a.present)
        .map((a) => `${String(a.date.getUTCDate()).padStart(2, "0")}/${period.month}`)
    )
  ).sort();

  const hasBankInfo = !!(center?.bankBin && center?.bankAccount && center?.bankAccountName);
  const qrUrl = hasBankInfo
    ? buildVietQrUrl({
        bankBin: center!.bankBin!,
        bankAccount: center!.bankAccount!,
        bankAccountName: center!.bankAccountName!,
        amount: tuition.total,
        memo: `${student.name} thang ${period.month}`,
      })
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">
        Phiếu Học Phí — {student.name}
      </h1>
      <InvoiceCard
        studentName={student.name}
        className={student.class.name}
        month={period.month}
        year={period.year}
        subjects={tuition.subjects}
        total={tuition.total}
        days={days}
        qrUrl={qrUrl}
        bankInfo={hasBankInfo ? { bankAccount: center!.bankAccount!, bankAccountName: center!.bankAccountName! } : null}
        initialTheme={sp.theme || center?.defaultTheme || "default"}
      />
    </div>
  );
}
