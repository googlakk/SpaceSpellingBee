# ElevenLabs API - Устранение неполадок

## Ошибка 401 Unauthorized

### Симптомы
```
POST https://api.elevenlabs.io/v1/text-to-speech/... 401 (Unauthorized)
GET https://api.elevenlabs.io/v1/voices 401 (Unauthorized)
Error loading voices: TTSProviderError: Failed to get available voices: Failed to fetch voices: 401
```

### Причины

1. **Неправильный API ключ**
   - Ключ скопирован не полностью
   - Опечатка при копировании
   - Ключ содержит лишние пробелы

2. **Истекший API ключ**
   - Старый ключ больше не действителен
   - Ключ был удален на платформе ElevenLabs

3. **Неактивный аккаунт**
   - Закончились кредиты
   - Аккаунт заблокирован или приостановлен
   - Не подтвержден email

4. **Недостаточно прав**
   - API ключ создан без необходимых разрешений

### Решение

#### Шаг 1: Получите новый API ключ

1. Откройте https://elevenlabs.io/app/settings/api-keys
2. Войдите в свой аккаунт
3. Нажмите "Create new key"
4. Скопируйте ключ **полностью** (он начинается с `sk_`)

**Важно:** Ключ отображается только один раз! Сохраните его в безопасном месте.

#### Шаг 2: Обновите .env файл

1. Откройте файл `.env` в корне проекта
2. Найдите строку `VITE_ELEVENLABS_API_KEY=...`
3. Замените на новый ключ:
   ```env
   VITE_ELEVENLABS_API_KEY=sk_ваш_новый_ключ_здесь
   ```
4. **Проверьте:**
   - Нет пробелов в начале/конце
   - Ключ начинается с `sk_`
   - Нет кавычек вокруг ключа

#### Шаг 3: Перезапустите сервер

```bash
# Остановите текущий сервер (Ctrl+C в терминале)
# Затем запустите снова:
npm run dev
```

**Важно:** Изменения в `.env` файле требуют перезапуска сервера!

#### Шаг 4: Проверьте работу

1. Откройте админ-панель
2. Перейдите в раздел "Config" или "Languages"
3. Попробуйте выбрать голос ElevenLabs
4. Если список голосов загрузился - всё работает!

### Проверка баланса

Убедитесь, что у вас есть доступные кредиты:

1. Откройте https://elevenlabs.io/app/usage
2. Проверьте раздел "Character usage"
3. Убедитесь, что лимит не исчерпан

**Free tier:** 10,000 символов/месяц

### Проверка статуса аккаунта

1. Откройте https://elevenlabs.io/app
2. Убедитесь, что email подтвержден
3. Проверьте, что аккаунт активен
4. Проверьте раздел billing (если применимо)

### Тестирование API ключа

Протестируйте ключ напрямую через curl:

```bash
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: ВАШ_API_КЛЮЧ"
```

**Ожидаемый результат:** JSON со списком голосов

**Если 401:** Ключ неправильный, создайте новый

### Частые ошибки

#### 1. Пробелы в .env
```env
# ❌ Неправильно
VITE_ELEVENLABS_API_KEY = sk_...
VITE_ELEVENLABS_API_KEY= sk_...

# ✅ Правильно
VITE_ELEVENLABS_API_KEY=sk_...
```

#### 2. Кавычки в .env
```env
# ❌ Неправильно
VITE_ELEVENLABS_API_KEY="sk_..."
VITE_ELEVENLABS_API_KEY='sk_...'

# ✅ Правильно
VITE_ELEVENLABS_API_KEY=sk_...
```

#### 3. Не перезапущен сервер
После изменения .env **обязательно** перезапустите dev-сервер!

#### 4. Неполный ключ
ElevenLabs API ключи обычно длинные (~50+ символов). Убедитесь, что скопировали полностью.

### Пример правильной конфигурации .env

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key

# TTS Providers
VITE_OPENAI_API_KEY=sk-proj-...
VITE_ELEVENLABS_API_KEY=sk_40e2438ae5dec8365b97d8dec3b30ba2f7f44285af69b100
VITE_ADMIN_PASSWORD=admin123
```

### Если проблема не решена

1. **Попробуйте другой браузер** - иногда проблема в кэше
2. **Очистите кэш браузера** - Ctrl+Shift+Delete
3. **Проверьте консоль браузера** - F12 → Console tab
4. **Создайте совершенно новый API ключ** на ElevenLabs
5. **Проверьте, работает ли сайт ElevenLabs** - https://status.elevenlabs.io/

### Контакт поддержки

Если ничего не помогло:
- **ElevenLabs Support:** support@elevenlabs.io
- **Documentation:** https://elevenlabs.io/docs
- **Discord Community:** https://discord.gg/elevenlabs

### Альтернатива: Использование OpenAI

Если ElevenLabs не работает, можете временно переключиться на OpenAI:

1. Откройте `src/shared/api/tts/TTSManager.ts`
2. Измените строку 22:
   ```typescript
   private defaultProvider: TTSProviderType = 'openai';
   ```
3. Обновите языки в БД:
   ```sql
   UPDATE languages SET tts_provider = 'openai';
   ```

## Другие распространенные ошибки

### 422 Unprocessable Entity
- **Причина:** Неверный voice_id или слишком длинный текст
- **Решение:** Проверьте voice_id, сократите текст

### 429 Too Many Requests
- **Причина:** Превышен rate limit
- **Решение:** Добавьте задержки между запросами, используйте retry logic

### Network Error / CORS
- **Причина:** Проблемы с сетью или настройками браузера
- **Решение:** Проверьте интернет-соединение, отключите VPN/прокси

## Проверочный чек-лист

- [ ] API ключ скопирован полностью из ElevenLabs dashboard
- [ ] В .env файле нет пробелов и кавычек вокруг ключа
- [ ] Ключ начинается с `sk_`
- [ ] Dev-сервер перезапущен после изменения .env
- [ ] У аккаунта есть доступные кредиты
- [ ] Email аккаунта подтвержден
- [ ] API ключ не был удален на платформе
- [ ] Браузер обновлен, кэш очищен

После прохождения всех пунктов озвучка должна заработать!
