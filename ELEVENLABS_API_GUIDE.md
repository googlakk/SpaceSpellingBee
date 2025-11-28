# ElevenLabs Text-to-Speech API - Полное руководство

## Обзор

ElevenLabs предоставляет высококачественный Text-to-Speech API с поддержкой множества языков и естественным звучанием. Этот документ описывает интеграцию ElevenLabs API в приложение SpellingBee.

## API Endpoints

### Base URL
```
https://api.elevenlabs.io/v1
```

### 1. Text-to-Speech (Генерация речи)

**Endpoint:** `POST /text-to-speech/{voice_id}`

**Заголовки:**
```http
Content-Type: application/json
xi-api-key: YOUR_API_KEY
Accept: audio/mpeg
```

**Параметры URL:**
- `voice_id` (обязательный): ID голоса для использования

**Тело запроса:**
```json
{
  "text": "Слово или текст для озвучки",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.54,
    "similarity_boost": 0.47,
    "style": 0.47,
    "use_speaker_boost": true
  },
  "apply_text_normalization": "off",
  "previous_text": "",
  "next_text": ""
}
```

**Ответ:**
- Бинарные данные аудио в формате MP3
- Content-Type: `audio/mpeg`

**Пример использования:**
```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: 'hello',
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.54,
        similarity_boost: 0.47,
        style: 0.47,
        use_speaker_boost: true
      },
      apply_text_normalization: 'off',
      previous_text: '',
      next_text: '',
    }),
  }
);

const audioBlob = await response.blob();
```

### 2. Get Voices (Получение списка голосов)

**Endpoint:** `GET /voices`

**Заголовки:**
```http
xi-api-key: YOUR_API_KEY
```

**Ответ:**
```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade",
      "description": "Young female voice",
      "labels": {
        "accent": "american",
        "description": "calm",
        "age": "young",
        "gender": "female",
        "use_case": "narration"
      }
    }
  ]
}
```

**Пример использования:**
```typescript
const response = await fetch('https://api.elevenlabs.io/v1/voices', {
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
  },
});

const data = await response.json();
const voices = data.voices;
```

## Параметры Voice Settings

### stability (Стабильность)
- **Диапазон:** 0.0 - 1.0
- **Рекомендуется:** 0.54
- **Описание:** Контролирует консистентность произношения
  - **Низкие значения (0.0-0.4):** Более выразительная, вариативная речь
  - **Средние значения (0.4-0.6):** Баланс между стабильностью и естественностью
  - **Высокие значения (0.6-1.0):** Максимально консистентное произношение

### similarity_boost (Схожесть с оригиналом)
- **Диапазон:** 0.0 - 1.0
- **Рекомендуется:** 0.47
- **Описание:** Насколько точно воспроизводится характер голоса
  - **Низкие значения:** Более креативная интерпретация
  - **Высокие значения:** Максимальная схожесть с оригинальным голосом

### style (Стиль/Экспрессивность)
- **Диапазон:** 0.0 - 1.0
- **Рекомендуется:** 0.47
- **Описание:** Уровень экспрессии в речи
  - **0.0:** Нейтральная, монотонная речь
  - **0.5:** Умеренная экспрессивность
  - **1.0:** Максимальная эмоциональность

### use_speaker_boost (Усиление речи)
- **Тип:** boolean
- **Рекомендуется:** true
- **Описание:** Улучшает четкость и качество произношения, особенно для образовательного контента

## Специальные параметры

### apply_text_normalization
- **Значения:** `'auto'` | `'on'` | `'off'`
- **Рекомендуется:** `'off'` для произношения отдельных слов
- **Описание:**
  - `'auto'`: Автоматическое преобразование чисел, дат, аббревиатур
  - `'on'`: Принудительная нормализация
  - `'off'`: Отключение нормализации (важно для точного произношения слов как написано)

### previous_text и next_text
- **Тип:** string
- **Рекомендуется:** пустые строки `""` для изолированных слов
- **Описание:** Контекст для улучшения интонации
  - При озвучке отдельных слов обязательно оставляйте пустыми, чтобы избежать контекстного автодополнения

## Модели

### eleven_multilingual_v2
- **Рекомендуется для:** Образовательных приложений, многоязычного контента
- **Поддерживаемые языки:** 29+ языков включая английский, испанский, французский, немецкий, польский, итальянский, португальский, хинди, арабский и другие
- **Преимущества:**
  - Высокое качество произношения
  - Естественные интонации
  - Хорошая поддержка акцентов
  - Оптимизирована для чтения текста

### Другие модели
- `eleven_turbo_v2`: Более быстрая генерация с хорошим качеством
- `eleven_turbo_v2_5`: Улучшенная версия turbo
- `eleven_monolingual_v1`: Только английский, высокое качество

