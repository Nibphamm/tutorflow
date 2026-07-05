# Phân tích sản phẩm: phieuhocphi.com ("Điểm Danh — Phiếu Học Phí")

> Tài liệu này tổng hợp toàn bộ chức năng và business logic đã khảo sát trực tiếp trên phieuhocphi.com (dùng chrome-devtools-mcp, đăng nhập bằng tài khoản thật của bạn — tài khoản "NIBPHAM", đang ở gói dùng thử ULTRA TRIAL). Mục tiêu: giúp bạn quyết định sẽ clone phần nào.
>
> **Lưu ý phạm vi khảo sát:** Không thực hiện các hành động ghi dữ liệu thật (không lưu nhận xét giả, không điểm danh, không tạo mã giới thiệu, không đổi cấu hình) — mọi thao tác ghi/lưu đều bị dừng lại chủ động hoặc bị chặn bởi hệ thống an toàn, chỉ xem giao diện/luồng. Một số nội dung trong ứng dụng còn ghi "sẽ được cập nhật sớm" — nghĩa là tính năng đã có UI/placeholder trên sản phẩm thật nhưng backend/dữ liệu chưa triển khai đầy đủ; các phần này được đánh dấu rõ bên dưới.

---

## 1. Sản phẩm là gì?

**Định vị:** Phần mềm quản lý trung tâm dạy học/gia sư nhỏ và vừa tại Việt Nam — trọng tâm là 3 việc: **điểm danh**, **tính học phí theo buổi/tháng**, và **xuất "Phiếu Học Phí"** (hoá đơn học phí dạng thẻ đẹp, có QR chuyển khoản) để gửi cho phụ huynh qua Zalo/Facebook.

- Tagline trên trang đăng nhập: *"Điểm Danh — Hệ thống quản lý trung tâm"*.
- Đối tượng: gia sư cá nhân, lớp học tại nhà, trung tâm dạy thêm quy mô nhỏ/vừa (không phải trường học lớn).
- Đơn vị tài khoản = **1 "trung tâm"** (mỗi lần đăng ký tạo một trung tâm/gia sư riêng, có thể mời thêm giáo viên/nhân viên vào làm việc chung — xem mục 6).
- Sản phẩm **đa ngành**, không chỉ tiếng Anh: phần "Thiết lập trung tâm" cho chọn loại hình Tiếng Anh / Toán học / Năng khiếu / Tiểu học / Lập trình / Tùy chỉnh — mỗi loại đổi nhãn cột điểm/nhận xét cho phù hợp.

---

## 2. Luồng công khai (chưa đăng nhập)

### 2.1. Trang chủ → tự động redirect `/login`
- Không có landing page marketing riêng; `/` chuyển thẳng vào `/login`.
- Trên nền form đăng nhập là **carousel giới thiệu 5 mẫu Phiếu Học Phí** ("✨ Khám phá Phiếu Học Phí — Vuốt hoặc bấm để xem các mẫu phiếu"), mỗi mẫu có theme màu khác nhau, tên học sinh/lớp mẫu, học phí, số buổi, tổng tiền, ngày đi học, nhận xét mẫu, QR VietQR giả lập theo từng ngân hàng khác nhau (Vietcombank, Techcombank, MB Bank, BIDV, VPBank) → đây chính là cách demo sản phẩm trước khi cần đăng ký, rất trực quan cho phụ huynh/giáo viên xem thử.
- Nút "🎉 Bắt đầu sử dụng" ở cuối carousel.

### 2.2. Đăng ký (`/register`)
Trường bắt buộc: Tên hiển thị, Email đăng nhập, Mật khẩu (≥6 ký tự), Xác nhận mật khẩu, + **Cloudflare Turnstile** (chống bot). Không có OAuth/social login.

### 2.3. Đăng nhập (`/login`)
Email/Username + Mật khẩu + Cloudflare Turnstile. Có "Quên mật khẩu?". Phiên đăng nhập giữ cookie lâu dài (không cần đăng nhập lại giữa các lần truy cập).

---

## 3. Dashboard chính (`/dashboard`)

