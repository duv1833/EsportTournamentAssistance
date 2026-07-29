# Learning & Project Insights — Esport Tournament Assistance

Tài liệu ghi chép lại toàn bộ kiến trúc, các công việc đã thực hiện và bài học kinh nghiệm về hệ thống **Esports Tournament Assistance (Tournament Management Engine)**.

---

## 1. Tổng Quan Dự Án

Dự án là một hệ thống web full-stack quản lý giải đấu Esports chuyên nghiệp và cộng đồng, tích hợp quy trình **Cấm/Chọn (Map & Agent Ban/Pick)** thời gian thực dành cho tựa game **VALORANT**.

### Tech Stack
- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data JPA, Spring Security, WebSockets (STOMP), MS SQL Server
- **Frontend**: React 19, Vite, Tailwind CSS v4, Axios, `@stomp/stompjs`, `sockjs-client`, Lucide React
- **Protocol**: HTTP RESTful API & WebSocket STOMP broker (`/topic/room/{matchId}`, `/app/draft/action`)

---

## 2. Các Công Việc Đã Thực Hiện (Refactoring & Optimization)

### 2.1. Kiến Trúc Frontend & State Management
- **Giải quyết Anti-pattern God Component**: Refactor `App.jsx` từ **837 dòng code** xuống còn **60 dòng**.
- **Toàn cục hóa Auth State (`AuthContext.jsx`)**: Xây dựng `AuthProvider` và `useAuth()` hook để quản lý trạng thái đăng nhập, JWT token và thông tin người dùng. Loại bỏ hoàn toàn prop-drilling qua 5-6 tầng component.
- **Thống nhất Routing**: Loại bỏ hệ thống hybrid routing (sự kết hợp lỗi giữa React Router và `activeTab` state). Chuyển hoàn toàn sang URL-based routing chuẩn trong React Router 7 (`useNavigate`, `<NavLink>`, `<Routes>`).

### 2.2. Kết Nối Dữ Liệu Thực (Real Backend Data Integration)
- **`Home.jsx`**: Thay thế dữ liệu hardcode giả bằng việc kết nối API backend (`getAllTournaments()`), thêm section thống kê thời gian thực (số giải đấu, số đội tuyển, tính năng real-time).
- **`TournamentList.jsx`**: Tách trang quản lý danh sách & tạo mới giải đấu ra khỏi `App.jsx`, kết nối API tạo giải đấu chờ Admin duyệt.
- **`NewsPage.jsx`**: Xây dựng trang tin tức hiển thị các giải đấu mới khởi tạo trên hệ thống dạng bài viết thông báo.
- **`TournamentRegistrationForm.jsx`**: Chuẩn hóa form đăng ký giải đấu thành shared component dùng chung, tránh lặp lại code.

### 2.3. Tối Ưu UI/UX & Design System
- **Nâng cấp `TactileButton`**: Hỗ trợ 8 variants (`primary`, `secondary`, `cyan`, `amber`, `outline`, `ghost`, `danger`) và 3 sizes (`sm`, `md`, `lg`), xóa bỏ 4 hàm định nghĩa trùng lặp.
- **Loading Skeleton (`LoadingSkeleton.jsx`)**: Thay thế chữ "Đang tải..." bằng animation shimmer hiệu ứng tactical mượt mà.
- **Page Transition (`PageTransition.jsx`)**: Thêm hiệu ứng chuyển trang `fade-in` & `slide-up`.
- **Thống nhất Theme Colors**: Chuyển các màu hardcoded (`#222`, `#333`, `#1b1b1b`) về Tailwind Theme Tokens (`bg-surface-charcoal`, `border-outline-variant`, `bg-background`).
- **`api.js` Interceptors**: Tự động đính kèm `Authorization: Bearer <token>` vào mọi HTTP request và tự động xử lý khi nhận mã lỗi `401 Unauthenticated`.

---

## 3. Kiến Thức & Bài Học Thu ĐƯợC Từ Dự Án (Key Takeaways)

### 🧠 3.1. Thiết Kế Hệ Thống Cấm/Chọn (Real-time Draft State Machine)
- **STOMP Broker & Dual Destination**: Quy trình Ban/Pick yêu cầu đồng bộ tức thì giữa 2 đội và trọng tài. Dự án sử dụng WebSocket STOMP với 2 kênh:
  - `/topic/room/{matchId}`: Nhận và phát tin tức thời cho tất cả client trong phòng.
  - `/app/draft/action`: Gửi hành động về backend để ghi vết vào cơ sở dữ liệu (`draft_actions` table).
- **Draft Sequence Template**: Thể thức cấm chọn (BO1, BO3, BO5) được cấu hình theo tuần tự các bước (`step_number`, `phase`, `action_type`, `turn_order`). Cần sử dụng `useMemo` thay vì biến `let` trong React để tránh re-render trùng lặp hoặc mất state khi timer đếm ngược chạy.

### 🛡️ 3.2. Phân Quyền Đa Tầng (Multi-Tier RBAC & Per-Tournament Roles)
- Hệ thống hỗ trợ 2 cấp độ phân quyền:
  1. **Global Role**: `ADMIN`, `USER` (quy định quyền truy cập trang quản trị Admin Panel).
  2. **Tournament-Level Role**: `OWNER` (chủ giải), `CO_ORGANIZER` (đồng BTC), `REFEREE` (trọng tài phòng đấu).
- Quyền hạn cấm/chọn và nhập tỷ số được kiểm tra nghiêm ngặt theo vai trò người dùng trong phòng đấu (Captains của Team A/Team B mới có quyền Pick/Ban đúng lượt; Admin/Referee mới có quyền Lưu tỷ số & chuyển trạng thái ván đấu).

### 📐 3.3. Thuật Toán Cấu Trúc Nhánh Đấu (Bracket Tree Generation)
- Sơ đồ thi đấu loại trực tiếp (Single Elimination) được tính toán theo vòng đấu (`round_number`) và vị trí trong vòng (`position_in_round`).
- Việc nhóm các match theo `roundNumber` và render bằng CSS Flexbox linh hoạt (`gap = 2^roundIndex * 16px`) giúp hiển thị sơ đồ thi đấu dạng cây chuẩn xác mà không bị tràn khung.

---

## 4. Hướng Phát Triển Tiếp Theo (Future Improvements)
- Tích hợp thêm âm thanh thông báo (sound FX) khi đến lượt cấm/chọn hoặc khi hết giờ đếm ngược.
- Bổ sung bộ đếm thời gian phía Backend (Server-side timer) để tự động auto-pick/auto-ban chính xác tuyệt đối ngay cả khi client bị ngắt kết nối network.
