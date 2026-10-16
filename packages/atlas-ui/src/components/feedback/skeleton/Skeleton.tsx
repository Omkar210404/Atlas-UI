import type { CSSProperties, ReactNode } from 'react';
import './skeleton.css';

export interface SkeletonProps {
  /** `line` for text, `block` for media and cards, `circle` for avatars and icons. */
  shape?: 'line' | 'block' | 'circle';
  /** CSS width, such as `60%` or `12rem`. Lines default to full width. */
  width?: string | number;
  /** CSS height. Lines default to one line of body text. */
  height?: string | number;
  /** Repeat a line this many times; the last line is shorter, like a paragraph's last line. */
  lines?: number;
  className?: string;
}

const size = (value: string | number | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/** A placeholder shaped like the content that is about to load. Decorative on its own. */
export function Skeleton({ shape = 'line', width, height, lines = 1, className }: SkeletonProps) {
  const style: CSSProperties = { width: size(width), height: size(height) };
  if (shape === 'line' && lines > 1) {
    return (
      <span
        className={['atl-skeleton-lines', className].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className="atl-skeleton"
            data-shape="line"
            style={{ ...style, width: i === lines - 1 ? '62%' : style.width }}
          />
        ))}
      </span>
    );
  }
  return (
    <span
      className={['atl-skeleton', className].filter(Boolean).join(' ')}
      data-shape={shape}
      style={style}
      aria-hidden="true"
    />
  );
}

export interface SkeletonGroupProps {
  /** While true, the placeholders show and the region is marked busy. */
  loading: boolean;
  /** What is loading, read to screen readers, for example "Loading harbour details". */
  label: string;
  /** Placeholders shown while loading. */
  placeholder: ReactNode;
  /** The real content, shown once loaded. */
  children: ReactNode;
  className?: string;
}

/**
 * Swaps placeholders for real content. The region is `aria-busy` while loading and says
 * what it is waiting for, so assistive technology does not read the empty shapes.
 */
export function SkeletonGroup({
  loading,
  label,
  placeholder,
  children,
  className,
}: SkeletonGroupProps) {
  return (
    <div
      className={['atl-skeleton-group', className].filter(Boolean).join(' ')}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="atl-visually-hidden" role="status">
            {label}
          </span>
          {placeholder}
        </>
      ) : (
        children
      )}
    </div>
  );
}
