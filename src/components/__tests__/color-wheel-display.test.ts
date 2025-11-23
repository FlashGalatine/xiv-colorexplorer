import { ColorWheelDisplay } from '../color-wheel-display';
import { createTestContainer, cleanupComponent } from './test-utils';
import type { Dye } from '@shared/types';
import { ThemeService } from '@services/index';

describe('ColorWheelDisplay', () => {
  let container: HTMLElement;
  let component: ColorWheelDisplay | null = null;

  const baseColor = '#ff0000';
  const harmonyDyes: Dye[] = [
    {
      id: 2,
      itemID: 2,
      name: 'Second',
      hex: '#00ff00',
      rgb: { r: 0, g: 255, b: 0 },
      hsv: { h: 120, s: 100, v: 100 },
      category: 'Green',
      acquisition: 'Test',
      cost: 1,
    },
    {
      id: 3,
      itemID: 3,
      name: 'Third',
      hex: '#0000ff',
      rgb: { r: 0, g: 0, b: 255 },
      hsv: { h: 240, s: 100, v: 100 },
      category: 'Blue',
      acquisition: 'Test',
      cost: 1,
    },
  ];

  beforeEach(() => {
    container = createTestContainer();
    vi.spyOn(ThemeService, 'getCurrentThemeObject').mockReturnValue({
      name: 'standard-light',
      palette: {} as any,
      isDark: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (component) {
      cleanupComponent(component, container);
    } else {
      container.remove();
    }
  });

  const createComponent = (): void => {
    component = new ColorWheelDisplay(container, baseColor, harmonyDyes, 'triadic', 160);
    component.init();
  };

  it('renders SVG wheel with donut segments', () => {
    createComponent();

    const svg = container.querySelector('svg.color-wheel');
    expect(svg).not.toBeNull();
  });

  it('renders a dot for each harmony dye', () => {
    createComponent();
    const dots = container.querySelectorAll('circle');

    // Expect at least base + harmony dots
    expect(dots.length).toBeGreaterThanOrEqual(harmonyDyes.length + 1);
  });

  it('displays harmony short name at center', () => {
    createComponent();
    const label = container.querySelector('text');
    expect(label?.textContent).toBe('TRIAD');
  });
});

