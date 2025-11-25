# Примеры использования новой TTS системы

## 1. Базовое использование с OpenAI

```typescript
import { ttsManager, TTSProviderConfig } from '@/shared/api/tts';

// Простой пример с OpenAI
async function playWord(word: string) {
  const config: TTSProviderConfig = {
    provider: 'openai',
    voiceId: 'onyx',
    settings: {
      model: 'tts-1-hd',
      speed: 0.85
    }
  };

  try {
    const audioBlob = await ttsManager.generateSpeech(word, config);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();

    // Очистка после воспроизведения
    audio.onended = () => URL.revokeObjectURL(audioUrl);
  } catch (error) {
    console.error('Failed to play audio:', error);
  }
}
```

## 2. Использование с языками из базы данных

```typescript
import { supabase, Language } from '@/shared/api/supabase';
import { ttsManager, TTSProviderConfig } from '@/shared/api/tts';

async function playWordForLanguage(word: string, languageId: string) {
  // Получаем язык из базы
  const { data: language } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (!language) {
    throw new Error('Language not found');
  }

  // Создаем конфигурацию из данных языка
  const config: TTSProviderConfig = {
    provider: language.tts_provider || 'openai',
    voiceId: language.voice_id || 'onyx',
    voiceName: language.voice_name,
    settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
  };

  // Генерируем и воспроизводим
  const audioBlob = await ttsManager.generateSpeech(word, config);
  const audio = new Audio(URL.createObjectURL(audioBlob));
  await audio.play();
}
```

## 3. Генерация аудио для слов с сохранением

```typescript
import { supabase, Word } from '@/shared/api/supabase';
import { ttsManager } from '@/shared/api/tts';

async function generateAndSaveAudio(wordId: string) {
  // Получаем слово и язык
  const { data: word } = await supabase
    .from('words')
    .select(`
      *,
      languages:language_id (
        tts_provider,
        voice_id,
        voice_name,
        voice_settings
      )
    `)
    .eq('id', wordId)
    .single();

  if (!word || !word.languages) return;

  const language = word.languages;

  // Создаем конфигурацию
  const config = {
    provider: language.tts_provider || 'openai',
    voiceId: language.voice_id || 'onyx',
    settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
  };

  // Генерируем аудио
  const audioBlob = await ttsManager.generateSpeech(word.word, config);

  // Сохраняем в Supabase Storage
  const fileName = `${wordId}.mp3`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('word-audio')
    .upload(fileName, audioBlob, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (uploadError) throw uploadError;

  // Получаем публичный URL
  const { data: urlData } = supabase.storage
    .from('word-audio')
    .getPublicUrl(fileName);

  // Обновляем запись слова
  await supabase
    .from('words')
    .update({
      audio_url: urlData.publicUrl,
      audio_generated: true
    })
    .eq('id', wordId);
}
```

## 4. Переключение между провайдерами

```typescript
import { ttsManager } from '@/shared/api/tts';

// Проверка доступности провайдеров
const isOpenAIAvailable = ttsManager.isProviderConfigured('openai');
const isElevenLabsAvailable = ttsManager.isProviderConfigured('elevenlabs');

console.log('OpenAI:', isOpenAIAvailable ? 'Available' : 'Not configured');
console.log('ElevenLabs:', isElevenLabsAvailable ? 'Available' : 'Not configured');

// Использование конкретного провайдера
async function generateWithSpecificProvider(
  text: string,
  provider: 'openai' | 'elevenlabs'
) {
  if (!ttsManager.isProviderConfigured(provider)) {
    throw new Error(`Provider ${provider} is not configured`);
  }

  const config = ttsManager.createDefaultConfig(provider);
  return await ttsManager.generateSpeech(text, config);
}

// OpenAI
const openaiAudio = await generateWithSpecificProvider('Hello', 'openai');

// ElevenLabs
const elevenLabsAudio = await generateWithSpecificProvider('Hello', 'elevenlabs');
```

## 5. Получение списка голосов

```typescript
import { ttsManager, TTSVoice } from '@/shared/api/tts';

// Получение голосов OpenAI (локальный список)
async function getOpenAIVoices() {
  const voices = await ttsManager.getAvailableVoices('openai');
  console.log('OpenAI voices:', voices);
  /*
  [
    { voice_id: 'onyx', name: 'Onyx', description: '...' },
    { voice_id: 'echo', name: 'Echo', description: '...' },
    ...
  ]
  */
}

// Получение голосов ElevenLabs (через API)
async function getElevenLabsVoices() {
  if (!ttsManager.isProviderConfigured('elevenlabs')) {
    console.log('ElevenLabs not configured');
    return [];
  }

  const voices = await ttsManager.getAvailableVoices('elevenlabs');
  console.log('ElevenLabs voices:', voices);
  return voices;
}
```

## 6. Компонент для настройки TTS провайдера

