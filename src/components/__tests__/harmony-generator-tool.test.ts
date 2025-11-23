import type { Dye } from '@shared/types';
import { HarmonyGeneratorTool } from '../harmony-generator-tool';

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
    },
    DyeService: {
      getInstance: () => mockDyeService,
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
});

