"use client";

import { useActionState, useState } from "react";
import type { StudentFormState } from "./actions";
import { Button, Card, Field, Input, Select } from "@/components/ui";

type ClassOption = { id: string; name: string };

type Initial = {
  id?: string;
  name?: string;
  classId?: string;
  feeModel?: "FIXED" | "PER_SESSION";
  fixedFee?: number | null;
  subject1Name?: string | null;
  subject1Price?: number | null;
  subject2Name?: string | null;
  subject2Price?: number | null;
};

export function StudentForm({
  classes,
  initial,
  action,
  submitLabel,
}: {
  classes: ClassOption[];
  initial?: Initial;
  action: (prev: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [feeModel, setFeeModel] = useState<"FIXED" | "PER_SESSION">(
    initial?.feeModel ?? "PER_SESSION"
  );
  const [hasSubject2, setHasSubject2] = useState(!!initial?.subject2Name);

  return (
    <Card className="max-w-lg">
      <form action={formAction} className="space-y-5">
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}

        <Field label="Họ và tên" required>
          <Input name="name" required defaultValue={initial?.name} />
        </Field>

        <Field label="Lớp" required>
          <Select name="classId" required defaultValue={initial?.classId}>
            <option value="">-- Chọn lớp --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Mô hình tính phí</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="feeModel"
                value="PER_SESSION"
                checked={feeModel === "PER_SESSION"}
                onChange={() => setFeeModel("PER_SESSION")}
                className="h-4 w-4 accent-indigo-600"
              />
              Tính theo buổi
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="feeModel"
                value="FIXED"
                checked={feeModel === "FIXED"}
                onChange={() => setFeeModel("FIXED")}
                className="h-4 w-4 accent-indigo-600"
              />
              Cố định/tháng
            </label>
          </div>
        </fieldset>

        {feeModel === "FIXED" ? (
          <Field label="Học phí cố định (đ)">
            <Input
              name="fixedFee"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={initial?.fixedFee ?? undefined}
            />
          </Field>
        ) : (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tên buổi 1">
                <Input name="subject1Name" defaultValue={initial?.subject1Name ?? "Buổi 1"} />
              </Field>
              <Field label="Đơn giá/buổi (đ)">
                <Input
                  name="subject1Price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  defaultValue={initial?.subject1Price ?? undefined}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={hasSubject2}
                onChange={(e) => setHasSubject2(e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              Học sinh có buổi/môn thứ 2
            </label>

            {hasSubject2 && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tên buổi 2">
                  <Input name="subject2Name" defaultValue={initial?.subject2Name ?? ""} />
                </Field>
                <Field label="Đơn giá/buổi (đ)">
                  <Input
                    name="subject2Price"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={initial?.subject2Price ?? undefined}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={pending} className="w-full">
          {pending ? "Đang lưu..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
