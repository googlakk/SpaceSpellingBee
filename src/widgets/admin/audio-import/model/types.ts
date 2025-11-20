export interface AudioFileItem {
  id: string;
  file: File;
  originalFileName: string;
  word: string;
  isDuplicate: boolean;
  duplicateAction?: 'skip' | 'replace';
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  details: {
    word: string;
    status: 'imported' | 'skipped' | 'error';
    message?: string;
  }[];
}
