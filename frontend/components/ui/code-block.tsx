'use client';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  isExpanded?: boolean;
  maxHeight?: string;
}

export function CodeBlock({ code, isExpanded = true, maxHeight = "400px" }: CodeBlockProps) {
  return (
    <Highlight
      theme={themes.nightOwl}
      code={code}
      language="json"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className + " overflow-auto p-4 rounded-lg text-sm"}
          style={{
            ...style,
            maxHeight: !isExpanded ? maxHeight : undefined,
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="select-none opacity-50 mr-4">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
} 