import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

vi.mock('@mui/icons-material', () => ({
  __esModule: true,
  default: new Proxy({}, { get: () => () => null }),
  Settings: () => null,
  Delete: () => null,
  DragHandle: () => null,
  BarChart: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  RotateLeft: () => null,
}));


vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
  };
});

afterEach(() => {
  cleanup();
});