Sau đăng nhập, giao diện xoay quanh **1 màn hình dashboard duy nhất** với các "chế độ" chuyển qua lại bằng nút bấm (không phải nhiều trang riêng biệt) — UX kiểu "app di động thu nhỏ trong trình duyệt".

### 3.1. Thanh trên cùng
- Logo trung tâm + tên trung tâm + **badge gói cước hiện tại** (vd "ULTRA").
- Bộ chọn Tháng / Năm áp dụng cho toàn bộ dữ liệu hiển thị.
- Chỉ báo "Online" (trạng thái kết nối).

### 3.2. KPI tổng quan (đầu trang)
- Tổng số học sinh + số lớp.
- 💰 Tổng học phí năm.
- Học phí tháng hiện tại.
- 🔥 Học phí phát sinh "hôm nay".

### 3.3. Thanh công cụ
- Ô tìm học sinh theo tên.
- Lọc theo lớp.
- Hiển thị ngày hôm nay + nút "Xem Điểm Danh Hôm Nay".
- 4 nút chế độ chính: **Điểm Danh**, **Nhận Xét**, **📅 Lịch Dạy**, và bảng danh sách học sinh mặc định.

### 3.4. Bảng danh sách học sinh (mặc định)
Cột: Học sinh · Lớp · Điểm danh (đã điểm danh bao nhiêu / tổng buổi trong tháng) · Số buổi đã học · Học phí tháng hiện tại. **Click vào tên học sinh → mở thẳng modal "Phiếu Học Phí"** của học sinh đó (xem mục 4) — đây là điểm chạm chính, biến bảng dữ liệu thành lối tắt tạo hoá đơn.

---

## 4. Phiếu Học Phí — tính năng lõi (core feature)

Modal "PHIẾU HỌC PHÍ" là trái tim của sản phẩm. Khi mở cho 1 học sinh, hệ thống tự tính:

- Tên lớp, tháng áp dụng.
- **Tối đa 2 "buổi" (subject/session type) riêng biệt** mỗi học sinh, mỗi buổi có tên tùy chỉnh (vd "Toán" / "Anh") và đơn giá/buổi riêng — cho phép 1 học sinh học 2 môn với 2 mức phí khác nhau trong cùng 1 phiếu.
- Số buổi đã học mỗi loại (vd "B1: 3 | B2: 3 buổi") — tự đếm từ dữ liệu điểm danh.
- **Tổng học phí = Σ(đơn giá buổi × số buổi)** tự động.
- Danh sách ngày đi học (lấy từ điểm danh) hiển thị dạng chip ngày.
- Ô "Viết lời nhắn học tập..." (nhận xét gửi kèm phiếu) + ô "Thêm ghi chú" phụ.
- **🎨 Giao diện phiếu**: chọn 1 trong 5 theme màu (Mặc định / Dâu Tây / Oải Hương / Đại Dương / Sang Trọng) — đổi theme cho từng phiếu lẻ hoặc đặt mặc định toàn trung tâm (ở Thiết lập trung tâm).
- **📅 Tháng**: đổi tháng áp dụng cho phiếu.
- **🔢 Buổi**: chuyển chế độ tính "theo buổi" (hiện số buổi chưa thu + nút "📅 Chọn ngày" mở picker chọn chính xác những ngày/tháng nào được gộp vào đợt thu này — hỗ trợ **gộp công nợ nhiều tháng vào 1 phiếu**, có nút Chọn hết / theo Thứ 2→6, và "💾 Lưu lịch sử" cho lần thu đó).
- **💰 Phụ phí / 🔗 Gộp học phí**: 2 tính năng nâng cao.
  - "Gộp học phí" (gộp phiếu của nhiều học sinh, ví dụ 2 anh chị em, thành 1 phiếu) → **bị khoá ở gói dùng thử** ("GÓI DÙNG THỬ KHÔNG HỖ TRỢ — Nâng cấp để sử dụng tính năng Gộp Học Phí") → xác nhận đây là tính năng trả phí, dùng làm đòn bẩy upsell.
  - "Phụ phí" (thêm phí phụ thu, ví dụ phí tài liệu) — không quan sát được rõ hành vi khi test (không có form hiện ra ngay), nghi ngờ cũng là premium hoặc cần thêm bước.
