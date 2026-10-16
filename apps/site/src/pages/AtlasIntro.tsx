import { chartedCount, plannedCount } from '../catalog';

/** The chart's title cartouche, set over open water in the top-left corner. */
export function AtlasIntro() {
  return (
    <div className="cartouche">
      <h1 id="level-title" className="cartouche__title" tabIndex={-1}>
        An atlas of interfaces.
      </h1>
      <p className="cartouche__lede">
        Original React components, charted by region. Choose a region to zoom in.
      </p>
      <p className="cartouche__meta">
        {chartedCount} of {plannedCount} components charted so far. Drag to pan; arrow keys move
        between regions; <kbd>/</kbd> searches.
      </p>
    </div>
  );
}
