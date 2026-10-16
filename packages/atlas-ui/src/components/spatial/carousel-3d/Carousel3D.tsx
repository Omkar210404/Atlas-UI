import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { IconChevronRight } from '../../../icons/chevron-right';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { Button } from '../../actions/button/Button';
import './carousel-3d.css';

export interface CarouselSlide {
  id: string;
  /** Names the slide for the slide picker and for assistive technology. */
  label: string;
  content: ReactNode;
}

export interface Carousel3DProps {
  /** Names the carousel, for example "Harbour guides". */
  label: string;
  slides: readonly CarouselSlide[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

/**
 * A ring of slides in CSS 3D that you turn with buttons, the arrow keys or the slide picker.
 * Follows the WAI-ARIA carousel pattern. It never turns by itself, so there is nothing to
 * pause. No WebGL.
 */
export function Carousel3D({
  label,
  slides,
  index,
  defaultIndex = 0,
  onIndexChange,
  className,
}: Carousel3DProps) {
  const [current, setCurrent] = useControllableState({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  // A running count of turns, so the ring always takes the short way round.
  const [turns, setTurns] = useState(current);
  const id = useId();
  const n = slides.length;
  // Announce slide changes only after the first one the person makes.
  const [live, setLive] = useState(false);

  const go = (step: number) => {
    setLive(true);
    setTurns((t) => t + step);
    setCurrent((c) => (((c + step) % n) + n) % n);
  };
  const goTo = (target: number) => {
    const forward = (((target - current) % n) + n) % n;
    go(forward <= n / 2 ? forward : forward - n);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  const angle = 360 / n;

  return (
    // Arrow keys turn the ring while focus is anywhere inside the carousel region.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      className={['atl-carousel', className].filter(Boolean).join(' ')}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={{ '--atl-n': n, '--atl-turn': turns } as React.CSSProperties}
    >
      <div className="atl-carousel__controls">
        <Button
          size="s"
          icon={<IconChevronRight style={{ rotate: '180deg' }} />}
          aria-label="Previous slide"
          aria-controls={`${id}-ring`}
          onClick={() => go(-1)}
        />
        <div className="atl-carousel__picker" role="group" aria-label="Choose a slide">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className="atl-carousel__dot"
              aria-label={slide.label}
              aria-current={i === current ? 'true' : undefined}
              aria-controls={`${id}-ring`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <Button
          size="s"
          icon={<IconChevronRight />}
          aria-label="Next slide"
          aria-controls={`${id}-ring`}
          onClick={() => go(1)}
        />
      </div>
      <div className="atl-carousel__viewport">
        <div
          id={`${id}-ring`}
          className="atl-carousel__ring"
          aria-live={live ? 'polite' : 'off'}
          aria-atomic="false"
        >
          {slides.map((slide, i) => {
            const active = i === current;
            return (
              <div
                key={slide.id}
                className="atl-carousel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${slide.label}`}
                aria-hidden={active ? undefined : true}
                inert={!active}
                data-active={active || undefined}
                style={
                  {
                    '--atl-i': i,
                    transform: `rotateY(${i * angle}deg) translateZ(var(--atl-radius))`,
                  } as React.CSSProperties
                }
              >
                {slide.content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
