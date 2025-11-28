import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { ttsManager } from '@/shared/api/tts';
import { TTSVoice } from '@/shared/api/tts/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface ConfigData {
  default_voice_id: string;
  default_voice_name: string;
  default_voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const ConfigManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);

  const [config, setConfig] = useState<ConfigData>({
    default_voice_id: 'nPczCjzI2devNBz1zQrb', // Default voice
    default_voice_name: 'Default Voice',
    default_voice_settings: {
      stability: 0.54,
      similarity_boost: 0.47,
      style: 0.47,
      use_speaker_boost: true,
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
        // Ensure voice settings have correct structure for ElevenLabs TTS
        const voiceSettings = data.default_voice_settings || {};
        const normalizedSettings = {
          stability: typeof voiceSettings.stability === 'number' ? voiceSettings.stability : 0.54,
          similarity_boost: typeof voiceSettings.similarity_boost === 'number' ? voiceSettings.similarity_boost : 0.47,
          style: typeof voiceSettings.style === 'number' ? voiceSettings.style : 0.47,
          use_speaker_boost: typeof voiceSettings.use_speaker_boost === 'boolean' ? voiceSettings.use_speaker_boost : true,
        };

        setConfig({
          default_voice_id: data.default_voice_id || 'nPczCjzI2devNBz1zQrb',
          default_voice_name: data.default_voice_name || 'Default Voice',
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
      const voiceList = await ttsManager.getAvailableVoices('elevenlabs');
      setVoices(voiceList);
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Failed to load ElevenLabs voices. Make sure your API key is configured.');
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
            Configure the default ElevenLabs TTS voice for text-to-speech. This will be used when a language doesn't have a specific voice assigned.
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
              Select a voice from your ElevenLabs account for text-to-speech
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
                {voices.find(v => v.voice_id === config.default_voice_id)?.description || 'ElevenLabs voice'}
              </div>
            </div>
          )}

          {/* Voice Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Default Voice Settings</h4>

            {/* Stability */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Stability</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((config.default_voice_settings?.stability ?? 0.54) * 100)}%
                </span>
              </div>
              <Slider
                value={[(config.default_voice_settings?.stability ?? 0.54) * 100]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      stability: v[0] / 100,
                    },
                  })
                }
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values = more consistent, lower values = more varied. Recommended: 54%
              </p>
            </div>

            {/* Similarity Boost */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Similarity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((config.default_voice_settings?.similarity_boost ?? 0.47) * 100)}%
                </span>
              </div>
              <Slider
                value={[(config.default_voice_settings?.similarity_boost ?? 0.47) * 100]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      similarity_boost: v[0] / 100,
                    },
                  })
                }
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How closely the voice matches the original. Recommended: 47%
              </p>
            </div>

            {/* Style Exaggeration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Style Exaggeration</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((config.default_voice_settings?.style ?? 0.47) * 100)}%
                </span>
              </div>
              <Slider
                value={[(config.default_voice_settings?.style ?? 0.47) * 100]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      style: v[0] / 100,
                    },
                  })
                }
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Expressiveness of the speech. Recommended: 47%
              </p>
            </div>

            {/* Speaker Boost */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="speaker-boost"
                checked={config.default_voice_settings?.use_speaker_boost ?? true}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      use_speaker_boost: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="speaker-boost" className="text-sm font-normal cursor-pointer">
                Enable speaker boost (recommended for clarity)
              </Label>
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
          <CardTitle>About ElevenLabs TTS Voice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • This default voice will be used for any language that doesn't have a specific voice assigned.
          </p>
          <p>
            • You can override this setting for individual languages in the "Languages" tab.
          </p>
          <p>
            • Make sure your ElevenLabs API key is configured in the .env file (VITE_ELEVENLABS_API_KEY).
          </p>
          <p>
            • <strong>Stability (54%)</strong>: Balances consistency with natural variation in speech.
          </p>
          <p>
            • <strong>Similarity (47%)</strong>: Controls how closely the voice matches the original character.
          </p>
          <p>
            • <strong>Style (47%)</strong>: Adds expressiveness while maintaining clarity for educational content.
          </p>
          <p>
            • <strong>Speaker Boost</strong>: Enhances clarity and quality, recommended for clear word pronunciation.
          </p>
          <p>
            • Using <strong>eleven_multilingual_v2</strong> model with text normalization disabled for accurate word-only pronunciation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
