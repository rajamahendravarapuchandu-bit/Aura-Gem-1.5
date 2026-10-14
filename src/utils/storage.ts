import { Conversation, UserSettings, ThemePreference, FontSizePreference, Attachment } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'aura_gem_conversations_v1',
  ACTIVE_ID: 'aura_gem_active_id_v1',
  SETTINGS: 'aura_gem_settings_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  fontSize: 'default',
  sendOnEnter: true,
};

/**
 * Strip heavy raw base64 payloads before persisting to localStorage
 * to prevent exceeding browser quota (5MB). Preserves metadata and thumbnail previews if small.
 */
function sanitizeAttachmentsForStorage(attachments?: Attachment[]): Attachment[] | undefined {
  if (!attachments || attachments.length === 0) return undefined;

  return attachments.map((att) => {
    // Retain full metadata, but omit massive base64 document or image data
    const isDoc = att.category === 'document';
    const textSnippet = isDoc && att.extractedText
      ? att.extractedText.slice(0, 1000) // keep a sample if needed
      : undefined;

    return {
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      category: att.category,
      // Keep small preview thumbnail if available (< 200KB)
      previewUrl: att.previewUrl && att.previewUrl.length < 200000 ? att.previewUrl : undefined,
      extractedText: textSnippet,
    };
  });
}

/**
 * Load all conversations from localStorage
 */
export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

/**
 * Save conversations to localStorage
 */
export function saveConversations(conversations: Conversation[]): void {
  try {
    const sanitized = conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) => ({
        ...msg,
        attachments: sanitizeAttachmentsForStorage(msg.attachments),
      })),
    }));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

/**
 * Load the last active conversation ID
 */
export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
  } catch {
    return null;
  }
}

/**
 * Save active conversation ID
 */
export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
  } catch (err) {
    console.error('Failed to save active conversation id:', err);
  }
}

/**
 * Load user settings
 */
export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      theme: (parsed.theme as ThemePreference) || DEFAULT_SETTINGS.theme,
      fontSize: (parsed.fontSize as FontSizePreference) || DEFAULT_SETTINGS.fontSize,
      sendOnEnter: typeof parsed.sendOnEnter === 'boolean' ? parsed.sendOnEnter : DEFAULT_SETTINGS.sendOnEnter,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings
 */
export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save user settings:', err);
  }
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
  } catch (err) {
    console.error('Failed to clear conversations:', err);
  }
}
