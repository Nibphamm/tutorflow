"use client";

import { useActionState } from "react";
import { createClassAction } from "./actions";
import { Button, Field, Input } from "@/components/ui";
import { PlusIcon } from "@/components/icons";

export function ClassForm() {
  const [state, action, pending] = useActionState(createClassAction, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <Field label="Tên lớp mới">
          <Input name="name" required />
        </Field>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        <PlusIcon /> {pending ? "Đang thêm..." : "Thêm lớp"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
