export function buildVietQrUrl(params: {
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
  amount: number;
  memo: string;
}): string {
  const q = new URLSearchParams({
    amount: String(params.amount),
    addInfo: params.memo,
    accountName: params.bankAccountName,
  });
  return `https://img.vietqr.io/image/${params.bankBin}-${params.bankAccount}-compact2.png?${q.toString()}`;
}
