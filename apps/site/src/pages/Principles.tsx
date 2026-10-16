import { useState } from 'react';
import { Button } from 'atlas-ui/actions/button';
import { contrastRatio } from 'atlas-ui/tokens/contrast';
import { cubicBezier } from 'atlas-ui/motion/tween';
import {
  durations,
  easings,
  radius,
  space,
  springs,
  themes,
  typeScale,
  type ThemeColours,
} from 'atlas-ui/tokens/tokens';

const roles: Array<[keyof ThemeColours, string, string]> = [
  ['sea0', '--sea-0', 'Background at the atlas, the shallowest level'],
  ['sea3', '--sea-3', 'Background at the spec sheet, the deepest level'],
  ['shoal', '--shoal', 'Surfaces: panels and regions'],
  ['reef', '--reef', 'Raised and active surfaces'],
  ['ink', '--ink', 'Text'],
  ['inkSoft', '--ink-soft', 'Secondary text'],
  ['edge', '--edge', 'Control boundaries'],
  ['isobath', '--isobath', 'Contour lines, decorative only'],
  ['magenta', '--chart-magenta', 'Focus, current location, primary action'],
  ['starboard', '--starboard', 'Success'],
  ['port', '--port', 'Danger'],
  ['caution', '--caution', 'Warning'],
];

