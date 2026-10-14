import React from 'react';
import { Sparkles, FileText, Image as ImageIcon, Lightbulb, BookOpen } from 'lucide-react';
import { GemstoneLogo } from './GemstoneLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    icon: Lightbulb,
    title: 'Explain complex concepts',
    description: 'Explain quantum computing in simple terms with everyday analogies.',
    prompt: 'Explain quantum computing in simple terms with everyday analogies.',
  },
  {
    icon: FileText,
    title: 'Summarize documents & PDFs',
    description: 'Extract key takeaways, action items, and risks from any document.',
    prompt: 'What are the best strategies for extracting actionable insights from a technical report?',
  },
  {
    icon: ImageIcon,
    title: 'Analyze visual content',
    description: 'Upload an image, diagram, or chart to get a detailed breakdown.',
    prompt: 'Can you give me tips on how to effectively analyze charts and diagrams?',
  },
  {
    icon: BookOpen,
    title: 'Draft & refine writing',
    description: 'Polished essays, project proposals, executive summaries, or code.',
    prompt: 'Draft a concise, professional project update email for executive stakeholders.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center max-w-2xl mx-auto my-auto select-none">
      {/* Gemstone Logo with subtle aura */}
      <div className="mb-6 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-20 blur-xl scale-150 animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md">
          <GemstoneLogo size={40} />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-2.5">
        Welcome to Aura-Gem<span className="text-[var(--color-accent)]">-1.5</span>
      </h2>
      <p className="text-base text-[var(--color-text-secondary)] mb-8 max-w-md leading-relaxed">
        Ask a question, upload a file, or explore something new.
      </p>

      {/* Example Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {EXAMPLE_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)]/60 transition-all shadow-xs hover:shadow-sm focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-hidden cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
