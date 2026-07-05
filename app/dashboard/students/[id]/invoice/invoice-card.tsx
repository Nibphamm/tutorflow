"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { INVOICE_THEMES, getTheme } from "@/lib/themes";
import { formatVnd } from "@/lib/fees";
import { Button } from "@/components/ui";
import { DownloadIcon } from "@/components/icons";

export function InvoiceCard({
  studentName,
  className,
  month,
  year,
  subjects,
  total,
  days,
  qrUrl,
  bankInfo,
  initialTheme,
}: {
  studentName: string;
  className: string;
  month: number;
  year: number;
  subjects: { name: string; price: number; sessions: number; amount: number }[];
  total: number;
  days: string[]; // "DD/MM"
  qrUrl: string | null;
  bankInfo: { bankAccount: string; bankAccountName: string } | null;
  initialTheme: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const [downloading, setDownloading] = useState(false);
  const theme = getTheme(searchParams.get("theme") ?? initialTheme);

  function setTheme(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function download() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `phieu-hoc-phi-${studentName}-${month}-${year}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Giao diện phiếu:</span>
        {INVOICE_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={t.label}
            title={t.label}
            className={
              "h-8 w-8 rounded-full bg-gradient-to-br shadow-sm transition-transform " +
              t.gradient +
              (theme.id === t.id
                ? " ring-2 ring-indigo-500 ring-offset-2 scale-110"
                : " hover:scale-105")
            }
          />
        ))}
      </div>

      <div
        ref={cardRef}
        className={`w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-xl ${theme.gradient}`}
      >
        <div className={`flex items-center justify-between ${theme.accent}`}>
          <h2 className="text-lg font-bold tracking-wide">PHIẾU HỌC PHÍ</h2>
          <span className="text-sm font-medium opacity-90">
            Tháng {month}/{year}
          </span>
        </div>
        <p className={`mt-1 text-sm font-medium opacity-90 ${theme.accent}`}>
          {studentName} · Lớp {className}
        </p>

        <div className="mt-4 space-y-1.5 rounded-xl bg-white p-4 text-sm text-slate-800">
          {subjects.map((s) => (
            <div key={s.name} className="flex justify-between">
              <span>
                {s.name} ({s.sessions} buổi × {formatVnd(s.price)})
              </span>
              <span className="font-medium">{formatVnd(s.amount)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Tổng cộng</span>
            <span>{formatVnd(total)}</span>
          </div>
        </div>

        {days.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {days.map((d) => (
              <span
                key={d}
                className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Viết lời nhắn học tập..."
          className="mt-3 w-full rounded-lg bg-white p-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          rows={2}
        />

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR chuyển khoản" className="h-24 w-24 shrink-0 rounded-md" />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-slate-100 text-center text-[10px] text-slate-500">
              Chưa cấu hình ngân hàng
            </div>
          )}
          <div className="min-w-0 text-xs text-slate-700">
            {bankInfo ? (
              <>
                <p className="truncate font-semibold text-slate-900">{bankInfo.bankAccountName}</p>
                <p>STK: {bankInfo.bankAccount}</p>
                <p className="font-medium">Số tiền: {formatVnd(total)}</p>
              </>
            ) : (
              <p>Vào Thiết lập để cấu hình VietQR</p>
            )}
          </div>
        </div>
      </div>

      <Button onClick={download} disabled={downloading} variant="primary">
        <DownloadIcon /> {downloading ? "Đang tạo ảnh..." : "Tải phiếu (PNG)"}
      </Button>
    </div>
  );
}
