# TutorFlow

Web quản lý trung tâm dạy học/gia sư nhỏ (điểm danh, tính học phí theo buổi/tháng, xuất
Phiếu Học Phí có QR VietQR). Clone chức năng lõi của phieuhocphi.com — xem `TutorFlow.md`
để biết chi tiết khảo sát sản phẩm gốc và phạm vi MVP.

Stack: Next.js 16 (App Router, TypeScript) + Prisma + Postgres + Auth.js v5 (credentials).

## Dev local

Cần Docker (Postgres) hoặc Postgres tự chạy.

```bash
docker run -d --name tutorflow-db -e POSTGRES_USER=tutorflow -e POSTGRES_PASSWORD=tutorflow \
  -e POSTGRES_DB=tutorflow -p 5432:5432 postgres:16-alpine

cp .env.example .env   # điền DATABASE_URL + AUTH_SECRET (openssl rand -base64 32)
npm install
npm run db:migrate     # áp migration vào DB local
npm run dev
```

Mở http://localhost:3000 → `/register` để tạo trung tâm đầu tiên.

## Test

```bash
npm test    # unit test lib/fees.ts (tính học phí)
npm run lint
npm run build
```

## Deploy production (Vercel + Neon)

1. Tạo project Postgres tại [neon.tech](https://neon.tech), lấy connection string **pooled**.
2. Import repo vào [Vercel](https://vercel.com/new).
3. Thêm biến môi trường trên Vercel:
   - `DATABASE_URL` = connection string Neon (pooled)
   - `AUTH_SECRET` = `openssl rand -base64 32`
4. Deploy. Build command đã cấu hình sẵn để tự chạy `prisma migrate deploy` trước khi build
   (xem `package.json` → script `build`).
5. Sau khi deploy xong, vào `/register` trên domain production để tạo trung tâm đầu tiên,
   sau đó vào **Thiết lập** để nhập thông tin ngân hàng (VietQR).

## Cấu trúc

- `prisma/schema.prisma` — data model (Center, User, Class, Student, Attendance, Remark)
- `lib/fees.ts` — logic tính học phí (cố định / theo buổi tối đa 2 môn)
- `lib/vietqr.ts` — sinh URL ảnh QR chuyển khoản (img.vietqr.io)
- `app/dashboard/*` — các route: học sinh, lớp, điểm danh (theo ngày + hàng loạt), phiếu học
  phí, nhận xét, thiết lập

## Ngoài phạm vi MVP (chưa làm)

Thu nợ/doanh thu, lịch dạy, đa giáo viên/phân quyền, chấm công GV, hồ sơ CRM đầy đủ, trang
web công khai trung tâm, bảng giá/thanh toán, affiliate, chống bot đăng ký. Xem `TutorFlow.md`
mục 14 để biết danh sách đầy đủ.
