/**
 * Извлекает слово из имени аудио файла
 * Удаляет расширение и лишние символы
 * @param fileName - полное имя файла (например, "apple.mp3")
 * @returns слово без расширения (например, "apple")
 */
export function parseFileName(fileName: string): string {
  // Удаляем расширение файла
  const nameWithoutExt = fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, '');

  // Убираем лишние пробелы по краям
  return nameWithoutExt.trim();
}

/**
 * Генерирует уникальный ID для элемента
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