- QR thanh toán **VietQR** tự sinh theo ngân hàng/số tài khoản/tên chủ TK đã cấu hình + số tiền + nội dung chuyển khoản — đây là tính năng networking quan trọng (tận dụng chuẩn VietQR công khai, không cần tích hợp cổng thanh toán).
- 2 checkbox xuất: "Tải Phiếu Đơn" (ảnh 1 học sinh) và "Tải Phiếu Lớp" (ảnh gộp cả lớp) — có vẻ xuất ra ảnh/PNG để gửi Zalo.
- Nút "✨ XÁC NHẬN NHẬN XÉT" để lưu nhận xét vào hệ thống.

---

## 5. Điểm Danh (Attendance)

Có **2 chế độ nhập liệu**:

1. **Điểm danh theo ngày** (mặc định): chọn lớp + ngày cụ thể → danh sách học sinh với radio **CÓ / VẮNG** (mặc định là VẮNG cho tới khi chọn) → nút "🚀 GỬI ĐIỂM DANH (đã chọn/tổng)".
2. **📋 Điểm danh hàng loạt** (bulk, dạng bảng tính): chọn Tháng/Năm/Lớp → hiện **lưới cả tháng** (mỗi cột là 1 ngày kèm thứ trong tuần) để tick/bỏ tick hàng loạt. Công cụ hỗ trợ:
   - "✅ Chọn hết" / "🗑️ Bỏ hết" / "Chọn 📅 T2→T6" (chỉ chọn các ngày trong tuần, bỏ qua T7/CN — dành cho lớp học cố định lịch tuần).
   - "📋 Sao chép điểm danh" (copy điểm danh từ tháng/lớp khác).
   - Đếm "X bé · Y ô · Z ngày thay đổi" theo thời gian thực.
   - "💾 LƯU (n ngày)".

Đây là thiết kế UX khá thông minh cho giáo viên dạy lớp cố định lịch (điểm danh cả tháng trong vài giây) — đáng để clone nếu muốn giữ trải nghiệm nhanh.

---

## 6. Nhận Xét (Remarks / học bạ ngắn)

- Chọn lớp + ngày → bảng: Học sinh · **Điểm Nói** · **Điểm Viết** · Nhận xét (nhãn cột này đổi theo "loại hình trung tâm" đã cấu hình, xem mục 8).
- Mỗi dòng có thể mở rộng (▼) để xem "Lý do nghỉ" nếu học sinh vắng hôm đó.
- "📜 Xem Lịch Sử" theo từng học sinh — xem lại toàn bộ nhận xét cũ.
- "📋 Phiếu nhận xét" — có vẻ là mẫu xuất riêng phần nhận xét/học bạ (chưa xác nhận được chi tiết).
- Nút "Lưu Tạm" (nháp) và "🚀 GỬI ĐIỂM" (chốt gửi) — có bước nháp trước khi công bố, hợp lý cho việc chỉnh sửa trước khi phụ huynh nhìn thấy.

---

## 7. Lịch Dạy (Teaching Schedule)

- Xem theo Tuần / Tháng, điều hướng tuần trước/sau.
- "➕ Thêm lịch" mở form đầy đủ:
  - Ngày, Giờ bắt đầu, Giờ kết thúc.
  - Lớp, **Giáo viên phụ trách** (hỗ trợ nhiều giáo viên/nhân sự).
  - Bài học (vd "Unit 5 - Animals"), Ghi chú, **File đính kèm**.
  - Trạng thái: 🟡 Chưa dạy / ✅ Đã dạy / 🔴 Hủy.
  - **Lặp lại...**: tạo chuỗi lịch lặp lại theo tuần (nút nhanh "2 TUẦN"/"4 tuần", tối đa 5 tuần/lần) — tiện cho lớp học cố định lịch hàng tuần.

---

## 8. Quick Menu (⚡) — bản đồ đầy đủ tính năng quản lý

Nút nổi "⚡" (kéo thả được, có thể ẩn) mở ra menu điều hướng tới các module quan trọng không nằm trên thanh chính:

