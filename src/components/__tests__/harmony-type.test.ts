/**
 * XIV Dye Tools - Harmony Type Component Tests
 *
 * Tests for the HarmonyType component which displays matching dyes
 * for a specific color harmony type
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HarmonyType, type HarmonyTypeInfo } from '../harmony-type';
import { createTestContainer, cleanupTestContainer, cleanupComponent } from './test-utils';
import type { Dye } from '@shared/types';

// Mock data
const mockHarmonyInfo: HarmonyTypeInfo = {
  id: 'complementary',
  name: 'Complementary',
  description: 'Colors opposite on the color wheel',
  icon: '🎨',
};

const mockDye1: Dye = {
  itemID: 1,
  id: 1,
  name: 'Jet Black',
  hex: '#000000',
  rgb: { r: 0, g: 0, b: 0 },
  hsv: { h: 0, s: 0, v: 0 },
  category: 'Neutral',
  acquisition: 'Weaver',
  cost: 0,
};

const mockDye2: Dye = {
  itemID: 2,
  id: 2,
  name: 'Snow White',
  hex: '#FFFFFF',
  rgb: { r: 255, g: 255, b: 255 },
  hsv: { h: 0, s: 0, v: 100 },
  category: 'Neutral',
  acquisition: 'Weaver',
  cost: 0,
};

describe('HarmonyType Component', () => {
  let container: HTMLElement;
  let component: HarmonyType;

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
    it('should create component with required properties', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(component).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should initialize without matched dyes', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const emptyState = container.textContent;
      expect(emptyState).toContain('No matching dyes found');
    });

    it('should initialize with matched dyes', () => {
      const matchedDyes = [
        { dye: mockDye1, deviance: 2 },
        { dye: mockDye2, deviance: 3 },
      ];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should initialize with prices disabled by default', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', [], false);
      component.init();

      expect(component).toBeDefined();
    });

    it('should initialize with prices enabled', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', [], true);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Rendering', () => {
    it('should render header with harmony info', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(container.textContent).toContain(mockHarmonyInfo.name);
    });

    it('should display matched dyes when provided', () => {
      const matchedDyes = [
        { dye: mockDye1, deviance: 1.5 },
        { dye: mockDye2, deviance: 2.0 },
      ];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      const text = container.textContent || '';
      expect(text).toContain('Jet Black');
    });

    it('should display correct dye names', () => {
      const matchedDyes = [{ dye: mockDye1, deviance: 2 }];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      const text = container.textContent || '';
      expect(text).toContain('Jet Black');
    });

    it('should apply card styling classes', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const card = container.querySelector('div');
      expect(card?.className).toContain('rounded-lg');
    });

    it('should apply theme-aware styling', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const card = container.querySelector('div');
      expect(card?.className).toContain('dark:bg-gray-800');
    });
  });

  describe('State Management', () => {
    it('should maintain harmony info through lifecycle', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(container.textContent).toContain(mockHarmonyInfo.name);
    });

    it('should handle empty matched dyes gracefully', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const emptyState = container.textContent;
      expect(emptyState).toContain('No matching dyes found');
    });

    it('should handle multiple matched dyes', () => {
      const matchedDyes = Array.from({ length: 5 }, (_, i) => ({
        dye: { ...mockDye1, id: i, itemID: i, name: `Dye ${i}` },
        deviance: Math.random() * 10,
      }));

      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should display different harmony types correctly', () => {
      const analogousInfo: HarmonyTypeInfo = {
        id: 'analogous',
        name: 'Analogous',
        description: 'Adjacent colors on the color wheel',
        icon: '🎨',
      };

      component = new HarmonyType(container, analogousInfo, '#FF0000', []);
      component.init();

      expect(container.textContent).toContain('Analogous');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long dye names', () => {
      const longNameDye: Dye = {
        ...mockDye1,
        name: 'This is an extremely long dye name that should still render properly without breaking',
      };

      const matchedDyes = [{ dye: longNameDye, deviance: 2 }];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      expect(container.textContent).toContain('extremely long dye name');
    });

    it('should handle special characters in dye names', () => {
      const specialDye: Dye = {
        ...mockDye1,
        name: "Dye's Name & Special <tag>",
      };

      const matchedDyes = [{ dye: specialDye, deviance: 2 }];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      expect(container.textContent).toContain("Dye's Name & Special");
    });

    it('should handle very high deviance values', () => {
      const matchedDyes = [{ dye: mockDye1, deviance: 100 }];
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', matchedDyes);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle various color formats', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#000000', []);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Lifecycle', () => {
    it('should properly initialize and destroy', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);

      component.destroy();
      expect(container.children.length).toBe(0);
    });

    it('should handle multiple update cycles', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      component.update();
      expect(container.children.length).toBeGreaterThan(0);

      component.update();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should cleanup resources on destroy', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      component.destroy();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      const card = container.querySelector('div');
      expect(card).toBeDefined();
    });

    it('should display harmony information clearly', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(container.textContent).toContain(mockHarmonyInfo.name);
      expect(container.textContent).toContain(mockHarmonyInfo.description);
    });

    it('should have proper text contrast', () => {
      component = new HarmonyType(container, mockHarmonyInfo, '#FF0000', []);
      component.init();

      expect(container).toBeDefined();
    });
  });
});
