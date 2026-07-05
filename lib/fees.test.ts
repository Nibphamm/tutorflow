// ponytail: 1 self-check chạy bằng `npm test` (tsx), không cần framework
import assert from "node:assert";
import { computeTuition } from "./fees";

// PER_SESSION, 2 môn, có buổi vắng không tính
{
  const r = computeTuition(
    {
      feeModel: "PER_SESSION",
      subject1Name: "Toán",
      subject1Price: 100_000,
      subject2Name: "Anh",
      subject2Price: 120_000,
    },
    [
      { present: true, subjectIndex: 0 },
      { present: true, subjectIndex: 0 },
      { present: false, subjectIndex: 0 }, // vắng, không tính
      { present: true, subjectIndex: 1 },
    ]
  );
  assert.strictEqual(r.total, 2 * 100_000 + 1 * 120_000);
  assert.strictEqual(r.subjects.length, 2);
}

// PER_SESSION, chỉ 1 môn (không cấu hình môn 2)
{
  const r = computeTuition(
    { feeModel: "PER_SESSION", subject1Name: "Toán", subject1Price: 50_000 },
    [
      { present: true, subjectIndex: 0 },
      { present: true, subjectIndex: 0 },
    ]
  );
  assert.strictEqual(r.total, 100_000);
  assert.strictEqual(r.subjects.length, 1);
}

// FIXED — không phụ thuộc số buổi
{
  const r = computeTuition({ feeModel: "FIXED", fixedFee: 500_000 }, [
    { present: true, subjectIndex: 0 },
  ]);
  assert.strictEqual(r.total, 500_000);
}

console.log("fees.test.ts: OK");
