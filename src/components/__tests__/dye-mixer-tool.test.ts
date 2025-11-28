import { DyeMixerTool } from '../dye-mixer-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
} from './test-utils';
import type { Dye } from '@shared/types';
import { dyeService, ColorService } from '@services/index';
import type { InterpolationStep } from '../color-interpolation-display';
import type { PaletteData } from '../palette-exporter';

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

});