"use client";

import { useActionState } from "react";
import { createClassAction } from "./actions";

export function ClassForm() {
  const [state, action, pending] = useActionState(createClassAction, undefined);

  return (
    <form action={action} className="flex items-end gap-2">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tên lớp mới</label>
        <input
          name="name"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Đang thêm..." : "+ Thêm lớp"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
