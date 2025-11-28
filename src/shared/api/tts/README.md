# TTS (Text-to-Speech) System

Гибкая система озвучивания текста с поддержкой нескольких провайдеров.

## Архитектура

Система построена на паттерне Strategy с использованием абстрактного интерфейса `ITTSProvider`, что позволяет легко добавлять новые TTS-сервисы.

```
tts/
├── types.ts                 # Общие типы и интерфейсы
├── TTSManager.ts            # Менеджер провайдеров (Singleton)
├── providers/
│   ├── OpenAIProvider.ts    # OpenAI TTS
│   └── ElevenLabsProvider.ts # ElevenLabs TTS
└── index.ts                 # Экспорты
```

## Поддерживаемые провайдеры

### OpenAI TTS
- **Модели**: `tts-1`, `tts-1-hd`
- **Голоса**: onyx, echo, alloy, fable, nova, shimmer
- **Настройки**: скорость (0.25-4.0x)
- **Преимущества**: Высокое качество, стабильность, разумная цена

### ElevenLabs
- **Модель**: `eleven_multilingual_v2` (рекомендуется для образовательного контента)
- **Голоса**: Динамический список через API (получение через `/v1/voices`)
- **Настройки**:
  - `stability` (0-1): Консистентность речи. **Рекомендуется: 0.54**
  - `similarity_boost` (0-1): Точность воспроизведения голоса. **Рекомендуется: 0.47**
  - `style` (0-1): Экспрессивность речи. **Рекомендуется: 0.47**
  - `use_speaker_boost` (boolean): Улучшение четкости. **Рекомендуется: true**
- **Специальные параметры**:
  - `apply_text_normalization`: `'off'` - отключает преобразование текста (важно для произношения отдельных слов)
  - `previous_text`, `next_text`: пустые строки - отключает контекстное дополнение
- **Преимущества**: Очень естественное звучание, многоязычность, точное произношение слов

## Использование

### Базовое использование

```typescript
import { ttsManager } from '@/shared/api/tts';

// Использование с конфигурацией
const config = {
  provider: 'openai',
  voiceId: 'onyx',
  settings: {
    model: 'tts-1-hd',
    speed: 0.85
  }
};

const audioBlob = await ttsManager.generateSpeech('Hello world', config);

// Воспроизведение
const audio = new Audio(URL.createObjectURL(audioBlob));
await audio.play();
```

### Работа с языками

```typescript
import { Language } from '@/shared/api/supabase';
import { ttsManager, TTSProviderConfig } from '@/shared/api/tts';

// Получение конфигурации из языка
const language: Language = {
  // ... данные языка
  tts_provider: 'openai',
  voice_id: 'onyx',
  voice_name: 'Onyx',
  voice_settings: {
    model: 'tts-1-hd',
    speed: 0.85
  }
};

// Создание конфигурации
const config: TTSProviderConfig = {
  provider: language.tts_provider || 'openai',
  voiceId: language.voice_id || 'onyx',
  voiceName: language.voice_name,
  settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
};

// Генерация речи
const audioBlob = await ttsManager.generateSpeech(text, config);
```

### Получение списка голосов

```typescript
// OpenAI (фиксированный список)
const openaiVoices = await ttsManager.getAvailableVoices('openai');

// ElevenLabs (динамический список через API)
const elevenLabsVoices = await ttsManager.getAvailableVoices('elevenlabs');

// Пример структуры голоса
// {
//   voice_id: 'onyx',
//   name: 'Onyx',
//   description: 'Professional male voice...'
// }
```

### Переключение между провайдерами

```typescript
// Проверка доступности
if (ttsManager.isProviderConfigured('openai')) {
  // OpenAI доступен
}

// Смена провайдера по умолчанию
ttsManager.setDefaultProvider('elevenlabs');

// Использование с настройками по умолчанию
const audioBlob = await ttsManager.generateSpeechWithDefaults('Hello');
```

### Получение настроек по умолчанию

