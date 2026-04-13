import { useState, useEffect } from 'react';
import { supabase, Level, Sublevel, Language } from '@/shared/api/supabase';
import { ttsManager } from '@/shared/api/tts';
import { TTSProviderType, TTSProviderConfig } from '@/shared/api/tts/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Trash2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const OPENAI_DEFAULT_VOICE_SETTINGS = {
  model: 'gpt-4o-mini-tts' as const,
  speed: 0.92,
  instruction: 'Speak like a professional male announcer with a low, warm, confident tone. Keep the diction crisp, clean, and precise. Sound natural, lively, and studio-quality. Pronounce only the provided word, with no added words or spelling.',
};

const getAudioFileMeta = (blob: Blob) => {
  const mimeType = blob.type || 'audio/mpeg';
  if (mimeType.includes('wav')) {
    return { extension: 'wav', contentType: 'audio/wav' };
  }
  if (mimeType.includes('ogg')) {
    return { extension: 'ogg', contentType: 'audio/ogg' };
  }
  return { extension: 'mp3', contentType: 'audio/mpeg' };
};

export const WordAdd = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sublevels, setSublevels] = useState<Sublevel[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('');
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>('');

  // Form state
  const [wordText, setWordText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [regenerationProgress, setRegenerationProgress] = useState({ current: 0, total: 0 });

  // Word list state
  const [words, setWords] = useState<any[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedSublevel) {
      loadWords();
      setSearchQuery(''); // Reset search when changing sublevel
    }
  }, [selectedSublevel]);

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
      const { data: levelsData, error } = await supabase
        .from('levels')
        .select('*, languages(code)')
        .eq('language_id', languageId)
        .order('order_index');

      if (error) throw error;
      setLevels(levelsData || []);
      setSelectedLevel('');

      // Set current language code for audio generation
      if (levelsData && levelsData.length > 0 && (levelsData[0] as any).languages) {
        setCurrentLanguageCode((levelsData[0] as any).languages.code);
      }
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

  const loadWords = async () => {
    if (!selectedSublevel) return;

    setLoadingWords(true);
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('sublevel_id', selectedSublevel)
        .order('word');

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Failed to load words');
    } finally {
      setLoadingWords(false);
    }
  };

  const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
  const supportsAutoAudio = !!selectedLanguageData?.voice_id;

  const handleAddWord = async () => {
    if (!wordText.trim()) {
      toast.error('Please enter a word');
      return;
    }

    if (!selectedSublevel || !selectedLanguage) {
      toast.error('Please select a sublevel');
      return;
    }

    if (!supportsAutoAudio && !audioFile) {
      toast.error('Please upload an audio file for this word');
      return;
    }

    setIsSubmitting(true);

    try {
      // IMPORTANT: Check if word already exists in this sublevel BEFORE generating audio
      const { data: existingWord } = await supabase
        .from('words')
        .select('id, word')
        .eq('sublevel_id', selectedSublevel)
        .eq('word', wordText)
        .maybeSingle();

      if (existingWord) {
        toast.error(`Word "${wordText}" already exists in this sublevel!`);
        setIsSubmitting(false);
        return;
      }

      let audioUrl: string | null = null;

      if (supportsAutoAudio && selectedLanguageData?.voice_id) {
        try {
          // Get TTS provider and voice settings
          const provider: TTSProviderType = (selectedLanguageData.tts_provider as TTSProviderType) || 'openai';
          let voiceId = selectedLanguageData.voice_id;
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
            voiceSettings = provider === 'openai'
              ? OPENAI_DEFAULT_VOICE_SETTINGS
              : await ttsManager.getDefaultSettings(provider);
          }

          console.log('🎙️ Generating audio with Provider:', provider);
          console.log('🎙️ Voice ID:', voiceId);
          console.log('🎙️ Voice settings:', voiceSettings);

          const ttsConfig: TTSProviderConfig = {
            provider,
            voiceId,
            settings: voiceSettings as any,
          };

          const audioBlob = await ttsManager.generateSpeech(wordText, ttsConfig);
          const { extension, contentType } = getAudioFileMeta(audioBlob);
          const fileName = `${selectedSublevel}/${wordText.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('word-audio')
            .upload(fileName, audioBlob, {
              contentType,
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('word-audio')
            .getPublicUrl(fileName);
          audioUrl = urlData.publicUrl;

        } catch (error) {
          console.warn('Could not generate audio:', error);
          toast.warning('Word added but audio generation failed. Check voice settings.');
        }
      } else if (audioFile) {
        // Upload provided audio
        const { extension, contentType } = getAudioFileMeta(audioFile);
        const fileName = `${selectedSublevel}/${wordText.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('word-audio')
          .upload(fileName, audioFile, {
            contentType,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('word-audio')
          .getPublicUrl(fileName);
        audioUrl = urlData.publicUrl;
      }

      // Insert word into database
      const { error: insertError } = await supabase.from('words').insert({
        sublevel_id: selectedSublevel,
        word: wordText,
        language_id: selectedLanguage,
        audio_url: audioUrl,
        audio_generated: !!audioUrl,
      });

      if (insertError) throw insertError;

      toast.success(`Word "${wordText}" added successfully!`);

      // Reset form
      setWordText('');
      setAudioFile(null);

      // Reload words
      loadWords();
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error('Failed to add word');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateAudio = async (wordId: string, wordText: string) => {
    if (!supportsAutoAudio || !selectedLanguageData?.voice_id) {
      toast.error('Auto-generation is not supported for this language or missing voice settings.');
      return;
    }

    setIsRegenerating(wordId);
    try {
      // Get TTS provider and voice settings
      const provider: TTSProviderType = (selectedLanguageData.tts_provider as TTSProviderType) || 'openai';
      let voiceId = selectedLanguageData.voice_id;
      let voiceSettings = selectedLanguageData.voice_settings;

      if (!voiceSettings) {
        try {
          const { data: configData } = await supabase.from('app_config').select('default_voice_settings').single();
          if (configData?.default_voice_settings) {
            voiceSettings = configData.default_voice_settings;
          }
        } catch (error) {
          console.warn('Could not load config voice settings:', error);
        }
      }

      if (!voiceSettings) {
        voiceSettings = provider === 'openai'
          ? OPENAI_DEFAULT_VOICE_SETTINGS
          : await ttsManager.getDefaultSettings(provider);
      }

      const ttsConfig: TTSProviderConfig = {
        provider,
        voiceId,
        settings: voiceSettings as any,
      };

      const audioBlob = await ttsManager.generateSpeech(wordText, ttsConfig);
      const { extension, contentType } = getAudioFileMeta(audioBlob);
      const fileName = `${selectedSublevel}/${wordText.replace(/[^a-zA-Z0-9]/g, '_')}_regenerated_${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('word-audio')
        .upload(fileName, audioBlob, { contentType, upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('word-audio').getPublicUrl(fileName);
      const audioUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('words')
        .update({ audio_url: audioUrl, audio_generated: true })
        .eq('id', wordId);

      if (updateError) throw updateError;

      toast.success(`Audio for "${wordText}" regenerated successfully!`);
      loadWords();
    } catch (error) {
      console.error('Error regenerating audio:', error);
      toast.error('Failed to regenerate audio');
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleRegenerateAll = async () => {
    if (!words || words.length === 0) {
      toast.warning('No words to regenerate.');
      return;
    }

    if (!supportsAutoAudio || !selectedLanguageData?.voice_id) {
      toast.error('Auto-generation is not supported for this language or missing voice settings.');
      return;
    }

    if (!confirm(`Are you sure you want to regenerate audio for ALL ${words.length} words in this sublevel? This might take a while.`)) {
      return;
    }

    setIsRegeneratingAll(true);
    setRegenerationProgress({ current: 0, total: words.length });

    let successCount = 0;
    let failCount = 0;

    try {
      // Get TTS provider and voice settings
      const provider: TTSProviderType = (selectedLanguageData.tts_provider as TTSProviderType) || 'openai';
      let voiceId = selectedLanguageData.voice_id;
      let voiceSettings = selectedLanguageData.voice_settings;

      if (!voiceSettings) {
        try {
          const { data: configData } = await supabase.from('app_config').select('default_voice_settings').single();
          if (configData?.default_voice_settings) {
            voiceSettings = configData.default_voice_settings;
          }
        } catch (error) {
          console.warn('Could not load config voice settings:', error);
        }
      }

      if (!voiceSettings) {
        voiceSettings = provider === 'openai'
          ? OPENAI_DEFAULT_VOICE_SETTINGS
          : await ttsManager.getDefaultSettings(provider);
      }

      const ttsConfig: TTSProviderConfig = {
        provider,
        voiceId,
        settings: voiceSettings as any,
      };

      // Process sequentially to avoid API rate limits
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        setRegenerationProgress({ current: i + 1, total: words.length });

        try {
          const audioBlob = await ttsManager.generateSpeech(word.word, ttsConfig);
          const { extension, contentType } = getAudioFileMeta(audioBlob);
          const fileName = `${selectedSublevel}/${word.word.replace(/[^a-zA-Z0-9]/g, '_')}_regenerated_${Date.now()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('word-audio')
            .upload(fileName, audioBlob, { contentType, upsert: false });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('word-audio').getPublicUrl(fileName);
          const audioUrl = urlData.publicUrl;

          const { error: updateError } = await supabase
            .from('words')
            .update({ audio_url: audioUrl, audio_generated: true })
            .eq('id', word.id);

          if (updateError) throw updateError;
          successCount++;

          // Small delay between requests to be extra safe with rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error(`Failed to regenerate audio for word "${word.word}":`, err);
          failCount++;
        }
      }

      if (failCount === 0) {
        toast.success(`Successfully regenerated audio for all ${successCount} words!`);
      } else {
        toast.warning(`Finished regenerating. ${successCount} succeeded, ${failCount} failed. Check console for details.`);
      }

      loadWords();
    } catch (error) {
      console.error('Error during batch regeneration:', error);
      toast.error('An unexpected error occurred during batch regeneration.');
    } finally {
      setIsRegeneratingAll(false);
      setRegenerationProgress({ current: 0, total: 0 });
    }
  };

  const handleDeleteWord = async (wordId: string, wordText: string) => {
    if (!confirm(`Delete word "${wordText}"?`)) return;

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;

      toast.success(`Word "${wordText}" deleted`);
      loadWords();
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word');
    }
  };

  // Filter words based on search query
  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Words Manually</CardTitle>
          <CardDescription>
            Add individual words to sublevels with automatic or manual audio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedLanguageData && supportsAutoAudio ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✨ Audio will be generated automatically using the voice configured for {selectedLanguageData.name}.
                </p>
              </div>
            ) : selectedLanguageData && !supportsAutoAudio ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  📤 No voice configured for {selectedLanguageData.name}. You must upload an MP3 audio file.
                </p>
              </div>
            ) : null}

            <div className="grid gap-4">
              <div>
                <Label>Select Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose language" />
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

              <div>
                <Label>Select Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose level" />
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

              <div>
                <Label>Select Sublevel</Label>
                <Select
                  value={selectedSublevel}
                  onValueChange={setSelectedSublevel}
                  disabled={!selectedLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sublevel" />
                  </SelectTrigger>
                  <SelectContent>
                    {sublevels.map((sublevel) => (
                      <SelectItem key={sublevel.id} value={sublevel.id}>
                        {sublevel.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Word</Label>
                <Input
                  placeholder={selectedLanguageData ? `Enter word in ${selectedLanguageData.name}` : 'Enter word'}
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  disabled={!selectedSublevel}
                />
              </div>

              {selectedLanguageData && !supportsAutoAudio && (
                <div>
                  <Label>Audio File (MP3)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      disabled={!selectedSublevel}
                    />
                    {audioFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudioFile(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {audioFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {audioFile.name}
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleAddWord}
                disabled={!wordText || !selectedSublevel || (!supportsAutoAudio && !audioFile) || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding word...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {supportsAutoAudio ? 'Add Word (Auto-generate audio)' : 'Add Word with Audio'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word List */}
      {selectedSublevel && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Words in this Sublevel ({words.length})</CardTitle>
            </div>
            {supportsAutoAudio && words.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateAll}
                disabled={isRegeneratingAll || !!isRegenerating}
                className="flex items-center gap-2"
              >
                {isRegeneratingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    Regenerating ({regenerationProgress.current}/{regenerationProgress.total})...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    Regenerate All
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingWords ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : words.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No words yet. Add your first word above!
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Field */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                {/* Words List */}
                {filteredWords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No words found matching "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {filteredWords.length < words.length && (
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredWords.length} of {words.length} words
                      </div>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredWords.map((word) => (
                        <div
                          key={word.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{word.word}</div>
                            <div className="text-sm text-muted-foreground">
                              {word.audio_url ? (
                                <span className="text-green-600">✓ Has audio</span>
                              ) : (
                                <span className="text-orange-600">⚠ No audio</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {word.audio_url && (
                              <audio controls className="h-8">
                                <source src={word.audio_url} type="audio/mpeg" />
                              </audio>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegenerateAudio(word.id, word.word)}
                              disabled={isRegenerating === word.id || !supportsAutoAudio}
                              title="Regenerate Audio"
                            >
                              {isRegenerating === word.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              ) : (
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWord(word.id, word.word)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
