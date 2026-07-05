"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "./actions";
import { INVOICE_THEMES } from "@/lib/themes";
import type { Center } from "@prisma/client";
import { Button, Card, Field, Input, Select } from "@/components/ui";

const CENTER_TYPES: { value: Center["type"]; label: string }[] = [
  { value: "EN", label: "Tiếng Anh" },
  { value: "MATH", label: "Toán Học" },
  { value: "ART", label: "Năng Khiếu" },
  { value: "PRIMARY", label: "Tiểu Học" },
  { value: "CODING", label: "Lập Trình" },
  { value: "CUSTOM", label: "Tùy Chỉnh" },
];

export function SettingsForm({ center }: { center: Center }) {
  const [state, action, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <form action={action} className="max-w-lg space-y-6">
      <Card className="space-y-4">
        <Field label="Tên hiển thị trên phiếu">
          <Input name="displayName" defaultValue={center.displayName ?? center.name} />
        </Field>

        <Field label="Loại hình trung tâm">
          <Select name="type" defaultValue={center.type}>
            {CENTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nhãn cột điểm 1">
            <Input name="remarkLabel1" defaultValue={center.remarkLabel1} />
          </Field>
          <Field label="Nhãn cột điểm 2">
            <Input name="remarkLabel2" defaultValue={center.remarkLabel2} />
          </Field>
        </div>

        <Field label="Theme mặc định cho phiếu">
          <Select name="defaultTheme" defaultValue={center.defaultTheme}>
            {INVOICE_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Thông tin VietQR</h2>
        <Field label="Mã BIN ngân hàng" hint="Ví dụ: 970436 = Vietcombank, 970407 = Techcombank">
          <Input name="bankBin" defaultValue={center.bankBin ?? ""} />
        </Field>
        <Field label="Số tài khoản">
          <Input name="bankAccount" defaultValue={center.bankAccount ?? ""} />
        </Field>
        <Field label="Tên chủ tài khoản">
          <Input name="bankAccountName" defaultValue={center.bankAccountName ?? ""} />
        </Field>
      </Card>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-sm text-emerald-600">Đã lưu thiết lập.</p>}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thiết lập"}
      </Button>
    </form>
  );
}
