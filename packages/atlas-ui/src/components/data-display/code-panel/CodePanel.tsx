import { Fragment, useEffect, useState } from 'react';
import { IconCheck } from '../../../icons/check';
import { IconCopy } from '../../../icons/copy';
import { announce } from '../../../primitives/announce';
import { Button } from '../../actions/button/Button';
import './code-panel.css';

export interface CodePanelProps {
  /** The source text: what gets copied. */
  code: string;
  /** Pre-highlighted HTML for the same code (for example from Shiki at build time). Plain text is shown without it. */
  html?: string;
  filename?: string;
  /** Called after a successful copy, for example to show a toast. Otherwise the panel announces it. */
  onCopied?: () => void;
  onCopyFailed?: () => void;
  className?: string;
}

/**
 * Source code with line numbers and a copy button. Highlighting is optional and expected
 * to be done ahead of time, so no highlighter ships to the browser. The code area scrolls
 * and is focusable, so keyboard users can scroll it too.
 */
export function CodePanel({
  code,
  html,
  filename,
  onCopied,
  onCopyFailed,
  className,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (onCopied) onCopied();
      else announce(`Copied${filename ? ` ${filename}` : ''}`);
    } catch {
      if (onCopyFailed) onCopyFailed();
      else
        announce(
          'Copying was blocked by the browser. Select the code and copy it instead.',
          'assertive',
        );
    }
  };

  const lines = code.split('\n').length;

  return (
    <div className={['atl-code', className].filter(Boolean).join(' ')}>
      <div className="atl-code__bar">
        {filename ? <span className="atl-code__file">{filename}</span> : null}
        <span className="atl-code__lines">{lines} lines</span>
        <Button
          size="s"
          className="atl-code__copy"
          onClick={copy}
          icon={copied ? <IconCheck /> : <IconCopy />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {html ? (
        // Highlighted ahead of time from source the author controls, never from user input.
        <div className="atl-code__body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="atl-code__body">
          {/* A scrollable region must be reachable by keyboard. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <pre tabIndex={0}>
            <code>
              {code.split('\n').map((line, i) => (
                // Newlines sit between line spans, as in highlighted output.
                <Fragment key={i}>
                  <span className="line">{line}</span>
                  {'\n'}
                </Fragment>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
