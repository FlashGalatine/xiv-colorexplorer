import type { Dye, PriceData } from '@shared/types';
import { HarmonyGeneratorTool } from '../harmony-generator-tool';
import type { PaletteData } from '../palette-exporter';
import type { HarmonyType } from '../harmony-type';

const createDye = (overrides: Partial<Dye> = {}): Dye => {
  const id = overrides.id ?? Math.floor(Math.random() * 1000) + 1;
  return {
    id,
    itemID: overrides.itemID ?? id,
    name: overrides.name ?? `Dye ${id}`,
    hex: overrides.hex ?? '#ff0000',
    rgb: overrides.rgb ?? { r: 255, g: 0, b: 0 },
    hsv: overrides.hsv ?? { h: 0, s: 100, v: 100 },
    category: overrides.category ?? 'Test',
    acquisition: overrides.acquisition ?? 'Test',
    cost: overrides.cost ?? 0,
  };
};

// Type helper to access private methods
type ComponentWithPrivate = HarmonyGeneratorTool & {
  baseColor: string;
  showPrices: boolean;
  priceData: Map<number, PriceData>;
  suggestionsMode: 'simple' | 'expanded';
  companionDyesCount: number;
  harmonyDisplays: Map<string, HarmonyType>;
  generateHarmonies: () => void;
  getSimpleModeLimit: (harmonyId: string) => number;
  applySuggestionsMode: (
    harmonyId: string,
    matched: Array<{ dye: Dye; deviance: number }>
  ) => Array<{ dye: Dye; deviance: number }>;
  calculateHueDeviance: (baseHex: string, dyeHex: string, offsets: number[]) => number;
  isDyeExcluded: (dye: Dye) => boolean;
  applyDyeFilters: (
    dyes: Array<{ dye: Dye; deviance: number }>
  ) => Array<{ dye: Dye; deviance: number }>;
  replaceExcludedDyes: (
    dyes: Array<{ dye: Dye; deviance: number }>,
    harmonyId: string
  ) => Array<{ dye: Dye; deviance: number }>;
  getPaletteData: () => PaletteData;
  getState: () => Record<string, unknown>;
  loadSuggestionsMode: () => void;
  updateSuggestionsMode: () => void;
  loadCompanionDyesCount: () => void;
  updateCompanionDyesCount: () => void;
  toggleCompanionSection: () => void;
  updateAllDisplays: () => void;
};

const mockHarmonySnapshots: Record<string, Array<{ dye: Dye; deviance: number }>> = {};

const triadicDyes = [
  createDye({ id: 2, itemID: 2, name: 'Triad A', hex: '#00ff00', hsv: { h: 120, s: 90, v: 80 } }),
  createDye({ id: 3, itemID: 3, name: 'Triad B', hex: '#0000ff', hsv: { h: 240, s: 90, v: 80 } }),
];

const dyePool = [
  createDye({ id: 10, itemID: 10, name: 'Companion 1', hex: '#111111' }),
  createDye({ id: 11, itemID: 11, name: 'Companion 2', hex: '#222222' }),
  createDye({ id: 12, itemID: 12, name: 'Companion 3', hex: '#333333' }),
];

const baseDye = createDye({ id: 100, itemID: 100, name: 'Base Dye', hex: '#ff0000' });

const mockDyeService = {
  getAllDyes: vi.fn(() => dyePool),
  findTriadicDyes: vi.fn(() => triadicDyes),
  findSplitComplementaryDyes: vi.fn(() => []),
  findTetradicDyes: vi.fn(() => []),
  findSquareDyes: vi.fn(() => []),
  findAnalogousDyes: vi.fn(() => []),
  findMonochromaticDyes: vi.fn(() => []),
  findCompoundDyes: vi.fn(() => []),
  findShadesDyes: vi.fn(() => []),
  findComplementaryPair: vi.fn(() => null),
  findClosestDye: vi.fn(() => baseDye),
};

vi.mock('../harmony-type', () => {
  return {
    HarmonyType: class {
      private info;
      constructor(
        container: HTMLElement,
        harmonyInfo: { id: string },
        _baseColor: string,
        matchedDyes: Array<{ dye: Dye; deviance: number }>
      ) {
        this.info = harmonyInfo;
        mockHarmonySnapshots[harmonyInfo.id] = matchedDyes;
      }
      init() {}
      updateDyes(matched: Array<{ dye: Dye; deviance: number }>) {
        mockHarmonySnapshots[this.info.id] = matched;
      }
      updateBaseColor() {}
      update() {}
      setPriceData() {}
      updateShowPrices() {}
      getDyes(): Dye[] {
        return mockHarmonySnapshots[this.info.id]?.map(({ dye }) => dye) ?? [];
      }
      destroy() {}
    },
  };
});

