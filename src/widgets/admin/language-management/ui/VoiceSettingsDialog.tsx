import { useState, useEffect } from 'react';
import { Language } from '@/shared/api/supabase';
import {
  ttsManager,
  TTSProviderType,
  TTSVoice,
  OpenAITTSSettings,
  ElevenLabsTTSSettings,
  KokoroTTSSettings,
} from '@/shared/api/tts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Volume2, Zap, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface VoiceSettingsDialogProps {
  language: Language | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    provider: TTSProviderType,
    voiceId: string,
    voiceName: string,
    settings: any
  ) => Promise<void>;
}

export const VoiceSettingsDialog = ({
  language,
  open,
  onOpenChange,
  onSave,
}: VoiceSettingsDialogProps) => {
  // Provider selection
  const [provider, setProvider] = useState<TTSProviderType>('openai');
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Common settings
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  // OpenAI settings
  const [openaiModel, setOpenaiModel] = useState<'tts-1' | 'tts-1-hd'>('tts-1-hd');
  const [openaiSpeed, setOpenaiSpeed] = useState(0.85);

  // ElevenLabs settings
  const [elevenLabsStability, setElevenLabsStability] = useState(0.5);
  const [elevenLabsSimilarity, setElevenLabsSimilarity] = useState(0.75);
  const [elevenLabsStyle, setElevenLabsStyle] = useState(0.0);
  const [elevenLabsSpeakerBoost, setElevenLabsSpeakerBoost] = useState(true);

  // Kokoro settings
  const [kokoroSpeed, setKokoroSpeed] = useState(1.0);

  const [saving, setSaving] = useState(false);

  // Load initial settings from language
  useEffect(() => {
    if (open && language) {
      const currentProvider = (language.tts_provider as TTSProviderType) || 'openai';
      const savedVoiceId = language.voice_id || '';
      const savedVoiceName = language.voice_name || '';

      setProvider(currentProvider);
      setSelectedVoiceId(savedVoiceId);
      setSelectedVoiceName(savedVoiceName);

      // Load settings based on provider
      if (language.voice_settings) {
        if (currentProvider === 'openai') {
          setOpenaiModel(language.voice_settings.model || 'tts-1-hd');
          setOpenaiSpeed(language.voice_settings.speed || 0.85);
        } else if (currentProvider === 'elevenlabs') {
          setElevenLabsStability(language.voice_settings.stability || 0.5);
          setElevenLabsSimilarity(language.voice_settings.similarity_boost || 0.75);
          setElevenLabsStyle(language.voice_settings.style || 0.0);
          setElevenLabsSpeakerBoost(language.voice_settings.use_speaker_boost ?? true);
        } else if (currentProvider === 'kokoro') {
          setKokoroSpeed(language.voice_settings.speed || 1.0);
        }
      }

      loadVoices(currentProvider, savedVoiceId);
    }
  }, [open, language]);

  // Load voices when provider changes (user manually changes provider)
  const handleProviderChangeWithVoiceLoad = (newProvider: TTSProviderType) => {
    handleProviderChange(newProvider);
    loadVoices(newProvider, ''); // Empty means use default
  };

  const loadVoices = async (providerType: TTSProviderType, preserveVoiceId: string = '') => {
    if (!ttsManager.isProviderConfigured(providerType)) {
      const providerNames: Record<TTSProviderType, string> = {
        openai: 'OpenAI',
        elevenlabs: 'ElevenLabs',
        kokoro: 'Kokoro',
      };
      toast.error(`${providerNames[providerType]} is not configured`);
      setVoices([]);
      return;
    }

    setLoadingVoices(true);
    try {
      const voiceList = await ttsManager.getAvailableVoices(providerType);
      setVoices(voiceList);

      // Only set default voice if no voice is preserved
      if (!preserveVoiceId && voiceList.length > 0) {
        const defaultVoice = ttsManager.getProvider(providerType).getDefaultVoiceId();
        const voice = voiceList.find(v => v.voice_id === defaultVoice) || voiceList[0];
        setSelectedVoiceId(voice.voice_id);
        setSelectedVoiceName(voice.name);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Failed to load voices');
      setVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleProviderChange = (newProvider: TTSProviderType) => {
    setProvider(newProvider);
    setSelectedVoiceId('');
    setSelectedVoiceName('');

    // Load default settings for new provider
    const defaultSettings = ttsManager.getDefaultSettings(newProvider);
    if (newProvider === 'openai') {
      const openaiSettings = defaultSettings as OpenAITTSSettings;
      setOpenaiModel(openaiSettings.model);
      setOpenaiSpeed(openaiSettings.speed);
    } else if (newProvider === 'elevenlabs') {
      const elevenLabsSettings = defaultSettings as ElevenLabsTTSSettings;
      setElevenLabsStability(elevenLabsSettings.stability);
      setElevenLabsSimilarity(elevenLabsSettings.similarity_boost);
      setElevenLabsStyle(elevenLabsSettings.style);
      setElevenLabsSpeakerBoost(elevenLabsSettings.use_speaker_boost);
    } else if (newProvider === 'kokoro') {
      const kokoroSettings = defaultSettings as KokoroTTSSettings;
      setKokoroSpeed(kokoroSettings.speed);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    const voice = voices.find(v => v.voice_id === voiceId);
    if (voice) {
      setSelectedVoiceName(voice.name);
    }
  };

  const handleSave = async () => {
    if (!selectedVoiceId) {
      toast.error('Please select a voice');
      return;
    }

    setSaving(true);
    try {
      let settings: any;

      if (provider === 'openai') {
        settings = {
          model: openaiModel,
          speed: openaiSpeed,
        };
      } else if (provider === 'elevenlabs') {
        settings = {
          stability: elevenLabsStability,
          similarity_boost: elevenLabsSimilarity,
          style: elevenLabsStyle,
          use_speaker_boost: elevenLabsSpeakerBoost,
        };
      } else if (provider === 'kokoro') {
        settings = {
          speed: kokoroSpeed,
        };
      }

      await onSave(provider, selectedVoiceId, selectedVoiceName, settings);
      toast.success('Voice settings saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving voice settings:', error);
      toast.error('Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  };

  if (!language) return null;

  const isOpenAIConfigured = ttsManager.isProviderConfigured('openai');
  const isElevenLabsConfigured = ttsManager.isProviderConfigured('elevenlabs');
  const isKokoroConfigured = ttsManager.isProviderConfigured('kokoro');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language.flag_emoji} Voice Settings for {language.name}
          </DialogTitle>
          <DialogDescription>
            Configure Text-to-Speech provider and voice for this language
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div>
            <Label>TTS Provider</Label>
            <Select value={provider} onValueChange={(value: TTSProviderType) => handleProviderChangeWithVoiceLoad(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai" disabled={!isOpenAIConfigured}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">OpenAI TTS</span>
                      {!isOpenAIConfigured && <span className="text-xs text-red-500">(Not configured)</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">High quality, reliable, cost-effective</span>
                  </div>
                </SelectItem>
                <SelectItem value="elevenlabs" disabled={!isElevenLabsConfigured}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="font-medium">ElevenLabs</span>
                      {!isElevenLabsConfigured && <span className="text-xs text-red-500">(Not configured)</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">Ultra-realistic, natural sounding voices</span>
                  </div>
                </SelectItem>
                <SelectItem value="kokoro" disabled={!isKokoroConfigured}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span className="font-medium">Kokoro (Local)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Runs locally in browser, no API key needed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {provider === 'openai' && <><strong>OpenAI:</strong> Best for educational content with clear pronunciation</>}
              {provider === 'elevenlabs' && <><strong>ElevenLabs:</strong> Best for natural, expressive speech</>}
              {provider === 'kokoro' && <><strong>Kokoro:</strong> Free, runs locally via WebGPU. First use downloads ~80MB model.</>}
            </p>
          </div>

          {/* Voice Selection */}
          <div>
            <Label>Select Voice</Label>
            {loadingVoices ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading voices...</span>
              </div>
            ) : voices.length > 0 ? (
              <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <span className="font-medium">{voice.name}</span>
                        </div>
                        {voice.description && (
                          <span className="text-xs text-muted-foreground">{voice.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-red-500 mt-2">No voices available</div>
            )}
          </div>

          {/* Current Selected Voice */}
          {selectedVoiceId && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Current: {selectedVoiceName}
                </span>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {voices.find(v => v.voice_id === selectedVoiceId)?.description || `${provider} voice`}
              </div>
            </div>
          )}

          {/* Provider-Specific Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Voice Settings</h4>

            {provider === 'openai' && (
              <>
                {/* OpenAI Model Selection */}
                <div>
                  <Label>Quality Model</Label>
                  <Select
                    value={openaiModel}
                    onValueChange={(value: 'tts-1' | 'tts-1-hd') => setOpenaiModel(value)}
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

                {/* OpenAI Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Speech Speed</Label>
                    <span className="text-sm text-muted-foreground">{openaiSpeed.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[openaiSpeed]}
                    onValueChange={(v) => setOpenaiSpeed(v[0])}
                    min={0.25}
                    max={4.0}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0.85x recommended for clear, professional narration. Range: 0.25x to 4.0x
                  </p>
                </div>
              </>
            )}

            {provider === 'elevenlabs' && (
              <>
                {/* ElevenLabs Stability */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Stability</Label>
                    <span className="text-sm text-muted-foreground">{elevenLabsStability.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[elevenLabsStability]}
                    onValueChange={(v) => setElevenLabsStability(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher stability = more consistent voice. Lower = more variation and expressiveness.
                  </p>
                </div>

                {/* ElevenLabs Similarity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Similarity Boost</Label>
                    <span className="text-sm text-muted-foreground">{elevenLabsSimilarity.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[elevenLabsSimilarity]}
                    onValueChange={(v) => setElevenLabsSimilarity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher values enhance similarity to the original voice. Recommended: 0.75
                  </p>
                </div>

                {/* ElevenLabs Style */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Style Exaggeration</Label>
                    <span className="text-sm text-muted-foreground">{elevenLabsStyle.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[elevenLabsStyle]}
                    onValueChange={(v) => setElevenLabsStyle(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher values exaggerate the style of the voice. Use 0.0 for neutral speech.
                  </p>
                </div>

                {/* ElevenLabs Speaker Boost */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Speaker Boost</Label>
                    <p className="text-xs text-muted-foreground">
                      Enhances voice clarity and quality
                    </p>
                  </div>
                  <Switch
                    checked={elevenLabsSpeakerBoost}
                    onCheckedChange={setElevenLabsSpeakerBoost}
                  />
                </div>
              </>
            )}

            {provider === 'kokoro' && (
              <>
                {/* Kokoro Local Info */}
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    🖥️ Kokoro runs locally in your browser using WebGPU. No API key required!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    First use will download the model (~80MB). Subsequent uses are instant.
                  </p>
                </div>

                {/* Kokoro Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Speech Speed</Label>
                    <span className="text-sm text-muted-foreground">{kokoroSpeed.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[kokoroSpeed]}
                    onValueChange={(v) => setKokoroSpeed(v[0])}
                    min={0.5}
                    max={2.0}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1.0x is natural speed. Range: 0.5x to 2.0x
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !selectedVoiceId}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Voice Settings'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
