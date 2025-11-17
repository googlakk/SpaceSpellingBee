import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Volume2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableVoices, ElevenLabsVoice } from '@/shared/api/elevenlabs';
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
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);

  const [config, setConfig] = useState<ConfigData>({
    default_voice_id: '',
    default_voice_name: '',
    default_voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
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
        setConfig({
          default_voice_id: data.default_voice_id || '',
          default_voice_name: data.default_voice_name || '',
          default_voice_settings: data.default_voice_settings || config.default_voice_settings,
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
    setLoadingVoices(true);
    try {
      const voiceList = await getAvailableVoices();
      setVoices(voiceList);
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Failed to load voices. Check your ElevenLabs API key.');
    } finally {
      setLoadingVoices(false);
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
            Configure the default ElevenLabs voice for text-to-speech. This will be used when a language doesn't have a specific voice assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div>
            <Label>Select Default Voice</Label>
            {loadingVoices ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading voices...</span>
              </div>
            ) : voices.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  No voices found. Check your ElevenLabs API key in .env file.
                </span>
              </div>
            ) : (
              <Select value={config.default_voice_id} onValueChange={handleVoiceChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a default voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {voice.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Preview voices at{' '}
              <a
                href="https://elevenlabs.io/voice-library"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ElevenLabs Voice Library
              </a>
            </p>
          </div>

          {/* Manual Voice ID Input */}
          <div>
            <Label>Or Enter Voice ID Manually</Label>
            <Input
              className="mt-2"
              placeholder="e.g., EXAVITQu4vr4xnSDxMaL"
              value={config.default_voice_id}
              onChange={(e) => {
                setConfig({
                  ...config,
                  default_voice_id: e.target.value,
                  default_voice_name: 'Custom Voice',
                });
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find voice IDs in your ElevenLabs dashboard or voice library
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
                ID: {config.default_voice_id}
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
                  {config.default_voice_settings.stability.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[config.default_voice_settings.stability]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      stability: v[0],
                    },
                  })
                }
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make voice more consistent but less expressive
              </p>
            </div>

            {/* Similarity Boost */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Similarity Boost</Label>
                <span className="text-sm text-muted-foreground">
                  {config.default_voice_settings.similarity_boost.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[config.default_voice_settings.similarity_boost]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      similarity_boost: v[0],
                    },
                  })
                }
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make voice closer to the original
              </p>
            </div>

            {/* Style */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Style</Label>
                <span className="text-sm text-muted-foreground">
                  {config.default_voice_settings.style.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[config.default_voice_settings.style]}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      style: v[0],
                    },
                  })
                }
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values add more character and emotion to the voice
              </p>
            </div>

            {/* Speaker Boost */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Speaker Boost</Label>
                <p className="text-xs text-muted-foreground">
                  Enhance voice clarity (recommended)
                </p>
              </div>
              <Button
                variant={config.default_voice_settings.use_speaker_boost ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setConfig({
                    ...config,
                    default_voice_settings: {
                      ...config.default_voice_settings,
                      use_speaker_boost: !config.default_voice_settings.use_speaker_boost,
                    },
                  })
                }
              >
                {config.default_voice_settings.use_speaker_boost ? 'Enabled' : 'Disabled'}
              </Button>
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
          <CardTitle>About Voice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • This default voice will be used for any language that doesn't have a specific voice assigned.
          </p>
          <p>
            • You can override this setting for individual languages in the "Languages" tab.
          </p>
          <p>
            • Make sure your ElevenLabs API key is configured in the .env.local file.
          </p>
          <p>
            • Voice settings control the quality and characteristics of the generated speech.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