function Swatches() {
  return (
    <div className="swatch-table" role="table" aria-label="Colour tokens and their contrast">
      <div role="row" className="swatch-table__row swatch-table__head">
        <span role="columnheader">Token</span>
        <span role="columnheader">Dark theme</span>
        <span role="columnheader">Light theme</span>
      </div>
      {roles.map(([key, name, role]) => (
        <div role="row" key={key} className="swatch-table__row">
          <span role="rowheader" className="swatch-table__token">
            <code>{name}</code>
            <span className="swatch-table__role">{role}</span>
          </span>
          {(['night', 'day'] as const).map((theme) => {
            const colour = themes[theme][key];
            const ratio = contrastRatio(colour, themes[theme].sea0);
            return (
              <span role="cell" key={theme} className="swatch">
                <span
                  className="swatch__chip"
                  style={{
                    background: colour,
                    boxShadow: `inset 0 0 0 1px ${themes[theme].isobath}`,
                  }}
                  aria-hidden="true"
                />
                <span className="swatch__value">{colour}</span>
                <span className="swatch__ratio">{ratio.toFixed(2)}:1 on background</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function EaseCurve({
  name,
  curve,
}: {
  name: string;
  curve: readonly [number, number, number, number];
}) {
  const [played, setPlayed] = useState(false);
  const fn = cubicBezier(...curve);
  const points = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${(t * 100).toFixed(1)},${(100 - fn(t) * 100).toFixed(1)}`;
  }).join(' ');
  return (
    <figure className="ease">
      <svg viewBox="-4 -14 108 128" className="ease__curve" aria-hidden="true">
        <rect x="0" y="0" width="100" height="100" className="ease__box" />
        <polyline points={points} className="ease__line" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption>
        <code>--ease-{name}</code>
        <span className="ease__values">cubic-bezier({curve.join(', ')})</span>
      </figcaption>
      <div className="ease__track" aria-hidden="true">
        <span
          className="ease__dot"
          data-played={played || undefined}
          style={{ transitionTimingFunction: `cubic-bezier(${curve.join(',')})` }}
        />
      </div>
      <Button variant="quiet" size="s" className="ease__play" onClick={() => setPlayed((p) => !p)}>
        Play {name}
      </Button>
    </figure>
  );
}

export function Principles() {
  return (
    <div className="page page--principles">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          Principles
        </h1>
        <p className="page__lede">
          atlas-ui borrows its visual language from nautical charts. Everything on this page is
          rendered from the same token file the components use.
        </p>
      </header>

      <section className="principle" aria-labelledby="p-idea">
        <h2 id="p-idea" className="section-title">
          The idea
        </h2>
        <div className="prose-block">
          <p>
            Charts shade water darker as it gets deeper. Here, zooming in is going deeper: the
            background darkens one step at each level, from the atlas to a component’s spec sheet,
            so you can feel where you are before you read anything.
          </p>
          <p>
            Regions are islands drawn with contour lines instead of boxes with shadows. Their names
            are set in letter-spaced italic along the coast, as charts name water. Raised surfaces
            get a contour edge; only overlays get a real shadow.
          </p>
          <p>
            Charts print the information that matters most in magenta. So does atlas-ui: magenta
            marks focus, your current location and primary actions, and nothing else.
          </p>
        </div>
      </section>

      <section className="principle" aria-labelledby="p-colour">
        <h2 id="p-colour" className="section-title">
          Colour
        </h2>
        <p className="prose">
          Every text colour reaches at least 4.5:1 on every surface in both themes, and control
          boundaries reach 3:1. A test computes each pair from the token file and fails the build if
          one drops below.
        </p>
        <Swatches />
      </section>

      <section className="principle" aria-labelledby="p-type">
        <h2 id="p-type" className="section-title">
          Type
        </h2>
        <div className="type-specimens">
          <div className="type-specimen">
            <p className="type-specimen__sample type-specimen__sample--display">
              Bricolage Grotesque
            </p>
            <p className="type-specimen__note">
              Display and interface. Weight 400–700, optical sizes.
            </p>
          </div>
          <div className="type-specimen">
            <p className="type-specimen__sample type-specimen__sample--prose">
              Newsreader carries prose, at a comfortable measure and an open line height.
            </p>
            <p className="type-specimen__note">Prose. Weight 400–600, optical sizes.</p>
          </div>
          <div className="type-specimen">
            <p className="type-specimen__sample type-specimen__sample--label">Newsreader Italic</p>
            <p className="type-specimen__note">
              Hydrographic labels: region names and group headings.
            </p>
          </div>
          <div className="type-specimen">
            <p className="type-specimen__sample type-specimen__sample--code">JetBrains Mono</p>
            <p className="type-specimen__note">Code and key caps only.</p>
          </div>
        </div>
        <ol className="scale-list" aria-label="Type scale, major third from 17px">
          {Object.entries(typeScale)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([step, rem]) => (
              <li key={step} style={{ fontSize: `${rem}rem` }}>
                <code>--step-{step}</code> {Math.round(rem * 16 * 10) / 10}px
              </li>
            ))}
        </ol>
      </section>

      <section className="principle" aria-labelledby="p-space">
        <h2 id="p-space" className="section-title">
          Space and shape
        </h2>
        <ul className="space-list">
          {Object.entries(space).map(([name, px]) => (
            <li key={name}>
              <span className="space-list__bar" style={{ width: px }} aria-hidden="true" />
              <code>--space-{name}</code> {px}px
            </li>
          ))}
        </ul>
        <ul className="radius-list">
          {Object.entries(radius).map(([name, px]) => (
            <li key={name}>
              <span
                className="radius-list__sample"
                style={{ borderRadius: Math.min(px, 40) }}
                aria-hidden="true"
              />
              <code>--radius-{name}</code>
              <span>
                {name === 'round' ? 'fully round' : `${px}px`}
                {name === 'control'
                  ? ', for controls'
                  : name === 'panel'
                    ? ', for panels'
                    : name === 'overlay'
                      ? ', for overlays'
                      : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="principle" aria-labelledby="p-motion">
        <h2 id="p-motion" className="section-title">
          Motion
        </h2>
        <p className="prose">
          Motion answers something you did: a press, an opening, a zoom. The only motion that starts
          on its own is the chart drawing itself on your first visit. With reduced motion, every
          duration below becomes zero.
        </p>
        <div className="ease-grid">
          {Object.entries(easings).map(([name, curve]) => (
            <EaseCurve key={name} name={name} curve={curve} />
          ))}
        </div>
        <table className="key-table">
          <caption className="atl-visually-hidden">Durations and springs</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Value</th>
              <th scope="col">Used for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--dur-tick</code>
              </td>
              <td>{durations.tick}ms</td>
              <td>Hover and press feedback</td>
            </tr>
            <tr>
              <td>
                <code>--dur-step</code>
              </td>
              <td>{durations.step}ms</td>
              <td>Small state changes</td>
            </tr>
            <tr>
              <td>
                <code>--dur-glide</code>
              </td>
              <td>{durations.glide}ms</td>
              <td>Panels, menus and overlays</td>
            </tr>
            <tr>
              <td>
                <code>--dur-voyage</code>
              </td>
              <td>{durations.voyage}ms</td>
              <td>Zooming between levels</td>
            </tr>
            <tr>
              <td>
                <code>--ease-current</code>
              </td>
              <td>
                spring {springs.current.stiffness}/{springs.current.damping}
              </td>
              <td>Indicators that follow a selection, as a CSS linear() curve</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
