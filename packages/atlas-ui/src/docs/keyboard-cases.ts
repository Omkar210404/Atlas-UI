import type { ComponentMeta } from './types';

type Case = () => Promise<void>;

/**
 * Pairs every documented key binding with a test, so the keyboard map on the spec sheet
 * cannot drift from behaviour. A binding without a test, or a test for a binding that is
 * not documented, throws.
 */
export function keyboardCases(
  meta: ComponentMeta,
  cases: Record<string, Case>,
): Array<[string, Case]> {
  const documented = meta.keyboard.map((binding) => binding.keys.join(' / '));
  const missing = documented.filter((id) => !(id in cases));
  const extra = Object.keys(cases).filter((id) => !documented.includes(id));
  if (missing.length || extra.length) {
    throw new Error(
      `Keyboard map and tests disagree for ${meta.name}. ` +
        `Untested: [${missing.join(', ')}]. Undocumented: [${extra.join(', ')}].`,
    );
  }
  return documented.map((id) => [id, cases[id] as Case]);
}
