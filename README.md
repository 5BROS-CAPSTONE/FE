# SmartDroneHub – Frontend

Giao diện web cho SmartDroneHub, hệ hỗ trợ quyết định (DSS) cho drone phun nông nghiệp – đồ án capstone nhóm 5BROS.
Giao diện dựa trên thiết kế Stitch (design system "AgroFlight Precision"), toàn bộ tiếng Việt.

## Công nghệ

React 19 · TypeScript · Vite · Tailwind CSS 3 · React Router · Material Symbols (icon) · ESLint · Prettier

## Bắt đầu

Yêu cầu Node.js 22 (xem `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Lệnh             | Tác dụng                                              |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Chạy server phát triển                                |
| `npm run build`  | Kiểm tra kiểu và build bản production vào `dist`      |
| `npm run check`  | Typecheck + lint + kiểm tra format (CI chạy lệnh này) |
| `npm run format` | Tự format toàn bộ code bằng Prettier                  |
| `npm run lint`   | Chạy ESLint                                           |

## Cấu trúc thư mục

```
src/
├── app/                    # Khung ứng dụng
│   ├── App.tsx             #   Provider + router
│   ├── routes.tsx          #   Gom route của các feature
│   └── navigation.ts       #   Menu sidebar (một chỗ duy nhất)
├── components/
│   ├── layout/             # AppLayout, Sidebar, Header
│   └── ui/                 # Component dùng chung: Button, Modal, Icon, bảng, form...
├── features/               # Mỗi module nghiệp vụ một thư mục
│   ├── uav-profiles/       #   S1.1 UAV Profile
│   │   ├── pages/          #     Các màn (route)
│   │   ├── routes.tsx      #     Route của module
│   │   └── profileFields.ts
│   ├── drones/             #   S1.2 – S1.4 Drone
│   │   ├── components/     #     Component riêng của module (popup đổi trạng thái)
│   │   ├── pages/
│   │   └── routes.tsx
│   └── operations/         #   S7 Farm/Field và S8 phiếu yêu cầu
├── pages/                  # Trang chung: ComingSoon, NotFound
├── store/                  # State dùng chung (FleetProvider) – hiện là dữ liệu giả lập
├── mocks/                  # Dữ liệu mẫu (khớp tài liệu bàn giao)
├── types/                  # Kiểu dữ liệu, mỗi thực thể một file
├── utils/                  # Hàm tiện ích (format ngày, nhãn trạng thái...)
└── styles/index.css        # Tailwind + style nền
```

Import luôn dùng alias `@/` (trỏ tới `src/`), ví dụ `import Button from '@/components/ui/Button'`.

## Thêm một module mới (ví dụ: Pin – S2)

1. Tạo thư mục `src/features/batteries/` với `pages/` (và `components/` nếu cần).
2. Tạo `src/features/batteries/routes.tsx` export mảng route, ví dụ `{ path: 'pin', element: <BatteryListPage /> }`.
3. Thêm mảng đó vào `featureRoutes` trong `src/app/routes.tsx`.
4. Menu: mục "Pin" đã có trong `src/app/navigation.ts`. Module mới thì thêm một dòng ở đây.
   Mục menu chưa có route sẽ tự hiện trang "Màn hình đang được thiết kế".
5. Kiểu dữ liệu mới thêm vào `src/types/<thực thể>.ts` rồi export trong `src/types/index.ts`.

Component dùng lại được ở nhiều module thì đặt trong `src/components/ui/`; chỉ dùng trong một module thì để trong `features/<module>/components/`.

## Màn hình đã làm (luồng S1 – Quản lý đội drone)

- **UAV Profile:** danh sách, xem (chỉ đọc), tạo mới, chỉnh sửa (lưu thành version mới), ngưng sử dụng / không thể ngưng, xác nhận tạo version.
- **Drone:** danh sách, chi tiết, thêm, chỉnh sửa (đổi UAV Profile), chuyển Unavailable, mở lại / chưa thể mở lại, ngưng sử dụng, không thể đổi trạng thái khi đang bay.

Luật nghiệp vụ (S1 và subprocess DC.1 `markStale`) nằm trong `src/store/FleetProvider.tsx`. Dữ liệu là giả lập và reset khi tải lại trang.
Thông số UAV Profile lấy từ sheet "[5BROS] Danh Sach Thong So Drone" – không tự thêm số liệu.
Khi có API backend, thay các hàm trong store bằng lời gọi API, giữ nguyên giao diện `FleetStore` trong `src/store/fleetContext.ts`.

## Khu vực canh tác (S7) và quản lý phiếu (S8)

- `/khu-vuc-canh-tac`: Manager xem/tạo/sửa/ngưng Farm và Field, xác minh ranh giới trên lưới mô phỏng. Customer xem Farm/Field của mình và gửi đề xuất qua phiếu.
- `/quan-ly-phieu`: Customer lưu nháp/gửi phiếu Field hoặc yêu cầu bay, bổ sung trên cùng phiếu và theo dõi kết quả. Manager xem xét, yêu cầu bổ sung, tiếp nhận/từ chối, xử lý Field tại S7 hoặc bàn giao yêu cầu bay cho C1, ghi kết quả và đóng phiếu.
- Dùng hộp “Vai trò mô phỏng” trên hai màn để chuyển giữa Mission Manager và Customer Nguyễn Văn An. Dữ liệu demo lưu trong `localStorage` của trình duyệt; “Khôi phục dữ liệu demo” đặt lại S7/S8 về mẫu ban đầu.

Ranh giới, diện tích và tệp đính kèm hiện là mô phỏng: lưới chưa dùng bản đồ địa lý thực, tệp chỉ lưu tên, không được tải lên máy chủ. Bước bàn giao C1 ghi mã và kết quả thử luồng trên phiếu; chưa tạo mission thật trong backend. Khi tích hợp API cần kiểm tra quyền Customer ở backend và đồng bộ trạng thái ticket, Field, mission.

## Đóng góp

Mỗi thành viên làm trên nhánh mang tên mình rồi mở Pull Request vào `main`. Chi tiết trong [CONTRIBUTING.md](CONTRIBUTING.md).
