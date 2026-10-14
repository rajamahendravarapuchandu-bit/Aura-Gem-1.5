import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react';
import { Conversation, ThemePreference } from '../types';
import { GemstoneLogo } from './GemstoneLogo';
import { ConfirmationModal } from './ConfirmationModal';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  theme: ThemePreference;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-hidden bg-[var(--color-surface)] border-r border-[var(--color-border)] select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <GemstoneLogo size={28} className="shrink-0" />
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
                  Aura-Gem<span className="text-[var(--color-accent)] font-semibold">-1.5</span>
                </h1>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium leading-tight">
                  Simple AI. Endless Possibilities.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium text-sm transition-all shadow-xs focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-hidden"
            title="Start a new conversation"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Search Bar (visible when expanded) */}
        {!isCollapsed && conversations.length > 3 && (
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {!isCollapsed && (
          <div className="px-2 py-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Recent Conversations
          </div>
        )}

        {filteredConversations.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-6 text-center text-xs text-[var(--color-text-muted)]">
              {searchQuery ? 'No matching chats found' : 'No recent chats yet'}
            </div>
          )
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  if (!isEditing) {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }
                }}
                className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
                title={conv.title}
              >
                {/* Left icon and title */}
                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                  <MessageSquare
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  />
                  {!isCollapsed && (
                    isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e, conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-text-primary)] rounded px-1.5 py-0.5 text-xs outline-hidden"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )
                  )}
                </div>

                {/* Action buttons (Rename, Delete) */}
                {!isCollapsed && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleSaveRename(e, conv.id)}
                          aria-label="Save title"
                          className="p-1 hover:text-[var(--color-accent)]"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          aria-label="Cancel rename"
                          className="p-1 hover:text-[var(--color-danger)]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, conv)}
                          aria-label="Rename conversation"
                          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, conv.id)}
                          aria-label="Delete conversation"
                          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions: Settings and Theme Toggle */}
      <div className="p-3 border-t border-[var(--color-border-subtle)] space-y-1">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle light or dark theme"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          ) : (
            <Moon className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          aria-label="Open settings"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingId !== null}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This will permanently remove it from your device."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) {
            onDeleteConversation(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out h-full ${
          isCollapsed ? 'w-16' : 'w-64 lg:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-surface)] shadow-2xl transition-transform duration-250 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
