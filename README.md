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

## Общее правило нового сервера

Все данные приходят и отправляются в обёртке `data`, а поля объекта лежат в `attributes`:

```
Получаем:   { data: { id: "abc", type: "boards", attributes: { title: "Покупки", ... } } }
Отправляем: { data: { type: "boards", attributes: { title: "Покупки" } } }
```

Чтобы не переделывать компоненты, в `getTodolists` и `getTasks` ответ перекладывается в старую форму через `transformResponse`.

## Списки (`todolistsApi.ts`)

| Запрос | Было | Стало | Что отправляем | Что приходит |

| `getTodolists` | `GET todo-lists` | `GET boards/my` | ничего | `{ data: Board[] }` |
| `addTodolist` | `POST todo-lists` | `POST boards` | `{ data: { type: "boards", attributes: { title, description: "" } } }` | `{ data: Board }` |
| `removeTodolist` | `DELETE todo-lists/{id}` | `DELETE boards/{id}` | ничего | пусто, `204` |
| `updateTodolistTitle` | `PUT todo-lists/{id}` | `PATCH boards/{id}` | `{ data: { type: "boards", attributes: { title } } }` | `{ data: Board }` |

Как доска перекладывается в старый `Todolist`:

| Поле `Todolist` | Откуда берётся |

| `id` | `board.id` |
| `title` | `board.attributes.title` |
| `addedDate` | `board.attributes.addedAt` |
| `order` | `board.attributes.order` |

Схемы в `todolistsApi.types.ts`: `boardSchema` (одна доска) и `boardsResponseSchema` (весь ответ `{ data: [...] }`).

## Задачи (`tasksApi.ts`)

| Запрос | Было | Стало | Что отправляем | Что приходит |

| `getTasks` | `GET todo-lists/{id}/tasks` | `GET boards/{boardId}/tasks` | ничего | `{ data: Task[], included, meta }` |
| `addTask` | `POST todo-lists/{id}/tasks` | `POST boards/{boardId}/tasks` | `{ data: { type: "tasks", attributes: { title } } }` | `{ data: Task }` |
| `removeTask` | `DELETE todo-lists/{id}/tasks/{taskId}` | `DELETE boards/{boardId}/tasks/{taskId}` | ничего | пусто, `204` |
| `updateTask` | `PUT todo-lists/{id}/tasks/{taskId}` | `PATCH boards/{boardId}/tasks/{taskId}` | `{ data: { type: "tasks", attributes: model } }` | `{ data: Task }` |

Как задача перекладывается в старый `DomainTask`:

| Поле `DomainTask` | Откуда берётся |

| `id` | `task.id` |
| `title` | `task.attributes.title` |
| `status` | `task.attributes.status` |
| `priority` | `task.attributes.priority` |
| `order` | `task.attributes.order` |
| `addedDate` | `task.attributes.addedAt` |
| `startDate` | `task.attributes.startDate` |
| `deadline` | `task.attributes.deadline` |
| `todoListId` | `task.relationships.board.data.id` |
| `description` | `null` (в списке задач сервер его не присылает) |

И весь ответ — в старый `GetTasksResponse`:

| Поле | Откуда берётся |

| `items` | `response.data` после `map` |
| `totalCount` | `response.meta.totalCount` |
| `error` | `null` |

Схемы в `tasksApi.types.ts`: `taskSchema` (одна задача) и `tasksResponseSchema` (весь ответ).

Три похожих типа, которые легко перепутать:

| Тип | Что описывает |

| `Task` | одна задача от нового сервера |
| `TasksResponse` | весь ответ нового сервера: `{ data, included, meta }` |
| `GetTasksResponse` | старая форма для компонентов: `{ error, totalCount, items }` |

`transformResponse` получает `TasksResponse`, а возвращает `GetTasksResponse`.

## Где в Swagger что искать

| Раздел | Что там |

| Boards Owner | свои доски: получить, создать, изменить, удалить |
| Tasks Owner | свои задачи: создать, изменить, удалить |
| Tasks Public | получить задачи |

В `Tasks Public` три похожих запроса:

```
GET /boards/tasks                      ← задачи ВСЕХ пользователей, не нужен
GET /boards/{boardId}/tasks            ← задачи одной доски, нужен этот
GET /boards/{boardId}/tasks/{taskId}   ← одна задача подробно
```

## Ограничения сервера

- Не больше **20 задач** на одной доске (иначе `403`).
- Задачи приходят по страницам: по умолчанию 10, максимум 20 (`pageNumber`, `pageSize`).
- Дневной лимит запросов. Сколько осталось, видно в ответе сервера, в заголовке `M-Stat`, например `[max: 100, used: 12]`.
- `null` в `PATCH` задачи **стирает** поле. Сейчас при изменении задачи отправляется `description: null`. Пока в приложении нет поля для описания, это не мешает. Если добавлять описание, это место нужно переделать.

## Ошибки, которые уже встречались

| Ошибка | Причина |

| `401 Invalid login or password` | не стоит галочка «Активна» на apihub |
| `401` у `me` при открытии страницы | ещё не вошла, токена нет — это нормально |
| `429` с текстом `API key is invalid or not passed` | неверный или старый `API-KEY` в `.env` |
| `429` без этого текста | закончился дневной лимит запросов (см. `M-Stat`) |
| `404` у `todo-lists` | такого пути на новом сервере нет, нужен `boards` |
| `403` при добавлении задачи | на доске уже 20 задач |
| `400` при создании или изменении | тело запроса без обёртки `{ data: { type, attributes } }` |
| `304 Not Modified` | не ошибка: ответ не изменился, браузер взял его из памяти |

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