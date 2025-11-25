import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableVoices, OpenAIVoice } from '@/shared/api/openai-tts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface ConfigData {
  default_voice_id: string;
  default_voice_name: string;
  default_voice_settings: {
    model: 'tts-1' | 'tts-1-hd';
    speed: number;
  };
}

export const ConfigManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voices, setVoices] = useState<OpenAIVoice[]>([]);

  const [config, setConfig] = useState<ConfigData>({
    default_voice_id: 'onyx', // Default to professional male voice
    default_voice_name: 'Onyx',
    default_voice_settings: {
      model: 'tts-1-hd',
      speed: 0.85, // Slightly slower for clear pronunciation
    },
  });

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
        // Ensure voice settings have correct structure for OpenAI TTS
        const voiceSettings = data.default_voice_settings || {};
        const normalizedSettings = {
          model: (voiceSettings.model === 'tts-1' || voiceSettings.model === 'tts-1-hd')
            ? voiceSettings.model
            : 'tts-1-hd',
          speed: typeof voiceSettings.speed === 'number' ? voiceSettings.speed : 0.85,
        };

        setConfig({
          default_voice_id: data.default_voice_id || 'onyx',
          default_voice_name: data.default_voice_name || 'Onyx',
          default_voice_settings: normalizedSettings,
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
      const voiceList = await getAvailableVoices();
      setVoices(voiceList);
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Failed to load voices');
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
      // Check if config exists
      const { data: existingConfig } = await supabase
        .from('app_config')
        .select('id')
        .single();

      if (existingConfig) {
        // Update existing config
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
        // Insert new config
        const { error } = await supabase
          .from('app_config')
          .insert({
            default_voice_id: config.default_voice_id,
            default_voice_name: config.default_voice_name,
            default_voice_settings: config.default_voice_settings,
          });

        if (error) throw error;
      }

      toast.success('Configuration saved successfully!');
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
          <CardTitle>Default Voice Configuration</CardTitle>
          <CardDescription>
            Configure the default OpenAI TTS voice for text-to-speech. This will be used when a language doesn't have a specific voice assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
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
              <strong>Recommended:</strong> Onyx - Professional male voice with clear, measured delivery
            </p>
          </div>

          {/* Current Selected Voice */}
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

          {/* Voice Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Default Voice Settings</h4>

            {/* Model Selection */}
            <div>
              <Label>Quality Model</Label>
              <Select
                value={config.default_voice_settings.model}
                onValueChange={(value: 'tts-1' | 'tts-1-hd') =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      model: value,
                    },
                  })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tts-1">
                    <div className="flex flex-col">
                      <span className="font-medium">tts-1</span>
                      <span className="text-xs text-muted-foreground">Standard quality (faster, lower cost)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tts-1-hd">
                    <div className="flex flex-col">
                      <span className="font-medium">tts-1-hd</span>
                      <span className="text-xs text-muted-foreground">High quality (recommended for education)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Speech Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {(config.default_voice_settings?.speed ?? 0.85).toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[config.default_voice_settings?.speed ?? 0.85]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      speed: v[0],
                    },
                  })
                }
                min={0.25}
                max={4.0}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground mt-1">
                0.85x is recommended for clear, professional narration. Range: 0.25x to 4.0x
              </p>
            </div>
          </div>

          {/* Save Button */}
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

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About OpenAI TTS Voice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • This default voice will be used for any language that doesn't have a specific voice assigned.
          </p>
          <p>
            • You can override this setting for individual languages in the "Languages" tab.
          </p>
          <p>
            • Make sure your OpenAI API key is configured in the .env file (VITE_OPENAI_API_KEY).
          </p>
          <p>
            • <strong>Onyx voice</strong> provides a professional male narrator tone, ideal for clear word pronunciation.
          </p>
          <p>
            • The <strong>tts-1-hd model</strong> provides higher audio quality, perfect for educational content.
          </p>
          <p>
            • A speed of <strong>0.85x</strong> allows for clear, measured pronunciation that's easy to understand.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
