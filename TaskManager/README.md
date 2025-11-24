# SEJobs Backend (TaskManager)

## Tổng quan / Overview

Hệ thống backend xây dựng bằng Node.js + TypeScript + Express (v5) cung cấp API cho quản lý người dùng, dự án, sprint, issue, activity, v.v. Kiến trúc tổ chức theo chiều feature + layer (handlers → services → repositories → db/migrations). Tài liệu Swagger tự động sinh từ mô tả trong thư mục `src/docs/swagger`.

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express 5
- Database: (SQL qua migration scripts + Mongo (config placeholder))
- Testing: Jest
- Docs: Swagger UI
- Others: Logger tùy chỉnh, JWT auth, DTO validation

## Cấu trúc thư mục / Directory Structure

```
TaskManager/
├─ src/
│  ├─ config/
│  │  ├─ env.ts
│  │  ├─ mongodb.ts
│  │  └─ swagger.ts
│  ├─ createApp.ts
│  ├─ index.ts
│  ├─ db/
│  │  ├─ migrations/
│  │  ├─ data/
│  │  └─ scripts/
│  ├─ docs/
│  │  └─ swagger/
│  ├─ dtos/
│  │  └─ user/
│  ├─ handlers/
│  ├─ middlewares/
│  ├─ models/
│  ├─ repositories/
│  ├─ routes/
│  ├─ services/
│  ├─ types/
│  └─ utils/
├─ migrations/                (Sequelize style legacy?)
├─ seeders/                   (Seed scripts legacy?)
├─ Dockerfile / docker-compose.yml
├─ package.json
├─ tsconfig.json
└─ README.md
```

### Mô tả các thành phần chính

- Application Bootstrap:

  - [`src/index.ts`](src/index.ts) – Entry khởi động server.
  - [`src/createApp.ts`](src/createApp.ts) – Khởi tạo Express app, đăng ký middlewares, routes, swagger.

- Configuration:

  - [`src/config/env.ts`](src/config/env.ts) – Nạp biến môi trường.
  - [`src/config/swagger.ts`](src/config/swagger.ts) – Thiết lập Swagger UI.
  - [`src/config/mongodb.ts`](src/config/mongodb.ts) – Cấu hình Mongo (nếu dùng).

- Database & Data:

  - Migrations SQL: `src/db/migrations/*.sql`
  - Static data import scripts: [`src/db/scripts/import-locations.ts`](src/db/scripts/import-locations.ts)
  - Seed data JSON: `src/db/data/*.json`

- DTOs (Validation layer):

  - Ví dụ: [`src/dtos/user/CreateUser.dto.ts`](src/dtos/user/CreateUser.dto.ts)
  - Tách riêng cấu trúc request/response khỏi models nội bộ.

- Models (Business Entities):

  - Ví dụ: [`src/models/user.model.ts`](src/models/user.model.ts)
  - Các thực thể: user, project, sprint, issue, comment, activity, otp-token, project-team.

- Repositories (Data Access):

  - Ví dụ: [`src/repositories/user.repository.ts`](src/repositories/user.repository.ts)
  - Chịu trách nhiệm tương tác DB, tách logic khỏi services.

- Services (Domain Logic):

  - Implement business rules, kết hợp nhiều repository.
  - Ví dụ: [`src/services/users.service.ts`](src/services/users.service.ts)

- Handlers (Controller layer):

  - Mapping HTTP request → gọi service → trả response.
  - Ví dụ: [`src/handlers/users.handler.ts`](src/handlers/users.handler.ts)

- Routes:

  - Định nghĩa endpoints và gắn handler.
  - Ví dụ: [`src/routes/users.route.ts`](src/routes/users.route.ts)

- Middlewares:

  - Auth: [`src/middlewares/auth.middleware.ts`](src/middlewares/auth.middleware.ts)
  - Error: [`src/middlewares/error.middleware.ts`](src/middlewares/error.middleware.ts)
  - Logger: [`src/middlewares/logger.middleware.ts`](src/middlewares/logger.middleware.ts)

