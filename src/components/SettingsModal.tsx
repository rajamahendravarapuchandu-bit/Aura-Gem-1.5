import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Type,
  Send,
  Trash2,
  Download,
  Cpu,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { UserSettings, ThemePreference, FontSizePreference, Conversation } from '../types';
import { GemstoneLogo } from './GemstoneLogo';
import { ConfirmationModal } from './ConfirmationModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  conversations: Conversation[];
  onClearAllConversations: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  conversations,
  onClearAllConversations,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showClearConfirm) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showClearConfirm]);

  if (!isOpen) return null;

  const handleExportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aura-gem-conversations-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 3000);
    } catch (err) {
      console.error('Failed to export conversations:', err);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center gap-2.5">
              <GemstoneLogo size={24} />
              <h2 id="settings-modal-title" className="text-lg font-semibold text-[var(--color-text-primary)]">
                Settings
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Theme Preference */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2.5">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ] as const
                ).map(({ id, label, icon: Icon }) => {
                  const isSelected = settings.theme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onUpdateSettings({ theme: id })}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold shadow-xs'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Preference */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Interface Font Size
                </label>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Adjusts reading comfort across all screens
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'small', label: 'Small', sizeHint: '14px' },
                    { id: 'default', label: 'Default', sizeHint: '16px' },
                    { id: 'large', label: 'Large', sizeHint: '18px' },
                    { id: 'extra-large', label: 'X-Large', sizeHint: '20px' },
                  ] as const
                ).map(({ id, label, sizeHint }) => {
                  const isSelected = settings.fontSize === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onUpdateSettings({ fontSize: id })}
                      className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)] shadow-xs'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{label}</span>
                      <span className="text-[11px] opacity-75">{sizeHint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Composer Keyboard Behavior */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)]">
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2.5">
                Keyboard Shortcut
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="sendShortcut"
                    checked={settings.sendOnEnter}
                    onChange={() => onUpdateSettings({ sendOnEnter: true })}
                    className="accent-[var(--color-accent)] h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      Press Enter to send
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Use Shift + Enter to create a new line
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="sendShortcut"
                    checked={!settings.sendOnEnter}
                    onChange={() => onUpdateSettings({ sendOnEnter: false })}
                    className="accent-[var(--color-accent)] h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      Press Ctrl / ⌘ + Enter to send
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Pressing Enter creates a regular new line
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation History Management */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)]">
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2.5">
                Conversation History
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={conversations.length === 0}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4 text-[var(--color-accent)]" />
                  <span>Export History (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={conversations.length === 0}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger-surface)] text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All History</span>
                </button>
              </div>
              {exportNotice && (
                <p className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] mt-2 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Conversation history downloaded successfully.
                </p>
              )}
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                History is saved in your browser&apos;s local storage ({conversations.length}{' '}
                {conversations.length === 1 ? 'chat' : 'chats'} stored).
              </p>
            </div>

            {/* Model & System Information */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                <Cpu className="h-4 w-4 text-[var(--color-accent)]" />
                <span>AI Model Information</span>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]/60 p-3.5 text-xs space-y-1.5 text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text-primary)]">Active Model:</span>
                  <span className="font-mono bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                    gemini-3.8-flash
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text-primary)]">Capabilities:</span>
                  <span>Multimodal (Text, Image, PDF, Document)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text-primary)]">Response Mode:</span>
                  <span>Server-side Streaming (SSE)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text-primary)]">Security:</span>
                  <span>Server-side proxy (credentials protected)</span>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">Aura-Gem-1.5</p>
                <p>Simple AI. Endless Possibilities.</p>
              </div>
              <span className="font-mono">v1.5.0</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showClearConfirm}
        title="Clear All Conversations"
        message="Are you sure you want to delete all saved conversations? This action will permanently remove all local conversation records and cannot be undone."
        confirmLabel="Delete All"
        isDestructive={true}
        onConfirm={() => {
          onClearAllConversations();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
};
