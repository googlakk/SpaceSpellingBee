# Гибкая система TTS - Руководство по настройке

## Что было сделано

Создана гибкая архитектура для работы с разными TTS-провайдерами (OpenAI и ElevenLabs), которая позволяет:

✅ Использовать любой провайдер (OpenAI или ElevenLabs)
✅ Легко переключаться между провайдерами
✅ Настраивать разные провайдеры для разных языков
✅ Добавлять новые провайдеры без изменения существующего кода
✅ Использовать единый API для всех провайдеров

## Структура новой системы

```
src/shared/api/tts/
├── types.ts                    # Общие типы и интерфейсы
├── TTSManager.ts               # Менеджер провайдеров (Singleton)
├── providers/
│   ├── OpenAIProvider.ts       # OpenAI TTS провайдер
│   └── ElevenLabsProvider.ts   # ElevenLabs TTS провайдер
├── index.ts                    # Главный экспорт
└── README.md                   # Документация
```

## Шаг 1: Настройка Environment Variables

### OpenAI (уже настроен)
```env
VITE_OPENAI_API_KEY=rXf7SHnkJnFoLGdJ92b8DfYzrUyNyy7Oh2kgcE9L
```

### ElevenLabs (опционально)
Если хотите использовать ElevenLabs, добавьте в `.env`:
```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Шаг 2: Миграция базы данных

Выполните SQL миграцию для добавления поддержки TTS провайдеров:

```sql
-- Добавляет колонку tts_provider в таблицу languages
ALTER TABLE languages
ADD COLUMN IF NOT EXISTS tts_provider TEXT
CHECK (tts_provider IN ('openai', 'elevenlabs'));

-- Устанавливает OpenAI как провайдер по умолчанию
UPDATE languages
SET tts_provider = 'openai'
WHERE tts_provider IS NULL;
```

Полная миграция находится в файле `MIGRATION_TTS_PROVIDER.sql`

## Шаг 3: Использование в коде

### Простой пример

```typescript
import { ttsManager } from '@/shared/api/tts';

// Использование OpenAI
const config = {
  provider: 'openai',
  voiceId: 'onyx',
  settings: {
    model: 'tts-1-hd',
    speed: 0.85
  }
};

const audioBlob = await ttsManager.generateSpeech('Hello world', config);
const audio = new Audio(URL.createObjectURL(audioBlob));
await audio.play();
```

### С данными из базы

```typescript
import { supabase } from '@/shared/api/supabase';
import { ttsManager } from '@/shared/api/tts';

// Получаем язык
const { data: language } = await supabase
  .from('languages')
  .select('*')
  .eq('id', languageId)
  .single();

// Создаем конфигурацию
const config = {
  provider: language.tts_provider || 'openai',
  voiceId: language.voice_id || 'onyx',
  settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
};

// Генерируем речь
const audioBlob = await ttsManager.generateSpeech(text, config);
```

## Шаг 4: Настройка провайдеров в админке

В админ-панели вы можете настроить TTS для каждого языка:

1. **Выбор провайдера**: OpenAI или ElevenLabs
2. **Выбор голоса**: Список доступных голосов для выбранного провайдера
3. **Настройки**: Специфичные настройки для провайдера

### OpenAI настройки:
- **Model**: `tts-1` (стандарт) или `tts-1-hd` (высокое качество)
- **Speed**: 0.25 - 4.0 (рекомендуется 0.85 для четкой дикции)

### ElevenLabs настройки:
- **Stability**: 0-1 (стабильность голоса)
- **Similarity Boost**: 0-1 (сходство с оригинальным голосом)
- **Style**: 0-1 (стилизация)
- **Use Speaker Boost**: true/false (усиление голоса)

## Шаг 5: Проверка доступности провайдеров

```typescript
import { ttsManager } from '@/shared/api/tts';

// Проверка OpenAI
const isOpenAIReady = ttsManager.isProviderConfigured('openai');
console.log('OpenAI:', isOpenAIReady ? '✓ Ready' : '✗ Not configured');

// Проверка ElevenLabs
const isElevenLabsReady = ttsManager.isProviderConfigured('elevenlabs');
console.log('ElevenLabs:', isElevenLabsReady ? '✓ Ready' : '✗ Not configured');
```

## Рекомендации по использованию

### Когда использовать OpenAI:
- ✅ Образовательные приложения (четкая дикция)
- ✅ Необходима стабильность и предсказуемость
- ✅ Ограниченный бюджет (более доступная цена)
- ✅ Простота настройки

**Рекомендованные настройки:**
```typescript
{
  model: 'tts-1-hd',  // Высокое качество
  speed: 0.85         // Четкое произношение слов
}
```

**Лучший голос для обучения:** `onyx` (профессиональный мужской голос)

### Когда использовать ElevenLabs:
- ✅ Нужно максимально естественное звучание
- ✅ Важна эмоциональность речи
- ✅ Множество языков с правильными акцентами
- ✅ Готовы платить больше за качество

**Рекомендованные настройки:**
```typescript
{
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
}
```

## Примеры использования

Смотрите файл `TTS_USAGE_EXAMPLES.md` для подробных примеров:

1. Базовое использование
2. Работа с базой данных
3. Генерация и сохранение аудио
4. Переключение между провайдерами
5. Получение списка голосов
6. React компоненты
7. Batch-генерация
8. Обработка ошибок
9. И многое другое!

## Миграция старого кода

Старый код продолжит работать, но рекомендуется постепенно мигрировать на новую систему:

### Было:
```typescript
import { generateSpeech } from '@/shared/api/openai-tts';
const blob = await generateSpeech(text, voiceId, settings);
```

### Стало:
```typescript
import { ttsManager } from '@/shared/api/tts';
const config = { provider: 'openai', voiceId, settings };
const blob = await ttsManager.generateSpeech(text, config);
```

## Добавление нового провайдера

Если в будущем потребуется добавить новый TTS-сервис:

1. Создайте класс, реализующий интерфейс `ITTSProvider`
2. Зарегистрируйте его в `TTSManager`
3. Добавьте тип в `TTSProviderType`
4. Готово! Система автоматически поддержит новый провайдер

## Преимущества новой системы

1. **Гибкость**: Легко переключаться между OpenAI и ElevenLabs
2. **Масштабируемость**: Добавление новых провайдеров занимает минуты
3. **Единый API**: Один интерфейс для всех сервисов
4. **Типобезопасность**: Полная поддержка TypeScript
5. **Централизация**: Все настройки TTS в одном месте
6. **Обратная совместимость**: Старый код продолжает работать

## Поддержка

Если возникнут вопросы:
1. Смотрите `src/shared/api/tts/README.md` - полная документация
2. Смотрите `TTS_USAGE_EXAMPLES.md` - примеры использования
3. Проверьте `MIGRATION_TTS_PROVIDER.sql` - SQL миграция

## Что дальше?

1. Выполните SQL миграцию
2. Настройте провайдеры для каждого языка в админке
3. Начните использовать новый API в коде
4. Наслаждайтесь гибкостью! 🚀
