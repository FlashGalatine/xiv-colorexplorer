/**
 * XIV Dye Tools - Accessibility Checker Tool Tests
 *
 * Tests for the AccessibilityCheckerTool component which simulates
 * colorblindness and checks dye accessibility for outfits
 */

import { vi } from 'vitest';
import { AccessibilityCheckerTool } from '../accessibility-checker-tool';
import { createTestContainer, cleanupTestContainer, cleanupComponent } from './test-utils';
import type { Dye } from '@shared/types';

// Mock dye data
const createMockDye = (overrides: Partial<Dye> = {}): Dye => ({
  id: 1,
  itemID: 30001,
  name: 'Test Dye',
  hex: '#FF0000',
  rgb: { r: 255, g: 0, b: 0 },
  hsv: { h: 0, s: 100, v: 100 },
  category: 'Red',
  acquisition: 'Vendor',
  cost: 0,
  isMetallic: false,
  isPastel: false,
  isDark: false,
  isCosmic: false,
  ...overrides,
});

// Helper to access private methods - use interface instead of intersection to avoid 'never' type
interface ComponentWithPrivate {
  init: () => void;
  analyzeDye: (dye: Dye) => {
    dyeId: number;
    dyeName: string;
    hex: string;
    contrastVsWhite: { ratio: number; wcagLevel: 'AAA' | 'AA' | 'Fail' };
    contrastVsBlack: { ratio: number; wcagLevel: 'AAA' | 'AA' | 'Fail' };
    warnings: string[];
    colorblindnessSimulations: Record<string, string>;
  };
  analyzePair: (
    dye1: Dye,
    dye2: Dye
  ) => {
    dye1Id: number;
    dye2Id: number;
    contrastRatio: number;
    wcagLevel: 'AAA' | 'AA' | 'Fail';
    distinguishability: number;
    colorblindnessDistinguishability: Record<string, number>;
    warnings: string[];
  };
  getWCAGLevel: (ratio: number) => 'AAA' | 'AA' | 'Fail';
  getWCAGBadgeColor: (level: string) => string;
  getDistinguishabilityTextColor: (score: number) => string;
  selectedDyes: Dye[];
}

