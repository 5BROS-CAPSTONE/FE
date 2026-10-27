# Quy trình làm việc nhóm

## Nhánh

- `main` luôn chạy được và build được. **Không push thẳng lên `main`**, mọi thay đổi đi qua Pull Request.
- Mỗi thành viên có **một nhánh riêng mang tên mình** (ví dụ `quyen`) và push code của mình lên đúng nhánh đó.
- Lần đầu, tạo nhánh của mình từ `main` (nếu nhánh đã có trên GitHub thì chỉ cần `git checkout <tên>`):

```bash
git checkout main
git pull
git checkout -b quyen
git push -u origin quyen
```

## Commit

Theo dạng `loại(phạm vi): mô tả ngắn`, ví dụ:

- `feat(batteries): màn danh sách pin`
- `fix(drones): sai số pin khi mở lại drone`
- `chore: cập nhật dependency`

Loại thường dùng: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`.

## Mỗi ngày làm việc

Trước khi code, lấy phần mới của `main` về nhánh mình để không bị lệch xa:

```bash
git checkout quyen
git pull                  # lấy code mới nhất của nhánh mình
git fetch origin
git merge origin/main     # cập nhật theo main, xử lý xung đột nếu có
```

Code xong một phần thì commit và push lên nhánh mình:

```bash
npm run format
npm run check             # typecheck + lint + format phải sạch
npm run build
git add .
git commit -m "feat(batteries): màn danh sách pin"
git push
```

## Đưa code vào `main`

1. Làm bước `git merge origin/main` ở trên, sửa hết xung đột rồi push.
2. Trên GitHub mở Pull Request **từ nhánh của mình vào `main`**, điền mẫu mô tả có sẵn.
3. CI tự chạy `npm run check` và `npm run build`. Chỉ merge khi CI **xanh** và GitHub báo **không có xung đột**; nên nhờ một bạn xem qua trước khi merge.
   Khi bấm merge, chọn **"Create a merge commit"** (không chọn Squash/Rebase) để nhánh cá nhân và `main` giữ chung lịch sử, lần sau không bị xung đột giả.
4. Merge xong vẫn tiếp tục làm trên nhánh của mình; lần sau nhớ `git merge origin/main` trước khi code tiếp.

Không dùng `git push --force` trên nhánh của người khác hoặc trên `main`.

## Tránh xung đột

- Mỗi người làm trên nhánh của mình và trong thư mục `src/features/<module>` mình phụ trách.
- Merge `main` vào nhánh mình thường xuyên (ít nhất mỗi ngày làm việc); để càng lâu càng dễ xung đột.
- File dùng chung (`src/app/routes.tsx`, `src/app/navigation.ts`, `src/types/index.ts`, `src/components/ui/*`) chỉ thêm dòng, hạn chế sửa dòng của người khác; sửa lớn thì báo nhóm trước.
- Không commit `node_modules`, `dist`, file `.env` thật.
- Dùng VS Code thì cài các extension được gợi ý (ESLint, Prettier, Tailwind CSS, EditorConfig) và bật "Format on Save".

## Quy tắc nội dung

- Thông số, trường dữ liệu, trạng thái lấy theo tài liệu của nhóm (BPMN, Function list, sheet thông số). Không tự thêm; chỗ chưa rõ thì hỏi nhóm.
- Giao diện tiếng Việt; thuật ngữ trạng thái (Available, In-mission, Unavailable, STALE) giữ tiếng Anh.
