# SmartDroneHub – Frontend

Giao diện web cho SmartDroneHub, hệ hỗ trợ quyết định (DSS) cho drone phun nông nghiệp – đồ án capstone nhóm 5BROS.
Giao diện tiếng Việt với nhận diện xanh rừng / ivory, trang chủ khách hàng và các không gian vận hành riêng.

## Công nghệ

React 19 · TypeScript · Vite · Tailwind CSS 3 · React Router · GSAP + @gsap/react · Material Symbols · ESLint · Prettier

## Bắt đầu

Yêu cầu Node.js 22 (xem `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

Mở `/` để xem trang chủ khách hàng. Ba site có trang đăng nhập riêng, không còn bộ chọn cổng:

| Site       | Trang công khai / đăng nhập | Không gian sau đăng nhập |
| ---------- | --------------------------- | ------------------------ |
| Khách hàng | `/` và `/dang-nhap`         | `/customer`              |
| Nhân viên  | `/staff/dang-nhap`          | `/staff`                 |
| Quản trị   | `/admin/dang-nhap`          | `/admin`                 |

Các site hiện chạy trên cùng server Vite bằng các đường dẫn độc lập; chưa cấu hình domain hay triển khai hosting riêng.
FE mặc định chạy chế độ demo. Mở mục **Trải nghiệm bản demo** trên từng trang đăng nhập để điền tài khoản mẫu.
Mật khẩu chung là `Demo@123`.

| Cổng       | Email demo                                  | Phạm vi                                                           |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Quản trị   | `admin@5bros.demo`                          | Tổng quan, tra cứu tài khoản nội bộ, vai trò/quyền, hồ sơ         |
| Staff      | `manager@5bros.demo`                        | Khu vực canh tác, xử lý phiếu, xem đội bay                        |
| Staff      | `expert@5bros.demo`                         | Tạo/sửa UAV Profile                                               |
| Staff      | `technician@5bros.demo`                     | Tạo/sửa drone, xem UAV Profile                                    |
| Staff      | `operator@5bros.demo`, `analyst@5bros.demo` | Các mục theo vai trò; module chưa xây dựng vẫn hiển thị trang chờ |
| Khách hàng | `customer@5bros.demo`                       | Farm/Field và phiếu của Nguyễn Văn An (`KH-0928`)                 |

## Đăng nhập và ba cổng ứng dụng

- `src/portals/admin/`: layout, menu, routes và màn hình quản trị tại `/admin`.
- `src/portals/staff/`: layout, menu, routes và tổng quan nhân viên tại `/staff`.
- `src/portals/customer/`: trang chủ công khai trong `public/`, đăng nhập, thanh điều hướng riêng và không gian khách hàng.
- `src/auth/`: biểu mẫu đăng nhập, session, kiểm tra cổng/quyền, API client và hồ sơ/đổi mật khẩu dùng chung.
- `src/features/`: module nghiệp vụ dùng lại giữa các cổng; quyền và dữ liệu được giới hạn theo tài khoản.

Mỗi site có provider và phiên riêng trong `sessionStorage`: `smartdronehub-auth-v2-customer`,
`smartdronehub-auth-v2-staff`, `smartdronehub-auth-v2-admin`. Có thể đăng nhập đồng thời ba site trong cùng tab;
đăng xuất một site không xóa phiên của site khác. Không lưu mật khẩu. Phiên cũ từ phiên bản v1 cần đăng nhập lại.
Gõ trực tiếp URL chưa đăng nhập sẽ chuyển tới đúng trang đăng nhập của site; URL không có quyền hiển thị trang chặn.
Menu và nút sửa theo quyền. Đường dẫn cũ `/drones`, `/uav-profiles` chuyển vào Staff;
`/quan-ly-phieu`, `/khu-vuc-canh-tac` chuyển vào site khách hàng. Query `?portal=staff|admin` cũ chuyển đến URL đăng nhập riêng.

### Thiết kế và chuyển động

- `src/styles/tokens.css`: font tự lưu trữ, màu sắc, thang chữ, khoảng cách, bo góc và trạng thái focus dùng chung.
- `src/styles/site.css`: bố cục trang chủ, ba trang đăng nhập và các workspace theo kích thước khả dụng.
- `src/styles/components.css`: nút, input, bảng, menu, hộp thoại, lựa chọn loại phiếu và thanh thao tác form.
- Font Be Vietnam Pro và Lora italic có đủ ký tự tiếng Việt, phục vụ từ `public/fonts/`; giấy phép và nguồn đi kèm. Giao diện không gọi Google Fonts khi chạy.
- `src/components/brand/Brand.tsx`: nhận diện dùng chung.
- `src/motion/gsap.ts`: đăng ký GSAP, `useGSAP` và ScrollTrigger một lần.
- `src/motion/PageTransition.tsx`: fade ngắn khi đổi trang, giữ ổn định vị trí của các thanh nút cố định.
- Trang chủ: timeline mở đầu, parallax trên desktop, reveal theo cuộn, quy trình ba bước có thể tương tác, FAQ mở/đóng.
- Các hook dùng `scope`, `revertOnUpdate` khi cần và dọn animation/ScrollTrigger khi unmount.
- `prefers-reduced-motion` tắt chuyển động; ảnh có kích thước ổn định, biến thể mobile và WebP phục vụ từ `public/images/`.
- Ảnh chỉ minh họa; nguồn tại `public/images/README.md`. Không dùng số liệu hiệu quả hoặc khách hàng giả làm bằng chứng.

Menu thao tác nằm ngoài vùng cắt của bảng, có điều khiển bằng bàn phím và bám hàng khi cuộn ngang.
Hộp thoại dùng native dialog/top layer, hỗ trợ focus loop, Escape và trả focus; drawer mobile có trạng thái inert khi đóng.
Thanh nút form được đo bằng ResizeObserver để chừa đúng khoảng trống phía dưới, gồm cả safe area.
Chi tiết thiết kế và ma trận rà soát Chrome/Firefox/WebKit ở [docs/design-system.md](docs/design-system.md).

Áp dụng các skill tại `../skills/gsap-skills/skills/`: `gsap-core`, `gsap-react`, `gsap-timeline`,
`gsap-scrolltrigger`, `gsap-performance`. Đây là source tham khảo; không chỉnh sửa repo skill hay BE.

### Dùng API đăng nhập BE hiện có

Copy `.env.example` thành `.env.local`, đặt:

```dotenv
VITE_AUTH_MODE=api
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Khởi động lại Vite. FE gọi `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`,
`PUT /auth/password`; cổng quản trị đọc `GET /users` (phân trang bằng `items`) và `GET /roles`.
Header xác thực là `Authorization: Bearer <accessToken>`. Session được kiểm tra khi khôi phục,
khi cửa sổ được focus, khi token hết hạn và khi API trả 401. Đổi mật khẩu thành công yêu cầu đăng nhập lại.
Không tự chuyển sang tài khoản demo nếu API lỗi. BE phải chạy và cho phép CORS từ origin FE.

Mapping theo source BE: `ADMIN` vào cổng quản trị; `MANAGER`, `EXPERT`, `OPERATOR`, `TECHNICIAN`,
`ANALYST` vào cổng Staff. Tài khoản nhiều role được vào cổng tương ứng với role của mình.
Quyền đọc/ghi khu vực, UAV Profile và drone bám `security/Role.java` trong BE.
Các mục nghiệp vụ chưa có quyền BE được giới hạn bằng role ở FE và vẫn là màn chờ.

BE hiện chưa có role/endpoint đăng nhập khách hàng, nên cổng khách hàng chỉ đăng nhập được trong chế độ demo.
Tài khoản demo không phải tài khoản BE. Tài khoản nội bộ do Admin cấp; không có tự đăng ký.
Các màn quản trị hiện là tra cứu tài khoản và vai trò, chưa có form tạo/sửa/cấp role tài khoản.
Đăng nhập API chưa chuyển dữ liệu các module đội bay/S7/S8 sang API; chúng vẫn dùng store demo.
Phân quyền FE phục vụ điều hướng; API thật phải tiếp tục kiểm tra quyền và phạm vi dữ liệu ở BE.

| Lệnh                 | Tác dụng                                         |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Chạy server phát triển                           |
| `npm run build`      | Kiểm tra kiểu và build bản production vào `dist` |
| `npm run check`      | Typecheck + lint + kiểm tra format               |
| `npm test`           | Chạy Vitest một lượt                             |
| `npm run test:watch` | Vitest ở chế độ theo dõi khi đang code           |
| `npm run format`     | Tự format toàn bộ code bằng Prettier             |
| `npm run lint`       | Chạy ESLint                                      |

CI chạy lần lượt `npm run check`, `npm test` rồi `npm run build`. Trước khi commit nên chạy:

```bash
npm run format && npm run check && npm test && npm run build
```

Test đặt cạnh file nguồn với tên `*.test.ts` / `*.test.tsx`; helper dựng cảnh ở `src/test/dom.tsx`.
Quy ước dành cho AI coding agent (và cho người) ở [AGENTS.md](AGENTS.md).

## Cấu trúc thư mục

```
src/
├── app/                    # Khung ứng dụng
│   ├── App.tsx             #   Provider + router
│   ├── routes.tsx          #   Gom route của các feature
│   └── navigation.ts       #   Kiểu menu, lọc quyền, breadcrumb
├── auth/                   # LoginForm/AuthScreen, session, API client, route guard, hồ sơ
├── motion/                 # GSAP registration, chuyển cảnh có cleanup
├── portals/
│   ├── admin/              # Cổng quản trị: layout, menu, routes, pages
│   ├── staff/              # Cổng nhân viên: layout, menu, routes, pages
│   └── customer/           # Site khách hàng: public/HomePage, login, workspace
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
└── styles/                 # index.css (Tailwind), site.css (nhận diện ba site)
```

Import luôn dùng alias `@/` (trỏ tới `src/`), ví dụ `import Button from '@/components/ui/Button'`.

## Thêm một module mới (ví dụ: Pin – S2)

1. Tạo thư mục `src/features/batteries/` với `pages/` (và `components/` nếu cần).
2. Tạo `src/features/batteries/routes.tsx` export mảng route, ví dụ `{ path: 'pin', element: <BatteryListPage /> }`.
3. Đăng ký route trong `src/portals/<cổng>/routes.tsx`, kèm `RequireAccess` cho quyền/role tương ứng.
4. Menu đặt tại `src/portals/<cổng>/navigation.ts`; mục của Staff chưa có module sẽ hiển thị màn chờ.
5. Kiểu dữ liệu mới thêm vào `src/types/<thực thể>.ts` rồi export trong `src/types/index.ts`.

Component dùng lại được ở nhiều module thì đặt trong `src/components/ui/`; chỉ dùng trong một module thì để trong `features/<module>/components/`.

## Màn hình đã làm (luồng S1 – Quản lý đội drone)

- **UAV Profile:** danh sách, xem (chỉ đọc), tạo mới, chỉnh sửa (lưu thành version mới), ngưng sử dụng / không thể ngưng, xác nhận tạo version.
- **Drone:** danh sách, chi tiết, thêm, chỉnh sửa (đổi UAV Profile), chuyển Unavailable, mở lại / chưa thể mở lại, ngưng sử dụng, không thể đổi trạng thái khi đang bay.

Luật nghiệp vụ (S1 và subprocess DC.1 `markStale`) nằm trong `src/store/FleetProvider.tsx`. Dữ liệu là giả lập và reset khi tải lại trang.
Thông số UAV Profile lấy từ sheet "[5BROS] Danh Sach Thong So Drone" – không tự thêm số liệu.
Khi có API backend, thay các hàm trong store bằng lời gọi API, giữ nguyên giao diện `FleetStore` trong `src/store/fleetContext.ts`.

## Khu vực canh tác (S7) và quản lý phiếu (S8)

- `/staff/khu-vuc-canh-tac`: Manager xem/tạo/sửa/ngưng Farm và Field, xác minh ranh giới trên lưới mô phỏng.
- `/customer/khu-vuc-canh-tac`: khách hàng xem Farm/Field của mình và gửi đề xuất qua phiếu.
- `/customer/quan-ly-phieu`: khách hàng lưu nháp/gửi phiếu khu vực canh tác hoặc nhiệm vụ, bổ sung trên cùng phiếu và theo dõi kết quả.
- `/staff/quan-ly-phieu`: Manager xem xét, yêu cầu bổ sung, tiếp nhận/từ chối, xử lý Field tại S7 hoặc bàn giao yêu cầu bay cho C1, ghi kết quả và đóng phiếu.
- Vai trò và phạm vi khách hàng lấy từ tài khoản đăng nhập. Đăng nhập riêng ở hai site để thử hai phía. Dữ liệu S7/S8 lưu trong `localStorage`, giữ lại các phiếu khi chuyển giữa site khách hàng và Staff.

Ranh giới, diện tích và tệp đính kèm hiện là mô phỏng: lưới chưa dùng bản đồ địa lý thực, tệp chỉ lưu tên, không được tải lên máy chủ. Bước bàn giao C1 ghi mã và kết quả thử luồng trên phiếu; chưa tạo mission thật trong backend. Khi tích hợp API cần kiểm tra quyền Customer ở backend và đồng bộ trạng thái ticket, Field, mission.

## Triển khai trên Vercel

`vercel.json` chuyển mọi đường dẫn không phải file tĩnh về `index.html`. Thiếu file này thì
React Router chỉ chạy khi người dùng bấm link trong trang: mở thẳng `/staff/dang-nhap` hay
bấm F5 sẽ ra 404, vì Vercel đi tìm một file tên như vậy và không thấy.

Nối vào backend thật thì đặt hai biến trong Vercel (Settings → Environment Variables),
chọn cả **Production** lẫn **Preview**:

```
VITE_AUTH_MODE=api
VITE_API_BASE_URL=https://<domain-railway>/api/v1
```

Vercel sẽ cảnh báo tiền tố `VITE_` làm lộ giá trị ra trình duyệt — đúng vậy và không sao:
Vite chỉ nhúng biến có tiền tố này, còn hai giá trị trên vốn đã công khai. Chọn
**Change to Config**. Bí mật thật nằm ở backend, không bao giờ xuống trình duyệt.

Vite nhúng biến lúc build, nên đổi biến xong phải **Redeploy** mới có tác dụng.

Ở chế độ `api`, đăng nhập khách hàng bị khoá có chủ ý: backend hiện chỉ có tài khoản nội bộ.

## Đóng góp

Mỗi thành viên làm trên nhánh mang tên mình rồi mở Pull Request vào `main`. Chi tiết trong [CONTRIBUTING.md](CONTRIBUTING.md).
