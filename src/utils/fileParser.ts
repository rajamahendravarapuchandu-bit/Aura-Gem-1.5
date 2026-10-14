import mammoth from 'mammoth';
import { Attachment, FileCategory } from '../types';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit

export interface ProcessedFileResult {
  attachment?: Attachment;
  error?: string;
}

/**
 * Determine category of the file based on MIME type and extension
 */
export function getFileCategory(file: File): { category: FileCategory; valid: boolean; reason?: string } {
  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  // Images
  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/png') ||
    mime.startsWith('image/webp') ||
    mime === 'image/jpg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  ) {
    return { category: 'image', valid: true };
  }

  // PDF
  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return { category: 'pdf', valid: true };
  }

  // Documents and text files
  const isDocx =
    name.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const isTextDoc =
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/javascript' ||
    mime === 'application/xml' ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.markdown') ||
    name.endsWith('.csv') ||
    name.endsWith('.json') ||
    name.endsWith('.xml') ||
    name.endsWith('.html') ||
    name.endsWith('.htm') ||
    name.endsWith('.js') ||
    name.endsWith('.ts') ||
    name.endsWith('.py');

  if (isDocx || isTextDoc) {
    return { category: 'document', valid: true };
  }

  // Unsupported
  return {
    category: 'other',
    valid: false,
    reason: `Unsupported file type "${file.name}". Supported formats: Images (JPEG, PNG, WebP), PDFs, and Documents (DOCX, TXT, MD, CSV, JSON).`,
  };
}

/**
 * Convert file to base64 string (without the data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as UTF-8 text safely
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof file.text === 'function') {
      file.text().then(resolve).catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = (err) => reject(err);
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Process an uploaded file into an Attachment object
 */
export async function processFile(file: File): Promise<ProcessedFileResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      error: `"${file.name}" is ${sizeMB}MB. The maximum supported file size is 15MB. Please upload a smaller file.`,
    };
  }

  // Check supported type
  const { category, valid, reason } = getFileCategory(file);
  if (!valid) {
    return { error: reason || 'File format not supported.' };
  }

  const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    if (category === 'image') {
      const base64Data = await fileToBase64(file);
      const mime = file.type || (file.name.endsWith('.webp') ? 'image/webp' : 'image/png');
      const previewUrl = `data:${mime};base64,${base64Data}`;
      return {
        attachment: {
          id,
          name: file.name,
          size: file.size,
          type: mime,
          category: 'image',
          base64Data,
          previewUrl,
        },
      };
    }

    if (category === 'pdf') {
      const base64Data = await fileToBase64(file);
      return {
        attachment: {
          id,
          name: file.name,
          size: file.size,
          type: 'application/pdf',
          category: 'pdf',
          base64Data,
        },
      };
    }

    if (category === 'document') {
      const name = file.name.toLowerCase();

      // DOCX Document
      if (
        name.endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = (result.value || '').trim();

        if (!extractedText) {
          return {
            error: `Could not extract text from "${file.name}". The document appears to be empty or contains only non-text elements.`,
          };
        }

        return {
          attachment: {
            id,
            name: file.name,
            size: file.size,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            category: 'document',
            extractedText,
          },
        };
      }

      // Plain text, Markdown, CSV, JSON, code documents
      const text = await readFileAsText(file);
      return {
        attachment: {
          id,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          category: 'document',
          extractedText: text,
        },
      };
    }

    return { error: `Could not process file "${file.name}".` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
    return { error: `Failed to process "${file.name}": ${errorMsg}` };
  }
}

/**
 * Format bytes into human-readable string (e.g. "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
