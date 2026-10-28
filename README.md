# CI/CD Node.js Demo

Ví dụ cho seminar CI/CD: ESLint → automated tests → syntax/build check bằng GitHub Actions, sau đó đóng gói artifact phát hành (Continuous Delivery).

## Yêu cầu

- Node.js 22+
- npm
- Git

## Chạy trên Ubuntu

```bash
npm install
npm run lint
npm test
npm run build
node src/index.js
```

## Cấu trúc

```text
cicd-nodejs-demo/
├── .github/workflows/ci.yml
├── src/
│   ├── discount.js
│   └── index.js
├── test/
│   └── discount.test.js
├── eslint.config.js
├── package.json
└── README.md
```

## CD: tạo gói phát hành

Workflow có job `deliver` phụ thuộc vào cả `lint`, `test` và `build`. Job này chỉ chạy khi push lên nhánh `main`; Pull Request vẫn chạy các bước CI nhưng không tạo gói phát hành. Sau khi CI thành công, job đóng gói các file ứng dụng thành `.tar.gz` có mã commit trong tên và lưu artifact của GitHub Actions trong 7 ngày.

Workflow dùng `actions/upload-artifact@v6` và `actions/download-artifact@v7`, là các phiên bản chạy trên Node.js 24. Nếu dùng self-hosted runner, runner cần phiên bản `2.327.1` trở lên.

### Demo trên GitHub

1. Push thay đổi hợp lệ lên `main`.
2. Mở repository → **Actions** → chọn workflow run mới nhất.
3. Xác nhận các job Lint, Test, Build và Continuous Delivery đều thành công.
4. Tải artifact `cicd-nodejs-demo-<commit>` ở cuối trang run.

Đây là Continuous Delivery: bản phát hành được chuẩn bị và sẵn sàng tải xuống.

## Demo nút phê duyệt và deploy staging qua SSH

Job `deploy-staging` tham chiếu GitHub Environment tên `staging`. Sau khi job `deliver` hoàn tất, workflow sẽ chuyển sang trạng thái chờ reviewer; runner chưa chạy bước SSH và chưa được cấp environment secrets cho tới khi có người duyệt. Sau khi duyệt, job tải artifact rồi chép, giải nén lên máy Linux. Đây là ví dụ triển khai tệp ứng dụng; với ứng dụng web chạy liên tục, máy staging cần thêm process manager (ví dụ systemd/PM2), reverse proxy và health check.

### Cấu hình Environment để hiện nút duyệt

1. Vào repository **Settings → Environments → New environment**, tạo environment `staging`.
2. Trong **Deployment protection rules**, bật **Required reviewers**, thêm tài khoản hoặc team làm reviewer rồi lưu.
3. Chuẩn bị máy staging và tài khoản SSH chỉ có quyền ghi vào thư mục ứng dụng. Trong phần secrets/variables của environment `staging`, tạo:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `STAGING_HOST` | Hostname hoặc IP máy staging |
| Secret | `STAGING_USER` | Tài khoản SSH dùng để deploy |
| Secret | `STAGING_SSH_KEY` | Private key của tài khoản deploy |
| Variable | `STAGING_PATH` | Thư mục đích, ví dụ `/var/www/cicd-nodejs-demo` |

Thêm public key tương ứng vào `authorized_keys` của tài khoản trên máy staging. Kiểm tra host key SSH theo quy trình của tổ chức trước khi deploy; ví dụ dùng `ssh-keyscan` trong workflow thuận tiện cho demo nhưng không xác thực host key ngoài băng. Không dùng khóa cá nhân hoặc tài khoản có quyền rộng cho workflow.

### Thao tác duyệt trong buổi demo

1. Push thay đổi lên `main`; chờ Lint, Test, Build và Continuous Delivery hoàn tất.
2. Trong **Actions**, mở workflow run đó. Job **Deploy to staging (approval required)** sẽ ở trạng thái **Waiting**.
3. Chọn **Review deployments**, chọn `staging`, rồi bấm **Approve and deploy**. Chọn **Reject** nếu muốn dừng.
4. Sau khi được duyệt, theo dõi log SSH/SCP và kiểm tra file trên máy staging.

GitHub plan có thể giới hạn Required reviewers theo loại repo. Theo tài liệu GitHub hiện tại, trên Free/Pro/Team, required reviewers chỉ khả dụng cho repository public; repo private/internal cần gói hỗ trợ phù hợp.

## Demo FAIL → PASS

1. Chạy `npm test`: tất cả test phải PASS.
2. Mở `src/discount.js`, tạm đổi công thức thành:

   ```js
   return price + (price * discountPercent / 100);
   ```

3. Chạy `npm test`: test giảm giá 10% sẽ FAIL.
4. Khôi phục công thức trừ, chạy lại `npm run lint`, `npm test`, `npm run build`.
5. Push lên GitHub và xem tab **Actions**.

## GitHub Actions: các khái niệm

- `workflow`: toàn bộ quy trình YAML.
- `job`: nhóm bước chạy trên runner.
- `step`: từng bước.
- `uses`: gọi action có sẵn, ví dụ `actions/checkout@v4`.
- `run`: chạy lệnh shell, ví dụ `npm test`.
- `runner`: máy thực thi job.

## Lưu ý

Workflow dùng `npm install` để project mẫu chạy được ngay khi chưa có lockfile. Với dự án thực tế, nên commit `package-lock.json` rồi đổi sang `npm ci` để cài dependency nhất quán.
# cicd-nodejs-demo