vi.mock('@services/index', () => {
  return {
    ColorService: {
      getColorDistance: () => 10,
      hexToHsv: (hex: string) => {
        // Simple mock that extracts HSV from hex or returns default
        // Real implementation would convert, but for tests this is sufficient
        return { h: 0, s: 100, v: 100 };
      },
    },
    DyeService: {
      getInstance: () => mockDyeService,
    },
    LanguageService: {
      t: (key: string) => key,
      getHarmonyType: (key: string) => key,
      subscribe: () => () => {},
    },
  };
});

vi.mock('@services/storage-service', () => {
  return {
    appStorage: {
      getItem: () => undefined,
      setItem: () => undefined,
    },
    STORAGE_KEYS: {
      HARMONY_FILTERS: 'filters',
      HARMONY_SUGGESTIONS_MODE: 'mode',
      HARMONY_COMPANION_DYES: 'companion',
    },
  };
});

describe('HarmonyGeneratorTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockHarmonySnapshots).forEach((key) => delete mockHarmonySnapshots[key]);
  });

  it('adds companion dyes in expanded mode even when only one match exists', () => {
    const container = document.createElement('div');
    const component = new HarmonyGeneratorTool(container);

    (component as unknown as { suggestionsMode: string }).suggestionsMode = 'expanded';
    (component as unknown as { companionDyesCount: number }).companionDyesCount = 2;

    const baseMatch = [
      {
        dye: createDye({ id: 1, itemID: 1, name: 'Complement' }),
        deviance: 0.2,
      },
    ];

    const result = (component as unknown as {
      applySuggestionsMode: (
        harmonyId: string,
        matched: Array<{ dye: Dye; deviance: number }>
      ) => Array<{ dye: Dye; deviance: number }>;
    }).applySuggestionsMode('complementary', baseMatch);

    expect(result).toHaveLength(3);
    expect(result[0].dye.name).toBe('Complement');
  });

  it('renders two triadic matches when service returns both companions', () => {
    const container = document.createElement('div');
    const component = new HarmonyGeneratorTool(container);
    component.render();

    (component as unknown as { baseColor: string }).baseColor = '#ff0000';

    (component as unknown as { generateHarmonies: () => void }).generateHarmonies();

    expect(mockDyeService.findTriadicDyes).toHaveBeenCalled();
    expect(mockHarmonySnapshots.triadic).toBeDefined();
    expect(mockHarmonySnapshots.triadic).toHaveLength(2);
    expect(mockHarmonySnapshots.triadic?.map(({ dye }) => dye.name)).toEqual(['Triad A', 'Triad B']);
  });

  // ==========================================================================
  // Business Logic Tests - getSimpleModeLimit
  // ==========================================================================

  describe('getSimpleModeLimit method', () => {
    it('should return 2 for complementary harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('complementary');
      expect(limit).toBe(2);
    });

    it('should return 3 for analogous harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('analogous');
      expect(limit).toBe(3);
    });

    it('should return 3 for triadic harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('triadic');
      expect(limit).toBe(3);
    });

    it('should return 4 for tetradic harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('tetradic');
      expect(limit).toBe(4);
    });

    it('should return 4 for square harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('square');
      expect(limit).toBe(4);
    });

    it('should return 3 for monochromatic harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('monochromatic');
      expect(limit).toBe(3);
    });

    it('should return 6 for unknown harmony type', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('unknown-type');
      expect(limit).toBe(6);
    });
  });

  // ==========================================================================
  // Business Logic Tests - applySuggestionsMode
  // ==========================================================================

  describe('applySuggestionsMode method', () => {
    it('should limit dyes in simple mode', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      (component as unknown as ComponentWithPrivate).suggestionsMode = 'simple';

      const dyes = [
        { dye: createDye({ id: 1 }), deviance: 0.1 },
        { dye: createDye({ id: 2 }), deviance: 0.2 },
        { dye: createDye({ id: 3 }), deviance: 0.3 },
        { dye: createDye({ id: 4 }), deviance: 0.4 },
        { dye: createDye({ id: 5 }), deviance: 0.5 },
      ];

      const result = (component as unknown as ComponentWithPrivate).applySuggestionsMode('complementary', dyes);

      // Complementary limit is 2
      expect(result).toHaveLength(2);
    });

    it('should sort dyes by deviance', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      (component as unknown as ComponentWithPrivate).suggestionsMode = 'simple';

      const dyes = [
        { dye: createDye({ id: 1, name: 'High' }), deviance: 0.5 },
        { dye: createDye({ id: 2, name: 'Low' }), deviance: 0.1 },
        { dye: createDye({ id: 3, name: 'Medium' }), deviance: 0.3 },
      ];

      const result = (component as unknown as ComponentWithPrivate).applySuggestionsMode('triadic', dyes);

      expect(result[0].dye.name).toBe('Low');
      expect(result[1].dye.name).toBe('Medium');
    });
  });

  // ==========================================================================
  // Business Logic Tests - calculateHueDeviance
  // ==========================================================================

  describe('calculateHueDeviance method', () => {
    it('should return 0 for same colors', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const deviance = (component as unknown as ComponentWithPrivate).calculateHueDeviance('#ff0000', '#ff0000', [0]);

      expect(deviance).toBe(0);
    });

    it('should return finite deviance for different colors', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      // Mock hexToHsv returns same values, so deviance will be based on offsets
      const deviance = (component as unknown as ComponentWithPrivate).calculateHueDeviance('#ff0000', '#00ff00', [120, 240]);

      // Should return a finite number
      expect(Number.isFinite(deviance)).toBe(true);
    });
  });

  // ==========================================================================
  // Business Logic Tests - applyDyeFilters
  // ==========================================================================

  describe('applyDyeFilters method', () => {
    it('should keep non-excluded dyes', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const dyes = [
        { dye: createDye({ id: 1 }), deviance: 0.1 },
        { dye: createDye({ id: 2 }), deviance: 0.2 },
      ];

      const result = (component as unknown as ComponentWithPrivate).applyDyeFilters(dyes);

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Business Logic Tests - getState
  // ==========================================================================

  describe('getState method', () => {
    it('should return baseColor', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      (component as unknown as ComponentWithPrivate).baseColor = '#00FF00';

      const state = (component as unknown as ComponentWithPrivate).getState();

      expect(state.baseColor).toBe('#00FF00');
    });

    it('should return showPrices', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      (component as unknown as ComponentWithPrivate).showPrices = true;

      const state = (component as unknown as ComponentWithPrivate).getState();

      expect(state.showPrices).toBe(true);
    });

    it('should return harmoniesGenerated count', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const state = (component as unknown as ComponentWithPrivate).getState();

      expect(typeof state.harmoniesGenerated).toBe('number');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getPaletteData
  // ==========================================================================

  describe('getPaletteData method', () => {
    it('should return palette data with base dye', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const paletteData = (component as unknown as ComponentWithPrivate).getPaletteData();

      expect(paletteData).toHaveProperty('base');
      expect(paletteData).toHaveProperty('groups');
    });

    it('should return empty groups initially', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      (component as unknown as ComponentWithPrivate).harmonyDisplays.clear();

      const paletteData = (component as unknown as ComponentWithPrivate).getPaletteData();

      expect(Object.keys(paletteData.groups)).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('lifecycle', () => {
    it('should render component successfully', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should cleanup on destroy', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      component.destroy();

      expect(container.children.length).toBe(0);
    });

    it('should handle update cycle', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect(() => {
        component.update();
        component.update();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Component State Tests
  // ==========================================================================

  describe('component state', () => {
    it('should have default suggestionsMode of simple', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect((component as unknown as ComponentWithPrivate).suggestionsMode).toBe('simple');
    });

    it('should have default baseColor', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect((component as unknown as ComponentWithPrivate).baseColor).toBe('#FF0000');
    });

    it('should have showPrices default to false', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect((component as unknown as ComponentWithPrivate).showPrices).toBe(false);
    });

    it('should have empty priceData initially', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      expect((component as unknown as ComponentWithPrivate).priceData.size).toBe(0);
    });
  });

  // ==========================================================================
  // Harmony Type Coverage Tests
  // ==========================================================================

  describe('harmony type coverage', () => {
    it('should return 3 for split-complementary harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('split-complementary');
      expect(limit).toBe(3);
    });

    it('should return 4 for compound harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('compound');
      expect(limit).toBe(4);
    });

    it('should return 3 for shades harmony', () => {
      const container = document.createElement('div');
      const component = new HarmonyGeneratorTool(container);
      component.render();

      const limit = (component as unknown as ComponentWithPrivate).getSimpleModeLimit('shades');
      expect(limit).toBe(3);
    });
  });
});