```typescript
// OpenAI
const openaiSettings = ttsManager.getDefaultSettings('openai');
// { model: 'tts-1-hd', speed: 0.85 }

// ElevenLabs
const elevenLabsSettings = ttsManager.getDefaultSettings('elevenlabs');
// { stability: 0.54, similarity_boost: 0.47, style: 0.47, use_speaker_boost: true }
```

## Обработка ошибок

```typescript
import {
  TTSProviderError,
  TTSProviderNotConfiguredError
} from '@/shared/api/tts';

try {
  const audioBlob = await ttsManager.generateSpeech(text, config);
} catch (error) {
  if (error instanceof TTSProviderNotConfiguredError) {
    console.error('Provider not configured:', error.provider);
  } else if (error instanceof TTSProviderError) {
    console.error('TTS error:', error.message);
    console.error('Provider:', error.provider);
  }
}
```

## Добавление нового провайдера

1. Создайте класс, реализующий `ITTSProvider`:

```typescript
import { ITTSProvider, TTSProviderType, TTSVoice, TTSSettings } from '../types';

export class MyTTSProvider implements ITTSProvider {
  readonly type: TTSProviderType = 'myprovider';

  isConfigured(): boolean {
    // Проверка API ключа
  }

  getDefaultSettings(): TTSSettings {
    // Настройки по умолчанию
  }

  getDefaultVoiceId(): string {
    // ID голоса по умолчанию
  }

  async generateSpeech(text: string, voiceId: string, settings: TTSSettings): Promise<Blob> {
    // Генерация речи
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // Получение списка голосов
  }
}
```

2. Зарегистрируйте в `TTSManager`:

```typescript
// В методе initializeProviders()
this.providers.set('myprovider', new MyTTSProvider());
```

3. Добавьте тип в `types.ts`:

```typescript
export type TTSProviderType = 'openai' | 'elevenlabs' | 'myprovider';
```

## Конфигурация в базе данных

### Таблица `languages`

```sql
ALTER TABLE languages
ADD COLUMN tts_provider TEXT CHECK (tts_provider IN ('openai', 'elevenlabs')),
ADD COLUMN voice_id TEXT,
ADD COLUMN voice_name TEXT,
ADD COLUMN voice_settings JSONB;
```

### Пример записи

```json
{
  "id": "...",
  "name": "English",
  "tts_provider": "openai",
  "voice_id": "onyx",
  "voice_name": "Onyx",
  "voice_settings": {
    "model": "tts-1-hd",
    "speed": 0.85
  }
}
```

## Рекомендации

### OpenAI
- **Используйте для**: Образовательных приложений, четкой дикции
- **Модель**: `tts-1-hd` для лучшего качества
- **Голос**: `onyx` для профессионального звучания
- **Скорость**: 0.85x для четкого произношения слов

### ElevenLabs
- **Используйте для**: Натурального звучания, точного произношения отдельных слов, многоязычного контента
- **Модель**: `eleven_multilingual_v2` для поддержки множества языков
- **Настройки для образовательного контента**:
  - Stability: 54% (баланс между консистентностью и естественностью)
  - Similarity: 47% (точное воспроизведение характера голоса)
  - Style: 47% (умеренная экспрессивность)
  - Speaker Boost: включен (четкость произношения)
- **Важно**:
  - Отключайте `apply_text_normalization` для точного произношения слов без контекста
  - Используйте пустые `previous_text` и `next_text` чтобы избежать автодополнения
- **Преимущество**: Отличная поддержка акцентов и языков, идеально для произношения отдельных слов

## Environment Variables

```env
# OpenAI TTS
VITE_OPENAI_API_KEY=your_openai_api_key

# ElevenLabs TTS
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## Миграция со старого кода

### Было (openai-tts.ts):
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

## Преимущества новой системы

1. ✅ **Гибкость**: Легко переключаться между провайдерами
2. ✅ **Расширяемость**: Простое добавление новых TTS-сервисов
3. ✅ **Единый интерфейс**: Одинаковый API для всех провайдеров
4. ✅ **Типобезопасность**: Полная поддержка TypeScript
5. ✅ **Обратная совместимость**: Старый код продолжает работать
6. ✅ **Централизация**: Все настройки в одном месте