### 8.1. 📊 Bảng & Thống kê
- **📋 Xem Điểm Danh Tháng** — view tổng hợp điểm danh cả tháng.
- **💳 Quản lý Thu nợ** — xem chi tiết dưới.
- **💰 Bảng phụ phí** — quản lý các khoản phụ phí đã thu.
- **📊 Xuất Excel** — xuất báo cáo ra file Excel.

### 8.2. 🔧 Quản lý
- **👶 Quản lý học sinh** — CRUD học sinh (xem mục 9).
- **📋 Điểm danh hàng loạt** — lối tắt tới mục 5.2.
- **☑️ Chấm công GV** — bảng chấm công giáo viên/nhân sự: có bộ đếm Tổng / ✅ Duyệt / ⏳ Chờ / ❌ Từ chối, lọc theo giáo viên, nút "➕ Thêm" → cho thấy đây là **quy trình duyệt công (giáo viên chấm công → chủ trung tâm duyệt/từ chối)**, phục vụ tính lương.
- **⚙️ Thiết lập trung tâm** — xem mục 9.4.
- **🛡️ Quản trị tài khoản** — **hệ thống multi-user/phân quyền** (xem mục 6.1 bên dưới, đổi số thứ tự cho khỏi trùng — chi tiết ngay sau đây).

### 8.3. 🎨 Cấu hình giao diện
- **🎨 Giao diện phiếu** — chọn theme mặc định cho Phiếu Học Phí toàn trung tâm.

### 8.4. 📖 Hướng dẫn & Hỗ trợ
- **🚀 Tính năng hệ thống** — trang giới thiệu tính năng (marketing nội bộ).
- **🎬 Xem hướng dẫn** — modal nhúng 4 video YouTube hướng dẫn: "Hướng Dẫn Nhanh", "Chi Tiết Phiếu Tiền", "Chi Tiết Phiếu Tiền P2", "Thêm Mã QR Thanh Toán" — cho thấy đội ngũ sản phẩm ưu tiên onboarding bằng video ngắn thay vì tài liệu dài.
- **💬 Zalo hỗ trợ** — chat hỗ trợ qua Zalo (widget nổi góc màn hình, luôn hiện).
- **👁️ Ẩn menu nổi** — tắt nút Quick Menu nổi nếu vướng màn hình.

---

## 9. Quản trị tài khoản — Multi-user & phân quyền

Đây là tính năng **rất đáng chú ý** cho mô hình trung tâm có nhiều giáo viên/nhân sự:

- Tab **ℹ️ INFO**: form tạo/sửa tài khoản phụ — Email đăng nhập, Mật khẩu, Tên hiển thị, **Quyền** (dropdown: `User (GV - SV)` / `User 2` / `User 3` / `Admin` — có vẻ là các mức phân quyền tùy biến, chưa rõ khác biệt cụ thể từng mức), và **"Lớp phụ trách"** — giới hạn 1 tài khoản GV chỉ thấy/thao tác trên các lớp được gán (checkbox chọn từng lớp, có "Chọn hết"/"Bỏ hết"). Bảng danh sách hiển thị User/Pass (ẩn, có nút hiện mật khẩu)/Tên/Role/Classes/Thao tác (Sửa).
- Tab **🎨 GIAO DIỆN**: trỏ sang đúng modal "Thiết lập trung tâm" (trùng với mục 9.4, có vẻ là 1 lối tắt UI).
- Tab **⚙️ CÀI ĐẶT**: **"⚠️ VÙNG NGUY HIỂM (DANGER ZONE)"** — nút "🧹 Reset hệ thống": xoá toàn bộ điểm danh + nhận xét nhưng **giữ lại danh sách học sinh**. (Không bấm thử vì phá dữ liệu thật.)

> Số lượng tài khoản giáo viên được tạo bị giới hạn theo gói cước (0 ở FREE → 50 ở ULTRA, xem bảng giá mục 11) — đây là 1 trục thu phí song song với số học sinh.

