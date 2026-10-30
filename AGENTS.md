# Hướng dẫn cho AI agent – SmartDroneHub FE

File này dành cho mọi AI coding agent làm việc trong repo (Claude Code, Cursor, Copilot, Codex…).
Người cũng nên đọc. Quy ước nhóm đầy đủ ở [CONTRIBUTING.md](CONTRIBUTING.md), kiến trúc ở [README.md](README.md).

Nếu một yêu cầu của người dùng mâu thuẫn với file này, **nói ra chỗ mâu thuẫn trước khi làm**, đừng im lặng làm theo.

## Bắt buộc trước khi báo "xong"

Chạy đủ bốn lệnh này và **tất cả phải xanh**. Đừng báo hoàn thành khi chưa chạy.

```bash
npm run format        # tự sửa format, chạy TRƯỚC để khỏi fail ở bước sau
npm run check         # typecheck + eslint + prettier --check
npm test              # Vitest, hiện 34 test
npm run build         # tsc -b && vite build
```

CI chạy đúng bốn bước này. Thiếu một bước là PR đỏ.

Nếu một lệnh fail và bạn không sửa được, **nói rõ lệnh nào fail và dán output**, đừng báo xong rồi để người khác phát hiện.

## Hook kiểm tra tại máy

`npm install` tự đặt `core.hooksPath` sang `.githooks`, nên hook `pre-commit` chạy sẵn: nó chặn commit nhầm
lên `main` và chạy `npm run check` + `npm test` trước mỗi commit. Nếu hook không chạy, bật tay một lần:

```bash
git config core.hooksPath .githooks
```

Hook là lưới an toàn, không thay cho việc tự chạy bốn lệnh ở trên.

## Tuyệt đối không

- **Không sửa trực tiếp trên `main`.** Luôn làm trên nhánh mang tên thành viên (`phat`, `Thanh`, `quyen`). `main` có ruleset chặn push thẳng.
- **Không chạy `npm audit fix --force`.** Nó nâng major và làm vỡ build. Muốn vá lỗ hổng thì xử lý từng gói một và test.
- **Không tự nâng major version** của dependency (`vite`, `react`, `react-router-dom`, `eslint`…) khi không được yêu cầu. Dependabot đã lo việc này.
- **Không tắt rule eslint** bằng `eslint-disable` để cho code chạy qua. Rule báo là có lý do — sửa code, không bịt miệng rule. Trường hợp thật sự cần thì ghi comment giải thích vì sao.
- **Không dùng `any`** để qua mặt typecheck. `strict: true` đang bật, giữ nguyên như vậy.
- **Không commit** `node_modules/`, `dist/`, `.env` thật.
- **Không tự bịa số liệu nghiệp vụ** (thông số drone, diện tích, khách hàng, ngày tháng). Lấy từ tài liệu nhóm; chỗ chưa rõ thì hỏi, hoặc dùng dữ liệu trong `src/mocks/`.
- **Không sửa repo BE hoặc repo skill** từ trong repo này.

## Quy ước code

- **Import luôn dùng alias `@/`**, ví dụ `import Button from '@/components/ui/Button'`. Không dùng `../../..`.
- **Giao diện tiếng Việt.** Thuật ngữ trạng thái giữ tiếng Anh: `Available`, `In-mission`, `Unavailable`, `STALE`.
- **Style dùng token có sẵn** trong `src/styles/tokens.css` (màu, khoảng cách, bo góc, font). Không hard-code mã màu hay px tuỳ tiện.
- **Component dùng ở nhiều module** đặt ở `src/components/ui/`; chỉ dùng trong một module thì để `src/features/<module>/components/`.
- **Không gọi `setState` trong `useEffect`** để đồng bộ state dẫn xuất — rule `react-hooks/set-state-in-effect` sẽ chặn. Cách đúng là tính trong lúc render, xem mẫu `wasDesktop` trong `src/components/layout/AppLayout.tsx`.
- **Animation GSAP** phải dùng `useGSAP` với `scope` và dọn khi unmount; tôn trọng `prefers-reduced-motion`.
- **Commit message** dạng `loại(phạm vi): mô tả`, ví dụ `feat(batteries): màn danh sách pin`.

## Viết test

Mỗi thay đổi về **logic** hoặc **hành vi UI** phải kèm test. Test đặt cạnh file nguồn, tên `*.test.ts` / `*.test.tsx`.

Ưu tiên theo thứ tự:

1. **Hàm thuần** (phân quyền, tính toán, validate) — rẻ và chắc nhất. Mẫu: `src/auth/model.test.ts`, `src/features/operations/geometry.test.ts`.
2. **Hành vi component** qua React Testing Library — truy vấn theo vai trò và nhãn mà người dùng thấy, không theo class CSS. Mẫu: `src/components/layout/AppLayout.test.tsx`.

Helper dựng cảnh nằm ở `src/test/dom.tsx`: `renderWorkspace()` bọc sẵn router và hai context, `installMatchMedia()` / `setDesktop()` để mô phỏng đổi breakpoint (jsdom không có `matchMedia`).

**Sửa bug thì viết test tái hiện bug trước.** Cách kiểm chứng test có tác dụng thật: tạm hoàn tác bản sửa, chạy lại test — phải đỏ đúng chỗ; khôi phục thì xanh. Test xanh mà không bắt được gì là test vô dụng.

## Việc nào phải hỏi người, không tự quyết

- Nâng major version dependency.
- Đổi cấu hình CI, ruleset, hoặc `vite.config.ts`.
- Đổi cấu trúc thư mục, đổi tên route, đổi shape của context dùng chung (`FleetStore`, `AuthStore`).
- Sửa file dùng chung mà nhiều người đụng: `src/app/routes.tsx`, `src/app/navigation.ts`, `src/types/index.ts`, `src/components/ui/*`. Thêm dòng thì được, sửa dòng của người khác thì báo trước.
- Xoá hoặc sửa test đang có. Test đỏ là tín hiệu, không phải chướng ngại vật cần dọn.

## Quy trình đưa code lên

```bash
git switch phat           # hoặc nhánh của bạn; KHÔNG phải main
git merge origin/main     # cập nhật trước khi code
# ... sửa code, viết test ...
npm run format && npm run check && npm test && npm run build
git add -A
git commit -m "feat(...): ..."
git push
```

Rồi mở Pull Request vào `main` trên GitHub. Khi merge chọn **"Create a merge commit"** (không Squash/Rebase) để nhánh cá nhân và `main` giữ chung lịch sử.

## Môi trường

- Node.js **22** (xem `.nvmrc`). Dùng Node khác có thể cho kết quả khác CI.
- Mặc định chạy chế độ demo, mật khẩu chung `Demo@123`, tài khoản mẫu trong `src/auth/demoAccounts.ts`.
- Muốn nối API BE thật: copy `.env.example` thành `.env.local`, đặt `VITE_AUTH_MODE=api` và `VITE_API_BASE_URL=http://localhost:8080/api/v1`, rồi khởi động lại Vite.
