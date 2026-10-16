import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered size in px. The artwork is drawn on a 20px grid with a 1.5px stroke. */
  size?: number;
  /** Gives the icon an accessible name. Without it the icon is decorative and hidden. */
  title?: string;
}

export type Icon = ((props: IconProps) => ReactNode) & { displayName: string };

export function createIcon(displayName: string, artwork: ReactNode): Icon {
  function IconComponent({ size = 20, title, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {artwork}
      </svg>
    );
  }
  IconComponent.displayName = displayName;
  return IconComponent;
}
