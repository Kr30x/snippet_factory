'use client';
import { Highlight, themes } from 'prism-react-renderer';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  code: string;
  isExpanded?: boolean;
  language?: string;
}

export function CodeBlock({ code, isExpanded = false, language = 'json' }: CodeBlockProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "relative font-mono text-sm overflow-hidden",
      !isExpanded && "max-h-[400px]"
    )}>
      <Highlight
        theme={theme === 'dark' ? themes.nightOwl : themes.github}
        code={code}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              className,
              "p-4 overflow-x-auto",
              theme === 'dark' && language === 'python' && "bg-zinc-950"
            )}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell text-right pr-4 select-none opacity-50 text-sm">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
} 