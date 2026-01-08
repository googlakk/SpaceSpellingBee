import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  is_active: boolean;
  tts_provider: 'openai' | 'elevenlabs' | 'kokoro' | null; // TTS provider type
  voice_id: string | null;
  voice_name: string | null;
  voice_settings: Record<string, any> | null; // Flexible settings for any provider
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  language_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Sublevel {
  id: string;
  level_id: string;
  name: string;
  display_name: string;
  order_index: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  sublevel_id: string;
  word: string;
  language_id: string;
  audio_url: string | null;
  audio_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppConfig {
  id: string;
  default_voice_id: string;
  default_voice_name: string;
  default_voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  created_at: string;
  updated_at: string;
}
