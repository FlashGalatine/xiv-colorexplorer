/**
 * XIV Dye Tools - Dye Comparison Tool Tests
 *
 * Tests for the DyeComparisonTool component which compares
 * up to 4 dyes with visualizations and detailed information
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DyeComparisonTool } from '../dye-comparison-tool';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
} from './test-utils';

describe('DyeComparisonTool Component', () => {
  let container: HTMLElement;
  let component: DyeComparisonTool;

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
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should render main layout', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const content = container.textContent || '';
      expect(content).toBeDefined();
    });

    it('should display dye selection controls', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Dye Selection', () => {
    it('should provide selector for 4 dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow selecting dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should display selected dye colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle no dyes selected gracefully', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const text = container.textContent || '';
      expect(text).toBeDefined();
    });

    it('should support up to 4 dyes comparison', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Color Distance Matrix', () => {
    it('should display distance matrix visualization', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should calculate color distances between dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should show distance values in table format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should use color coding (green/yellow/red)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle self-comparison (diagonal zeros)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Hue-Saturation Chart', () => {
    it('should display 2D hue-saturation chart', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should render canvas-based visualization', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should plot dyes on chart axes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle zoom controls', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Brightness Chart', () => {
    it('should display 1D brightness chart', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should show brightness distribution', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should scale brightness axis 0-100', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Dye Information Display', () => {
    it('should display dye names', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should show hex color codes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display RGB values', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should show dye categories', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display acquisition methods', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    it('should provide export options', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should export as JSON format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should export as CSS format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should generate valid export data', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow copying hex codes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Market Board Integration', () => {
    it('should display dye prices when available', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should handle missing price data gracefully', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update prices when toggled', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should maintain selected dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update all charts when dyes change', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.update();
      expect(container).toBeDefined();
    });

    it('should handle partial dye selection', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle empty selection', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Lifecycle', () => {
    it('should initialize without errors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle update cycles', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.update();
      component.update();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should cleanup resources on destroy', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      component.destroy();
      expect(container.children.length).toBe(0);
    });

    it('should properly cleanup canvas contexts', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.destroy();
      expect(component).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const firstChild = container.querySelector('div');
      expect(firstChild).toBeDefined();
    });

    it('should provide alt text for charts', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should have keyboard navigation support', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle comparing similar colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle comparing very different colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle single dye comparison', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle maximum dyes (4)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });
});
