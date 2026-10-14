import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Sparkles, AlertCircle } from 'lucide-react';
import { Conversation, Message, UserSettings, Attachment } from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadUserSettings,
  saveUserSettings,
  clearAllConversations,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { MessageComposer } from './components/MessageComposer';
import { SettingsModal } from './components/SettingsModal';
import { GemstoneLogo } from './components/GemstoneLogo';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveConversationId());
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());

  const [inputDraft, setInputDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  // Apply Theme and Font Size preferences
  useEffect(() => {
    const root = document.documentElement;

    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize);

    // Apply theme
    const applyResolvedTheme = () => {
      let resolved = settings.theme;
      if (resolved === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isDark ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', resolved);
    };

    applyResolvedTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyResolvedTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme, settings.fontSize]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [activeId, scrollToBottom]);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveUserSettings(updated);
      return updated;
    });
  };

  // Toggle light/dark directly
  const handleToggleTheme = () => {
    const currentTheme = settings.theme;
    let nextTheme: UserSettings['theme'] = 'dark';
    if (currentTheme === 'dark') {
      nextTheme = 'light';
    } else if (currentTheme === 'light') {
      nextTheme = 'dark';
    } else {
      // If system, toggle to opposite of current system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      nextTheme = isDark ? 'light' : 'dark';
    }
    handleUpdateSettings({ theme: nextTheme });
  };

  // New Chat
  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveId(null);
    setInputDraft('');
    setGlobalError(null);
  };

  // Select Conversation
  const handleSelectConversation = (id: string) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveId(id);
    setGlobalError(null);
  };

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    if (activeId === id) {
      if (isGenerating && abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsGenerating(false);
      }
      setActiveId(null);
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  // Clear all conversations
  const handleClearAllConversations = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    clearAllConversations();
    setConversations([]);
    setActiveId(null);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send Message & Stream Response
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (isGenerating) return;
    setGlobalError(null);

    let targetConvId = activeId;
    let currentConv = conversations.find((c) => c.id === targetConvId);

    // If no active conversation, initialize a new one
    if (!targetConvId || !currentConv) {
      const newTitle =
        text.slice(0, 36) || (attachments[0] ? `File: ${attachments[0].name}` : 'New Conversation');
      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newTitle.trim(),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      targetConvId = newConv.id;
      currentConv = newConv;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
    }

    // Create user message
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: Date.now(),
      status: 'complete',
    };

    // Placeholder assistant message
    const assistantMessageId = `msg-asst-${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      status: 'streaming',
    };

    // Update conversation with user & placeholder assistant messages
    const updatedMessages = [...currentConv.messages, userMessage, assistantMessage];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    // Clear input
    setInputDraft('');
    setIsGenerating(true);
    setTimeout(() => scrollToBottom(true), 50);

    // Setup AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Previous history for model context
    const previousMessages = currentConv.messages;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: previousMessages,
          currentPrompt: text,
          attachments,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMessage = 'Server error occurred.';
        try {
          const errJson = await response.json();
          if (errJson.error) errMessage = errJson.error;
        } catch {
          errMessage = `Request failed with HTTP status ${response.status}`;
        }
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read streaming response from server.');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataPayload = trimmed.replace(/^data:\s*/, '');
          if (dataPayload === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              // Stream into state
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === targetConvId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedText, status: 'streaming' }
                            : m
                        ),
                      }
                    : c
                )
              );
              scrollToBottom(true);
            }
          } catch (e: unknown) {
            if (e instanceof Error && e.message !== dataPayload) {
              // Ignore partial JSON parse warnings unless it's a real error
              if (dataPayload.includes('"error"')) {
                throw e;
              }
            }
          }
        }
      }

      // Mark assistant message as complete
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: accumulatedText || 'No response generated.',
                        status: 'complete',
                      }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was intentionally stopped by user
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content: m.content || '(Generation stopped)',
                          status: 'complete',
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        const errorText =
          err instanceof Error
            ? err.message
            : 'An unexpected connection error occurred. Please check your network and try again.';

        // Keep draft if empty so user doesn't lose thoughts
        setInputDraft((currentDraft) => (currentDraft ? currentDraft : text));

        // Mark message as error
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          status: 'error',
                          errorMessage: errorText,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  // Retry failed message
  const handleRetry = (failedMessageId: string) => {
    if (!activeConversation) return;

    // Find the failed assistant message and the preceding user message
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === failedMessageId);
    if (msgIndex <= 0) return;

    const userMessage = activeConversation.messages[msgIndex - 1];
    if (userMessage.role !== 'user') return;

    // Clean out the failed assistant message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: c.messages.filter((m) => m.id !== failedMessageId),
            }
          : c
      )
    );

    // Resend user message prompt
    handleSendMessage(userMessage.content, userMessage.attachments || []);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Top Navigation Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar menu"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <GemstoneLogo size={22} className="md:hidden" />
              <span className="font-semibold text-sm tracking-tight text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeConversation ? activeConversation.title : 'Aura-Gem-1.5'}
              </span>
            </div>
          </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              gemini-flash (multimodal)
            </span>
        </header>

        {/* Global Error Notice if any */}
        {globalError && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-danger-surface)] border-b border-[var(--color-danger)]/30 text-xs text-[var(--color-danger)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              className="p-1 hover:opacity-75"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages or Welcome Area */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 relative"
        >
          <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <WelcomeScreen onSelectPrompt={(p) => handleSendMessage(p, [])} />
            ) : (
              <div className="space-y-1">
                {activeConversation.messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onRetry={handleRetry}
                    isLastAssistantMessage={
                      msg.role === 'assistant' &&
                      index === activeConversation.messages.length - 1
                    }
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Message Composer */}
        <div className="shrink-0 p-3 sm:p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent">
          <div className="max-w-3xl mx-auto">
            <MessageComposer
              input={inputDraft}
              onChangeInput={setInputDraft}
              onSend={handleSendMessage}
              isGenerating={isGenerating}
              onStop={handleStopGeneration}
              sendOnEnter={settings.sendOnEnter}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        conversations={conversations}
        onClearAllConversations={handleClearAllConversations}
      />
    </div>
  );
}