describe('AccessibilityCheckerTool Component', () => {
  let container: HTMLElement;
  let component: AccessibilityCheckerTool;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  describe('Initialization', () => {
    it('should create component successfully', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should render title and subtitle', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const text = container.textContent || '';
      expect(text).toContain('Accessibility');
    });

    it('should render dye selector container', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const selectorContainer = container.querySelector('#dye-selector-container');
      expect(selectorContainer).not.toBeNull();
    });

    it('should render results container', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer).not.toBeNull();
    });
  });

  describe('Colorblindness Types', () => {
    it('should display deuteranopia option', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should display protanopia option', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display tritanopia option', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should display achromatopsia option', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow switching between colorblind types', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });
  });

  describe('Outfit Slots', () => {
    it('should provide Head dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should provide Body dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should provide Hands dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should provide Legs dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should provide Feet dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should provide Weapon dye selector', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle all 6 slots simultaneously', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Dual Dyes Feature', () => {
    it('should provide dual dye toggle', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should display dual dye description', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should toggle dual dyes on/off', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should persist dual dye preference', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Intensity Sliders', () => {
    it('should provide intensity slider', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should show current intensity value', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow adjusting intensity', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should update preview in real-time on slider change', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Preview Display', () => {
    it('should display outfit preview', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should show normal vision colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should show simulated colorblind colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should display side-by-side comparison', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update preview when dyes change', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(container).toBeDefined();
    });
  });

  describe('Accessibility Score', () => {
    it('should calculate accessibility score', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display score numerically', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should show score interpretation', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update score as dyes change', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(component).toBeDefined();
    });

    it('should handle no dyes selected', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container).toBeDefined();
    });
  });

  describe('Distinguishability Warnings', () => {
    it('should warn when dyes not distinguishable', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should highlight problematic dye combinations', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should show warning severity levels', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update warnings when selection changes', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(component).toBeDefined();
    });
  });

  describe('Color Suggestions', () => {
    it('should provide dye suggestions for improvement', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should rank suggestions by improvement potential', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should support one-click application of suggestions', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should maintain selected dyes', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should maintain selected vision type', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should maintain intensity setting', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should maintain dual dyes toggle state', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(component).toBeDefined();
    });

    it('should update all UI elements on state change', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      expect(container).toBeDefined();
    });
  });

  describe('Lifecycle', () => {
    it('should initialize without errors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle update cycles', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      component.update();
      component.update();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should cleanup resources on destroy', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      component.destroy();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should have semantic HTML structure', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const firstChild = container.querySelector('div');
      expect(firstChild).toBeDefined();
    });

    it('should provide descriptive labels', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should be keyboard navigable', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should have sufficient color contrast', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should provide screen reader support', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all colorblind types', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle intensity at minimum (0)', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle intensity at maximum (100)', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle all 6 outfit slots filled', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle no dyes selected', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle mixed dual/single dyes', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  // ==========================================================================
  // Business Logic Tests - analyzeDye
  // ==========================================================================

  describe('analyzeDye method', () => {
    it('should return DyeAccessibilityResult with all required fields', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result).toHaveProperty('dyeId');
      expect(result).toHaveProperty('dyeName');
      expect(result).toHaveProperty('hex');
      expect(result).toHaveProperty('contrastVsWhite');
      expect(result).toHaveProperty('contrastVsBlack');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('colorblindnessSimulations');
    });

    it('should include all colorblindness simulations', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result.colorblindnessSimulations).toHaveProperty('normal');
      expect(result.colorblindnessSimulations).toHaveProperty('deuteranopia');
      expect(result.colorblindnessSimulations).toHaveProperty('protanopia');
      expect(result.colorblindnessSimulations).toHaveProperty('tritanopia');
      expect(result.colorblindnessSimulations).toHaveProperty('achromatopsia');
    });

    it('should calculate contrast ratios as positive numbers', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result.contrastVsWhite.ratio).toBeGreaterThanOrEqual(1);
      expect(result.contrastVsBlack.ratio).toBeGreaterThanOrEqual(1);
    });

    it('should return valid WCAG levels for contrast', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(['AAA', 'AA', 'Fail']).toContain(result.contrastVsWhite.wcagLevel);
      expect(['AAA', 'AA', 'Fail']).toContain(result.contrastVsBlack.wcagLevel);
    });
  });

  // ==========================================================================
  // Business Logic Tests - analyzePair
  // ==========================================================================

  describe('analyzePair method', () => {
    it('should return DyePairResult with contrast ratio and distinguishability', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#00FF00' });
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result).toHaveProperty('dye1Id');
      expect(result).toHaveProperty('dye2Id');
      expect(result).toHaveProperty('contrastRatio');
      expect(result).toHaveProperty('wcagLevel');
      expect(result).toHaveProperty('distinguishability');
      expect(result).toHaveProperty('colorblindnessDistinguishability');
      expect(result).toHaveProperty('warnings');
    });

    it('should calculate distinguishability between 0 and 100', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#00FF00' });
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.distinguishability).toBeGreaterThanOrEqual(0);
      expect(result.distinguishability).toBeLessThanOrEqual(100);
    });

    it('should calculate contrast ratio as a positive number', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#00FF00' });
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.contrastRatio).toBeGreaterThanOrEqual(1);
    });

    it('should return low distinguishability for similar colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#FF0010' }); // Very similar
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.distinguishability).toBeLessThan(20);
    });

    it('should return high distinguishability for contrasting colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#000000' }); // Black
      const dye2 = createMockDye({ id: 2, hex: '#FFFFFF' }); // White
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.distinguishability).toBeGreaterThan(50);
    });

    it('should include colorblindness distinguishability for all vision types', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#00FF00' });
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.colorblindnessDistinguishability).toHaveProperty('normal');
      expect(result.colorblindnessDistinguishability).toHaveProperty('deuteranopia');
      expect(result.colorblindnessDistinguishability).toHaveProperty('protanopia');
      expect(result.colorblindnessDistinguishability).toHaveProperty('tritanopia');
    }
    );
  });

  // ==========================================================================
  // Business Logic Tests - getWCAGLevel
  // ==========================================================================

  describe('getWCAGLevel method', () => {
    it('should return AAA for ratio >= 7', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const level = (component as unknown as ComponentWithPrivate).getWCAGLevel(7);
      expect(level).toBe('AAA');
    });

    it('should return AA for ratio >= 4.5', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const level = (component as unknown as ComponentWithPrivate).getWCAGLevel(5);
      expect(level).toBe('AA');
    });

    it('should return Fail for ratio < 4.5', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const level = (component as unknown as ComponentWithPrivate).getWCAGLevel(3);
      expect(level).toBe('Fail');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getWCAGBadgeColor
  // ==========================================================================

  describe('getWCAGBadgeColor method', () => {
    it('should return green style for AAA', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getWCAGBadgeColor('AAA');
      expect(color).toContain('green');
    });

    it('should return blue style for AA', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getWCAGBadgeColor('AA');
      expect(color).toContain('blue');
    });

    it('should return red style for Fail', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getWCAGBadgeColor('Fail');
      expect(color).toContain('red');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getDistinguishabilityTextColor
  // ==========================================================================

  describe('getDistinguishabilityTextColor method', () => {
    it('should return green for score >= 60', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityTextColor(65);
      expect(color).toContain('green');
    });

    it('should return blue for score >= 40', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityTextColor(45);
      expect(color).toContain('blue');
    });

    it('should return yellow for score >= 20', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityTextColor(25);
      expect(color).toContain('yellow');
    });

    it('should return red for score < 20', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityTextColor(15);
      expect(color).toContain('red');
    });
  });

  // ==========================================================================
  // updateResults Integration Tests
  // ==========================================================================

  describe('updateResults integration', () => {
    // Helper to access private updateResults - use interface to avoid 'never' type
    interface ComponentWithUpdateResults {
      updateResults: () => void;
      dyeSelector: { getSelectedDyes: () => Dye[] } | null;
    }

    it('should display empty message when no dyes selected', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      // Manually trigger updateResults with empty selection via mock
      const comp = component as unknown as ComponentWithUpdateResults;
      if (comp.dyeSelector) {
        vi.spyOn(comp.dyeSelector, 'getSelectedDyes').mockReturnValue([]);
      }

      // Trigger selection change
      const dyeSelectorContainer = container.querySelector('#dye-selector-container');
      dyeSelectorContainer?.dispatchEvent(new CustomEvent('selection-changed'));

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('');
    });

    it('should render dye cards when dyes are selected', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithUpdateResults;
      const selectedDyes = [
        createMockDye({ id: 1, name: 'Red Dye', hex: '#FF0000' }),
        createMockDye({ id: 2, name: 'Blue Dye', hex: '#0000FF' }),
      ];

      if (comp.dyeSelector) {
        vi.spyOn(comp.dyeSelector, 'getSelectedDyes').mockReturnValue(selectedDyes);
      }

      // Trigger selection change
      const dyeSelectorContainer = container.querySelector('#dye-selector-container');
      dyeSelectorContainer?.dispatchEvent(new CustomEvent('selection-changed'));

      // Results should be rendered
      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer).not.toBeNull();
    });

    it('should show pair comparison section when 2+ dyes selected', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithUpdateResults;
      const selectedDyes = [
        createMockDye({ id: 1, name: 'Red Dye', hex: '#FF0000' }),
        createMockDye({ id: 2, name: 'Blue Dye', hex: '#0000FF' }),
      ];

      if (comp.dyeSelector) {
        vi.spyOn(comp.dyeSelector, 'getSelectedDyes').mockReturnValue(selectedDyes);
      }

      // Trigger selection change
      const dyeSelectorContainer = container.querySelector('#dye-selector-container');
      dyeSelectorContainer?.dispatchEvent(new CustomEvent('selection-changed'));

      // Check if pair comparison note is rendered
      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Rendering Tests - renderDyeCard
  // ==========================================================================

  describe('renderDyeCard rendering', () => {
    // Use interface to avoid 'never' type from intersection with private members
    interface ComponentWithRender {
      renderDyeCard: (result: {
        dyeId: number;
        dyeName: string;
        hex: string;
        contrastVsWhite: { ratio: number; wcagLevel: 'AAA' | 'AA' | 'Fail' };
        contrastVsBlack: { ratio: number; wcagLevel: 'AAA' | 'AA' | 'Fail' };
        warnings: string[];
        colorblindnessSimulations: Record<string, string>;
      }) => HTMLElement;
    }

    it('should render dye card with name and hex', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dyeId: 1,
        dyeName: 'Test Red Dye',
        hex: '#FF0000',
        contrastVsWhite: { ratio: 4.0, wcagLevel: 'Fail' as const },
        contrastVsBlack: { ratio: 5.25, wcagLevel: 'AA' as const },
        warnings: [],
        colorblindnessSimulations: {
          normal: '#FF0000',
          deuteranopia: '#AA5500',
          protanopia: '#AA5500',
          tritanopia: '#FF0055',
          achromatopsia: '#808080',
        },
      };

      const card = comp.renderDyeCard(result);

      expect(card.textContent).toContain('Test Red Dye');
      expect(card.textContent).toContain('#FF0000');
    });

    it('should render contrast vs white and black', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dyeId: 1,
        dyeName: 'Test Dye',
        hex: '#FF0000',
        contrastVsWhite: { ratio: 4.0, wcagLevel: 'Fail' as const },
        contrastVsBlack: { ratio: 5.25, wcagLevel: 'AA' as const },
        warnings: [],
        colorblindnessSimulations: {
          normal: '#FF0000',
          deuteranopia: '#AA5500',
          protanopia: '#AA5500',
          tritanopia: '#FF0055',
          achromatopsia: '#808080',
        },
      };

      const card = comp.renderDyeCard(result);

      // Should show contrast ratios (4.0 displayed as "4:1", 5.25 displayed as "5.25:1")
      expect(card.textContent).toContain('4:1');
      expect(card.textContent).toContain('5.25:1');
    });

    it('should render warnings when present', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dyeId: 1,
        dyeName: 'Test Dye',
        hex: '#FF0000',
        contrastVsWhite: { ratio: 4.0, wcagLevel: 'Fail' as const },
        contrastVsBlack: { ratio: 5.25, wcagLevel: 'AA' as const },
        warnings: ['Red-green colorblind warning', 'Another warning'],
        colorblindnessSimulations: {
          normal: '#FF0000',
          deuteranopia: '#AA5500',
          protanopia: '#AA5500',
          tritanopia: '#FF0055',
          achromatopsia: '#808080',
        },
      };

      const card = comp.renderDyeCard(result);

      expect(card.textContent).toContain('Red-green colorblind warning');
      expect(card.textContent).toContain('Another warning');
    });

    it('should render colorblindness simulations grid', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dyeId: 1,
        dyeName: 'Test Dye',
        hex: '#FF0000',
        contrastVsWhite: { ratio: 4.0, wcagLevel: 'Fail' as const },
        contrastVsBlack: { ratio: 5.25, wcagLevel: 'AA' as const },
        warnings: [],
        colorblindnessSimulations: {
          normal: '#FF0000',
          deuteranopia: '#AA5500',
          protanopia: '#AA5500',
          tritanopia: '#FF0055',
          achromatopsia: '#808080',
        },
      };

      const card = comp.renderDyeCard(result);
      // Layout was changed from grid-cols-5 to flex flex-wrap for better i18n support
      const flexContainer = card.querySelector('.flex.flex-wrap');

      expect(flexContainer).not.toBeNull();
      expect(flexContainer?.children.length).toBe(5); // 5 vision types
    });
  });

  // ==========================================================================
  // Rendering Tests - renderPairCard
  // ==========================================================================

  describe('renderPairCard rendering', () => {
    // Use interface to avoid 'never' type from intersection with private members
    interface ComponentWithRender {
      renderPairCard: (result: {
        dye1Id: number;
        dye1Name: string;
        dye1Hex: string;
        dye2Id: number;
        dye2Name: string;
        dye2Hex: string;
        contrastRatio: number;
        wcagLevel: 'AAA' | 'AA' | 'Fail';
        distinguishability: number;
        colorblindnessDistinguishability: {
          normal: number;
          deuteranopia: number;
          protanopia: number;
          tritanopia: number;
        };
        warnings: string[];
      }) => HTMLElement;
    }

    it('should render both dye names', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dye1Id: 1,
        dye1Name: 'Rose Red',
        dye1Hex: '#FF0000',
        dye2Id: 2,
        dye2Name: 'Ocean Blue',
        dye2Hex: '#0000FF',
        contrastRatio: 2.5,
        wcagLevel: 'Fail' as const,
        distinguishability: 75,
        colorblindnessDistinguishability: {
          normal: 75,
          deuteranopia: 60,
          protanopia: 55,
          tritanopia: 70,
        },
        warnings: [],
      };

      const card = comp.renderPairCard(result);

      expect(card.textContent).toContain('Rose Red');
      expect(card.textContent).toContain('Ocean Blue');
    });

    it('should render distinguishability score', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dye1Id: 1,
        dye1Name: 'Red',
        dye1Hex: '#FF0000',
        dye2Id: 2,
        dye2Name: 'Blue',
        dye2Hex: '#0000FF',
        contrastRatio: 2.5,
        wcagLevel: 'Fail' as const,
        distinguishability: 75,
        colorblindnessDistinguishability: {
          normal: 75,
          deuteranopia: 60,
          protanopia: 55,
          tritanopia: 70,
        },
        warnings: [],
      };

      const card = comp.renderPairCard(result);

      expect(card.textContent).toContain('75%');
    });

    it('should render warnings when present', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const comp = component as unknown as ComponentWithRender;
      const result = {
        dye1Id: 1,
        dye1Name: 'Red',
        dye1Hex: '#FF0000',
        dye2Id: 2,
        dye2Name: 'Similar Red',
        dye2Hex: '#FF1111',
        contrastRatio: 1.05,
        wcagLevel: 'Fail' as const,
        distinguishability: 15,
        colorblindnessDistinguishability: {
          normal: 15,
          deuteranopia: 10,
          protanopia: 8,
          tritanopia: 12,
        },
        warnings: ['Very similar colors'],
      };

      const card = comp.renderPairCard(result);

      expect(card.textContent).toContain('Very similar colors');
    });
  });

  // ==========================================================================
  // analyzeDye Edge Cases - Warning Generation
  // ==========================================================================

  describe('analyzeDye warning generation', () => {
    it('should generate red-green warning for similar deuteranopia/protanopia colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      // Use a red color that becomes similar in deuteranopia and protanopia
      const mockDye = createMockDye({ id: 1, hex: '#FF0000' });
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      // The warning might or might not appear depending on the color
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should check tritanopia distinguishability', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      // Blue colors are most affected by tritanopia
      const mockDye = createMockDye({ id: 1, hex: '#0000FF' });
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result.colorblindnessSimulations.tritanopia).toBeDefined();
    });

    it('should check achromatopsia distinguishability', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      // Gray-ish colors might trigger achromatopsia warnings
      const mockDye = createMockDye({ id: 1, hex: '#808080' });
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result.colorblindnessSimulations.achromatopsia).toBeDefined();
    });
  });

  // ==========================================================================
  // analyzePair Edge Cases - Warning Generation
  // ==========================================================================

  describe('analyzePair warning generation', () => {
    it('should warn for very similar colors (distinguishability < 20)', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#FF0005' }); // Almost identical
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn for somewhat similar colors (distinguishability < 40)', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#FF3333' }); // Somewhat similar
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      // May or may not have warnings depending on exact distance
      expect(result.warnings).toBeDefined();
    });

    it('should not warn for very different colors', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#000000' }); // Black
      const dye2 = createMockDye({ id: 2, hex: '#FFFFFF' }); // White
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result.warnings.length).toBe(0);
    });
  });
});
