import { useId } from 'react';
import type { PlaygroundValues, PropControl } from 'atlas-ui/docs/types';

/**
 * Playground controls generated from a component's metadata.
 * These are token-styled native inputs for now; they switch to atlas-ui's own Inputs
 * components once that category is charted.
 */
export function Controls({
  controls,
  values,
  onChange,
}: {
  controls: readonly PropControl[];
  values: PlaygroundValues;
  onChange: (name: string, value: string | number | boolean) => void;
}) {
  const baseId = useId();
  return (
    <div className="controls">
      {controls.map((control) => {
        const id = `${baseId}-${control.name}`;
        const hintId = `${id}-hint`;
        const value = values[control.name];
        return (
          <div key={control.name} className="control" data-kind={control.kind}>
            {control.kind === 'boolean' ? (
              <label className="control__check" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={Boolean(value)}
                  aria-describedby={hintId}
                  onChange={(e) => onChange(control.name, e.target.checked)}
                />
                <span>{control.label}</span>
              </label>
            ) : (
              <label className="control__label" htmlFor={id}>
                {control.label}
                {control.kind === 'number' ? (
                  <output className="control__value" htmlFor={id}>
                    {String(value)}
                    {control.unit ?? ''}
                  </output>
                ) : null}
              </label>
            )}
            {control.kind === 'select' ? (
              <select
                id={id}
                className="control__select"
                value={String(value)}
                aria-describedby={hintId}
                onChange={(e) => onChange(control.name, e.target.value)}
              >
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {control.kind === 'number' ? (
              <input
                id={id}
                className="control__range"
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={Number(value)}
                aria-describedby={hintId}
                onChange={(e) => onChange(control.name, Number(e.target.value))}
              />
            ) : null}
            {control.kind === 'text' ? (
              <input
                id={id}
                className="control__text"
                type="text"
                value={String(value)}
                aria-describedby={hintId}
                onChange={(e) => onChange(control.name, e.target.value)}
              />
            ) : null}
            <p id={hintId} className="control__hint">
              {control.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
