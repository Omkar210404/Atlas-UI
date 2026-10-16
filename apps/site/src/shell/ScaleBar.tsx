import type { Route } from '../router';

const steps = [
  { level: 'atlas', label: 'Atlas' },
  { level: 'region', label: 'Region' },
  { level: 'type', label: 'Type' },
  { level: 'spec', label: 'Spec' },
] as const;

/**
 * A chart's scale bar, repurposed: it shows how far you have zoomed in.
 * Decorative for assistive technology; the breadcrumb trail carries the same information.
 */
export function ScaleBar({ route }: { route: Route }) {
  const index = steps.findIndex((s) => s.level === route.level);
  if (index === -1) return null;
  return (
    <div className="scale-bar" aria-hidden="true">
      <div className="scale-bar__track">
        {steps.map((step, i) => (
          <span key={step.level} className="scale-bar__segment" data-filled={i <= index || undefined} />
        ))}
      </div>
      <div className="scale-bar__labels">
        {steps.map((step, i) => (
          <span key={step.level} data-current={i === index || undefined}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
