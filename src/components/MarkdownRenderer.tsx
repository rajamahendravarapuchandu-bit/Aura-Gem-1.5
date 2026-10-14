import React, { useMemo, useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Configure marked for GFM and line breaks
  const htmlContent = useMemo(() => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content || '') as string;
    } catch (err) {
      console.error('Markdown parse error:', err);
      return content;
    }
  }, [content]);

  // Handle copy for individual code blocks if clicked
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const copyButton = target.closest('[data-copy-code]') as HTMLElement;
    if (copyButton) {
      const codeId = copyButton.getAttribute('data-copy-code');
      const codeElement = document.getElementById(`code-block-${codeId}`);
      if (codeElement) {
        const textToCopy = codeElement.innerText;
        navigator.clipboard.writeText(textToCopy);
        const idx = parseInt(codeId || '0', 10);
        setCopiedCodeIndex(idx);
        setTimeout(() => setCopiedCodeIndex(null), 2000);
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`markdown-body select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
