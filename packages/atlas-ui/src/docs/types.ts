import type { ComponentType, ReactNode } from 'react';

export type CategorySlug =
  | 'actions'
  | 'inputs'
  | 'navigation'
  | 'data-display'
  | 'feedback'
  | 'overlays'
  | 'layout'
  | 'spatial';

interface ControlBase {
  /** Prop name the value is passed as. */
  name: string;
  label: string;
  description: string;
}

/** A playground control. The playground renders one input per entry. */
export type PropControl =
  | (ControlBase & { kind: 'boolean'; default: boolean })
  | (ControlBase & {
      kind: 'select';
      default: string;
      options: ReadonlyArray<{ value: string; label: string }>;
    })
  | (ControlBase & {
      kind: 'number';
      default: number;
      min: number;
      max: number;
      step: number;
      unit?: string;
    })
  | (ControlBase & { kind: 'text'; default: string });

export type PlaygroundValues = Record<string, string | number | boolean>;

export interface KeyBinding {
  /** Alternative key combinations, each written like `Shift+F10` or `Mod+K` (Mod = Ctrl or ⌘). */
  keys: readonly string[];
  /** What happens, in plain words. */
  action: string;
}

export interface ComponentMeta {
  slug: string;
  name: string;
  category: CategorySlug;
  /** One sentence shown on the atlas and in search. */
  summary: string;
  /** Paragraphs for the spec sheet introduction. */
  description: readonly string[];
  usage: readonly string[];
  keyboard: readonly KeyBinding[];
  accessibility: readonly string[];
  reducedMotion: string;
  props: readonly PropControl[];
  /** Source files in the component folder, in display order. */
  files: readonly string[];
  /** npm packages the copied source needs, with version ranges. */
  dependencies: Readonly<Record<string, string>>;
  /** Shared atlas-ui files the copied source needs (primitives, icons, tokens). */
  registryDependencies: readonly string[];
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  render: () => ReactNode;
}

export interface ComponentDocs {
  meta: ComponentMeta;
  presets: readonly Preset[];
  Playground: ComponentType<{ values: PlaygroundValues }>;
}

export function defaultValues(meta: ComponentMeta): PlaygroundValues {
  return Object.fromEntries(meta.props.map((control) => [control.name, control.default]));
}
