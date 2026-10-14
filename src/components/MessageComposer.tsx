import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  X,
  FileText,
  FileCode,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Attachment } from '../types';
import { processFile, formatFileSize } from '../utils/fileParser';

interface MessageComposerProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  onStop: () => void;
  sendOnEnter: boolean;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  input,
  onChangeInput,
  onSend,
  isGenerating,
  onStop,
  sendOnEnter,
  disabled = false,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea to fit text up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileChange = async (files: FileList | File[]) => {
    setComposerError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsProcessingFile(true);
    const newAttachments: Attachment[] = [];

    for (const file of fileList) {
      const result = await processFile(file);
      if (result.error) {
        setComposerError(result.error);
      } else if (result.attachment) {
        newAttachments.push(result.attachment);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    setIsProcessingFile(false);

    // Reset file input value so user can pick the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendOnEnter) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    } else {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (isGenerating || isProcessingFile || disabled) return;

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) {
      return;
    }

    onSend(trimmed, attachments);
    setAttachments([]);
    setComposerError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileChange(e.dataTransfer.files);
    }
  };

  const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !isGenerating && !isProcessingFile;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border transition-all duration-150 ${
        isDraggingOver
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/40 ring-2 ring-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs hover:border-[var(--color-accent)]/50 focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]'
      }`}
    >
      {/* Drag & drop overlay indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--color-accent-light)]/90 backdrop-blur-xs">
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            Drop images, PDFs, or documents to attach
          </p>
        </div>
      )}

      {/* Composer Error Notification */}
      {composerError && (
        <div className="flex items-start justify-between gap-2 mx-3 mt-2.5 p-2.5 rounded-xl bg-[var(--color-danger-surface)] border border-[var(--color-danger)]/30 text-xs text-[var(--color-danger)]">
          <div className="flex items-center gap-1.5 flex-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{composerError}</span>
          </div>
          <button
            type="button"
            onClick={() => setComposerError(null)}
            className="p-0.5 hover:opacity-75"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* File Previews List */}
      {(attachments.length > 0 || isProcessingFile) && (
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-primary)] max-w-xs"
            >
              {att.category === 'image' ? (
                att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="h-6 w-6 rounded object-cover shrink-0 border border-[var(--color-border)]"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                )
              ) : att.category === 'pdf' ? (
                <FileText className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
              ) : (
                <FileCode className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
              )}

              <div className="truncate max-w-[140px]">
                <p className="truncate font-medium leading-none">{att.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {formatFileSize(att.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                aria-label={`Remove ${att.name}`}
                className="ml-1 p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-danger)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {isProcessingFile && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
              <span>Processing file...</span>
            </div>
          )}
        </div>
      )}

      {/* Input area & buttons */}
      <div className="flex items-end gap-2 p-2.5 sm:p-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,text/plain,text/markdown,.txt,.md,.markdown,.docx"
          onChange={(e) => {
            if (e.target.files) handleFileChange(e.target.files);
          }}
          className="hidden"
          id="file-attachment-input"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating || isProcessingFile || disabled}
          aria-label="Attach file (image, PDF, docx, txt)"
          title="Attach files (Image, PDF, DOCX, TXT, MD)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] disabled:opacity-40 transition-colors focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-hidden"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Multiline textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            attachments.length > 0
              ? 'Ask anything about the attached files...'
              : 'Ask a question or describe a task...'
          }
          disabled={disabled}
          className="flex-1 max-h-[200px] min-h-[38px] resize-none bg-transparent py-2 px-1 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-hidden"
        />

        {/* Send / Stop button */}
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating response"
            title="Stop generation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-danger)] text-white hover:opacity-90 transition-all shadow-xs focus:ring-2 focus:ring-[var(--color-danger)] focus:outline-hidden"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Send message"
            title={sendOnEnter ? 'Send (Enter)' : 'Send (Ctrl+Enter)'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-xs focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-hidden ${
              canSubmit
                ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white cursor-pointer'
                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-border)]'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Helper text on desktop */}
      <div className="hidden sm:flex items-center justify-between px-3 pb-2 text-[10px] text-[var(--color-text-muted)] select-none">
        <span>Supported: JPEG, PNG, WebP, PDF, DOCX, TXT, MD (up to 15MB)</span>
        <span>{sendOnEnter ? 'Enter to send, Shift+Enter for new line' : 'Ctrl+Enter to send'}</span>
      </div>
    </div>
  );
};