### 9.4. Thiết lập trung tâm (3 tab)
1. **📝 Nhận Xét** — chọn "loại hình trung tâm" định sẵn: 🇬🇧 Tiếng Anh (mặc định: Điểm Nói/Điểm Viết) · ➕ Toán Học · 🎵 Năng Khiếu · 🏫 Tiểu Học · 💻 Lập Trình · ✏️ Tùy Chỉnh — mỗi loại đổi nhãn 2 cột điểm cho phù hợp (vd Toán/Lập trình có thể dùng "Lý thuyết"/"Thực hành"). Có preview trực tiếp.
2. **🧾 Phiếu Học Phí** — tên hiển thị tuỳ chỉnh trên phiếu (khác tên trung tâm), chọn theme mặc định, toggle **"⚠️ Nhắc nợ học phí"** (hiện badge + dòng nợ trên phiếu — checkbox này bị **disabled** trên tài khoản trial, khả năng cũng là tính năng trả phí/chưa mở), toggle **"🎨 Màu nền ngày đi học"** (tô màu phân biệt buổi 1/buổi 2 trên phiếu).
3. **🌐 Mẫu Web** — **trung tâm có 1 trang web công khai riêng**, chọn 1 trong 5 giao diện: 🌸 Hoa Anh Đào (truyền thống) · 🌊 Đại Dương (xanh dương chuyên nghiệp) · 🌿 Cluvix Spa (trắng sáng cyan — có vẻ theme này tái sử dụng từ 1 sản phẩm khác của cùng nhà phát triển, tên không khớp ngành giáo dục) · 🌅 Hoàng Hôn (ấm áp) · 📜 Giấy Ngà Mực Nâu (thư pháp truyền thống). **Không xác định được URL/nội dung trang web này khi khảo sát** (không tìm thấy link công khai) — cần hỏi thêm nếu muốn clone chức năng này.

---

## 10. Quản lý học sinh (CRUD)

Modal "🎓 QUẢN LÝ DANH SÁCH HỌC SINH" có 2 tab:

### 10.1. Tab 📋 Danh Sách
Form thêm/sửa nhanh: Họ và Tên, Lớp, chọn **1 trong 2 mô hình tính phí**:
- **"Tính Học Phí Từng Buổi"**: nhập đơn giá/buổi cho tối đa 2 "buổi" có tên tuỳ chỉnh (vd Toán/Anh) — học phí = đơn giá × số buổi đã học.
- **"Tính Học Phí Cố Định"**: 1 mức học phí cố định/tháng, không phụ thuộc số buổi.

Ngoài ra: nút "📤 Nhập HS hàng loạt" (import Excel/CSV — chưa xác nhận định dạng), lọc theo lớp, tìm theo tên, bảng danh sách có nút Sửa/Xoá từng dòng.

### 10.2. Tab 📊 Chi Tiết
Nhóm học sinh theo lớp → click vào từng học sinh mở **hồ sơ chi tiết dạng CRM**, chia 8 mục (accordion):

1. **Tổng quan** — trạng thái (Đang học), lớp hiện tại, học phí chính/phụ, thông báo.
2. **Thông tin cá nhân** — Họ tên, Ngày sinh, Giới tính, Địa chỉ, SĐT học sinh, Email, **Phụ huynh, SĐT phụ huynh, Zalo/Facebook**, Ghi chú đặc biệt. *(Các trường này tồn tại trên UI nhưng dữ liệu mẫu đều "Chưa cập nhật" — form nhập liệu đầy đủ chưa xác nhận được vị trí khi khảo sát, có thể nằm trong flow "Sửa thông tin".)*
3. **Học tập & Lớp học** — lớp, giáo viên, phòng học, kết quả học tập — *"Chưa có dữ liệu điểm"* (placeholder, chưa có tính năng nhập điểm học tập chính thức ngoài Nhận Xét).
4. **Điểm danh & Chuyên cần** — *"Lịch sử điểm danh sẽ được cập nhật sớm"* (⚠️ **roadmap, chưa triển khai** dù đã điểm danh thật ở nơi khác).
5. **Tài chính & Học phí** — hiện học phí cố định + ngày bắt đầu học; *"Lịch sử đóng phí & công nợ sẽ được cập nhật sớm"* (⚠️ **roadmap**).
6. **Lịch học & Lịch thi** — *"sẽ được cập nhật sớm"* (⚠️ **roadmap**, dù đã có module Lịch Dạy riêng ở cấp trung tâm).
7. **Tài liệu & Bài tập** — *"sẽ được cập nhật sớm"* (⚠️ **roadmap**).
8. **Nhật ký tương tác** — lịch sử chăm sóc/phản hồi phụ huynh — *"sẽ được cập nhật sớm"* (⚠️ **roadmap**).

