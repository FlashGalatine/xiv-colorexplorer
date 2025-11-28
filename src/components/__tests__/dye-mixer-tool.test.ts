import { DyeMixerTool } from '../dye-mixer-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
} from './test-utils';
import type { Dye } from '@shared/types';
import { dyeService, ColorService, LanguageService } from '@services/index';
import type { InterpolationStep } from '../color-interpolation-display';
import type { PaletteData } from '../palette-exporter';
import { vi } from 'vitest';

// Create mock dye helper
const createMockDye = (overrides: Partial<Dye> = {}): Dye => ({
  id: 1,
  itemID: 30001,
  name: 'Test Dye',
  hex: '#FF0000',
  rgb: { r: 255, g: 0, b: 0 },
  hsv: { h: 0, s: 100, v: 100 },
  category: 'Red',
  acquisition: 'Vendor',
  cost: 100,
  ...overrides,
});

// Type helper to access private methods
type ComponentWithPrivate = DyeMixerTool & {
  selectedDyes: Dye[];
  stepCount: number;
  colorSpace: 'rgb' | 'hsv';
  currentSteps: InterpolationStep[];
  updateInterpolation: () => void;
  calculateInterpolation: (
    startDye: Dye,
    endDye: Dye,
    steps: number,
    colorSpace: 'rgb' | 'hsv'
  ) => InterpolationStep[];
  getPaletteData: () => PaletteData;
  getState: () => Record<string, unknown>;
  saveGradient: () => void;
  loadSavedGradient: (index: number) => void;
  deleteSavedGradient: (index: number) => void;
  displaySavedGradients: () => void;
  toggleSavedGradientsPanel: () => void;
  copyShareUrl: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const dyeSelectorInitMock = vi.fn();
const dyeSelectorSetSelectedDyesMock = vi.fn();
const dyeSelectorDestroyMock = vi.fn();
const interpolationInitMock = vi.fn();
const interpolationDestroyMock = vi.fn();
const dyeFiltersInitMock = vi.fn();
const dyeFiltersDestroyMock = vi.fn();
const paletteExporterInitMock = vi.fn();
const paletteExporterUpdateMock = vi.fn();
const paletteExporterDestroyMock = vi.fn();

vi.mock('../dye-selector', () => {
  return {
    DyeSelector: class {
      constructor(_container: HTMLElement, _options: unknown) {}
      init(): void {
        dyeSelectorInitMock();
      }
      setSelectedDyes(dyes: Dye[]): void {
        dyeSelectorSetSelectedDyesMock(dyes);
      }
      destroy(): void {
        dyeSelectorDestroyMock();
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
        interpolationDestroyMock();
      }
    },
  };
});

vi.mock('../dye-filters', () => {
  return {
    DyeFilters: class {
      private onFilterChangeCallback: (() => void) | null = null;
      constructor(_container: HTMLElement, options?: { onFilterChange?: () => void }) {
        this.onFilterChangeCallback = options?.onFilterChange || null;
      }
      render(): void {
        dyeFiltersInitMock();
      }
      bindEvents(): void {
        /* noop */
      }
      onMount(): void {
        /* noop */
      }
      isDyeExcluded(_dye: Dye): boolean {
        return false;
      }
      filterDyes(dyes: Dye[]): Dye[] {
        return dyes;
      }
      triggerFilterChange(): void {
        if (this.onFilterChangeCallback) {
          this.onFilterChangeCallback();
        }
      }
      destroy(): void {
        dyeFiltersDestroyMock();
      }
    },
  };
});

vi.mock('../palette-exporter', () => {
  return {
    PaletteExporter: class {
      constructor(_container: HTMLElement, _options: unknown) {}
      init(): void {
        paletteExporterInitMock();
      }
      update(): void {
        paletteExporterUpdateMock();
      }
      destroy(): void {
        paletteExporterDestroyMock();
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
    // Reset all mocks
    dyeSelectorInitMock.mockClear();
    dyeSelectorSetSelectedDyesMock.mockClear();
    dyeSelectorDestroyMock.mockClear();
    interpolationInitMock.mockClear();
    interpolationDestroyMock.mockClear();
    dyeFiltersInitMock.mockClear();
    dyeFiltersDestroyMock.mockClear();
    paletteExporterInitMock.mockClear();
    paletteExporterUpdateMock.mockClear();
    paletteExporterDestroyMock.mockClear();
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

  // ==========================================================================
  // Business Logic Tests - calculateInterpolation
  // ==========================================================================

  describe('calculateInterpolation method', () => {
    beforeEach(() => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(
        createMockDye({ id: 10, name: 'Closest Dye', hex: '#888888' })
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return array of interpolation steps', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        5,
        'rgb'
      );

      expect(steps).toHaveLength(5);
    });

    it('should include position values from 0 to 1', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        3,
        'rgb'
      );

      expect(steps[0].position).toBe(0);
      expect(steps[2].position).toBe(1);
    });

    it('should calculate theoretical colors in RGB mode', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        3,
        'rgb'
      );

      // Colors are returned as lowercase hex
      expect(steps[0].theoreticalColor.toLowerCase()).toBe('#ff0000');
      expect(steps[2].theoreticalColor.toLowerCase()).toBe('#0000ff');
    });

    it('should calculate theoretical colors in HSV mode', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        3,
        'hsv'
      );

      expect(steps).toHaveLength(3);
      expect(steps[0].theoreticalColor).toBeDefined();
    });

    it('should include matched dye for each step', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        3,
        'rgb'
      );

      expect(steps[0].matchedDye).toBeDefined();
      expect(steps[0].matchedDye?.name).toBe('Closest Dye');
    });

    it('should calculate distance for each step', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });

      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(
        startDye,
        endDye,
        3,
        'rgb'
      );

      expect(typeof steps[0].distance).toBe('number');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getPaletteData
  // ==========================================================================

  describe('getPaletteData method', () => {
    it('should return palette data with base dye', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, name: 'Start Dye' });
      const endDye = createMockDye({ id: 2, name: 'End Dye' });

      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye, endDye];
      (instance as unknown as ComponentWithPrivate).currentSteps = [];

      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();

      expect(paletteData.base?.name).toBe('Start Dye');
    });

    it('should include end dye in groups', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, name: 'Start Dye' });
      const endDye = createMockDye({ id: 2, name: 'End Dye' });

      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye, endDye];
      (instance as unknown as ComponentWithPrivate).currentSteps = [];

      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();

      expect(paletteData.groups.end).toHaveLength(1);
      expect(paletteData.groups.end[0]?.name).toBe('End Dye');
    });

    it('should include step dyes in groups', () => {
      const instance = initComponent();
      const startDye = createMockDye({ id: 1 });
      const endDye = createMockDye({ id: 2 });
      const stepDye = createMockDye({ id: 3, name: 'Step Dye' });

      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye, endDye];
      (instance as unknown as ComponentWithPrivate).currentSteps = [
        { position: 0.5, theoreticalColor: '#888888', matchedDye: stepDye, distance: 10 },
      ];

      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();

      expect(paletteData.groups.steps).toHaveLength(1);
      expect(paletteData.groups.steps[0]?.name).toBe('Step Dye');
    });

    it('should include metadata', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).stepCount = 15;
      (instance as unknown as ComponentWithPrivate).colorSpace = 'rgb';
      (instance as unknown as ComponentWithPrivate).currentSteps = [];

      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();

      expect(paletteData.metadata?.stepCount).toBe(15);
      expect(paletteData.metadata?.colorSpace).toBe('rgb');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getState
  // ==========================================================================

  describe('getState method', () => {
    it('should return selectedDyeCount', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
      ];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.selectedDyeCount).toBe(2);
    });

    it('should return selectedDyeNames', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ name: 'Red Dye' }),
        createMockDye({ name: 'Blue Dye' }),
      ];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.selectedDyeNames).toEqual(['Red Dye', 'Blue Dye']);
    });

    it('should return stepCount', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).stepCount = 15;

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.stepCount).toBe(15);
    });

    it('should return colorSpace', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).colorSpace = 'rgb';

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.colorSpace).toBe('rgb');
    });
  });

  // ==========================================================================
  // Business Logic Tests - updateInterpolation
  // ==========================================================================

  describe('updateInterpolation method', () => {
    it('should show instruction when less than 2 dyes selected', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      const display = container.querySelector('#interpolation-display-container');
      expect(display?.textContent).toContain('Select 2 dyes to see interpolation');
    });

    it('should clear currentSteps when less than 2 dyes', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).currentSteps = [
        { position: 0, theoreticalColor: '#FF0000', matchedDye: null, distance: 0 },
      ];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      expect((instance as unknown as ComponentWithPrivate).currentSteps).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Business Logic Tests - toggleSavedGradientsPanel
  // ==========================================================================

  describe('toggleSavedGradientsPanel method', () => {
    it('should toggle panel visibility', () => {
      const instance = initComponent();

      const savedContainer = container.querySelector<HTMLElement>('#saved-gradients-container');
      if (savedContainer) {
        savedContainer.style.maxHeight = '300px';
      }

      (instance as unknown as ComponentWithPrivate).toggleSavedGradientsPanel();

      expect(savedContainer?.style.maxHeight).toBe('0px');
    });

    it('should update toggle button text', () => {
      const instance = initComponent();

      const savedContainer = container.querySelector<HTMLElement>('#saved-gradients-container');
      const toggleBtn = container.querySelector<HTMLElement>('#toggle-saved-gradients');

      if (savedContainer) {
        savedContainer.style.maxHeight = '0px';
      }

      (instance as unknown as ComponentWithPrivate).toggleSavedGradientsPanel();

      expect(toggleBtn?.textContent).toBe('▲');
    });
  });

  // ==========================================================================
  // Business Logic Tests - showToast
  // ==========================================================================

  describe('showToast method', () => {
    beforeEach(() => {
      document.getElementById('toast-container')?.remove();
    });

    afterEach(() => {
      document.getElementById('toast-container')?.remove();
    });

    it('should create toast container', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Test message', 'info');

      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer).not.toBeNull();
    });

    it('should display message in toast', () => {
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Custom message', 'success');

      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer?.textContent).toContain('Custom message');
    });
  });

  // ==========================================================================
  // Business Logic Tests - displaySavedGradients
  // ==========================================================================

  describe('displaySavedGradients method', () => {
    it('should show no-saved-text when empty', () => {
      localStorage.setItem('xivdyetools_dyemixer_gradients', '[]');
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).displaySavedGradients();

      const noText = container.querySelector<HTMLElement>('#no-saved-gradients-text');
      expect(noText?.style.display).not.toBe('none');
    });

    it('should display saved gradients', () => {
      const gradients = [
        {
          name: 'Test Gradient',
          dye1Name: 'Red',
          dye2Name: 'Blue',
          dye1Id: 1,
          dye2Id: 2,
          stepCount: 10,
          colorSpace: 'hsv',
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));
      const instance = initComponent();

      (instance as unknown as ComponentWithPrivate).displaySavedGradients();

      const savedContainer = container.querySelector('#saved-gradients-container');
      expect(savedContainer?.textContent).toContain('Test Gradient');
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('lifecycle', () => {
    it('should cleanup on destroy', () => {
      const instance = initComponent();

      instance.destroy();

      expect(container.children.length).toBe(0);
    });

    it('should handle update cycle', () => {
      const instance = initComponent();

      expect(() => {
        instance.update();
        instance.update();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Event Handling Tests
  // ==========================================================================

  describe('event handling', () => {
    it('should handle selection-changed event', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye());
      const instance = initComponent();
      const selectorContainer = container.querySelector('#dye-selector-container');

      const testDyes = [
        createMockDye({ id: 1, hex: '#FF0000' }),
        createMockDye({ id: 2, hex: '#0000FF' }),
      ];

      selectorContainer?.dispatchEvent(
        new CustomEvent('selection-changed', { detail: { selectedDyes: testDyes } })
      );

      expect((instance as unknown as ComponentWithPrivate).selectedDyes).toHaveLength(2);
    });

    it('should handle HSV radio change', () => {
      const instance = initComponent();
      const hsvRadio = container.querySelector<HTMLInputElement>('#color-space-hsv');

      hsvRadio!.checked = true;
      hsvRadio!.dispatchEvent(new Event('change'));

      expect((instance as unknown as ComponentWithPrivate).colorSpace).toBe('hsv');
    });
  });


  // ==========================================================================
  // Branch Coverage Tests - calculateInterpolation branches
  // ==========================================================================

  describe('calculateInterpolation branches', () => {
    it('should handle hue wraparound in HSV mode', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ id: 10, hex: '#888888' }));
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF1A00' });
      const endDye = createMockDye({ id: 2, hex: '#FF0066' });
      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(startDye, endDye, 3, 'hsv');
      expect(steps).toHaveLength(3);
    });

    it('should handle single step case', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ id: 10, hex: '#888888' }));
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });
      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(startDye, endDye, 1, 'rgb');
      expect(steps).toHaveLength(1);
      expect(steps[0].position).toBe(0);
    });

    it('should handle null matchedDye', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(null);
      const instance = initComponent();
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });
      const steps = (instance as unknown as ComponentWithPrivate).calculateInterpolation(startDye, endDye, 3, 'rgb');
      expect(steps[0].matchedDye).toBeNull();
      expect(steps[0].distance).toBe(0);
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - saveGradient branches
  // ==========================================================================

  describe('saveGradient branches', () => {
    it('should show error when less than 2 dyes', () => {
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).saveGradient();
      expect(showToastSpy).toHaveBeenCalledWith(expect.any(String), 'error');
    });

    it('should return early when prompt cancelled', () => {
      vi.spyOn(window, 'prompt').mockReturnValue(null);
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye({ id: 1 }), createMockDye({ id: 2 })];
      (instance as unknown as ComponentWithPrivate).saveGradient();
      const saved = JSON.parse(localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]');
      expect(saved).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - loadSavedGradient branches
  // ==========================================================================

  describe('loadSavedGradient branches', () => {
    it('should show error for invalid index', () => {
      localStorage.setItem('xivdyetools_dyemixer_gradients', '[]');
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');
      (instance as unknown as ComponentWithPrivate).loadSavedGradient(999);
      expect(showToastSpy).toHaveBeenCalledWith('Gradient not found', 'error');
    });

    it('should show error when dye not found', () => {
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify([{name:'Test',dye1Id:99999,dye2Id:88888,stepCount:10,colorSpace:'hsv'}]));
      vi.spyOn(dyeService, 'getDyeById').mockReturnValue(null);
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');
      (instance as unknown as ComponentWithPrivate).loadSavedGradient(0);
      expect(showToastSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - deleteSavedGradient branches
  // ==========================================================================

  describe('deleteSavedGradient branches', () => {
    it('should show error for invalid index', () => {
      localStorage.setItem('xivdyetools_dyemixer_gradients', '[]');
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');
      (instance as unknown as ComponentWithPrivate).deleteSavedGradient(999);
      expect(showToastSpy).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - copyShareUrl branches
  // ==========================================================================

  describe('copyShareUrl branches', () => {
    it('should show error when less than 2 dyes', () => {
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).copyShareUrl();
      expect(showToastSpy).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - early returns
  // ==========================================================================

  describe('early returns', () => {
    it('should handle toggleSavedGradientsPanel when container missing', () => {
      const instance = initComponent();
      container.querySelector('#saved-gradients-container')?.remove();
      expect(() => (instance as unknown as ComponentWithPrivate).toggleSavedGradientsPanel()).not.toThrow();
    });

    it('should handle updateInterpolation when container missing', () => {
      const instance = initComponent();
      container.querySelector('#interpolation-display-container')?.remove();
      expect(() => (instance as unknown as ComponentWithPrivate).updateInterpolation()).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - getPaletteData edge cases
  // ==========================================================================

  describe('getPaletteData edges', () => {
    it('should handle empty selectedDyes', () => {
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).currentSteps = [];
      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();
      expect(paletteData.base).toBeNull();
    });

    it('should filter null matchedDye from steps', () => {
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye({id:1}), createMockDye({id:2})];
      (instance as unknown as ComponentWithPrivate).currentSteps = [
        { position: 0, theoreticalColor: '#FF0000', matchedDye: null, distance: 0 },
        { position: 0.5, theoreticalColor: '#00FF00', matchedDye: createMockDye({id:3}), distance: 5 },
      ];
      const paletteData = (instance as unknown as ComponentWithPrivate).getPaletteData();
      expect(paletteData.groups.steps).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Function Coverage Tests - onMount
  // ==========================================================================

  describe('onMount method', () => {
    it('should subscribe to LanguageService changes', () => {
      const subscribeSpy = vi.spyOn(LanguageService, 'subscribe');
      initComponent();
      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should call update when language changes', () => {
      let languageCallback: (() => void) | null = null;
      vi.spyOn(LanguageService, 'subscribe').mockImplementation((cb) => {
        languageCallback = cb;
        return () => {};
      });

      const instance = initComponent();
      const updateSpy = vi.spyOn(instance, 'update');

      // Trigger the language change callback
      if (languageCallback) {
        languageCallback();
      }

      expect(updateSpy).toHaveBeenCalled();
    });

    it('should call updateInterpolation after timeout', async () => {
      vi.useFakeTimers();
      const updateSpy = vi.spyOn(DyeMixerTool.prototype as any, 'updateInterpolation');
      initComponent();

      // Fast-forward timer
      vi.advanceTimersByTime(100);

      expect(updateSpy).toHaveBeenCalled();
      vi.useRealTimers();
      updateSpy.mockRestore();
    });
  });

  // ==========================================================================
  // Function Coverage Tests - bindEvents child component initialization
  // ==========================================================================

  describe('bindEvents child components', () => {
    it('should initialize DyeSelector', () => {
      initComponent();
      expect(dyeSelectorInitMock).toHaveBeenCalled();
    });

    it('should initialize DyeFilters', () => {
      initComponent();
      expect(dyeFiltersInitMock).toHaveBeenCalled();
    });

    it('should initialize PaletteExporter', () => {
      initComponent();
      expect(paletteExporterInitMock).toHaveBeenCalled();
    });

    it('should bind save button click handler', () => {
      const instance = initComponent();
      const saveBtn = container.querySelector<HTMLButtonElement>('#save-gradient-btn');
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      saveBtn?.click();

      expect(showToastSpy).toHaveBeenCalled();
    });

    it('should bind share button click handler', () => {
      const instance = initComponent();
      const shareBtn = container.querySelector<HTMLButtonElement>('#copy-url-btn');
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      shareBtn?.click();

      expect(showToastSpy).toHaveBeenCalled();
    });

    it('should bind toggle button click handler', () => {
      const instance = initComponent();
      const toggleBtn = container.querySelector<HTMLButtonElement>('#toggle-saved-gradients');
      const savedContainer = container.querySelector<HTMLElement>('#saved-gradients-container');

      if (savedContainer) {
        savedContainer.style.maxHeight = '300px';
      }

      toggleBtn?.click();

      expect(savedContainer?.style.maxHeight).toBe('0px');
    });
  });

  // ==========================================================================
  // Function Coverage Tests - destroy with all child components
  // ==========================================================================

  describe('destroy with child components', () => {
    it('should destroy DyeSelector when it exists', () => {
      const instance = initComponent();
      instance.destroy();
      expect(dyeSelectorDestroyMock).toHaveBeenCalled();
    });

    it('should destroy PaletteExporter when it exists', () => {
      const instance = initComponent();
      instance.destroy();
      expect(paletteExporterDestroyMock).toHaveBeenCalled();
    });

    it('should destroy interpolationDisplay when it exists', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ id: 10, hex: '#888888' }));
      const instance = initComponent();

      // Trigger interpolation to create display
      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });
      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye, endDye];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      instance.destroy();
      expect(interpolationDestroyMock).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Function Coverage Tests - saveGradient success path
  // ==========================================================================

  describe('saveGradient success path', () => {
    it('should save gradient to localStorage when valid', () => {
      vi.spyOn(window, 'prompt').mockReturnValue('My Test Gradient');
      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, name: 'Red Dye' }),
        createMockDye({ id: 2, name: 'Blue Dye' }),
      ];
      (instance as unknown as ComponentWithPrivate).stepCount = 12;
      (instance as unknown as ComponentWithPrivate).colorSpace = 'rgb';

      (instance as unknown as ComponentWithPrivate).saveGradient();

      const saved = JSON.parse(localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('My Test Gradient');
      expect(saved[0].stepCount).toBe(12);
      expect(showToastSpy).toHaveBeenCalledWith(expect.stringContaining('My Test Gradient'), 'success');
    });

    it('should append to existing gradients', () => {
      const existingGradients = [{ name: 'Existing', dye1Id: 1, dye2Id: 2, stepCount: 10, colorSpace: 'hsv' }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(existingGradients));
      vi.spyOn(window, 'prompt').mockReturnValue('New Gradient');

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 3 }),
        createMockDye({ id: 4 }),
      ];

      (instance as unknown as ComponentWithPrivate).saveGradient();

      const saved = JSON.parse(localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]');
      expect(saved).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Function Coverage Tests - loadSavedGradient success path
  // ==========================================================================

  describe('loadSavedGradient success path', () => {
    it('should load gradient and set selected dyes', () => {
      const dye1 = createMockDye({ id: 101, name: 'Loaded Red' });
      const dye2 = createMockDye({ id: 102, name: 'Loaded Blue' });
      vi.spyOn(dyeService, 'getDyeById')
        .mockReturnValueOnce(dye1)
        .mockReturnValueOnce(dye2);

      const gradients = [{
        name: 'Saved Gradient',
        dye1Id: 101,
        dye2Id: 102,
        dye1Name: 'Loaded Red',
        dye2Name: 'Loaded Blue',
        stepCount: 15,
        colorSpace: 'rgb',
        timestamp: new Date().toISOString(),
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).loadSavedGradient(0);

      expect((instance as unknown as ComponentWithPrivate).selectedDyes).toHaveLength(2);
      expect((instance as unknown as ComponentWithPrivate).stepCount).toBe(15);
      expect((instance as unknown as ComponentWithPrivate).colorSpace).toBe('rgb');
      expect(dyeSelectorSetSelectedDyesMock).toHaveBeenCalledWith([dye1, dye2]);
      expect(showToastSpy).toHaveBeenCalledWith(expect.stringContaining('Saved Gradient'), 'success');
    });

    it('should update step count input UI', () => {
      const dye1 = createMockDye({ id: 101 });
      const dye2 = createMockDye({ id: 102 });
      vi.spyOn(dyeService, 'getDyeById')
        .mockReturnValueOnce(dye1)
        .mockReturnValueOnce(dye2);

      const gradients = [{
        name: 'Test',
        dye1Id: 101,
        dye2Id: 102,
        stepCount: 18,
        colorSpace: 'hsv',
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).loadSavedGradient(0);

      const stepInput = container.querySelector<HTMLInputElement>('input[type="range"]');
      expect(stepInput?.value).toBe('18');
    });

    it('should check color space radio button', () => {
      const dye1 = createMockDye({ id: 101 });
      const dye2 = createMockDye({ id: 102 });
      vi.spyOn(dyeService, 'getDyeById')
        .mockReturnValueOnce(dye1)
        .mockReturnValueOnce(dye2);

      const gradients = [{
        name: 'Test',
        dye1Id: 101,
        dye2Id: 102,
        stepCount: 10,
        colorSpace: 'rgb',
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).loadSavedGradient(0);

      const rgbRadio = container.querySelector<HTMLInputElement>('#color-space-rgb');
      expect(rgbRadio?.checked).toBe(true);
    });

    it('should use default values when gradient missing stepCount/colorSpace', () => {
      const dye1 = createMockDye({ id: 101 });
      const dye2 = createMockDye({ id: 102 });
      vi.spyOn(dyeService, 'getDyeById')
        .mockReturnValueOnce(dye1)
        .mockReturnValueOnce(dye2);

      const gradients = [{
        name: 'Minimal',
        dye1Id: 101,
        dye2Id: 102,
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).loadSavedGradient(0);

      expect((instance as unknown as ComponentWithPrivate).stepCount).toBe(10);
      expect((instance as unknown as ComponentWithPrivate).colorSpace).toBe('hsv');
    });
  });

  // ==========================================================================
  // Function Coverage Tests - deleteSavedGradient success path
  // ==========================================================================

  describe('deleteSavedGradient success path', () => {
    it('should delete gradient from localStorage', () => {
      const gradients = [
        { name: 'First', dye1Id: 1, dye2Id: 2 },
        { name: 'Second', dye1Id: 3, dye2Id: 4 },
      ];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).deleteSavedGradient(0);

      const saved = JSON.parse(localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Second');
      expect(showToastSpy).toHaveBeenCalledWith(expect.stringContaining('First'), 'success');
    });

    it('should refresh display after deletion', () => {
      const gradients = [{ name: 'ToDelete', dye1Id: 1, dye2Id: 2, dye1Name: 'A', dye2Name: 'B' }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).deleteSavedGradient(0);

      const noText = container.querySelector<HTMLElement>('#no-saved-gradients-text');
      expect(noText?.style.display).not.toBe('none');
    });
  });

  // ==========================================================================
  // Function Coverage Tests - copyShareUrl success path
  // ==========================================================================

  describe('copyShareUrl success path', () => {
    it('should copy URL to clipboard when valid', async () => {
      const clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: clipboardWriteMock,
        },
      });

      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 100 }),
        createMockDye({ id: 200 }),
      ];
      (instance as unknown as ComponentWithPrivate).stepCount = 8;
      (instance as unknown as ComponentWithPrivate).colorSpace = 'rgb';

      (instance as unknown as ComponentWithPrivate).copyShareUrl();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(clipboardWriteMock).toHaveBeenCalledWith(
        expect.stringContaining('dye1=100')
      );
      expect(clipboardWriteMock).toHaveBeenCalledWith(
        expect.stringContaining('dye2=200')
      );
      expect(clipboardWriteMock).toHaveBeenCalledWith(
        expect.stringContaining('steps=8')
      );
      expect(showToastSpy).toHaveBeenCalledWith(expect.any(String), 'success');
    });

    it('should show error when clipboard fails', async () => {
      const clipboardWriteMock = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, {
        clipboard: {
          writeText: clipboardWriteMock,
        },
      });

      const instance = initComponent();
      const showToastSpy = vi.spyOn(instance as unknown as ComponentWithPrivate, 'showToast');

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 100 }),
        createMockDye({ id: 200 }),
      ];

      (instance as unknown as ComponentWithPrivate).copyShareUrl();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(showToastSpy).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });

  // ==========================================================================
  // Function Coverage Tests - displaySavedGradients with button events
  // ==========================================================================

  describe('displaySavedGradients button events', () => {
    it('should load gradient when load button clicked', () => {
      const dye1 = createMockDye({ id: 101 });
      const dye2 = createMockDye({ id: 102 });
      vi.spyOn(dyeService, 'getDyeById')
        .mockReturnValueOnce(dye1)
        .mockReturnValueOnce(dye2);

      const gradients = [{
        name: 'Clickable',
        dye1Id: 101,
        dye2Id: 102,
        dye1Name: 'Red',
        dye2Name: 'Blue',
        stepCount: 10,
        colorSpace: 'hsv',
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      const instance = initComponent();

      // Find and click load button
      const savedContainer = container.querySelector('#saved-gradients-container');
      const loadBtn = savedContainer?.querySelector('button');
      loadBtn?.click();

      expect((instance as unknown as ComponentWithPrivate).selectedDyes).toHaveLength(2);
    });

    it('should delete gradient when delete button clicked', () => {
      const gradients = [{
        name: 'ToDelete',
        dye1Id: 1,
        dye2Id: 2,
        dye1Name: 'Red',
        dye2Name: 'Blue',
      }];
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(gradients));

      initComponent();

      // Find delete button (second button in actions)
      const savedContainer = container.querySelector('#saved-gradients-container');
      const buttons = savedContainer?.querySelectorAll('button');
      const deleteBtn = buttons?.[1];
      deleteBtn?.click();

      const saved = JSON.parse(localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]');
      expect(saved).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Function Coverage Tests - updateInterpolation with existing display
  // ==========================================================================

  describe('updateInterpolation existing display destruction', () => {
    it('should destroy existing interpolation display before creating new one', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ id: 10, hex: '#888888' }));
      const instance = initComponent();

      // First interpolation
      const startDye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye1 = createMockDye({ id: 2, hex: '#0000FF' });
      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye1, endDye1];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      interpolationDestroyMock.mockClear();

      // Second interpolation - should destroy first
      const startDye2 = createMockDye({ id: 3, hex: '#00FF00' });
      const endDye2 = createMockDye({ id: 4, hex: '#FFFF00' });
      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye2, endDye2];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      expect(interpolationDestroyMock).toHaveBeenCalled();
    });

    it('should update paletteExporter after interpolation', () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ id: 10, hex: '#888888' }));
      const instance = initComponent();

      paletteExporterUpdateMock.mockClear();

      const startDye = createMockDye({ id: 1, hex: '#FF0000' });
      const endDye = createMockDye({ id: 2, hex: '#0000FF' });
      (instance as unknown as ComponentWithPrivate).selectedDyes = [startDye, endDye];
      (instance as unknown as ComponentWithPrivate).updateInterpolation();

      expect(paletteExporterUpdateMock).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Function Coverage Tests - showToast variations
  // ==========================================================================

  describe('showToast variations', () => {
    beforeEach(() => {
      document.getElementById('toast-container')?.remove();
    });

    afterEach(() => {
      document.getElementById('toast-container')?.remove();
    });

    it('should use green for success toast', () => {
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).showToast('Success!', 'success');

      const toast = document.getElementById('toast-container')?.firstElementChild as HTMLElement;
      expect(toast?.style.backgroundColor).toContain('rgb(16, 185, 129)');
    });

    it('should use red for error toast', () => {
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).showToast('Error!', 'error');

      const toast = document.getElementById('toast-container')?.firstElementChild as HTMLElement;
      expect(toast?.style.backgroundColor).toContain('rgb(239, 68, 68)');
    });

    it('should use existing toast container if present', () => {
      const existingContainer = document.createElement('div');
      existingContainer.id = 'toast-container';
      document.body.appendChild(existingContainer);

      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).showToast('Test', 'info');

      const containers = document.querySelectorAll('#toast-container');
      expect(containers).toHaveLength(1);
    });

    it('should allow click to dismiss toast', async () => {
      vi.useFakeTimers();
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).showToast('Dismissible', 'info');

      const toast = document.getElementById('toast-container')?.firstElementChild as HTMLElement;
      toast?.click();

      vi.advanceTimersByTime(350);

      // Container is removed when empty, so check it doesn't exist OR has no children
      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer === null || toastContainer.children.length === 0).toBe(true);
      vi.useRealTimers();
    });

    it('should auto-remove toast after timeout', async () => {
      vi.useFakeTimers();
      const instance = initComponent();
      (instance as unknown as ComponentWithPrivate).showToast('Auto remove', 'info');

      // Wait for auto-remove (3000ms + 300ms animation)
      vi.advanceTimersByTime(3500);

      // Container is removed when empty, so check it doesn't exist OR has no children
      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer === null || toastContainer.children.length === 0).toBe(true);
      vi.useRealTimers();
    });
  });

  // ==========================================================================
  // Function Coverage Tests - share button hover events
  // ==========================================================================

  describe('share button hover events', () => {
    it('should add brightness filter on mouseenter', () => {
      initComponent();
      const shareBtn = container.querySelector<HTMLButtonElement>('#copy-url-btn');

      shareBtn?.dispatchEvent(new MouseEvent('mouseenter'));

      expect(shareBtn?.style.filter).toBe('brightness(0.9)');
    });

    it('should remove brightness filter on mouseleave', () => {
      initComponent();
      const shareBtn = container.querySelector<HTMLButtonElement>('#copy-url-btn');

      shareBtn?.dispatchEvent(new MouseEvent('mouseenter'));
      shareBtn?.dispatchEvent(new MouseEvent('mouseleave'));

      expect(shareBtn?.style.filter).toBe('');
    });

    it('should darken on mousedown', () => {
      initComponent();
      const shareBtn = container.querySelector<HTMLButtonElement>('#copy-url-btn');

      shareBtn?.dispatchEvent(new MouseEvent('mousedown'));

      expect(shareBtn?.style.filter).toBe('brightness(0.8)');
    });

    it('should lighten on mouseup', () => {
      initComponent();
      const shareBtn = container.querySelector<HTMLButtonElement>('#copy-url-btn');

      shareBtn?.dispatchEvent(new MouseEvent('mousedown'));
      shareBtn?.dispatchEvent(new MouseEvent('mouseup'));

      expect(shareBtn?.style.filter).toBe('brightness(0.9)');
    });
  });

  // ==========================================================================
  // Function Coverage Tests - displaySavedGradients error handling
  // ==========================================================================

  describe('displaySavedGradients error handling', () => {
    it('should handle JSON parse error gracefully', () => {
      localStorage.setItem('xivdyetools_dyemixer_gradients', 'invalid json');

      const instance = initComponent();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).displaySavedGradients();
      }).not.toThrow();
    });
  });

});