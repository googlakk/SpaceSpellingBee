# 🐝 Intellect Pro School - Spelling Bee

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg?logo=typescript)

**Интерактивное приложение для изучения правописания английских слов с AI-технологией распознавания голоса**

[Демо](https://intellectproschool.com) · [Документация](./DEPLOYMENT.md) · [Сообщить об ошибке](https://github.com/intellectproschool/spelling-bee/issues)

</div>

---

## ✨ Особенности

- 🎤 **AI-распознавание голоса** - Произносите слова, и AI проверит правильность
- 🚀 **Космическая тематика** - Увлекательное путешествие по галактикам
- 📱 **PWA-приложение** - Устанавливается на любое устройство и работает офлайн
- 🎯 **Режимы обучения** - Тренировка и практика с различными уровнями сложности
- 📊 **Отслеживание прогресса** - Статистика и история обучения
- 🎨 **Современный UI** - Красивый интерфейс на базе Shadcn UI
- 🌙 **Темная тема** - Комфортное использование в любое время суток
- 🔊 **Голосовое сопровождение** - Произношение слов и обратная связь

## 🛠️ Технологии

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Shadcn UI (Radix UI)
- **Backend**: Supabase 2.81.1
- **State Management**: TanStack Query 5.83.0
- **Routing**: React Router DOM 6.30.1
- **Voice Recognition**: Web Speech API

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/intellectproschool/spelling-bee.git
   cd spelling-bee
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.example .env
   ```

   Отредактируйте `.env` и добавьте ваши ключи Supabase:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Запустите сервер разработки**
   ```bash
   npm run dev
   ```

5. **Откройте в браузере**
   ```
   http://localhost:5173
   ```

## 📦 Сборка для продакшена

```bash
# Сборка приложения
npm run build

# Предварительный просмотр продакшен сборки
npm run preview
```

Собранное приложение будет в папке `dist/`

## 🎨 Подготовка к публикации

Перед публикацией необходимо сгенерировать иконки и изображения:

1. **Откройте в браузере**:
   - `generate-icons.html` - для генерации иконок приложения
   - `generate-og-image.html` - для генерации Open Graph изображения

2. **Проверьте готовность**:
   - Откройте `check-deployment-ready.html` для проверки всех пунктов

3. **Прочитайте полную инструкцию**:
   - См. [DEPLOYMENT.md](./DEPLOYMENT.md) для детального руководства

## 📁 Структура проекта

```
spelling-bee/
├── public/              # Статические файлы
│   ├── manifest.json    # PWA манифест
│   ├── robots.txt       # SEO robots
│   ├── sitemap.xml      # SEO sitemap
│   └── sw.js           # Service Worker
├── src/
│   ├── components/      # React компоненты
│   ├── pages/          # Страницы приложения
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Утилиты и библиотеки
│   ├── integrations/   # Интеграции (Supabase)
│   └── main.tsx        # Точка входа
├── index.html          # HTML шаблон
├── package.json        # Зависимости проекта
├── vite.config.ts      # Конфигурация Vite
├── tailwind.config.ts  # Конфигурация Tailwind
└── tsconfig.json       # Конфигурация TypeScript
```

## 🎮 Использование

### Режим тренировки
1. Выберите уровень сложности
2. Слушайте произношение слова
3. Произнесите слово в микрофон
4. Получите обратную связь

### Режим практики
1. Выберите категорию слов
2. Проходите испытания
3. Отслеживайте прогресс
4. Получайте награды

### Административная панель
- Управление словами
- Просмотр статистики учеников
- Настройка уровней сложности

## 🌐 Развертывание

### Lovable (рекомендуется)
1. Откройте [Lovable Project](https://lovable.dev/projects/cd335065-cc65-4679-b399-a1767fb11c0b)
2. Нажмите Share → Publish

### Другие платформы
- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

Подробнее см. [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 Скрипты

```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run build:dev    # Сборка в dev режиме
npm run preview      # Просмотр продакшен сборки
npm run lint         # Проверка кода ESLint
```

## 🤝 Разработка

### Редактирование через Lovable
Посетите [Lovable Project](https://lovable.dev/projects/cd335065-cc65-4679-b399-a1767fb11c0b) и начните работу с AI-ассистентом.

### Локальная разработка
1. Создайте новую ветку: `git checkout -b feature/my-feature`
2. Внесите изменения
3. Зафиксируйте: `git commit -m "Add my feature"`
4. Отправьте: `git push origin feature/my-feature`
5. Создайте Pull Request

## 🐛 Сообщение об ошибках

Если вы нашли ошибку, пожалуйста:
1. Проверьте [Issues](https://github.com/intellectproschool/spelling-bee/issues)
2. Создайте новый Issue с подробным описанием

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

Разработано с ❤️ командой **Intellect Pro School**

## 🙏 Благодарности

- [React Team](https://react.dev/)
- [Vite Team](https://vitejs.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**[Сайт](https://intellectproschool.com)** · **[Документация](./DEPLOYMENT.md)** · **[GitHub](https://github.com/intellectproschool/spelling-bee)**

</div>