- Utilities:

  - JWT: [`src/utils/jwt.util.ts`](src/utils/jwt.util.ts)
  - Logger: [`src/utils/logger.ts`](src/utils/logger.ts)
  - Validation helpers: [`src/utils/validate.ts`](src/utils/validate.ts)
  - Converters: [`src/utils/convert.ts`](src/utils/convert.ts)
  - Error classes: [`src/utils/errors.ts`](src/utils/errors.ts)

- API Documentation:
  - Swagger spec fragments: `src/docs/swagger/*.docs.ts`
  - Được hợp nhất trong swagger config.

### Luồng xử lý (Request Flow)

`Route` → `Handler` → `Service` → `Repository` → `DB`  
Middleware Cross-cutting: Auth / Validation / Error handling / Logging.

### Biến môi trường (.env)

Ví dụ (tùy chỉnh theo thực tế triển khai):

```
PORT=3000
NODE_ENV=development
JWT_SECRET=super-secret-key
DB_HOST=localhost
DB_USER=...
DB_PASS=...
DB_NAME=...
```

### Scripts (package.json)

| Script                            | Chức năng                               |
| --------------------------------- | --------------------------------------- |
| build                             | Compile TypeScript                      |
| start                             | Chạy app đã build                       |
| test                              | Chạy bộ test Jest (nếu được định nghĩa) |
| (Thêm start:dev nếu dùng nodemon) |

### Chạy dự án

1. Cài đặt:

```
npm install
```

2. Phát triển (nếu có nodemon):

```
npm run start:dev
```

3. Build:

```
npm run build
```

4. Chạy production:

```
npm start
```

### Testing

- Tests nằm trong `src/__tests__/`
- Cấu hình Jest: `jest.config.js`
- Ví dụ test: [`src/__tests__/users.test.ts`](src/__tests__/users.test.ts)

### Logging

- Logger trừu tượng: [`src/utils/logger.ts`](src/utils/logger.ts)
- Middleware logger: inject info mỗi request.

### Error Handling

- Custom errors: [`src/utils/errors.ts`](src/utils/errors.ts)
- Central error middleware: thống nhất format JSON trả về.

### Authentication

- JWT utilities: [`src/utils/jwt.util.ts`](src/utils/jwt.util.ts)
- Middleware xác thực: chặn route cần bảo vệ.

### Swagger

- Config: [`src/config/swagger.ts`](src/config/swagger.ts)
- Fragments: `src/docs/swagger/*.docs.ts`
- Truy cập: `/api-docs` (tùy config).

### Quy ước đặt tên

- `*.dto.ts` DTO lớp.
- `*.handler.ts` Controller.
- `*.service.ts` Business logic.
- `*.repository.ts` Data access.
- `*.model.ts` Domain entities.

### Mở rộng (Extension Points)

- Thêm module mới: tạo model → repository → service → handler → route.
- Thêm swagger docs: tạo file `.docs.ts` và import vào builder.
- Thêm middleware: viết file và đăng ký trong `createApp.ts`.

### Triển khai Docker

- `Dockerfile` & `docker-compose.yml` hỗ trợ production compose (DB + app).
- Build image:

```
docker build -t sejobs-backend .
```

- Run compose:

```
docker-compose up -d
```

### Ghi chú

- Giữ service thuần business; không trả trực tiếp response.
- Repo không thực hiện logic nghiệp vụ ngoài dữ liệu.
- Handler chịu trách nhiệm map HTTP → service và format response.

## Roadmap Gợi ý

- Thêm layer cache (Redis).
- Thêm OpenAPI generation tự động từ decorators.
- Thêm role-based access control chi tiết.
- Thêm metrics / tracing (Prometheus / OpenTelemetry).

## License

Private / Internal Use.
