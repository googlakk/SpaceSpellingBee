# 🔧 PWA Debug Guide - Решение проблем с установкой

## 🐛 Проблема: Показывается только инструкция, а не нативный диалог

### Почему это происходит?

PWA нативный диалог установки показывается **только при определенных условиях**:

---

## ✅ Чеклист для работы нативного диалога:

### 1. **HTTPS обязателен!**
```
❌ http://localhost:8080  - НЕ работает (кроме localhost)
✅ https://yoursite.com   - РАБОТАЕТ
✅ http://localhost:8080  - РАБОТАЕТ (исключение для разработки)
```

**Решение:** Запустите приложение на HTTPS или localhost

---

### 2. **Service Worker должен быть зарегистрирован**

Откройте DevTools (F12) → **Application** → **Service Workers**

```
✅ Service Worker: Activated and Running
❌ Service Worker: (none)
```

**Как проверить в консоли:**
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log(reg ? '✅ SW зарегистрирован' : '❌ SW НЕ зарегистрирован');
});
```

---

### 3. **Manifest должен быть валидным**

DevTools (F12) → **Application** → **Manifest**

**Проверьте:**
- ✅ Файл загружается без ошибок
- ✅ Все иконки доступны
- ✅ `start_url` корректен
- ✅ `display: "standalone"`

---

### 4. **Событие `beforeinstallprompt` должно сработать**

**Откройте консоль браузера:**

```javascript
// Проверьте логи:
💡 PWA install prompt is available and saved globally!
```

Если не видите этого лога - событие не произошло!

**Почему может не сработать:**
- ❌ Приложение уже установлено
- ❌ Пользователь ранее отклонил установку
- ❌ Браузер не поддерживает (Firefox, Safari)
- ❌ Не все критерии PWA выполнены

---

### 5. **Браузер должен поддерживать PWA**

| Браузер | Поддержка | Нативный диалог |
|---------|-----------|-----------------|
| Chrome Android | ✅ Да | ✅ Да |
| Chrome Desktop | ✅ Да | ✅ Да |
| Edge | ✅ Да | ✅ Да |
| Safari iOS | ✅ Частично | ❌ Нет (только инструкции) |
| Firefox | ❌ Нет | ❌ Нет |

---

## 🧪 Как протестировать нативный диалог?

### Метод 1: На реальном Android устройстве

1. Задеплойте приложение на **HTTPS** хостинг
2. Откройте на Android в **Chrome**
3. Нажмите кнопку "Установить приложение"
4. ✅ Должен появиться нативный диалог!

---

### Метод 2: Chrome DevTools (симуляция)

1. Откройте DevTools (F12)
2. **Console** → вставьте код:

```javascript
// Симуляция события beforeinstallprompt (НЕ РАБОТАЕТ для реальной установки!)
window.dispatchEvent(new Event('beforeinstallprompt'));
```

**⚠️ Это только для теста логов, не для реальной установки!**

---

### Метод 3: Сброс состояния PWA

Если вы **ранее отклонили** установку:

#### Chrome Desktop:
1. Адресная строка → иконка ⓘ (слева)
2. **Site settings**
3. **Permissions** → сбросить все
4. Перезагрузить страницу

#### Chrome Android:
1. Настройки Chrome → **Site settings**
2. Найти ваш сайт
3. **Clear & reset**
4. Перезагрузить страницу

---

## 🔍 Диагностика через консоль

Вставьте в консоль браузера:

```javascript
// Проверка всех условий PWA
async function checkPWA() {
  console.log('🔍 PWA Diagnostics:');

  // 1. HTTPS
  console.log('1. HTTPS:', location.protocol === 'https:' ? '✅' : '❌');

  // 2. Service Worker
  const sw = await navigator.serviceWorker.getRegistration();
  console.log('2. Service Worker:', sw ? '✅' : '❌');

  // 3. Manifest
  const manifests = document.querySelectorAll('link[rel="manifest"]');
  console.log('3. Manifest:', manifests.length > 0 ? '✅' : '❌');

  // 4. Уже установлено?
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  console.log('4. Installed:', isStandalone ? '✅ (уже установлено)' : '❌');

  // 5. beforeinstallprompt доступен?
  console.log('5. Install prompt available:', window.deferredPrompt ? '✅' : '❌');
}

checkPWA();
```

---

## 🎯 Ожидаемое поведение

### На Android Chrome:
1. Откройте сайт
2. Консоль: `💡 PWA install prompt is available and saved globally!`
3. Кнопка "Установить приложение" появляется
4. **Клик** → **Нативный диалог Chrome**:
   ```
   ┌─────────────────────────────┐
   │  Установить приложение?     │
   │                             │
   │  Intellect Pro School       │
   │  - Spelling Bee             │
   │                             │
   │  [Установить]  [Отмена]     │
   └─────────────────────────────┘
   ```

### На iOS Safari:
1. Откройте сайт
2. Кнопка "Установить приложение" появляется
3. **Клик** → **Модальное окно с инструкциями** (это нормально!)
4. Пользователь следует инструкциям вручную

---

## 🚨 Частые проблемы

### Проблема 1: Событие не срабатывает

**Причины:**
- Приложение уже установлено
- Пользователь отклонил установку ранее
- Критерии PWA не выполнены

**Решение:**
```javascript
// В консоли проверьте:
localStorage.clear(); // Очистить localStorage
// Затем перезагрузить страницу
```

---

### Проблема 2: "Install prompt not available"

**В консоли видите:**
```
⚠️ PWA install prompt not available
```

**Решение:**
1. Проверьте что Service Worker активен
2. Проверьте что manifest загружен
3. Перезагрузите страницу
4. Проверьте HTTPS

---

### Проблема 3: Показывается инструкция вместо диалога

**Это нормально, если:**
- ✅ Вы на **iOS** (Safari не поддерживает нативный диалог)
- ✅ Вы на **Firefox** (не поддерживает PWA установку)
- ✅ Событие `beforeinstallprompt` еще не произошло

**Это проблема, если:**
- ❌ Вы на **Chrome Android** и ожидаете нативный диалог

---

## 🎓 Итоговая памятка

### Для показа нативного диалога нужно:

1. ✅ **HTTPS** (или localhost)
2. ✅ **Service Worker** зарегистрирован
3. ✅ **Manifest** валиден
4. ✅ **Chrome/Edge** браузер
5. ✅ **Приложение НЕ установлено**
6. ✅ **beforeinstallprompt** событие произошло

### Команды для проверки:

```javascript
// Запустите в консоли:

// 1. Проверить что глобальная функция доступна:
window.getInstallPrompt

// 2. Проверить Service Worker:
navigator.serviceWorker.getRegistration()

// 3. Очистить все и начать заново:
localStorage.clear();
location.reload();
```

---

## 📞 Нужна помощь?

Если ничего не помогло:

1. Откройте DevTools → **Console**
2. Скопируйте все логи
3. Откройте DevTools → **Application**
4. Сделайте скриншот секции **Service Workers** и **Manifest**
5. Пришлите мне информацию

---

**Удачи! 🚀**
