import type { ReactNode } from 'react';
import './depth-layers-card.css';

export interface DepthLayer {
  id: string;
  content: ReactNode;
}

export interface DepthLayersCardProps {
  /** Layers from back to front. */
  layers: readonly DepthLayer[];
  /** Readable content below the stack: title, text, actions. */
  children?: ReactNode;
  /** Distance in px between layers when the card opens out. */
  spread?: number;
  className?: string;
}

/**
 * A card whose picture is a stack of flat planes that separate in CSS 3D on hover or focus,
 * like the layers of a chart lifted apart: sea, contours, labels. No WebGL.
 */
export function DepthLayersCard({
  layers,
  children,
  spread = 22,
  className,
}: DepthLayersCardProps) {
  return (
    <div
      className={['atl-depth', className].filter(Boolean).join(' ')}
      style={{ '--atl-spread': `${spread}px` } as React.CSSProperties}
    >
      <div className="atl-depth__stage" aria-hidden="true">
        <div className="atl-depth__stack">
          {layers.map((layer, i) => (
            <div
              key={layer.id}
              className="atl-depth__layer"
              style={{ '--atl-layer': i } as React.CSSProperties}
            >
              {layer.content}
            </div>
          ))}
        </div>
      </div>
      {children ? <div className="atl-depth__body">{children}</div> : null}
    </div>
  );
}
