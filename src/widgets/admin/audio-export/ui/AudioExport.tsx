import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase, Level, Sublevel, Language, Word } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, FileAudio, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const AudioExport = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sublevels, setSublevels] = useState<Sublevel[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('');

  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');

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
      toast.error('Не удалось загрузить языки');
    }
  };

  const loadLevels = async (languageId: string) => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('language_id', languageId)
        .order('name');

      if (error) throw error;
      setLevels(data || []);
      setSelectedLevel('');
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Не удалось загрузить уровни');
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
      toast.error('Не удалось загрузить подуровни');
    }
  };

  const loadWords = async (sublevelId: string) => {
    setLoadingWords(true);
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('sublevel_id', sublevelId)
        .order('word');

      if (error) throw error;
      setWords(data || []);

      const wordsWithAudio = data?.filter(w => w.audio_url) || [];
      toast.success(`Загружено ${wordsWithAudio.length} слов с аудио из ${data?.length || 0} слов`);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Не удалось загрузить слова');
      setWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  const fetchAudioAsBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    return await response.blob();
  };

  const getFileExtension = (url: string): string => {
    const urlParts = url.split('?')[0].split('.');
    const ext = urlParts[urlParts.length - 1].toLowerCase();
    // Поддерживаемые форматы
    const supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    return supportedFormats.includes(ext) ? ext : 'mp3';
  };

  const sanitizeFileName = (name: string): string => {
    // Удаляем специальные символы и заменяем пробелы на подчеркивания
    return name
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  };

  const handleDownloadAll = async () => {
    const wordsWithAudio = words.filter(w => w.audio_url);

    if (wordsWithAudio.length === 0) {
      toast.error('Нет слов с аудиофайлами для скачивания');
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
      const selectedLevelData = levels.find(l => l.id === selectedLevel);
      const selectedSublevelData = sublevels.find(s => s.id === selectedSublevel);

      toast.info(`Начинаем скачивание ${wordsWithAudio.length} аудиофайлов...`);

      for (let i = 0; i < wordsWithAudio.length; i++) {
        const word = wordsWithAudio[i];
        setCurrentWord(word.word);
        setProgress(((i + 1) / wordsWithAudio.length) * 100);

        try {
          if (word.audio_url) {
            const audioBlob = await fetchAudioAsBlob(word.audio_url);
            const fileExt = getFileExtension(word.audio_url);
            const fileName = `${sanitizeFileName(word.word)}.${fileExt}`;
            zip.file(fileName, audioBlob);
          }
        } catch (error) {
          console.error(`Error downloading audio for "${word.word}":`, error);
          toast.error(`Ошибка при скачивании аудио для "${word.word}"`);
        }
      }

      // Генерируем ZIP-архив
      toast.info('Создание ZIP-архива...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Формируем имя архива
      const zipFileName = `audio_${selectedLanguageData?.code || 'unknown'}_${selectedLevelData?.name || 'level'}_${selectedSublevelData?.name || 'sublevel'}.zip`;

      // Скачиваем архив
      saveAs(zipBlob, zipFileName);

      toast.success(`Успешно скачано ${wordsWithAudio.length} аудиофайлов!`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Ошибка при создании архива');
    } finally {
      setIsDownloading(false);
      setProgress(0);
      setCurrentWord('');
    }
  };

  const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
  const selectedLevelData = levels.find(l => l.id === selectedLevel);
  const selectedSublevelData = sublevels.find(s => s.id === selectedSublevel);
  const wordsWithAudio = words.filter(w => w.audio_url);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт аудио файлов
        </CardTitle>
        <CardDescription>
          Выберите подуровень для массового скачивания всех аудиофайлов в ZIP-архиве
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Выбор языка, уровня, подуровня */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Язык</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите язык" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.flag_emoji} {lang.native_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Уровень</Label>
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
              disabled={!selectedLanguage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Подуровень</Label>
            <Select
              value={selectedSublevel}
              onValueChange={setSelectedSublevel}
              disabled={!selectedLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите подуровень" />
              </SelectTrigger>
              <SelectContent>
                {sublevels.map(sublevel => (
                  <SelectItem key={sublevel.id} value={sublevel.id}>
                    {sublevel.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Выбранные параметры */}
        {selectedLanguageData && selectedLevelData && selectedSublevelData && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Выбрано:</strong> {selectedLanguageData.flag_emoji}{' '}
              {selectedLanguageData.native_name} → {selectedLevelData.display_name} →{' '}
              {selectedSublevelData.display_name}
            </p>
          </div>
        )}

        {/* Загрузка слов */}
        {loadingWords && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Загрузка слов...</span>
          </div>
        )}

        {/* Статистика */}
        {!loadingWords && words.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Всего слов</p>
                <p className="text-2xl font-bold">{words.length}</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">С аудио</p>
                <p className="text-2xl font-bold text-green-600">{wordsWithAudio.length}</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Без аудио</p>
                <p className="text-2xl font-bold text-red-600">{words.length - wordsWithAudio.length}</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Процент</p>
                <p className="text-2xl font-bold text-blue-600">
                  {words.length > 0 ? Math.round((wordsWithAudio.length / words.length) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Кнопка скачивания */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handleDownloadAll}
                disabled={isDownloading || wordsWithAudio.length === 0}
                size="lg"
                className="w-full md:w-auto"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Скачивание...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Скачать все аудио ({wordsWithAudio.length} файлов)
                  </>
                )}
              </Button>
            </div>

            {/* Прогресс скачивания */}
            {isDownloading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Скачивание: {currentWord}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Таблица слов */}
            <div className="rounded-md border max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Слово</TableHead>
                    <TableHead>Статус аудио</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word, index) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-mono text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {word.word}
                      </TableCell>
                      <TableCell>
                        {word.audio_url ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Есть аудио
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <FileAudio className="h-3 w-3 mr-1" />
                            Нет аудио
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Пустое состояние */}
        {!loadingWords && words.length === 0 && selectedSublevel && (
          <div className="text-center p-8 text-muted-foreground">
            <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет слов в выбранном подуровне</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
