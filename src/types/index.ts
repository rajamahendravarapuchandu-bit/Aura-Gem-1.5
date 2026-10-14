export type Role = 'user' | 'assistant' | 'system';

export type FileCategory = 'image' | 'pdf' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  // Base64 data (without data URL prefix for API) or extracted text for docs
  base64Data?: string;
  extractedText?: string;
  previewUrl?: string; // Data URL for image thumbnail
  pageCount?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  errorMessage?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export type FontSizePreference = 'small' | 'default' | 'large' | 'extra-large';

export interface UserSettings {
  theme: ThemePreference;
  fontSize: FontSizePreference;
  sendOnEnter: boolean;
}
