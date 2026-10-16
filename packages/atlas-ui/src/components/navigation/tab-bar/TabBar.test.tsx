import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { Tab, TabBar, TabPanel, Tabs } from './TabBar';

function Example({
  activation = 'automatic',
  onValueChange,
}: {
  activation?: 'automatic' | 'manual';
  onValueChange?: (v: string) => void;
}) {
  return (
    <Tabs defaultValue="one" activation={activation} onValueChange={onValueChange}>
      <TabBar label="Example">
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
        <Tab value="three">Three</Tab>
      </TabBar>
      <TabPanel value="one">Panel one</TabPanel>
      <TabPanel value="two">Panel two</TabPanel>
      <TabPanel value="three">Panel three</TabPanel>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tab bar', () => {
  it('wires tabs to panels', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Example' })).toBeTruthy();
    const first = tab('One');
    expect(first.getAttribute('aria-selected')).toBe('true');
    const panel = screen.getByRole('tabpanel');
    expect(first.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(first.id);
    expect(panel.textContent).toBe('Panel one');
  });

  it('keeps only the selected tab in the tab order', () => {
    render(<Example />);
    expect(tab('One').tabIndex).toBe(0);
    expect(tab('Two').tabIndex).toBe(-1);
  });

  it('selects on click', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(tab('Three'));
    expect(tab('Three').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel three');
    expect(onValueChange).toHaveBeenCalledWith('three');
  });

  it('follows a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState('two');
      return (
        <>
          <button type="button" onClick={() => setValue('three')}>
            External
          </button>
          <Tabs value={value} onValueChange={setValue}>
            <TabBar label="Controlled">
              <Tab value="one">One</Tab>
              <Tab value="two">Two</Tab>
              <Tab value="three">Three</Tab>
            </TabBar>
          </Tabs>
        </>
      );
    }
    render(<Controlled />);
    expect(tab('Two').getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'External' }));
    expect(tab('Three').getAttribute('aria-selected')).toBe('true');
  });

  it('places the indicator under the selected tab', async () => {
    render(<Example />);
    await userEvent.click(tab('Two'));
    const list = screen.getByRole('tablist');
    await vi.waitFor(() => {
      expect(list.style.getPropertyValue('--atl-indicator-x')).toBe(`${tab('Two').offsetLeft}px`);
      expect(list.style.getPropertyValue('--atl-indicator-w')).toBe(`${tab('Two').offsetWidth}px`);
    });
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      ArrowRight: async () => {
        render(<Example />);
        await userEvent.click(tab('Three'));
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(tab('One'));
        expect(tab('One').getAttribute('aria-selected')).toBe('true');
      },
      ArrowLeft: async () => {
        render(<Example />);
        tab('One').focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(tab('Three'));
      },
      Home: async () => {
        render(<Example />);
        await userEvent.click(tab('Three'));
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(tab('One'));
      },
      End: async () => {
        render(<Example />);
        tab('One').focus();
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(tab('Three'));
      },
      'Enter / Space': async () => {
        render(<Example activation="manual" />);
        tab('One').focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(tab('Two'));
        expect(tab('One').getAttribute('aria-selected')).toBe('true');
        await userEvent.keyboard('{Enter}');
        expect(tab('Two').getAttribute('aria-selected')).toBe('true');
        await userEvent.keyboard('{ArrowRight}');
        await userEvent.keyboard(' ');
        expect(tab('Three').getAttribute('aria-selected')).toBe('true');
      },
      Tab: async () => {
        render(<Example />);
        tab('One').focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('tabpanel'));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