> **Nhận định:** Trang hồ sơ học sinh cho thấy rõ tham vọng sản phẩm hướng tới 1 CRM đầy đủ cho trung tâm (hồ sơ 360°, lịch sử chăm sóc phụ huynh...) nhưng **hiện tại 4/8 mục vẫn là khung rỗng**. Đây là cơ hội tốt nếu bạn muốn clone: có thể vượt mặt bản gốc bằng cách hoàn thiện đúng các mục này trước.

---

## 11. Quản lý Thu nợ & Doanh thu (💳)

Modal 2 tab:

### 11.1. Tab 💳 Thu Nợ
Chọn lớp → bảng: Học sinh · từng ngày đã học (icon vòng tròn kèm số buổi/subject) · **Đã thu** (số tiền đã xác nhận thu) · **Nợ tháng** (dropdown chọn tháng, hiện số buổi + số tiền còn nợ) · nút **"✅ Chốt"** (xác nhận đã thu tiền, khoá đợt thu đó lại) từng dòng, và **"⚡ Chốt cả lớp"** (chốt hàng loạt).

### 11.2. Tab 📈 Doanh Thu
Bộ lọc Tháng/Năm/Lớp + loại tiền (Tổng / Học phí / Phụ phí). 4 chế độ xem: **📅 Lịch** (heatmap theo ngày, hiện số tiền + số HS mỗi ngày có phát sinh), **📊 Số liệu**, **🥧 Biểu đồ**, **📋 Danh sách**. 4 KPI: Tổng phát sinh · Đã thu · Đang nợ · Phụ phí.

→ Đây là bộ đôi tính năng biến sản phẩm từ "công cụ tạo phiếu" thành **công cụ quản lý dòng tiền/công nợ** thực sự — rất quan trọng nếu muốn giữ lại giá trị cốt lõi khi clone.

---

## 12. Mô hình kinh doanh & Bảng giá (`/pricing`)

### 12.1. Cấu trúc gói (theo tháng, có toggle 1 Năm giảm thêm 40%; giá tháng giảm 10% "ưu đãi có hạn" kèm đồng hồ đếm ngược tạo cảm giác khan hiếm)

| Gói | Học sinh | Điểm danh quá khứ | Điểm danh tương lai | Số TK giáo viên | Giá/tháng (đã giảm) |
|---|---|---|---|---|---|
| FREE | 5 | 5 ngày | 0 | 0 | 0đ |
| NANO *(ưu đãi gia sư)* | 15 | 150 ngày | theo thời hạn gói | 2 | 18.000đ |
| PLUS *(ưu đãi giáo viên)* | 35 | 180 ngày | theo thời hạn gói | 5 | 54.000đ |
| PRO *(dùng nhiều nhất)* | 75 | 210 ngày | theo thời hạn gói | 10 | 135.000đ |
| MAX *(khuyến nghị)* | 150 | 250 ngày | theo thời hạn gói | 15 | 270.000đ |
| PREMIUM | 300 | 300 ngày | theo thời hạn gói | 30 | 540.000đ |
| ULTRA | 1.000 | 365 ngày | theo thời hạn gói | 50 | 1.350.000đ |
| TRIAL *(dùng thử, giới hạn ngày)* | 1.000 | 365 ngày | 7 ngày | 2 | miễn phí, có hạn |

**Tính năng chỉ có ở gói trả phí (NANO trở lên), khoá ở FREE/giới hạn ở TRIAL:**
- Quản lý học sinh **chi tiết** (hồ sơ CRM mục 10.2).
- **Điểm danh hàng loạt**.
- **Tải phiếu không giới hạn** (FREE và TRIAL giới hạn **5 phiếu/ngày**).
- Gộp học phí (xác nhận khoá cứng ở Trial, thông báo rõ ràng khi bấm thử).
- Tài khoản giáo viên phụ (0 ở Free).

