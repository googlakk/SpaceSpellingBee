import { useState, useRef, useEffect } from 'react';
import { supabase, Level, Sublevel, Language } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Loader2, X, AlertCircle, CheckCircle2, FileAudio } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AudioFileItem, ImportResult } from '../model/types';
import { parseFileName, generateId } from '../lib/parseFileName';
import { createSafeFileName, getFileExtension } from '../lib/sanitizeFileName';

export const AudioImport = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sublevels, setSublevels] = useState<Sublevel[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('');

  const [audioFiles, setAudioFiles] = useState<AudioFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [currentDuplicateItem, setCurrentDuplicateItem] = useState<AudioFileItem | null>(null);

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
      toast.error('Не удалось загрузить языки');
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!selectedLanguage || !selectedLevel || !selectedSublevel) {
      toast.error('Сначала выберите язык, уровень и подуровень');
      return;
    }

    // Парсим файлы и создаем элементы для таблицы
    const newAudioFiles: AudioFileItem[] = Array.from(files).map(file => ({
      id: generateId(),
      file,
      originalFileName: file.name,
      word: parseFileName(file.name),
      isDuplicate: false,
      uploadStatus: 'pending',
    }));

    // Проверяем на дубликаты в базе данных
    await checkDuplicates(newAudioFiles);

    setAudioFiles(newAudioFiles);
    toast.success(`Загружено ${newAudioFiles.length} файлов`);
  };

  const checkDuplicates = async (files: AudioFileItem[]) => {
    try {
      // Получаем все слова из выбранного sublevel
      const { data: existingWords, error } = await supabase
        .from('words')
        .select('word')
        .eq('sublevel_id', selectedSublevel);

      if (error) throw error;

      const existingWordSet = new Set(
        (existingWords || []).map(w => w.word.toLowerCase())
      );

      // Отмечаем дубликаты
      files.forEach(file => {
        file.isDuplicate = existingWordSet.has(file.word.toLowerCase());
      });
    } catch (error) {
      console.error('Error checking duplicates:', error);
      toast.error('Не удалось проверить дубликаты');
    }
  };

  const removeFile = (id: string) => {
    setAudioFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateWord = (id: string, newWord: string) => {
    setAudioFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, word: newWord } : f))
    );
  };

  const handleDuplicateAction = (action: 'skip' | 'replace') => {
    if (!currentDuplicateItem) return;

    setAudioFiles(prev =>
      prev.map(f =>
        f.id === currentDuplicateItem.id
          ? { ...f, duplicateAction: action }
          : f
      )
    );

    setDuplicateDialogOpen(false);
    setCurrentDuplicateItem(null);
  };

  const handleImport = async () => {
    if (audioFiles.length === 0) {
      toast.error('Нет файлов для импорта');
      return;
    }

    // Проверяем, есть ли необработанные дубликаты
    const unhandledDuplicates = audioFiles.filter(
      f => f.isDuplicate && !f.duplicateAction
    );

    if (unhandledDuplicates.length > 0) {
      // Показываем диалог для первого необработанного дубликата
      setCurrentDuplicateItem(unhandledDuplicates[0]);
      setDuplicateDialogOpen(true);
      return;
    }

    // Начинаем импорт
    setIsUploading(true);
    setProgress(0);

    const result: ImportResult = {
      total: audioFiles.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };

    for (let i = 0; i < audioFiles.length; i++) {
      const item = audioFiles[i];
      setCurrentWord(item.word);
      setProgress(((i + 1) / audioFiles.length) * 100);

      try {
        // Пропускаем, если это дубликат и выбрано действие "skip"
        if (item.isDuplicate && item.duplicateAction === 'skip') {
          result.skipped++;
          result.details.push({
            word: item.word,
            status: 'skipped',
            message: 'Дубликат - пропущено',
          });

          setAudioFiles(prev =>
            prev.map(f =>
              f.id === item.id
                ? { ...f, uploadStatus: 'success' }
                : f
            )
          );
          continue;
        }

        // Обновляем статус
        setAudioFiles(prev =>
          prev.map(f =>
            f.id === item.id
              ? { ...f, uploadStatus: 'uploading' }
              : f
          )
        );

        // Загружаем аудио в Supabase Storage
        const audioUrl = await uploadAudioToStorage(item.file, item.word);

        // Добавляем или обновляем слово в базе данных
        if (item.isDuplicate && item.duplicateAction === 'replace') {
          // Обновляем существующее слово
          await updateExistingWord(item.word, audioUrl);
          result.imported++;
          result.details.push({
            word: item.word,
            status: 'imported',
            message: 'Обновлено',
          });
        } else {
          // Добавляем новое слово
          await insertNewWord(item.word, audioUrl);
          result.imported++;
          result.details.push({
            word: item.word,
            status: 'imported',
            message: 'Добавлено',
          });
        }

        setAudioFiles(prev =>
          prev.map(f =>
            f.id === item.id
              ? { ...f, uploadStatus: 'success' }
              : f
          )
        );
      } catch (error) {
        console.error(`Error processing ${item.word}:`, error);
        result.errors++;
        result.details.push({
          word: item.word,
          status: 'error',
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });

        setAudioFiles(prev =>
          prev.map(f =>
            f.id === item.id
              ? { ...f, uploadStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Ошибка' }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    setProgress(100);
    setCurrentWord('');

    // Показываем результат
    toast.success(
      `Импорт завершен: ${result.imported} добавлено, ${result.skipped} пропущено, ${result.errors} ошибок`
    );
  };

  const uploadAudioToStorage = async (file: File, word: string): Promise<string> => {
    const fileExt = getFileExtension(file.name);
    const safeFileName = createSafeFileName(word, fileExt);
    const fileName = `${selectedSublevel}/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('word-audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('word-audio')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const insertNewWord = async (word: string, audioUrl: string) => {
    const { error } = await supabase.from('words').insert({
      sublevel_id: selectedSublevel,
      language_id: selectedLanguage,
      word,
      audio_url: audioUrl,
      audio_generated: false,
    });

    if (error) throw error;
  };

  const updateExistingWord = async (word: string, audioUrl: string) => {
    const { error } = await supabase
      .from('words')
      .update({
        audio_url: audioUrl,
        audio_generated: false,
      })
      .eq('sublevel_id', selectedSublevel)
      .eq('word', word);

    if (error) throw error;
  };

  const handleReset = () => {
    setAudioFiles([]);
    setProgress(0);
    setCurrentWord('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedLanguageData = languages.find(l => l.id === selectedLanguage);
  const selectedLevelData = levels.find(l => l.id === selectedLevel);
  const selectedSublevelData = sublevels.find(s => s.id === selectedSublevel);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Множественный импорт аудио файлов
        </CardTitle>
        <CardDescription>
          Выберите язык, уровень и подуровень, затем загрузите аудио файлы. Название файла будет использовано как слово.
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

        {/* Загрузка файлов */}
        <div className="space-y-2">
          <Label>Аудио файлы</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg,.m4a,.flac"
              multiple
              onChange={handleFileSelect}
              disabled={!selectedSublevel || isUploading}
              className="flex-1"
            />
            {audioFiles.length > 0 && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isUploading}
              >
                Очистить
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Поддерживаемые форматы: MP3, WAV, OGG, M4A, FLAC
          </p>
        </div>

        {/* Таблица предпросмотра */}
        {audioFiles.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Файл</TableHead>
                    <TableHead>Слово</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audioFiles.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.originalFileName}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.word}
                          onChange={e => updateWord(item.id, e.target.value)}
                          disabled={isUploading}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        {item.uploadStatus === 'pending' && (
                          <>
                            {item.isDuplicate ? (
                              item.duplicateAction ? (
                                <Badge variant="secondary">
                                  {item.duplicateAction === 'skip'
                                    ? 'Пропустить'
                                    : 'Заменить'}
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Дубликат
                                </Badge>
                              )
                            ) : (
                              <Badge variant="outline">Новое</Badge>
                            )}
                          </>
                        )}
                        {item.uploadStatus === 'uploading' && (
                          <Badge variant="secondary">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Загрузка...
                          </Badge>
                        )}
                        {item.uploadStatus === 'success' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Готово
                          </Badge>
                        )}
                        {item.uploadStatus === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Ошибка
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.isDuplicate && !item.duplicateAction && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentDuplicateItem(item);
                              setDuplicateDialogOpen(true);
                            }}
                            disabled={isUploading}
                          >
                            Выбрать
                          </Button>
                        )}
                        {!isUploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Прогресс */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Обработка: {currentWord}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Кнопки */}
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleImport}
                disabled={
                  isUploading ||
                  audioFiles.some(f => f.isDuplicate && !f.duplicateAction)
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Импортировать ({audioFiles.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Диалог для обработки дубликатов */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Обнаружен дубликат</AlertDialogTitle>
            <AlertDialogDescription>
              Слово "{currentDuplicateItem?.word}" уже существует в этом подуровне.
              Что вы хотите сделать?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDuplicateAction('skip')}>
              Пропустить
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDuplicateAction('replace')}>
              Заменить аудио
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