```typescript
import { useState, useEffect } from 'react';
import { ttsManager } from '@/shared/api/tts';
import { supabase, Language } from '@/shared/api/supabase';

function TTSProviderSelector({ language }: { language: Language }) {
  const [provider, setProvider] = useState(language.tts_provider || 'openai');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(language.voice_id || '');

  useEffect(() => {
    loadVoices();
  }, [provider]);

  async function loadVoices() {
    if (!ttsManager.isProviderConfigured(provider)) {
      console.log(`Provider ${provider} not configured`);
      return;
    }

    const voiceList = await ttsManager.getAvailableVoices(provider);
    setVoices(voiceList);
  }

  async function saveSettings() {
    const settings = ttsManager.getDefaultSettings(provider);

    await supabase
      .from('languages')
      .update({
        tts_provider: provider,
        voice_id: selectedVoice,
        voice_settings: settings
      })
      .eq('id', language.id);
  }

  return (
    <div>
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option value="openai">OpenAI TTS</option>
        <option value="elevenlabs">ElevenLabs</option>
      </select>

      <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
        {voices.map(voice => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {voice.name}
          </option>
        ))}
      </select>

      <button onClick={saveSettings}>Save</button>
    </div>
  );
}
```

## 7. Batch-генерация аудио

```typescript
import { ttsManager } from '@/shared/api/tts';
import { supabase } from '@/shared/api/supabase';

async function generateAudioForAllWords(sublevelId: string) {
  // Получаем все слова подуровня
  const { data: words } = await supabase
    .from('words')
    .select(`
      *,
      languages:language_id (
        tts_provider,
        voice_id,
        voice_settings
      )
    `)
    .eq('sublevel_id', sublevelId)
    .is('audio_url', null); // Только слова без аудио

  if (!words || words.length === 0) return;

  console.log(`Generating audio for ${words.length} words...`);

  for (const word of words) {
    try {
      const language = word.languages;

      const config = {
        provider: language.tts_provider || 'openai',
        voiceId: language.voice_id || 'onyx',
        settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
      };

      // Генерируем аудио
      const audioBlob = await ttsManager.generateSpeech(word.word, config);

      // Сохраняем в Storage
      const fileName = `${word.id}.mp3`;
      await supabase.storage
        .from('word-audio')
        .upload(fileName, audioBlob, { upsert: true });

      const { data: urlData } = supabase.storage
        .from('word-audio')
        .getPublicUrl(fileName);

      // Обновляем базу
      await supabase
        .from('words')
        .update({
          audio_url: urlData.publicUrl,
          audio_generated: true
        })
        .eq('id', word.id);

      console.log(`✓ Generated audio for "${word.word}"`);
    } catch (error) {
      console.error(`✗ Failed to generate audio for "${word.word}":`, error);
    }
  }

  console.log('Audio generation complete!');
}
```

## 8. Использование в React Hook

```typescript
import { useState, useCallback } from 'react';
import { ttsManager, TTSProviderConfig } from '@/shared/api/tts';
import { toast } from 'sonner';

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playText = useCallback(async (text: string, config: TTSProviderConfig) => {
    if (isPlaying) {
      toast.warning('Audio is already playing');
      return;
    }

    setIsPlaying(true);

    try {
      const audioBlob = await ttsManager.generateSpeech(text, config);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast.error('Failed to play audio');
      };

      await audio.play();
    } catch (error) {
      setIsPlaying(false);
      console.error('TTS Error:', error);
      toast.error('Failed to generate audio');
    }
  }, [isPlaying]);

  return { playText, isPlaying };
}

// Использование в компоненте
function WordCard({ word, language }) {
  const { playText, isPlaying } = useTTS();

  const handlePlay = () => {
    const config = {
      provider: language.tts_provider || 'openai',
      voiceId: language.voice_id || 'onyx',
      settings: language.voice_settings || ttsManager.getDefaultSettings('openai')
    };

    playText(word.word, config);
  };

  return (
    <div>
      <h3>{word.word}</h3>
      <button onClick={handlePlay} disabled={isPlaying}>
        {isPlaying ? 'Playing...' : 'Play Audio'}
      </button>
    </div>
  );
}
```

## 9. Обработка ошибок

```typescript
import {
  ttsManager,
  TTSProviderError,
  TTSProviderNotConfiguredError
} from '@/shared/api/tts';

async function safeGenerateSpeech(text: string, config: TTSProviderConfig) {
  try {
    return await ttsManager.generateSpeech(text, config);
  } catch (error) {
    if (error instanceof TTSProviderNotConfiguredError) {
      console.error(`Provider ${error.provider} is not configured`);
      console.error('Please check your environment variables');

      // Попробуем альтернативный провайдер
      const fallbackProvider = error.provider === 'openai' ? 'elevenlabs' : 'openai';

      if (ttsManager.isProviderConfigured(fallbackProvider)) {
        console.log(`Falling back to ${fallbackProvider}`);
        const fallbackConfig = {
          ...config,
          provider: fallbackProvider
        };
        return await ttsManager.generateSpeech(text, fallbackConfig);
      }

      throw new Error('No TTS providers configured');
    }

    if (error instanceof TTSProviderError) {
      console.error('TTS Provider Error:', error.message);
      console.error('Provider:', error.provider);
      console.error('Original error:', error.originalError);
    }

    throw error;
  }
}
```

## 10. Миграция старого кода

### Было:
```typescript
import { generateSpeech } from '@/shared/api/openai-tts';

// Старый код
const audioBlob = await generateSpeech(text, 'onyx', {
  model: 'tts-1-hd',
  speed: 0.85
});
```

### Стало:
```typescript
import { ttsManager } from '@/shared/api/tts';

// Новый код
const config = {
  provider: 'openai',
  voiceId: 'onyx',
  settings: {
    model: 'tts-1-hd',
    speed: 0.85
  }
};

const audioBlob = await ttsManager.generateSpeech(text, config);
```

Новая система более гибкая и позволяет легко переключаться между провайдерами!
