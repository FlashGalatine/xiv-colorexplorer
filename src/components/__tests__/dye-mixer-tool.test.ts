import { DyeMixerTool } from '../dye-mixer-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
} from './test-utils';
import type { Dye } from '@shared/types';
import { dyeService } from '@services/index';
import type { InterpolationStep } from '../color-interpolation-display';

const dyeSelectorInitMock = vi.fn();
const interpolationInitMock = vi.fn();

vi.mock('../dye-selector', () => {
  return {
    DyeSelector: class {
      constructor(_container: HTMLElement, _options: unknown) {}
      init(): void {
        dyeSelectorInitMock();
      }
      destroy(): void {
        /* noop */
      }
    },
  };
});

vi.mock('../color-interpolation-display', () => {
  return {
    ColorInterpolationDisplay: class {
      constructor(
        _container: HTMLElement,
        _startColor: string,
        _endColor: string,
        _steps: InterpolationStep[],
        _colorSpace: 'rgb' | 'hsv'
      ) {}
      init(): void {
        interpolationInitMock();
      }
      destroy(): void {
        /* noop */
      }
    },
  };
});

describe('DyeMixerTool', () => {
  let container: HTMLElement;
  let component: DyeMixerTool | null = null;

  beforeEach(() => {
    container = createTestContainer();
    setupMockLocalStorage();
    vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(mockDye('Closest', '#abcdef'));
    vi.spyOn(dyeService, 'getDyeById').mockReturnValue(mockDye('Saved', '#123123'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (component) {
      cleanupComponent(component, container);
    } else {
      container.remove();
    }
  });

  const initComponent = (): DyeMixerTool => {
    const instance = new DyeMixerTool(container);
    instance.init();
    component = instance;
    return instance;
  };

  const mockDye = (name: string, hex: string): Dye => ({
    id: Math.floor(Math.random() * 1000),
    itemID: Math.floor(Math.random() * 1000),
    name,
    hex,
    rgb: { r: 255, g: 0, b: 0 },
    hsv: { h: 0, s: 100, v: 100 },
    category: 'Test',
    acquisition: 'Test',
    cost: 10,
  });

  it('shows instruction message when updateInterpolation runs without two dyes', () => {
    const instance = initComponent();
    (instance as unknown as { updateInterpolation: () => void }).updateInterpolation();

    const display = container.querySelector('#interpolation-display-container');
    expect(display?.textContent).toContain('Select 2 dyes to see interpolation');
  });

  it('updates step count value and triggers interpolation on slider input', () => {
    const updateSpy = vi.spyOn(DyeMixerTool.prototype as any, 'updateInterpolation');
    initComponent();
    updateSpy.mockClear();

    const slider = container.querySelector<HTMLInputElement>('#step-count-input');
    const valueDisplay = container.querySelector<HTMLElement>('#step-count-value');
    expect(slider).not.toBeNull();
    slider!.value = '12';
    slider!.dispatchEvent(new Event('input'));

    expect(valueDisplay?.textContent).toBe('12');
    expect(updateSpy).toHaveBeenCalled();
    updateSpy.mockRestore();
  });

  it('invokes interpolation when two dyes are selected', () => {
    const calcSpy = vi
      .spyOn(DyeMixerTool.prototype as any, 'calculateInterpolation')
      .mockReturnValue([
        {
          position: 0,
          theoreticalColor: '#ff0000',
          matchedDye: mockDye('Match', '#ff0000'),
          distance: 0,
        },
      ]);

    const instance = initComponent();
    const selectorContainer = container.querySelector('#dye-selector-container')!;

    const start = mockDye('Start', '#ff0000');
    const end = mockDye('End', '#0000ff');

    selectorContainer.dispatchEvent(
      new CustomEvent('selection-changed', { detail: { selectedDyes: [start, end] } })
    );

    expect(calcSpy).toHaveBeenCalledWith(start, end, expect.any(Number), expect.any(String));
    calcSpy.mockRestore();
  });

  it('switches color space when radio buttons change', () => {
    const instance = initComponent();
    const rgbRadio = container.querySelector<HTMLInputElement>('#color-space-rgb')!;

    rgbRadio.checked = true;
    rgbRadio.dispatchEvent(new Event('change'));

    expect((instance as unknown as { colorSpace: string }).colorSpace).toBe('rgb');
  });
});