**2 khái niệm định lượng quan trọng cần clone đúng để giữ tính hợp lý:**
- **"Điểm Danh Tương Lai"**: được phép điểm danh trước / xuất phiếu trước cho các ngày tương lai, giới hạn theo *ngày hết hạn gói đã mua* (không phải số ngày cố định) — vd mua PRO 1 năm còn hạn tới 28/05/2027 thì được điểm danh trước tới đúng ngày đó.
- **"Điểm Danh Quá Khứ"**: số ngày tối đa được phép sửa lại dữ liệu điểm danh cũ tính lùi từ hôm nay; quá hạn thì bị khoá không sửa được nữa (cơ chế chống gian lận/đảm bảo tính toàn vẹn báo cáo theo thời gian).

**Cơ chế nâng gói khi đang dùng gói còn hạn:** gói mới không huỷ gói cũ ngay — "gói cũ còn hạn sẽ được bảo lưu, khi hết hạn gói mới sẽ tự động về gói cũ còn hạn sử dụng" (xếp chồng thời hạn, không cộng dồn tự động — phải liên hệ Admin thủ công để tối ưu).

### 12.2. Thanh toán
- Bấm "⚡ Nâng Gói" → tạo đơn hàng, hiện **mã thanh toán + đồng hồ đếm ngược 15:00** ("thanh toán trong 15 phút, hết giờ tự huỷ đơn"), nút Copy mã, nút "✅ Đã thanh toán".
- Sau khi bấm đã thanh toán → thông báo **"Đơn hàng đã ghi nhận! Vui lòng đợi 5–15 phút để hệ thống xác nhận"** hoặc liên hệ Admin trực tiếp.
- → Đây là **thanh toán chuyển khoản thủ công có bán tự động hoá** (không phải cổng thanh toán tự động như Momo/VNPay/Stripe): có mã đơn hàng, có giới hạn thời gian, nhưng xác nhận cuối vẫn do admin duyệt tay (5–15 phút) — rất phù hợp bối cảnh SMB Việt Nam, đơn giản, không tốn phí gateway, nhưng cần nhân sự trực xác nhận.

### 12.3. Chương trình giới thiệu (Affiliate/Referral)
- Người giới thiệu: nhận **10% hoa hồng** trên giá gói mà người được giới thiệu mua (nếu người đó dùng mã).
- Người được giới thiệu: giảm **5%** (gói tháng) hoặc **10%** (gói năm) khi nhập mã.
- Link giới thiệu dạng `https://phieuhocphi.com/?ref=xxxx`.
- Gợi ý trong sản phẩm: "đăng bài kèm hình ảnh phiếu học phí lên Threads/Facebook/hội nhóm để tăng lượt thu hút" — cho thấy chiến lược tăng trưởng chủ yếu dựa vào **word-of-mouth + UGC (chính cái phiếu học phí đẹp là công cụ marketing lan truyền)**.

### 12.4. Chiến thuật tâm lý bán hàng quan sát được trên trang giá
- Bộ đếm **"46 người đang xem"** trang giá (social proof, có thể giả lập).
- Toast **"🎉 na***mdo@gmail.com vừa mua gói PRO (năm) — Giảm 40% — 1 giờ trước"** luân phiên hiện góc màn hình (FOMO/social proof).
- Đồng hồ đếm ngược khuyến mãi (27 ngày...) song song với đồng hồ đếm ngược thanh toán (15 phút) — 2 lớp tạo cảm giác khẩn cấp khác nhau (dài hạn thúc mua, ngắn hạn thúc hoàn tất đơn).
- Badge phân biệt: "ƯU ĐÃI GIA SƯ", "ƯU ĐÃI GIÁO VIÊN", "DÙNG NHIỀU NHẤT", "KHUYẾN NGHỊ" — định hướng lựa chọn theo từng nhóm khách hàng khác nhau ngay trên UI.

---

## 13. Điểm kỹ thuật ghi nhận thêm (ảnh hưởng tới việc clone)

