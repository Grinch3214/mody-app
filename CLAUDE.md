# mody-app

Приложение для фильтрации данных о составах и ценах из Google Sheets с генерацией временных shareable-ссылок.

## Архитектура

Монорепо: два независимых приложения в одном репозитории.

```
mody-app-back/
├── backend/    → NestJS API, деплой на Railway
└── frontend/   → (позже), деплой на Netlify/Vercel
```

## Backend (`/backend`)

**Стек:** NestJS · PostgreSQL · Prisma 7 · Redis · JWT

### Модули

- `PrismaModule` — глобальный, подключается ко всем модулям автоматически
- `AuthModule` — логин без регистрации (юзеры создаются вручную в БД), JWT токены (7 дней)
- `SheetsModule` — (планируется) fetching CSV из Google Sheets, кэш в Redis с TTL
- `ShareModule` — (планируется) создание/получение временных ссылок (Redis TTL 24ч)

### Структура файлов

```
src/
├── prisma/         — PrismaService + PrismaModule (global)
├── auth/           — login, JWT strategy, JwtAuthGuard
│   ├── auth.controller.ts    POST /auth/login
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts     — @UseGuards(JwtAuthGuard) для защиты роутов
│   └── auth.module.ts
└── app.module.ts
```

### Prisma

Конфиг в `prisma.config.ts` (Prisma 7, не в schema.prisma).
Схема в `prisma/schema.prisma`, сгенерированный клиент в `generated/prisma/` (в .gitignore).

Модели:
- `User` — id, email, password (bcrypt hash), role (ADMIN), createdAt

Создать юзера вручную:
```bash
npx prisma studio        # GUI в браузере
# или через SQL:
# INSERT INTO "User" (email, password, role, "createdAt")
# VALUES ('admin@example.com', '<bcrypt_hash>', 'ADMIN', NOW());
```

### Переменные окружения

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your-secret-key
```

### Команды

```bash
cd backend
npm run start:dev          # dev режим с hot reload
npm run build              # сборка
npx prisma migrate dev     # применить миграции
npx prisma studio          # GUI для БД
npx prisma generate        # перегенерировать клиент
```

## Принципы

- Без регистрации: юзеры создаются только вручную через Prisma Studio или SQL
- Google Sheets данные кэшируются на стороне бека (не долбим таблицу на каждый запрос)
- Временные ссылки живут 24 часа, хранятся в Redis с TTL
- Защищённые роуты используют `@UseGuards(JwtAuthGuard)` из `AuthModule`