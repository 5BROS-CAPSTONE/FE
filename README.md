# SmartDroneHub – Frontend

Fleet dashboard cho dự án capstone 5BROS. UI dựa trên thiết kế Stitch (design system "AgroFlight Precision").

## Stack
React 19 + Vite + TypeScript + Tailwind CSS 3, React Router, lucide-react. Dữ liệu hiện dùng mock trong `src/mocks`.

## Chạy
```bash
npm install
npm run dev
```

## Màn hình đã làm (từ Stitch)
- **UAV Profile**: danh sách, tạo mới, chỉnh sửa (tạo version mới), ngưng sử dụng / không thể ngưng sử dụng, xác nhận tạo version.
- **Drone**: danh sách, chi tiết, thêm, chỉnh sửa (đổi UAV Profile), chuyển Unavailable, mở lại / chưa thể mở lại, ngưng sử dụng, không thể đổi trạng thái khi đang bay.

Luật nghiệp vụ đang chạy trên store giả lập ở `src/store/FleetProvider.tsx` (dữ liệu reset khi tải lại trang). Khi có API, thay các hàm trong store bằng lời gọi BE.

Các mục menu khác (Nhiệm vụ, Pin, Báo cáo...) đang là trang placeholder vì chưa có thiết kế.
