# Tager

Редактор OSM для уточнения объектов.

Проект полностью сгенерирован LLM.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта и задайте переменные:
```env
VITE_OSM_OAUTH_CLIENT_ID=ваш_client_id
VITE_OSM_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/login
```
Опционально — спутниковые тайлы Mapbox:
```env
VITE_MAPBOX_ACCESS_TOKEN=ваш_токен
```
Без токена используется публичный ключ OpenStreetMap.

3. OAuth-приложение на OpenStreetMap:
   - https://www.openstreetmap.org/user/your_username/oauth_clients
   - Создайте приложение, укажите Redirect URI: `http://127.0.0.1:5173/login` (для разработки)
   - Для GitHub Pages: `https://your-username.github.io/tager/login`

4. Запуск:
```bash
npm run dev
```

Сборка и превью:
```bash
npm run build
npm run preview
```

## Использование

1. Войдите через OpenStreetMap OAuth.
2. На странице поиска выберите область на карте и нажмите «Загрузить объекты».
3. На странице редактирования:
   - Выберите значение тега из списка или введите своё (несколько значений — через чекбоксы).
   - «Подтвердить и продолжить» — перейти к следующему объекту.
   - «Завершить» — сохранить изменения в OSM.
