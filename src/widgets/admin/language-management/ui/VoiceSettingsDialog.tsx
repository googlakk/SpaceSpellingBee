import { useState, useEffect } from 'react';
import { Language } from '@/shared/api/supabase';
import { getAvailableVoices } from '@/shared/api/elevenlabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Volume2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSettingsDialogProps {
  language: Language | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (voiceId: string, voiceName: string, settings: any) => Promise<void>;
}

export const VoiceSettingsDialog = ({
  language,
  open,
  onOpenChange,
  onSave,
}: VoiceSettingsDialogProps) => {
  const [voices, setVoices] = useState<Array<{ voice_id: string; name: string }>>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadVoices();
      if (language) {
        setSelectedVoiceId(language.voice_id || '');
        setSelectedVoiceName(language.voice_name || '');
        if (language.voice_settings) {
          setStability(language.voice_settings.stability);
          setSimilarityBoost(language.voice_settings.similarity_boost);
          setStyle(language.voice_settings.style);
          setUseSpeakerBoost(language.voice_settings.use_speaker_boost);
        }
      }
    }
  }, [open, language]);

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
      const settings = {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      };

      await onSave(selectedVoiceId, selectedVoiceName, settings);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving voice settings:', error);
      toast.error('Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  };

  if (!language) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language.flag_emoji} Voice Settings for {language.name}
          </DialogTitle>
          <DialogDescription>
            Configure ElevenLabs text-to-speech voice for this language
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Selection */}
          <div>
            <Label>Select Voice</Label>
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
              <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice" />
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
              placeholder="e.g., EXAVITQu4vr4xnSDxMaL"
              value={selectedVoiceId}
              onChange={(e) => {
                setSelectedVoiceId(e.target.value);
                setSelectedVoiceName('Custom Voice');
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find voice IDs in your ElevenLabs dashboard
            </p>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Voice Settings</h4>

            {/* Stability */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Stability</Label>
                <span className="text-sm text-muted-foreground">{stability.toFixed(2)}</span>
              </div>
              <Slider
                value={[stability]}
                onValueChange={(v) => setStability(v[0])}
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
                <span className="text-sm text-muted-foreground">{similarityBoost.toFixed(2)}</span>
              </div>
              <Slider
                value={[similarityBoost]}
                onValueChange={(v) => setSimilarityBoost(v[0])}
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
                <span className="text-sm text-muted-foreground">{style.toFixed(2)}</span>
              </div>
              <Slider
                value={[style]}
                onValueChange={(v) => setStyle(v[0])}
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
                variant={useSpeakerBoost ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseSpeakerBoost(!useSpeakerBoost)}
              >
                {useSpeakerBoost ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
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