## Рекомендуемые настройки для SpellingBee

### Для произношения отдельных слов
```json
{
  "text": "слово",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.54,
    "similarity_boost": 0.47,
    "style": 0.47,
    "use_speaker_boost": true
  },
  "apply_text_normalization": "off",
  "previous_text": "",
  "next_text": ""
}
```

**Обоснование:**
- `stability: 0.54` - баланс для четкого, но естественного произношения
- `similarity_boost: 0.47` - сохраняет характер голоса без артефактов
- `style: 0.47` - умеренная экспрессивность для обучения
- `use_speaker_boost: true` - максимальная четкость
- `apply_text_normalization: 'off'` - произносит слово точно как написано
- Пустые `previous_text` и `next_text` - нет контекстного влияния

### Для предложений и фраз
```json
{
  "text": "Полное предложение для озвучки.",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.60,
    "similarity_boost": 0.75,
    "style": 0.35,
    "use_speaker_boost": true
  },
  "apply_text_normalization": "auto"
}
```

## Обработка ошибок

### 401 Unauthorized
- **Причина:** Неверный или истекший API ключ
- **Решение:** Проверьте ключ в `.env` файле, создайте новый на https://elevenlabs.io/app/settings/api-keys

### 400 Bad Request
- **Причина:** Некорректные параметры запроса
- **Решение:** Проверьте формат voice_settings и других параметров

### 422 Unprocessable Entity
- **Причина:** Текст слишком длинный или voice_id не существует
- **Решение:** Уменьшите текст, проверьте voice_id

### 429 Too Many Requests
- **Причина:** Превышен лимит запросов
- **Решение:** Добавьте retry logic с exponential backoff

### Пример обработки ошибок:
```typescript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.blob();
} catch (error) {
  console.error('TTS generation failed:', error);
  throw error;
}
```

## Лимиты и квоты

- **Free tier:** 10,000 символов/месяц
- **Starter:** 30,000 символов/месяц
- **Creator:** 100,000 символов/месяц
- **Pro:** 500,000 символов/месяц

Проверить использование: https://elevenlabs.io/app/usage

## Best Practices

### 1. Кэширование аудио
```typescript
// Сохраняйте сгенерированные аудио в storage
const fileName = `${word}_${voiceId}_${Date.now()}.mp3`;
await supabase.storage
  .from('word-audio')
  .upload(fileName, audioBlob);
```

### 2. Повторное использование
```typescript
// Проверяйте существование аудио перед генерацией
const { data } = await supabase
  .from('words')
  .select('audio_url')
  .eq('word', word)
  .single();

if (data?.audio_url) {
  return data.audio_url; // Используем существующее
}
```

### 3. Обработка ошибок
```typescript
// Используйте fallback на другой провайдер
try {
  return await elevenLabsGenerate(text);
} catch (error) {
  console.warn('ElevenLabs failed, falling back to OpenAI');
  return await openAIGenerate(text);
}
```

### 4. Оптимизация для образования
- Используйте `eleven_multilingual_v2` для поддержки разных языков
- Отключайте text normalization для точного произношения
- Включайте speaker boost для четкости
- Используйте стабильные настройки (stability ~0.5-0.6)

## Примеры кода

### Генерация с повтором при ошибке
```typescript
async function generateWithRetry(
  text: string,
  config: TTSProviderConfig,
  maxRetries = 3
): Promise<Blob> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ttsManager.generateSpeech(text, config);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}
```

### Пакетная генерация
```typescript
async function generateBatch(words: string[], voiceId: string) {
  const results = [];

  for (const word of words) {
    try {
      const audio = await ttsManager.generateSpeech(word, {
        provider: 'elevenlabs',
        voiceId,
        settings: {
          stability: 0.54,
          similarity_boost: 0.47,
          style: 0.47,
          use_speaker_boost: true
        }
      });

      results.push({ word, audio, success: true });

      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({ word, error, success: false });
    }
  }

  return results;
}
```

## Полезные ссылки

- **API Documentation:** https://elevenlabs.io/docs/api-reference/text-to-speech
- **Dashboard:** https://elevenlabs.io/app
- **API Keys:** https://elevenlabs.io/app/settings/api-keys
- **Usage:** https://elevenlabs.io/app/usage
- **Voice Library:** https://elevenlabs.io/voice-library
- **Models:** https://elevenlabs.io/docs/model-overview

## Заключение

ElevenLabs API предоставляет мощные возможности для генерации естественной речи. Правильная конфигурация параметров критична для образовательного контента - отключайте нормализацию текста и контекстное дополнение для точного произношения отдельных слов.
