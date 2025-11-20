/**
 * Создает безопасное имя файла для Supabase Storage
 * Использует UUID для избежания проблем с кириллицей и спецсимволами
 * @param originalWord - оригинальное слово (может быть на любом языке)
 * @param extension - расширение файла
 * @returns безопасное имя файла
 */
export function createSafeFileName(originalWord: string, extension: string): string {
  // Генерируем уникальный ID
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);

  // Создаем безопасное имя файла без кириллицы
  return `word_${timestamp}_${randomId}.${extension}`;
}

/**
 * Извлекает расширение файла
 * @param fileName - имя файла
 * @returns расширение без точки
 */
export function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/i);
  return match ? match[1].toLowerCase() : 'mp3';
}
