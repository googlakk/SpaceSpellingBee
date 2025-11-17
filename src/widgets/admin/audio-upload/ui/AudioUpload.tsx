import { useState, useRef, useEffect } from 'react';
import { supabase, Sublevel, Word, Language, Level } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const AudioUpload = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [sublevels, setSublevels] = useState<Sublevel[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('');
  const [words, setWords] = useState<Word[]>([]);
  const [uploadingWordId, setUploadingWordId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  useEffect(() => {
    if (selectedSublevel) {
      loadWords(selectedSublevel);
    } else {
      setWords([]);
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
      const { data, error } = await supabase
        .from('levels')
        .select('*, languages(code, flag_emoji)')
        .eq('language_id', languageId)
        .order('name');

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

  const loadWords = async (sublevelId: string) => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('sublevel_id', sublevelId)
        .order('word');

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Failed to load words');
    }
  };

  const handleAudioUpload = async (wordId: string, file: File) => {
    setUploadingWordId(wordId);

    try {
      const word = words.find(w => w.id === wordId);
      if (!word) throw new Error('Word not found');

      // Upload audio to Supabase Storage
      const fileName = `${selectedSublevel}/${word.word}_${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('word-audio')
        .upload(fileName, file, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('word-audio')
        .getPublicUrl(fileName);

      // Update word with audio URL
      const { error: updateError } = await supabase
        .from('words')
        .update({
          audio_url: urlData.publicUrl,
          audio_generated: true,
        })
        .eq('id', wordId);

      if (updateError) throw updateError;

      toast.success(`Audio uploaded for "${word.word}"`);

      // Reload words to show updated status
      loadWords(selectedSublevel);
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio');
    } finally {
      setUploadingWordId(null);
    }
  };

  const selectedLanguageData = languages.find(l => l.id === selectedLanguage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio Files</CardTitle>
        <CardDescription>
          Manually upload MP3 audio files for words
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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

          <div>
            <Label>Select Sublevel</Label>
            <Select value={selectedSublevel} onValueChange={setSelectedSublevel} disabled={!selectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a sublevel" />
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
        </div>

        {selectedSublevel && words.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Words ({words.length})</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{word.word}</div>
                    <div className="text-sm text-muted-foreground">
                      {word.audio_url ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Audio uploaded
                        </span>
                      ) : (
                        <span className="text-orange-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          No audio
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {word.audio_url && (
                      <audio controls className="h-8">
                        <source src={word.audio_url} type="audio/mpeg" />
                      </audio>
                    )}

                    <input
                      ref={(el) => (fileInputRefs.current[word.id] = el)}
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAudioUpload(word.id, file);
                        }
                      }}
                    />

                    <Button
                      size="sm"
                      variant={word.audio_url ? 'outline' : 'default'}
                      onClick={() => fileInputRefs.current[word.id]?.click()}
                      disabled={uploadingWordId === word.id}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingWordId === word.id
                        ? 'Uploading...'
                        : word.audio_url
                        ? 'Replace'
                        : 'Upload'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSublevel && words.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No words found in this sublevel. Import words first.
          </div>
        )}

        {!selectedSublevel && (
          <div className="text-center py-8 text-muted-foreground">
            Select a language, level, and sublevel to upload audio files
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Audio files must be in MP3 format</li>
            <li>File names should match the word for easy identification</li>
            <li>You can replace existing audio by uploading a new file</li>
            <li>Audio will be played back during practice sessions</li>
            <li>Use this for languages without automatic TTS support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
