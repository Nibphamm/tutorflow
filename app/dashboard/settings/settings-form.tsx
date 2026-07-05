"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "./actions";
import { INVOICE_THEMES } from "@/lib/themes";
import type { Center } from "@prisma/client";

const CENTER_TYPES: { value: Center["type"]; label: string }[] = [
  { value: "EN", label: "🇬🇧 Tiếng Anh" },
  { value: "MATH", label: "➕ Toán Học" },
  { value: "ART", label: "🎵 Năng Khiếu" },
  { value: "PRIMARY", label: "🏫 Tiểu Học" },
  { value: "CODING", label: "💻 Lập Trình" },
  { value: "CUSTOM", label: "✏️ Tùy Chỉnh" },
];

export function SettingsForm({ center }: { center: Center }) {
  const [state, action, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <form action={action} className="max-w-lg space-y-6 rounded-lg bg-white p-6 shadow">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tên hiển thị trên phiếu</label>
        <input
          name="displayName"
          defaultValue={center.displayName ?? center.name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Loại hình trung tâm</label>
        <select
          name="type"
          defaultValue={center.type}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {CENTER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nhãn cột điểm 1</label>
          <input
            name="remarkLabel1"
            defaultValue={center.remarkLabel1}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nhãn cột điểm 2</label>
          <input
            name="remarkLabel2"
            defaultValue={center.remarkLabel2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">🎨 Theme mặc định cho phiếu</label>
        <select
          name="defaultTheme"
          defaultValue={center.defaultTheme}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {INVOICE_THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 rounded-md border border-slate-200 p-3">
        <p className="text-sm font-medium text-slate-700">Thông tin VietQR</p>
        <div className="space-y-1">
          <label className="text-xs text-slate-600">Mã BIN ngân hàng (vd 970436 = Vietcombank)</label>
          <input
            name="bankBin"
            defaultValue={center.bankBin ?? ""}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-600">Số tài khoản</label>
          <input
            name="bankAccount"
            defaultValue={center.bankAccount ?? ""}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-600">Tên chủ tài khoản</label>
          <input
            name="bankAccountName"
            defaultValue={center.bankAccountName ?? ""}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Đã lưu</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Lưu thiết lập"}
      </button>
    </form>
  );
}
