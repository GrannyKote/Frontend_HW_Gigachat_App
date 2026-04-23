# GigaChat React App

Приложение-чата на React и Vite с интеграцией GigaChat API.

## Демо

- Видео демо: [`demo/2026-04-23 21-22-02.mp4`](demo/2026-04-23%2021-22-02.mp4)

## Скриншоты

- Экран старта: [`demo/start.png`](demo/start.png)
- Список чатов: [`demo/chat_list.png`](demo/chat_list.png)
- Новый чат: [`demo/new_chat.png`](demo/new_chat.png)
- Окно чата: [`demo/chat.png`](demo/chat.png)
- Форматирование в чате: [`demo/chat_format.png`](demo/chat_format.png)
- Настройки: [`demo/settings.png`](demo/settings.png)

## Стек

- `React` `18.3.1`
- `TypeScript` `5.9.3`
- `React Router DOM` `7.14.0`
- `Zustand` `5.0.12` для хранения состояния чатов и сообщений
- `CSS` для стилизации интерфейса
- `Vite` `6.0.0` как инструмент сборки и dev server

## Запуск локально

1. Клонируйте репозиторий:

```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd Frontend_HW_Gigachat_App
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте локальный файл окружения на основе шаблона:

```bash
cp .env.example .env
```

Если вы работаете в PowerShell, можно использовать:

```powershell
Copy-Item .env.example .env
```

4. Заполните `.env` нужными значениями.

5. Запустите приложение:

```bash
npm run dev
```

6. Откройте адрес, который выведет Vite в терминале. Обычно это `http://localhost:5173`.

## Переменные окружения

| Переменная | Назначение | Пример значения |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Базовый префикс для запросов к API и auth endpoint. В dev-режиме обычно указывает на проксируемый путь Vite. | `/api` |
| `VITE_DEFAULT_SCOPE` | Значение scope, которое будет выбрано по умолчанию на форме авторизации. | `GIGACHAT_API_PERS` |

