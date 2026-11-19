# Todolist — шпаргалка по серверу Trelly

## Сервер и документация

| Что | Где |

| Сервер (базовый URL) | `https://trelly.it-incubator.app/api/1.0` |
| Документация (Swagger) | `https://trelly.it-incubator.app/api` |
| Где взять API-ключ | `https://apihub.it-incubator.io` → Trelly API |
| Логин | почта, с которой регистрировалась на apihub |

Старый сервер `social-network.samuraijs.com` больше не используется.

## Перед первым входом

На `apihub.it-incubator.io` → Trelly API должна стоять галочка **«Активна»**.
Без неё `auth/simple/login` отвечает `401 Invalid login or password`, даже если логин и пароль верные.

## Файл `.env`

```
VITE_BASE_URL=https://trelly.it-incubator.app/api/1.0
VITE_API_KEY=ключ_из_apihub
```

- После изменения `.env` нужно перезапустить `pnpm dev`.
- `.env` не отправлять на GitHub (проверить, что он есть в `.gitignore`).

## Заголовки в каждом запросе (`baseApi.ts`)

| Заголовок | Значение |

| `API-KEY` | ключ из `.env` |
| `Authorization` | `Bearer <accessToken из localStorage>` |

## Вход и выход

В Swagger нужен раздел **Simple Authentication**, а не **Authentication**.
`Authentication` — это вход через OAuth на apihub, он нам не нужен.

| Действие | Запрос | Что отправляем | Что приходит при успехе |

| Вход | `POST auth/simple/login` | `{ login, password, rememberMe }` | `{ accessToken, refreshToken }` |
| Кто я | `GET auth/me` | ничего | `{ userId, login }` |
| Выход | `POST auth/simple/logout` | `{ refreshToken }` | пустой ответ |

`resultCode` у нового сервера нет. Успех или ошибку определяем так:

- `login` и `me`: успех, если есть `res.data` → `if (res.data)`
- `logout`: при успехе `res.data` равно `null`, поэтому проверяем наличие ключа → `if ("data" in res)`

## Токены в localStorage

| Константа | Ключ | Что лежит |

| `AUTH_TOKEN` | `auth-token` | `accessToken` |
| `REFRESH_TOKEN` | `refresh_token` | `refreshToken` |

- После входа сохраняем оба токена.
- После выхода удаляем оба токена.
- `localStorage.getItem(...)` имеет тип `string | null`, поэтому перед использованием проверяем: `if (refreshToken) { ... }`

## Списки и задачи

| Было (samuraijs) | Стало (trelly) |

| `todo-lists` | `boards` (свои — `GET boards/my`) |
| `todo-lists/{todolistId}/tasks` | `boards/{boardId}/tasks` |

## Ошибки, которые уже встречались

| Ошибка | Причина |

| `401 Invalid login or password` | не стоит галочка «Активна» на apihub |
| `401` у `me` при открытии страницы | ещё не вошла, токена нет — это нормально |
| `429` с текстом `API key is invalid or not passed` | неверный или старый `API-KEY` в `.env` |
| `404` у `todo-lists` | такого пути на новом сервере нет, нужен `boards` |

## Туннель для сдачи домашки

Нужен только тогда, когда приложение должна открыть система проверки.

```bash
# окно 1
pnpm dev

# окно 2 (порт тот, что в строке Local:)
cloudflared tunnel --url http://localhost:3000
```

- Адрес `https://....trycloudflare.com` из окна 2 отправить в систему проверки.
- Оба окна держать открытыми, пока идут тесты.
- После перезапуска туннеля адрес будет новым.
- Ошибка `429` от cloudflared — подождать минуту и запустить снова.
- Ошибка `Blocked request. This host is not allowed` — добавить в `vite.config.ts`:

```ts
server: {
  allowedHosts: true
}
```