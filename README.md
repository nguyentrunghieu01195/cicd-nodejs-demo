# CI/CD Node.js Demo

Ví dụ cho seminar CI/CD: ESLint → automated tests → syntax/build check bằng GitHub Actions.

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
