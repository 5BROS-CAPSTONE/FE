# Quy trình làm việc nhóm

## Nhánh

- `main` luôn chạy được và build được. **Không push thẳng lên `main`**, mọi thay đổi đi qua Pull Request.
- Mỗi chức năng một nhánh, tạo từ `main` mới nhất:

```bash
git checkout main
git pull
git checkout -b feature/s2-gan-pin
```

Đặt tên nhánh: `feature/<mã luồng>-<mô tả>` (ví dụ `feature/s2-gan-pin`), sửa lỗi dùng `fix/<mô tả>`, việc cấu hình dùng `chore/<mô tả>`.

## Commit

Theo dạng `loại(phạm vi): mô tả ngắn`, ví dụ:

- `feat(batteries): màn danh sách pin`
- `fix(drones): sai số pin khi mở lại drone`
- `chore: cập nhật dependency`

Loại thường dùng: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`.

## Trước khi mở Pull Request

```bash
npm run format     # tự format
npm run check      # typecheck + lint + format phải sạch
npm run build
git fetch origin
git rebase origin/main   # cập nhật theo main, xử lý xung đột nếu có
git push -u origin feature/s2-gan-pin
```

Mở PR vào `main`, điền mẫu mô tả có sẵn. CI trên GitHub sẽ tự chạy `npm run check` và `npm run build`; PR chỉ được merge khi CI xanh và có ít nhất một bạn review.

## Tránh xung đột

- Mỗi người làm trong thư mục `src/features/<module>` của mình.
- File dùng chung (`src/app/routes.tsx`, `src/app/navigation.ts`, `src/types/index.ts`, `src/components/ui/*`) chỉ thêm dòng, hạn chế sửa dòng của người khác; sửa lớn thì báo nhóm trước.
- Không commit `node_modules`, `dist`, file `.env` thật.
- Dùng VS Code thì cài các extension được gợi ý (ESLint, Prettier, Tailwind CSS, EditorConfig) và bật "Format on Save".

## Quy tắc nội dung

- Thông số, trường dữ liệu, trạng thái lấy theo tài liệu của nhóm (BPMN, Function list, sheet thông số). Không tự thêm; chỗ chưa rõ thì hỏi nhóm.
- Giao diện tiếng Việt; thuật ngữ trạng thái (Available, In-mission, Unavailable, STALE) giữ tiếng Anh.
