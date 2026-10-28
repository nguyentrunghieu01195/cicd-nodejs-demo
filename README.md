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

## Ví dụ deploy lên máy staging qua SSH

Job `deploy-staging` minh họa cách tải artifact rồi chép và giải nén trên một máy Linux. Đây là ví dụ triển khai tệp ứng dụng; với ứng dụng web đang chạy liên tục, máy staging cần thêm process manager (ví dụ systemd/PM2), reverse proxy và health check.

Trước khi bật deploy, chuẩn bị máy staging và tài khoản SSH hạn chế quyền ghi vào thư mục ứng dụng. Trong **Settings → Secrets and variables → Actions**, tạo:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `STAGING_HOST` | Hostname hoặc IP máy staging |
| Secret | `STAGING_USER` | Tài khoản SSH dùng để deploy |
| Secret | `STAGING_SSH_KEY` | Private key của tài khoản deploy |
| Variable | `STAGING_PATH` | Thư mục đích, ví dụ `/var/www/cicd-nodejs-demo` |
| Variable | `ENABLE_SSH_DEPLOY` | Đặt thành `true` để bật job deploy |

Thêm public key tương ứng vào `authorized_keys` của tài khoản trên máy staging. Kiểm tra host key SSH theo quy trình của tổ chức trước khi deploy; ví dụ dùng `ssh-keyscan` trong workflow thuận tiện cho demo nhưng không xác thực host key ngoài băng. Chỉ bật `ENABLE_SSH_DEPLOY` khi đã chuẩn bị đủ secret, variable và máy đích. Khi chạy, deploy chỉ được thực hiện sau các bước lint, test, build và đóng gói thành công trên `main`. Không dùng khóa cá nhân hoặc tài khoản có quyền rộng cho workflow.

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
