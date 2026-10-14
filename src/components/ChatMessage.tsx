import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  FileCode,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import { Message, Attachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GemstoneLogo } from './GemstoneLogo';
import { formatFileSize } from '../utils/fileParser';

interface ChatMessageProps {
  message: Message;
  onRetry?: (messageId: string) => void;
  isLastAssistantMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isStreaming = message.status === 'streaming';

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(message.timestamp));

  return (
    <>
      <div
        className={`group relative flex w-full gap-3 py-4 transition-colors ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
            <GemstoneLogo size={20} />
          </div>
        )}

        {/* Message bubble / content */}
        <div
          className={`flex flex-col max-w-[85%] sm:max-w-[78%] lg:max-w-[72%] ${
            isUser ? 'items-end' : 'items-start'
          }`}
        >
          {/* User Attached files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs text-xs text-[var(--color-text-primary)]"
                >
                  {att.category === 'image' && (att.previewUrl || att.base64Data) ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage(att.previewUrl || `data:${att.type};base64,${att.base64Data}`)
                      }
                      className="cursor-zoom-in"
                      title="View full image"
                    >
                      <img
                        src={att.previewUrl || `data:${att.type};base64,${att.base64Data}`}
                        alt={att.name}
                        className="h-10 w-10 rounded-lg object-cover border border-[var(--color-border)]"
                      />
                    </button>
                  ) : att.category === 'pdf' ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                      <FileText className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                      <FileCode className="h-5 w-5" />
                    </div>
                  )}

                  <div className="max-w-[150px] sm:max-w-[180px] overflow-hidden">
                    <p className="truncate font-medium">{att.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {formatFileSize(att.size)} • {att.category.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm transition-all ${
              isUser
                ? 'bg-[var(--color-accent)] text-white rounded-br-xs shadow-xs'
                : isError
                ? 'bg-[var(--color-danger-surface)] border border-[var(--color-danger)]/40 text-[var(--color-danger)]'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-xs shadow-xs'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap select-text leading-relaxed font-normal">
                {message.content}
              </p>
            ) : isError ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Request Failed</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-primary)]">
                  {message.errorMessage || message.content || 'An unexpected error occurred while communicating with Gemini.'}
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(message.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-lg bg-[var(--color-danger)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            ) : (
              <div>
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--color-accent)] animate-pulse align-middle" />
                )}
              </div>
            )}
          </div>

          {/* Message Footer Actions */}
          <div
            className={`flex items-center gap-2 mt-1 px-1 text-[11px] text-[var(--color-text-muted)] ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>{formattedTime}</span>

            {/* Copy button for Assistant messages */}
            {!isUser && !isError && message.content && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy response text"
                title="Copy response"
                className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-[var(--color-accent)]" />
                    <span className="text-[var(--color-accent)] font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Image Lightbox Modal if an attachment thumbnail was clicked */}
      {previewImage && (
        <div
          role="dialog"
          aria-label="Image preview modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged attachment preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
