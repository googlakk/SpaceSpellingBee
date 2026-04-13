import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { ttsManager } from '@/shared/api/tts';
import { TTSVoice, OpenAITTSSettings } from '@/shared/api/tts/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

interface ConfigData {
  default_voice_id: string;
  default_voice_name: string;
  default_voice_settings: OpenAITTSSettings;
}

const OPENAI_BROADCAST_DEFAULTS: ConfigData = {
  default_voice_id: 'onyx',
  default_voice_name: 'Onyx',
  default_voice_settings: {
    model: 'gpt-4o-mini-tts',
    speed: 0.92,
    instruction: 'Speak like a professional male announcer with a low, warm, confident tone. Keep the diction crisp, clean, and precise. Sound natural, lively, and studio-quality. Pronounce only the provided word, with no added words or spelling.',
  },
};

export const ConfigManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);

  const [config, setConfig] = useState<ConfigData>(OPENAI_BROADCAST_DEFAULTS);

  useEffect(() => {
    loadConfig();
    loadVoices();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const voiceSettings = data.default_voice_settings || {};
        setConfig({
          default_voice_id: data.default_voice_id || OPENAI_BROADCAST_DEFAULTS.default_voice_id,
          default_voice_name: data.default_voice_name || OPENAI_BROADCAST_DEFAULTS.default_voice_name,
          default_voice_settings: {
            model: ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts', 'gpt-4o-mini-audio-preview'].includes(voiceSettings.model)
              ? (voiceSettings.model === 'gpt-4o-mini-audio-preview' ? 'gpt-4o-mini-tts' : voiceSettings.model)
              : OPENAI_BROADCAST_DEFAULTS.default_voice_settings.model,
            speed: typeof voiceSettings.speed === 'number'
              ? voiceSettings.speed
              : OPENAI_BROADCAST_DEFAULTS.default_voice_settings.speed,
            instruction: typeof voiceSettings.instruction === 'string'
              ? voiceSettings.instruction
              : OPENAI_BROADCAST_DEFAULTS.default_voice_settings.instruction,
          },
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadVoices = async () => {
    try {
      const voiceList = await ttsManager.getAvailableVoices('openai');
      setVoices(voiceList);
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Failed to load OpenAI voices. Make sure VITE_OPENAI_API_KEY is configured.');
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    setConfig({
      ...config,
      default_voice_id: voiceId,
      default_voice_name: voice?.name || 'Custom Voice',
    });
  };

  const handleSaveConfig = async () => {
    if (!config.default_voice_id) {
      toast.error('Please select a default voice');
      return;
    }

    setSaving(true);
    try {
      const { data: existingConfig } = await supabase
        .from('app_config')
        .select('id')
        .single();

      if (existingConfig) {
        const { error } = await supabase
          .from('app_config')
          .update({
            default_voice_id: config.default_voice_id,
            default_voice_name: config.default_voice_name,
            default_voice_settings: config.default_voice_settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_config')
          .insert({
            default_voice_id: config.default_voice_id,
            default_voice_name: config.default_voice_name,
            default_voice_settings: config.default_voice_settings,
          });

        if (error) throw error;
      }

      toast.success('OpenAI voice configuration saved successfully.');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default OpenAI Voice</CardTitle>
          <CardDescription>
            Configure the global OpenAI TTS voice used when a language does not override its own settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Select Default Voice</Label>
            <Select value={config.default_voice_id} onValueChange={handleVoiceChange}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a default voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="font-medium">{voice.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              `Onyx` is the recommended low male voice for clear dictionary-style pronunciation.
            </p>
          </div>

          {config.default_voice_id && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Current: {config.default_voice_name}
                </span>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {voices.find(v => v.voice_id === config.default_voice_id)?.description || 'OpenAI voice'}
              </div>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Voice Settings</h4>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Model</Label>
                <span className="text-sm text-muted-foreground">{config.default_voice_settings.model}</span>
              </div>
              <Select
                value={config.default_voice_settings.model}
                onValueChange={(model: 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts') =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      model,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini-tts">gpt-4o-mini-tts</SelectItem>
                  <SelectItem value="tts-1-hd">tts-1-hd</SelectItem>
                  <SelectItem value="tts-1">tts-1</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                `gpt-4o-mini-tts` uses the current OpenAI TTS endpoint and supports `speed` directly.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Speed</Label>
                <span className="text-sm text-muted-foreground">{config.default_voice_settings.speed.toFixed(2)}x</span>
              </div>
              <Slider
                value={[config.default_voice_settings.speed]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      speed: v[0],
                    },
                  })
                }
                min={0.75}
                max={1.15}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Slightly slower speech improves diction for spelling exercises. Recommended: `0.92x`.
              </p>
            </div>

            <div>
              <Label>Instruction</Label>
              <Textarea
                className="mt-2 min-h-28"
                value={config.default_voice_settings.instruction || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      instruction: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use this to force announcer-style delivery, but keep the rule that only the word should be spoken.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={saving || !config.default_voice_id}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving configuration...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This configuration targets a low male announcer voice using OpenAI `Onyx`.
          </p>
          <p>
            Set `VITE_OPENAI_API_KEY` in your environment before using generation from the admin panel.
          </p>
          <p>
            Existing languages with their own `tts_provider` and `voice_settings` will keep those values until updated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
