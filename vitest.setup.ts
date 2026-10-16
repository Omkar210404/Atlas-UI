import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import './packages/atlas-ui/src/tokens/tokens.css';
import './packages/atlas-ui/src/styles/base.css';

afterEach(() => {
  cleanup();
});
