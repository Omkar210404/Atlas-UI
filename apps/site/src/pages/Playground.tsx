import type { PlaygroundValues, PropControl } from 'atlas-ui/docs/types';
import { AnimatedSelect } from 'atlas-ui/inputs/animated-select';
import { RangeSlider } from 'atlas-ui/inputs/range-slider';
import { SegmentedControl } from 'atlas-ui/inputs/segmented-control';
import { Switch } from 'atlas-ui/inputs/switch';
import { TextField } from 'atlas-ui/inputs/text-field';

/** Playground controls generated from a component's metadata, built from atlas-ui's own inputs. */
export function Controls({
  controls,
  values,
  onChange,
}: {
  controls: readonly PropControl[];
  values: PlaygroundValues;
  onChange: (name: string, value: string | number | boolean) => void;
}) {
  return (
    <div className="controls">
      {controls.map((control) => {
        const value = values[control.name];
        switch (control.kind) {
          case 'boolean':
            return (
              <Switch
                key={control.name}
                label={control.label}
                description={control.description}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange(control.name, checked)}
              />
            );
          case 'select':
            return control.options.length <= 3 ? (
              <div key={control.name} className="control">
                <SegmentedControl
                  label={control.label}
                  size="s"
                  options={control.options}
                  value={String(value)}
                  onValueChange={(v) => onChange(control.name, v)}
                />
                <p className="control__hint">{control.description}</p>
              </div>
            ) : (
              <AnimatedSelect
                key={control.name}
                label={control.label}
                hint={control.description}
                options={control.options}
                value={String(value)}
                onValueChange={(v) => onChange(control.name, v)}
              />
            );
          case 'number':
            return (
              <div key={control.name} className="control">
                <RangeSlider
                  label={control.label}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={Number(value)}
                  onValueChange={(v) => onChange(control.name, v)}
                  formatValue={(v) => `${v}${control.unit ? ` ${control.unit}` : ''}`}
                  tooltip="always"
                />
                <p className="control__hint">{control.description}</p>
              </div>
            );
          case 'text':
            return (
              <TextField
                key={control.name}
                label={control.label}
                hint={control.description}
                value={String(value)}
                onValueChange={(v) => onChange(control.name, v)}
              />
            );
        }
      })}
    </div>
  );
}
