# mody-app-back

## Суть проекта

Бэкенд для получения данных из публичных Google Sheets таблиц, их фильтрации по запросам от клиента и отдачи результатов. Дополнительная фича — создание временных ссылок на отфильтрованный набор данных (TTL 24 часа, делаем позже).

Тестирование через Postman. Деплой на Railway.

## Стек

- NestJS 11 + TypeScript 5.9
- @nestjs/config (env через ConfigModule, isGlobal)
- csv-parse (парсинг CSV из Google Sheets)
- Google Sheets публичный CSV экспорт (без OAuth / API ключа)
- Drizzle ORM + PostgreSQL (Docker, порт 15434)
- JWT авторизация (7 дней, bcrypt пароли)

## Структура

```
mody-app-back/
├── backend/
│   ├── src/
│   │   ├── common/types/product.types.ts
│   │   ├── db/
│   │   │   ├── db.module.ts      (@Global)
│   │   │   ├── db.service.ts
│   │   │   ├── schema.ts
│   │   │   └── seed.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── login.dto.ts
│   │   ├── sheets/
│   │   │   ├── sheets.module.ts
│   │   │   ├── sheets.service.ts
│   │   │   ├── sheets.controller.ts
│   │   │   ├── filter.service.ts
│   │   │   └── filter.dto.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── drizzle/          (миграции, в .gitignore не добавлять)
│   ├── drizzle.config.ts
│   ├── docker-compose.yml
│   └── .env
└── CLAUDE.md
```

## Переменные окружения (.env)

```
GOOGLE_SHEET_ID=...           # прайс-лист
GOOGLE_INVENTORY_SHEET_ID=... # инвентаризация
DATABASE_URL=postgresql://postgres:password@localhost:15434/mody
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=mody
PORT=3000
JWT_SECRET=change_me_in_production
```

## База данных

- PostgreSQL 16 в Docker (порт 15434)
- `@Global() DbModule` экспортирует `DbService` с полем `.db` (Drizzle instance)
- Схема: таблицы `users` + `products`
- Команды:
  - `npm run db:generate` — сгенерировать SQL миграцию
  - `npm run db:migrate` — применить миграции
  - `npm run db:seed` — создать пользователя admin/admin

## AuthModule

- `POST /auth/login` → `{ email, password }` → `{ access_token }`
- JWT токен, 7 дней, секрет `JWT_SECRET`
- `JwtAuthGuard` — проверяет `Authorization: Bearer <token>`
- Регистрации нет, юзеры добавляются через `npm run db:seed` или вручную в БД
- Пароли хешируются через bcrypt (10 rounds)

## SheetsModule

### Эндпоинты

- `GET /sheets` — все продукты (с фильтрацией через query params)
- `GET /sheets?brand=Beneliss&segment=Составы&name=SOS` — фильтрация (AND, подстрока, case-insensitive)
- `POST /sheets/refresh` — принудительное обновление данных из Google Sheets (JWT-protected)

### Хранение данных

- При старте (`OnModuleInit`) — загружает оба листа и сохраняет в таблицу `products`
- Каждые 2 часа — автоматически обновляет (таймер сбрасывается с каждым refresh)
- При обновлении: DELETE все → chunked INSERT (500 строк за раз)

### Структура ответа (Product)

```json
{
  "segment": "1. Составы",
  "brand": "Beneliss",
  "name": "Beneliss ARROZ",
  "volume": 500,
  "prices": {
    "full": 2400,
    "500": null,
    "250": 1300,
    "100": 600,
    "50": 350
  },
  "stock": {
    "bottles": 554,
    "openMl": 450,
    "totalMl": 277450
  }
}
```

`prices.*` — null если в таблице пусто. `stock` — null если товар не найден в инвентаризации.

### Источники данных

| Переменная | Описание |
|---|---|
| `GOOGLE_SHEET_ID` | Прайс-лист (цены для девочек) |
| `GOOGLE_INVENTORY_SHEET_ID` | Инвентаризация (остатки) |

CSV экспорт без API ключа: `https://docs.google.com/spreadsheets/d/{id}/export?format=csv`

### Логика заголовков прайс-листа

2 строки заголовков объединяются (forward-fill):
- row1: `"Ціни дівчат"`, `""`, `""` ...
- row2: `"РРЦ"`, `"500"`, `"250"` ...
- Результат: `"Ціни дівчат РРЦ"`, `"Ціни дівчат 500"`, `"Ціни дівчат 250"` ...

### Логика остатков (stock)

- `Остаток шт` = `"554,90"` (запятая = десятичный разделитель)
- `bottles` = `Math.floor(554.90)` = 554
- `openMl` = `Math.round(0.90 × volume)` = 450мл (для 500мл бутылки)
- `totalMl` = отдельная колонка `Остаток мл`

### Фильтрация

- Параметры: `segment`, `brand`, `name` — все опциональны
- AND-логика при нескольких параметрах
- Поиск по подстроке, регистр игнорируется
- Остатки и цены в фильтрации не участвуют

## Планируемые модули

### ShareModule (делаем после деплоя)

Флоу:
- Админ фильтрует продукты → нажимает "Создать ссылку"
- `POST /share` принимает `{ products: [...] }` → сохраняет снимок с TTL → возвращает `{ token, expiresAt }`
- `GET /share/:token` → отдаёт сохранённые продукты (или 404 если истекло)
- POST защищён JWT, GET публичный
- TTL: 24 часа