- **Chống bot bằng Cloudflare Turnstile** ở cả đăng ký lẫn đăng nhập — cần có giải pháp tương đương nếu muốn chống spam đăng ký.
- Toàn bộ app hoạt động dạng **SPA nhiều modal chồng lớp** trên 1 URL `/dashboard` (không dùng nhiều route riêng cho từng chức năng) — cần cân nhắc giữ nguyên cách này hay tách route rõ ràng hơn khi clone (tách route sẽ dễ bảo trì/SEO hơn nhưng UX hiện tại khá nhanh vì không load lại trang).
- QR thanh toán dùng **VietQR** (chuẩn mở, miễn phí, không cần hợp đồng ngân hàng) — dễ và rẻ để tái tạo.
- Có widget chat Zalo nổi cố định — kênh support chính là Zalo, không phải email/ticket.

---

## 14. Đề xuất phân nhóm để bạn quyết định phạm vi clone

**Nhóm lõi (MVP bắt buộc nếu muốn ra bản dùng được):**
1. Đăng ký/đăng nhập trung tâm.
2. Quản lý học sinh + lớp (2 mô hình phí: cố định/theo buổi, tối đa 2 "buổi" mỗi học sinh).
3. Điểm danh (theo ngày + hàng loạt theo tháng).
4. Sinh Phiếu Học Phí tự động (tính tiền, ngày học, QR VietQR, xuất ảnh).
5. Nhận Xét cơ bản.

**Nhóm giá trị gia tăng (đáng làm sớm để cạnh tranh):**
6. Quản lý Thu nợ + Doanh thu (bảng chốt thu, heatmap doanh thu).
7. Lịch Dạy + lặp lịch tuần.
8. Đa người dùng/phân quyền theo lớp (multi-teacher).
9. Chấm công giáo viên có duyệt.

**Nhóm khác biệt hoá / có thể làm tốt hơn bản gốc:**
10. Hoàn thiện hồ sơ học sinh CRM đầy đủ (4 mục bản gốc còn để trống: lịch sử điểm danh, lịch sử thu phí, lịch thi, tài liệu bài tập, nhật ký chăm sóc phụ huynh).
11. Trang web công khai cho từng trung tâm ("Mẫu Web") — bản gốc mới dừng ở chọn theme, chưa rõ nội dung thực tế hiển thị gì.

**Nhóm kinh doanh (làm sau khi có người dùng):**
12. Bảng giá nhiều bậc + thanh toán chuyển khoản thủ công có mã đơn/đếm giờ.
13. Chương trình giới thiệu/hoa hồng.
14. Gói dùng thử tự động hạ cấp khi hết hạn.

---

## 15. Câu hỏi cần bạn quyết định trước khi bắt tay code

1. Bạn muốn giữ mô hình **1 trang SPA nhiều modal** như bản gốc, hay tách thành nhiều route/trang riêng (Next.js pages, v.v.)?
2. Có cần **multi-tenant thật** (nhiều trung tâm dùng chung 1 hệ thống, cách ly dữ liệu) ngay từ đầu, hay tạm thời làm single-tenant cho 1 trung tâm của bạn trước?
3. Thanh toán: giữ kiểu **chuyển khoản thủ công + admin duyệt tay** (đơn giản, không phí gateway) hay tích hợp **cổng thanh toán tự động** (VNPay/Momo/PayOS) ngay từ đầu?
4. Có cần tính năng đa giáo viên/phân quyền theo lớp ngay ở bản đầu, hay để 1 người dùng duy nhất trước?
5. "Mẫu Web" công khai cho trung tâm — có nằm trong phạm vi muốn làm không, vì tôi chưa tìm được URL/nội dung thực tế để tham khảo thêm?
6. Có muốn tôi khảo sát sâu hơn 1 vài phần chưa rõ (vd nút "Phụ phí" chưa hiện form khi test, cơ chế "User 2"/"User 3" trong phân quyền, định dạng file "Nhập HS hàng loạt") bằng cách bạn thao tác trực tiếp và tôi quan sát qua chrome-devtools không?

---

*Tài liệu được tạo tự động từ phiên khảo sát thực tế ngày 2026-07-04. Vui lòng đọc và phản hồi phần nào cần khảo sát thêm hoặc muốn đưa vào/loại khỏi phạm vi clone.*
