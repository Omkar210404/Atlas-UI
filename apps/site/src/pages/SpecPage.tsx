import { Fragment, useEffect, useState } from 'react';
import { defaultValues, type ComponentDocs, type PlaygroundValues } from 'atlas-ui/docs/types';
import { IconCheck } from 'atlas-ui/icons/check';
import { IconCopy } from 'atlas-ui/icons/copy';
import { Tab, TabBar, TabPanel, Tabs } from 'atlas-ui/navigation/tab-bar';
import { announce } from 'atlas-ui/primitives/announce';
import type { Category, TypeEntry } from '../catalog';
import { Controls } from './Playground';
import { loadSource, type Source } from './sources';
import { useDocs } from './useDocs';

type StageTheme = 'page' | 'night' | 'day' | 'both';

const mac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

function Keys({ combo }: { combo: string }) {
  const names: Record<string, string> = {
    Mod: mac ? '⌘' : 'Ctrl',
    ArrowRight: '→',
    ArrowLeft: '←',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Escape: 'Esc',
  };
  const parts = combo.split('+');
  return (
    <span className="keys">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <span aria-hidden="true">+</span> : null}
          <kbd aria-label={part === 'Mod' ? (mac ? 'Command' : 'Control') : part}>{names[part] ?? part}</kbd>
        </Fragment>
      ))}
    </span>
  );
}

