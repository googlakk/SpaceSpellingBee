import { useState, useRef } from 'react';
import { supabase, Level, Sublevel, Language } from '@/shared/api/supabase';
import { ttsManager } from '@/shared/api/tts';
import { TTSProviderType, TTSProviderConfig } from '@/shared/api/tts/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, RefreshCw, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

export const WordsImport = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sublevels, setSublevels] = useState<Sublevel[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [wordListText, setWordListText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      loadLevels(selectedLanguage);
    } else {
      setLevels([]);
      setSelectedLevel('');
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedLevel) {
      loadSublevels(selectedLevel);
    } else {
      setSublevels([]);
      setSelectedSublevel('');
    }
  }, [selectedLevel]);

  const loadLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Failed to load languages');
    }
  };

  const loadLevels = async (languageId: string) => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('language_id', languageId)
        .order('order_index');

      if (error) throw error;
      setLevels(data || []);
      setSelectedLevel('');
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Failed to load levels');
    }
  };

  const loadSublevels = async (levelId: string) => {
    try {
      const { data, error } = await supabase
        .from('sublevels')
        .select('*')
        .eq('level_id', levelId)
        .order('order_index');

      if (error) throw error;
      setSublevels(data || []);
      setSelectedSublevel('');
    } catch (error) {
      console.error('Error loading sublevels:', error);
      toast.error('Failed to load sublevels');
    }
  };

  const parseWordList = (text: string): string[] => {
    // Split by newlines and filter out empty lines
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedLanguage || !selectedLevel || !selectedSublevel) {
      toast.error('Please select language, level, and sublevel first');
      return;
    }

    try {
      const text = await file.text();
      const words = parseWordList(text);

      if (words.length === 0) {
        toast.error('No words found in file');
        return;
      }

      await processWords(words);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    }
  };

  const processWords = async (words: string[]) => {
    setIsUploading(true);
    setProgress(0);

    const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
    if (!selectedLanguageData) {
      toast.error('No language selected');
      setIsUploading(false);
      return;
    }

    const supportsAutoAudio = !!selectedLanguageData.voice_id;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      setCurrentWord(word);

      try {
        // IMPORTANT: Check if word already exists BEFORE generating audio
        const { data: existingWord } = await supabase
          .from('words')
          .select('id, word')
          .eq('sublevel_id', selectedSublevel)
          .eq('word', word)
          .maybeSingle();

        if (existingWord) {
          if (replaceExisting) {
            // Delete existing word and its audio
            console.log(`🔄 Word "${word}" exists, replacing...`);

            // Delete old audio from storage if exists
            if (existingWord.audio_url) {
              try {
                const urlPath = existingWord.audio_url.split('/word-audio/')[1];
                if (urlPath) {
                  await supabase.storage.from('word-audio').remove([urlPath]);
                }
              } catch (e) {
                console.warn('Could not delete old audio:', e);
              }
            }

            // Delete the word record
            await supabase.from('words').delete().eq('id', existingWord.id);
          } else {
            console.log(`⏭️ Word "${word}" already exists in this sublevel, skipping...`);
            skippedCount++;
            setProgress(((i + 1) / words.length) * 100);
            continue;
          }
        }

        let audioUrl: string | null = null;

        if (supportsAutoAudio && selectedLanguageData.voice_id) {
          try {
            // Get TTS provider and voice settings
            const provider: TTSProviderType = (selectedLanguageData.tts_provider as TTSProviderType) || 'elevenlabs';
            let voiceSettings = selectedLanguageData.voice_settings;

            // If language doesn't have specific voice settings, try to get from global config
            if (!voiceSettings) {
              try {
                const { data: configData } = await supabase
                  .from('app_config')
                  .select('default_voice_settings')
                  .single();

                if (configData?.default_voice_settings) {
                  voiceSettings = configData.default_voice_settings;
                }
              } catch (error) {
                console.warn('Could not load config voice settings:', error);
              }
            }

            // Use default settings if none available
            if (!voiceSettings) {
              voiceSettings = ttsManager.getDefaultSettings(provider);
            }

            console.log(`🎙️ Generating audio for new word: "${word}" using ${provider}`);

            const ttsConfig: TTSProviderConfig = {
              provider,
              voiceId: selectedLanguageData.voice_id,
              settings: voiceSettings,
            };

            const audioBlob = await ttsManager.generateSpeech(word, ttsConfig);

            const fileName = `${selectedSublevel}/${word.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp3`;
            const { error: uploadError } = await supabase.storage
              .from('word-audio')
              .upload(fileName, audioBlob, {
                contentType: 'audio/mpeg',
                upsert: false,
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
            } else {
              const { data: urlData } = supabase.storage
                .from('word-audio')
                .getPublicUrl(fileName);
              audioUrl = urlData.publicUrl;
            }
          } catch (audioError) {
            console.warn(`Could not generate audio for "${word}":`, audioError);
          }
        }

        const { error: insertError } = await supabase.from('words').insert({
          sublevel_id: selectedSublevel,
          word: word,
          language_id: selectedLanguage,
          audio_url: audioUrl,
          audio_generated: !!audioUrl,
        });

        if (insertError) {
          throw insertError;
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing word "${word}":`, error);
        errorCount++;
      }

      setProgress(((i + 1) / words.length) * 100);
    }

    setIsUploading(false);
    setCurrentWord('');
    setProgress(0);

    // Build detailed result message
    const parts: string[] = [];

    if (successCount > 0) {
      parts.push(`✅ Imported ${successCount} new word${successCount !== 1 ? 's' : ''}`);
    }

    if (skippedCount > 0) {
      parts.push(`⏭️ Skipped ${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''}`);
    }

    if (errorCount > 0) {
      parts.push(`❌ ${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    }

    if (successCount > 0 || skippedCount > 0) {
      let message = parts.join(' | ');

      if (!supportsAutoAudio) {
        message += ' (No voice configured - audio not generated)';
      }

      toast.success(message, { duration: 5000 });
    } else {
      toast.error('Failed to import any words.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setWordListText('');
  };

  const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
  const supportsAutoAudio = !!selectedLanguageData?.voice_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Words</CardTitle>
        <CardDescription>
          Import words from a file or paste them directly. Audio will be generated automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Language Selection */}
          <div>
            <Label>Select Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.flag_emoji} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          <div>
            <Label>Select Level</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sublevel Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Sublevel</Label>
              {selectedLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSublevels(selectedLevel)}
                  disabled={isUploading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={selectedSublevel}
              onValueChange={setSelectedSublevel}
              disabled={!selectedLevel || sublevels.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    sublevels.length === 0 && selectedLevel
                      ? "No sublevels found - create one first"
                      : "Choose a sublevel"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sublevels.map((sublevel) => (
                  <SelectItem key={sublevel.id} value={sublevel.id}>
                    {sublevel.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sublevels.length === 0 && selectedLevel && (
              <p className="text-sm text-muted-foreground mt-1">
                No sublevels available. Please create a sublevel in the "Levels & Sublevels" tab first.
              </p>
            )}
          </div>

          {/* Replace Existing Toggle */}
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="replace-existing" className="text-orange-900 dark:text-orange-100">Replace existing words</Label>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                If enabled, existing words will be deleted and their audio regenerated
              </p>
            </div>
            <Switch
              id="replace-existing"
              checked={replaceExisting}
              onCheckedChange={setReplaceExisting}
              disabled={isUploading}
            />
          </div>

          {/* Text Input Section */}
          <div className="space-y-3">
            <Label>Paste Word List</Label>
            <Textarea
              placeholder="sun&#10;get&#10;run&#10;find&#10;fun&#10;take&#10;down&#10;road&#10;sing&#10;grow"
              value={wordListText}
              onChange={(e) => setWordListText(e.target.value)}
              disabled={isUploading || !selectedSublevel}
              className="min-h-[150px] font-mono"
            />
            <Button
              onClick={() => {
                const words = parseWordList(wordListText);
                if (words.length === 0) {
                  toast.error('Please enter at least one word');
                  return;
                }
                processWords(words);
              }}
              disabled={!selectedSublevel || isUploading || !wordListText.trim()}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Type className="mr-2 h-4 w-4" />
                  Import from Text ({parseWordList(wordListText).length} words)
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or upload a file</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={!selectedSublevel || isUploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedSublevel || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Word List (.txt, .csv)
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {selectedLanguageData && !supportsAutoAudio && "⚠ No voice configured. Audio will not be generated."}
              {selectedLanguageData && supportsAutoAudio && "✓ Voice configured. Audio will be generated automatically."}
              {!selectedLanguageData && "Select a language to see audio generation status."}
            </p>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="truncate max-w-[80%]">Processing: {currentWord}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        {/* Format Example */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">File Format</h4>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
            {`sun
get
run
find
fun
take
down
road
sing
grow`}
          </pre>
          <p className="text-sm text-blue-800 mt-2">
            • One word per line
            <br />
            • Empty lines will be ignored
            <br />
            • Text or CSV files accepted
            <br />
            • Duplicates will be automatically skipped
            <br />
            • Audio will be generated for each new word
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
