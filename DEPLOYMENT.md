# 🚀 Руководство по развертыванию Spelling Bee

## 📋 Предварительная подготовка

### 1. Генерация иконок приложения

Перед публикацией необходимо сгенерировать все иконки для PWA:

1. Откройте файл `generate-icons.html` в браузере
2. Нажмите кнопку "Generate All Icons"
3. Скачайте все сгенерированные иконки, используя кнопки "Download"
4. Сохраните их в папку `public/` со следующими названиями:
   - `icon-16x16.png`
   - `icon-32x32.png`
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### 2. Генерация Open Graph изображения

1. Откройте файл `generate-og-image.html` в браузере
2. Нажмите кнопку "Generate Open Graph Image"
3. Скачайте изображение как `og-image.png`
4. Сохраните его в папку `public/`

### 3. Создание Favicon

Используйте один из следующих способов:

**Способ 1: Онлайн генератор**
1. Перейдите на https://favicon.io/
2. Загрузите `icon-512x512.png`
3. Скачайте сгенерированный `favicon.ico`
4. Сохраните в папку `public/`

**Способ 2: Использование существующей иконки**
1. Переименуйте `icon-32x32.png` в `favicon.ico`
2. Сохраните в папку `public/`

## 🏗️ Сборка приложения

### Установка зависимостей

```bash
npm install
```

### Сборка для продакшена

```bash
npm run build
```

Собранное приложение будет находиться в папке `dist/`

### Предварительный просмотр сборки

```bash
npm run preview
```

## 🌐 Развертывание

### Lovable (рекомендуется)

1. Откройте [Lovable](https://lovable.dev/projects/cd335065-cc65-4679-b399-a1767fb11c0b)
2. Нажмите Share → Publish
3. Приложение будет автоматически развернуто

### Netlify

1. Создайте аккаунт на [Netlify](https://www.netlify.com/)
2. Подключите GitHub репозиторий
3. Настройки сборки:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Нажмите "Deploy"

### Vercel

1. Создайте аккаунт на [Vercel](https://vercel.com/)
2. Импортируйте проект из GitHub
3. Vercel автоматически определит настройки
4. Нажмите "Deploy"

### Другие хостинги

Для развертывания на других платформах:
1. Соберите проект: `npm run build`
2. Загрузите содержимое папки `dist/` на хостинг
3. Убедитесь, что сервер настроен на перенаправление всех запросов на `index.html` (для SPA)

## ⚙️ Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Settings
VITE_APP_NAME=Intellect Pro School - Spelling Bee
VITE_APP_URL=https://intellectproschool.com
```

## 🔍 SEO оптимизация

### Обновите URL-адреса

Замените `https://intellectproschool.com` в следующих файлах на ваш реальный домен:

- `index.html` (meta теги og:url и canonical)
- `public/sitemap.xml` (все URL)
- `public/robots.txt` (Sitemap URL)

### После развертывания

1. **Google Search Console**
   - Добавьте сайт в [Google Search Console](https://search.google.com/search-console)
   - Отправьте sitemap: `https://yourdomain.com/sitemap.xml`

2. **Тестирование**
   - Проверьте PWA: [web.dev/measure](https://web.dev/measure/)
   - Проверьте мета-теги: [metatags.io](https://metatags.io/)
   - Проверьте Open Graph: [opengraph.xyz](https://www.opengraph.xyz/)

3. **Performance**
   - Тест скорости: [PageSpeed Insights](https://pagespeed.web.dev/)
   - Lighthouse audit в Chrome DevTools

## 📱 PWA установка

После развертывания пользователи смогут:
- Установить приложение на мобильные устройства
- Использовать офлайн (после первого посещения)
- Получать push-уведомления (если настроены)

## 🔐 Безопасность

Проверьте перед публикацией:
- [ ] Все API ключи находятся в переменных окружения
- [ ] `.env` добавлен в `.gitignore`
- [ ] CORS настроен правильно на backend
- [ ] HTTPS включен на продакшене
- [ ] CSP заголовки настроены (Content Security Policy)

## 🐛 Отладка

Если что-то пошло не так:

1. **Проверьте консоль браузера** (F12)
2. **Проверьте логи сборки**
3. **Убедитесь, что все зависимости установлены**
4. **Проверьте переменные окружения**
5. **Очистите кэш и пересоберите**: `rm -rf dist node_modules && npm install && npm run build`

## 📞 Поддержка

При возникновении проблем:
- Проверьте [GitHub Issues](https://github.com/intellectproschool/spelling-bee/issues)
- Обратитесь в техническую поддержку Intellect Pro School

---

**Удачного развертывания! 🎉**