function Stage({ docs, slug }: { docs: ComponentDocs; slug: string }) {
  const [theme, setTheme] = useState<StageTheme>('page');
  const [preset, setPreset] = useState(docs.presets[0]?.id ?? '');
  const themes: StageTheme[] = theme === 'both' ? ['night', 'day'] : [theme];

  return (
    <section className="stage" aria-labelledby="stage-title">
      <div className="stage__bar">
        <h2 id="stage-title" className="section-title">
          Live preview
        </h2>
        <fieldset className="mini-toggle">
          <legend className="mini-toggle__legend">Preview theme</legend>
          {(['page', 'night', 'day', 'both'] as const).map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={`stage-theme-${slug}`}
                value={option}
                checked={theme === option}
                onChange={() => setTheme(option)}
              />
              <span>{{ page: 'Page', night: 'Dark', day: 'Light', both: 'Both' }[option]}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <Tabs value={preset} onValueChange={setPreset}>
        <TabBar label="Presets" variant="chip">
          {docs.presets.map((p) => (
            <Tab key={p.id} value={p.id}>
              {p.name}
            </Tab>
          ))}
        </TabBar>
        {docs.presets.map((p) => (
          <TabPanel key={p.id} value={p.id} className="stage__panel">
            <p className="stage__description">{p.description}</p>
            <div className="stage__frames" data-count={themes.length}>
              {themes.map((t) => (
                <div
                  key={t}
                  className="stage__frame"
                  data-theme={t === 'page' ? undefined : t}
                  style={p.id === docs.presets[0]?.id && t === themes[0] ? { viewTransitionName: `stage-${slug}` } : undefined}
                >
                  {themes.length > 1 ? <span className="stage__frame-label">{t === 'night' ? 'Dark' : 'Light'}</span> : null}
                  {p.render(themes.length > 1 ? (t === 'night' ? 'dark' : 'light') : undefined)}
                </div>
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </section>
  );
}

function PlaygroundSection({ docs }: { docs: ComponentDocs }) {
  const [values, setValues] = useState<PlaygroundValues>(() => defaultValues(docs.meta));
  const { Playground } = docs;
  return (
    <section className="playground" aria-labelledby="playground-title">
      <h2 id="playground-title" className="section-title">
        Props playground
      </h2>
      <div className="playground__layout">
        <Controls
          controls={docs.meta.props}
          values={values}
          onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
        />
        <div className="playground__output">
          <Playground values={values} />
        </div>
      </div>
      <button type="button" className="text-button" onClick={() => setValues(defaultValues(docs.meta))}>
        Reset props
      </button>
    </section>
  );
}

function CodePanel({ category, slug, file }: { category: string; slug: string; file: string }) {
  const [source, setSource] = useState<Source | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSource(category, slug, file).then((s) => alive && setSource(s));
    return () => {
      alive = false;
    };
  }, [category, slug, file]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source.code);
      setCopied(true);
      announce(`Copied ${file}`);
    } catch {
      announce('Copying was blocked by the browser. Select the code and copy it instead.', 'assertive');
    }
  };

  return (
    <div className="code-panel">
      <div className="code-panel__bar">
        <span className="code-panel__file">{file}</span>
        {source ? (
          <span className="code-panel__lines">{source.code.split('\n').length} lines</span>
        ) : null}
        <button type="button" className="code-panel__copy" onClick={copy} disabled={!source}>
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {source ? (
        <div
          className="code-panel__body"
          // Generated at build time from this repository's own source files.
          dangerouslySetInnerHTML={{ __html: source.html }}
        />
      ) : (
        <p className="code-panel__loading">{source === null ? 'Source not found.' : 'Loading source…'}</p>
      )}
    </div>
  );
}

function SourceSection({ docs }: { docs: ComponentDocs }) {
  const [file, setFile] = useState(docs.meta.files[0] ?? '');
  const deps = Object.entries(docs.meta.dependencies);
  return (
    <div className="reference__body">
      <p className="prose">
        Copy these files into your project, next to the shared atlas-ui files listed below.
        Needs {deps.map(([name, range]) => `${name} ${range}`).join(', ')}; nothing else from npm.
      </p>
      <p className="prose">
        Shared files:{' '}
        {docs.meta.registryDependencies.map((dep, i) => (
          <Fragment key={dep}>
            {i > 0 ? ', ' : null}
            <code>{dep}</code>
          </Fragment>
        ))}
        .
      </p>
      <Tabs value={file} onValueChange={setFile}>
        <TabBar label="Source files" variant="chip">
          {docs.meta.files.map((f) => (
            <Tab key={f} value={f}>
              {f}
            </Tab>
          ))}
        </TabBar>
        {docs.meta.files.map((f) => (
          <TabPanel key={f} value={f} className="reference__code">
            <CodePanel category={docs.meta.category} slug={docs.meta.slug} file={f} />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

function Reference({ docs }: { docs: ComponentDocs }) {
  const { meta } = docs;
  return (
    <section className="reference" aria-label="Reference">
      <Tabs defaultValue="usage">
        <TabBar label="Reference" variant="line">
          <Tab value="usage">Usage</Tab>
          <Tab value="source">Source</Tab>
          <Tab value="keyboard">Keyboard</Tab>
          <Tab value="a11y">Accessibility</Tab>
          <Tab value="motion">Reduced motion</Tab>
        </TabBar>
        <TabPanel value="usage" className="reference__panel">
          <ul className="notes">
            {meta.usage.map((note) => (
              <li key={note}>
                <InlineCode text={note} />
              </li>
            ))}
          </ul>
        </TabPanel>
        <TabPanel value="source" className="reference__panel">
          <SourceSection docs={docs} />
        </TabPanel>
        <TabPanel value="keyboard" className="reference__panel">
          <table className="key-table">
            <caption className="atl-visually-hidden">Keyboard map for {meta.name}</caption>
            <thead>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">What happens</th>
              </tr>
            </thead>
            <tbody>
              {meta.keyboard.map((binding) => (
                <tr key={binding.keys.join()}>
                  <td>
                    {binding.keys.map((combo, i) => (
                      <Fragment key={combo}>
                        {i > 0 ? <span className="key-table__or"> or </span> : null}
                        <Keys combo={combo} />
                      </Fragment>
                    ))}
                  </td>
                  <td>{binding.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabPanel>
        <TabPanel value="a11y" className="reference__panel">
          <ul className="notes">
            {meta.accessibility.map((note) => (
              <li key={note}>
                <InlineCode text={note} />
              </li>
            ))}
          </ul>
        </TabPanel>
        <TabPanel value="motion" className="reference__panel">
          <p className="prose">{meta.reducedMotion}</p>
          <p className="prose prose--soft">
            Applies when your system asks for reduced motion, or when you choose Reduce motion in the
            search palette.
          </p>
        </TabPanel>
      </Tabs>
    </section>
  );
}

/** Renders `backtick` spans in docs text as code. */
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

export function SpecPage({ category, type }: { category: Category; type: TypeEntry }) {
  const docs = useDocs(category.slug, type.slug);

  if (docs === null) {
    return (
      <div className="page">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          {type.name}
        </h1>
        <p className="page__lede">This type is not charted yet, so it has no spec sheet.</p>
      </div>
    );
  }

  return (
    <div className="page page--spec">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          {type.name}
        </h1>
        <p className="page__lede">{type.summary}</p>
        {docs
          ? docs.meta.description.map((paragraph) => (
              <p key={paragraph} className="prose">
                {paragraph}
              </p>
            ))
          : null}
      </header>
      {docs ? (
        <>
          <Stage docs={docs} slug={type.slug} />
          <PlaygroundSection docs={docs} />
          <Reference docs={docs} />
        </>
      ) : (
        <p className="page__meta">Loading the spec sheet…</p>
      )}
    </div>
  );
}
