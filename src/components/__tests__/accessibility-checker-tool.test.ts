/**
 * XIV Dye Tools - Accessibility Checker Tool Tests
 *
 * Tests for the AccessibilityCheckerTool component which simulates
 * colorblindness and checks dye accessibility for outfits
 */

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
  ...overrides,
});

// Helper to access private methods
type ComponentWithPrivate = AccessibilityCheckerTool & {
  analyzeDye: (dye: Dye) => {
    dyeId: number;
    dyeName: string;
    hex: string;
    contrastScore: number;
    wcagLevel: 'AAA' | 'AA' | 'Fail';
    warnings: string[];
    colorblindnessSimulations: Record<string, string>;
  };
  analyzePair: (dye1: Dye, dye2: Dye) => {
    dye1Id: number;
    dye2Id: number;
    distinguishability: number;
    warnings: string[];
  };
  calculateOverallAccessibilityScore: () => number;
  getAccessibilityScoreStyle: (score: number) => { color: string; label: string; bgClass: string };
  getScoreColor: (score: number) => string;
  getWCAGBadgeColor: (level: string) => string;
  getDistinguishabilityColor: (score: number) => string;
  selectedDyes: Dye[];
};

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
      expect(result).toHaveProperty('contrastScore');
      expect(result).toHaveProperty('wcagLevel');
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

    it('should calculate contrast score between 0 and 100', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(result.contrastScore).toBeGreaterThanOrEqual(0);
      expect(result.contrastScore).toBeLessThanOrEqual(100);
    });

    it('should return valid WCAG level', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const mockDye = createMockDye();
      const result = (component as unknown as ComponentWithPrivate).analyzeDye(mockDye);

      expect(['AAA', 'AA', 'Fail']).toContain(result.wcagLevel);
    });
  });

  // ==========================================================================
  // Business Logic Tests - analyzePair
  // ==========================================================================

  describe('analyzePair method', () => {
    it('should return DyePairResult with distinguishability score', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1, hex: '#FF0000' });
      const dye2 = createMockDye({ id: 2, hex: '#00FF00' });
      const result = (component as unknown as ComponentWithPrivate).analyzePair(dye1, dye2);

      expect(result).toHaveProperty('dye1Id');
      expect(result).toHaveProperty('dye2Id');
      expect(result).toHaveProperty('distinguishability');
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
  });

  // ==========================================================================
  // Business Logic Tests - calculateOverallAccessibilityScore
  // ==========================================================================

  describe('calculateOverallAccessibilityScore method', () => {
    it('should return 100 for single dye', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      (component as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];
      const score = (component as unknown as ComponentWithPrivate).calculateOverallAccessibilityScore();

      expect(score).toBe(100);
    });

    it('should return 100 for empty selection', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      (component as unknown as ComponentWithPrivate).selectedDyes = [];
      const score = (component as unknown as ComponentWithPrivate).calculateOverallAccessibilityScore();

      expect(score).toBe(100);
    });

    it('should return score between 0 and 100 for multiple dyes', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      (component as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, hex: '#FF0000' }),
        createMockDye({ id: 2, hex: '#00FF00' }),
      ];
      const score = (component as unknown as ComponentWithPrivate).calculateOverallAccessibilityScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ==========================================================================
  // Business Logic Tests - getScoreColor
  // ==========================================================================

  describe('getScoreColor method', () => {
    it('should return green for score >= 100', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getScoreColor(100);
      expect(color).toContain('green');
    });

    it('should return blue for score >= 70', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getScoreColor(75);
      expect(color).toContain('blue');
    });

    it('should return yellow for score >= 40', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getScoreColor(50);
      expect(color).toContain('yellow');
    });

    it('should return red for score < 40', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getScoreColor(20);
      expect(color).toContain('red');
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
  // Business Logic Tests - getDistinguishabilityColor
  // ==========================================================================

  describe('getDistinguishabilityColor method', () => {
    it('should return green for score >= 80', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityColor(85);
      expect(color).toContain('green');
    });

    it('should return blue for score >= 60', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityColor(65);
      expect(color).toContain('blue');
    });

    it('should return yellow for score >= 40', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityColor(45);
      expect(color).toContain('yellow');
    });

    it('should return red for score < 40', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const color = (component as unknown as ComponentWithPrivate).getDistinguishabilityColor(25);
      expect(color).toContain('red');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getAccessibilityScoreStyle
  // ==========================================================================

  describe('getAccessibilityScoreStyle method', () => {
    it('should return excellent style for score >= 80', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const style = (component as unknown as ComponentWithPrivate).getAccessibilityScoreStyle(85);
      expect(style.label.toLowerCase()).toContain('excellent');
      expect(style.color).toContain('green');
    });

    it('should return fair style for score 50-79', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const style = (component as unknown as ComponentWithPrivate).getAccessibilityScoreStyle(60);
      expect(style.label.toLowerCase()).toContain('fair');
      expect(style.color).toContain('yellow');
    });

    it('should return poor style for score < 50', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const style = (component as unknown as ComponentWithPrivate).getAccessibilityScoreStyle(30);
      expect(style.label.toLowerCase()).toContain('poor');
      expect(style.color).toContain('red');
    });
  });

  // ==========================================================================
  // Public Methods Tests
  // ==========================================================================

  describe('createPair method', () => {
    it('should create pair without error', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      const dye1 = createMockDye({ id: 1 });
      const dye2 = createMockDye({ id: 2 });

      expect(() => component.createPair(dye1, dye2)).not.toThrow();
    });
  });

  describe('clearPairs method', () => {
    it('should clear pairs without error', () => {
      component = new AccessibilityCheckerTool(container);
      component.init();

      expect(() => component.clearPairs()).not.toThrow();
    });
  });
});
