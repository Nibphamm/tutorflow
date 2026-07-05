"use client";

import { useActionState, useState } from "react";
import type { StudentFormState } from "./actions";

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
    <form action={formAction} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Họ và tên</label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Lớp</label>
        <select
          name="classId"
          required
          defaultValue={initial?.classId}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">-- Chọn lớp --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Mô hình tính phí</label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="feeModel"
              value="PER_SESSION"
              checked={feeModel === "PER_SESSION"}
              onChange={() => setFeeModel("PER_SESSION")}
            />
            Tính theo buổi
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="feeModel"
              value="FIXED"
              checked={feeModel === "FIXED"}
              onChange={() => setFeeModel("FIXED")}
            />
            Cố định/tháng
          </label>
        </div>
      </div>

      {feeModel === "FIXED" ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Học phí cố định (đ)</label>
          <input
            name="fixedFee"
            type="number"
            min={0}
            defaultValue={initial?.fixedFee ?? undefined}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-md border border-slate-200 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Tên buổi 1</label>
              <input
                name="subject1Name"
                defaultValue={initial?.subject1Name ?? "Buổi 1"}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Đơn giá/buổi (đ)</label>
              <input
                name="subject1Price"
                type="number"
                min={0}
                defaultValue={initial?.subject1Price ?? undefined}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={hasSubject2}
              onChange={(e) => setHasSubject2(e.target.checked)}
            />
            Học sinh có buổi/môn thứ 2
          </label>

          {hasSubject2 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Tên buổi 2</label>
                <input
                  name="subject2Name"
                  defaultValue={initial?.subject2Name ?? ""}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Đơn giá/buổi (đ)</label>
                <input
                  name="subject2Price"
                  type="number"
                  min={0}
                  defaultValue={initial?.subject2Price ?? undefined}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
