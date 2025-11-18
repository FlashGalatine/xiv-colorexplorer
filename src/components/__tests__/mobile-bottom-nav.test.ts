/**
 * XIV Dye Tools - MobileBottomNav Component Tests
 *
 * Tests for the MobileBottomNav component
 * Covers rendering, tool selection, active state management, and events
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MobileBottomNav, type MobileToolDef } from '../mobile-bottom-nav';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
  expectElement,
} from './test-utils';

// ============================================================================
// Mock Data
// ============================================================================

const mockTools: MobileToolDef[] = [
  {
    id: 'harmony',
    name: 'Harmony',
    icon: '🎨',
    description: 'Generate harmonious color palettes',
  },
  {
    id: 'matcher',
    name: 'Matcher',
    icon: '🔍',
    description: 'Find matching dyes from images',
  },
  {
    id: 'accessibility',
    name: 'Access',
    icon: '♿',
    description: 'Check colorblind accessibility',
  },
  {
    id: 'comparison',
    name: 'Compare',
    icon: '📊',
    description: 'Compare multiple dyes',
  },
];

// ============================================================================
// Tests
// ============================================================================

describe('MobileBottomNav', () => {
  let container: HTMLElement;
  let component: MobileBottomNav;

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

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render navigation element with correct attributes', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const nav = container.querySelector('nav') as HTMLElement;
      expect(nav).not.toBeNull();
      expect(nav.getAttribute('aria-label')).toBe('Mobile Navigation');
      expect(nav.getAttribute('data-mobile-nav')).toBe('true');
    });

    it('should render all tool buttons', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const buttons = container.querySelectorAll('[data-tool-id]');
      expect(buttons.length).toBe(mockTools.length);
    });

    it('should render tool buttons with correct data-tool-id', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      mockTools.forEach((tool) => {
        const button = container.querySelector(`[data-tool-id="${tool.id}"]`);
        expect(button).not.toBeNull();
      });
    });

    it('should render tool icon and name', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.textContent).toContain('🎨');
      expect(harmonyBtn.textContent).toContain('Harmony');
    });

    it('should set title attribute with tool description', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.getAttribute('title')).toBe('Generate harmonious color palettes');
    });

    it('should set aria-label with tool name', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.getAttribute('aria-label')).toBe('Harmony');
    });

    it('should set role="tab" on all buttons', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const buttons = container.querySelectorAll('[data-tool-id]');
      buttons.forEach((btn) => {
        expect(btn.getAttribute('role')).toBe('tab');
      });
    });

    it('should highlight default active tool (harmony)', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.getAttribute('aria-selected')).toBe('true');
      expectElement.toHaveClass(harmonyBtn, 'text-blue-600');
    });

    it('should not highlight non-active tools', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLElement;
      expect(matcherBtn.getAttribute('aria-selected')).toBe('false');
      expectElement.toHaveClass(matcherBtn, 'text-gray-600');
    });

    it('should render with empty tools array', () => {
      component = new MobileBottomNav(container, []);
      component.init();

      const buttons = container.querySelectorAll('[data-tool-id]');
      expect(buttons.length).toBe(0);
    });

    it('should emit mobile-nav-ready event after rendering', async () => {
      component = new MobileBottomNav(container, mockTools);

      const eventHandler = vi.fn();
      container.addEventListener('mobile-nav-ready', eventHandler);

      component.init();

      // Event is emitted in setTimeout, so wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Tool Selection
  // ==========================================================================

  describe('Tool Selection', () => {
    it('should emit tool-selected event when tool is clicked', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;
      matcherBtn.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('should emit correct toolId in event detail', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;
      matcherBtn.click();

      const event = eventHandler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.toolId).toBe('matcher');
    });

    it('should update active tool when clicked', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;
      matcherBtn.click();

      expect(component.getActiveToolId()).toBe('matcher');
    });

    it('should highlight newly selected tool', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;
      matcherBtn.click();

      expect(matcherBtn.getAttribute('aria-selected')).toBe('true');
      expectElement.toHaveClass(matcherBtn, 'text-blue-600');
    });

    it('should remove highlight from previously active tool', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;

      // Initially harmony is active
      expect(harmonyBtn.getAttribute('aria-selected')).toBe('true');

      // Click matcher
      matcherBtn.click();

      // Harmony should no longer be highlighted
      expect(harmonyBtn.getAttribute('aria-selected')).toBe('false');
      expectElement.toHaveClass(harmonyBtn, 'text-gray-600');
    });

    it('should emit events for all tools', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      mockTools.forEach((tool) => {
        const btn = container.querySelector(`[data-tool-id="${tool.id}"]`) as HTMLButtonElement;
        btn.click();
      });

      expect(eventHandler).toHaveBeenCalledTimes(mockTools.length);

      // Verify each tool was emitted
      mockTools.forEach((tool, index) => {
        const event = eventHandler.mock.calls[index][0] as CustomEvent;
        expect(event.detail.toolId).toBe(tool.id);
      });
    });

    it('should bubble custom event', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      // Listen on document to verify bubbling
      document.addEventListener('tool-selected', eventHandler);

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLButtonElement;
      matcherBtn.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);

      // Cleanup
      document.removeEventListener('tool-selected', eventHandler);
    });

    it('should not emit event if toolId is invalid', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      // Manually create button without data-tool-id
      const invalidBtn = document.createElement('button');
      container.appendChild(invalidBtn);
      invalidBtn.click();

      expect(eventHandler).toHaveBeenCalledTimes(0);
    });
  });

  // ==========================================================================
  // Active State Management
  // ==========================================================================

  describe('Active State Management', () => {
    it('should set active tool via setActiveToolId', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      component.setActiveToolId('matcher');

      expect(component.getActiveToolId()).toBe('matcher');
    });

    it('should update button styles when setting active tool', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      component.setActiveToolId('matcher');

      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLElement;
      expect(matcherBtn.getAttribute('aria-selected')).toBe('true');
      expectElement.toHaveClass(matcherBtn, 'text-blue-600');
    });

    it('should do nothing if setting same tool as current', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const initialToolId = component.getActiveToolId();
      component.setActiveToolId(initialToolId);

      // Should still be the same
      expect(component.getActiveToolId()).toBe(initialToolId);
    });

    it('should get active tool id', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      expect(component.getActiveToolId()).toBe('harmony');
    });

    it('should update active tool multiple times', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      component.setActiveToolId('matcher');
      expect(component.getActiveToolId()).toBe('matcher');

      component.setActiveToolId('accessibility');
      expect(component.getActiveToolId()).toBe('accessibility');

      component.setActiveToolId('comparison');
      expect(component.getActiveToolId()).toBe('comparison');
    });

    it('should maintain only one active tool at a time', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      component.setActiveToolId('matcher');

      const buttons = container.querySelectorAll('[data-tool-id]');
      let activeCount = 0;

      buttons.forEach((btn) => {
        if (btn.getAttribute('aria-selected') === 'true') {
          activeCount++;
        }
      });

      expect(activeCount).toBe(1);
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('State Management', () => {
    it('should return correct state on init', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const state = component['getState']();

      expect(state.currentToolId).toBe('harmony');
      expect(state.toolCount).toBe(mockTools.length);
    });

    it('should return updated state after tool selection', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      component.setActiveToolId('matcher');

      const state = component['getState']();

      expect(state.currentToolId).toBe('matcher');
      expect(state.toolCount).toBe(mockTools.length);
    });

    it('should return correct toolCount for empty tools array', () => {
      component = new MobileBottomNav(container, []);
      component.init();

      const state = component['getState']();

      expect(state.toolCount).toBe(0);
    });
  });

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  describe('Lifecycle', () => {
    it('should initialize component correctly', () => {
      component = new MobileBottomNav(container, mockTools);
      expect(component['isInitialized']).toBe(false);

      component.init();

      expect(component['isInitialized']).toBe(true);
    });

    it('should clean up event listeners on destroy', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const listenerCount = component['listeners'].size;
      expect(listenerCount).toBeGreaterThan(0);

      component.destroy();

      expect(component['listeners'].size).toBe(0);
    });

    it('should update component correctly', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      // Change active tool
      component.setActiveToolId('matcher');
      expect(component.getActiveToolId()).toBe('matcher');

      // Update component (should re-render)
      component.update();

      // After update, elements should still exist
      const nav = container.querySelector('nav');
      const buttons = container.querySelectorAll('[data-tool-id]');

      expect(nav).not.toBeNull();
      expect(buttons.length).toBe(mockTools.length);
    });

    it('should preserve active tool state after update', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      // Change active tool
      component.setActiveToolId('matcher');

      // Update component
      component.update();

      // Active tool should be preserved (it's in private field currentToolId)
      const matcherBtn = container.querySelector('[data-tool-id="matcher"]') as HTMLElement;
      expect(matcherBtn.getAttribute('aria-selected')).toBe('true');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle single tool', () => {
      const singleTool = [mockTools[0]];
      component = new MobileBottomNav(container, singleTool);
      component.init();

      const buttons = container.querySelectorAll('[data-tool-id]');
      expect(buttons.length).toBe(1);

      const state = component['getState']();
      expect(state.toolCount).toBe(1);
    });

    it('should handle tool with long name (truncation)', () => {
      const longNameTools: MobileToolDef[] = [
        {
          id: 'long-name',
          name: 'Very Long Tool Name That Should Truncate',
          icon: '🔧',
          description: 'Tool with very long name',
        },
      ];

      component = new MobileBottomNav(container, longNameTools);
      component.init();

      const toolBtn = container.querySelector('[data-tool-id="long-name"]') as HTMLElement;
      const label = toolBtn.querySelector('.truncate') as HTMLElement;

      expect(label).not.toBeNull();
      expectElement.toHaveClass(label, 'truncate');
      expectElement.toHaveClass(label, 'max-w-[60px]');
    });

    it('should handle tool with special characters in description', () => {
      const specialTools: MobileToolDef[] = [
        {
          id: 'special',
          name: 'Special',
          icon: '🔧',
          description: "Tool's description with <special> chars & symbols!",
        },
      ];

      component = new MobileBottomNav(container, specialTools);
      component.init();

      const toolBtn = container.querySelector('[data-tool-id="special"]') as HTMLElement;
      expect(toolBtn).not.toBeNull();
      expect(toolBtn.getAttribute('title')).toBe("Tool's description with <special> chars & symbols!");
    });

    it('should handle rapid tool selection', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      // Rapidly select different tools
      component.setActiveToolId('matcher');
      component.setActiveToolId('accessibility');
      component.setActiveToolId('comparison');
      component.setActiveToolId('harmony');

      // Final state should be harmony
      expect(component.getActiveToolId()).toBe('harmony');

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.getAttribute('aria-selected')).toBe('true');
    });

    it('should handle clicking same tool multiple times', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;

      // Click same tool 3 times
      harmonyBtn.click();
      harmonyBtn.click();
      harmonyBtn.click();

      // Should emit 3 events (no deduplication)
      expect(eventHandler).toHaveBeenCalledTimes(3);

      // Each event should have same toolId
      for (let i = 0; i < 3; i++) {
        const event = eventHandler.mock.calls[i][0] as CustomEvent;
        expect(event.detail.toolId).toBe('harmony');
      }
    });

    it('should handle setActiveToolId with non-existent tool id', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      // Set to non-existent tool (should update state but no visual change)
      component.setActiveToolId('non-existent');

      expect(component.getActiveToolId()).toBe('non-existent');

      // All buttons should be inactive
      const buttons = container.querySelectorAll('[data-tool-id]');
      buttons.forEach((btn) => {
        expect(btn.getAttribute('aria-selected')).toBe('false');
      });
    });

    it('should handle all tools being clicked in sequence', () => {
      component = new MobileBottomNav(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      // Click all tools in order
      mockTools.forEach((tool) => {
        const btn = container.querySelector(`[data-tool-id="${tool.id}"]`) as HTMLButtonElement;
        btn.click();
      });

      // Should emit event for each tool
      expect(eventHandler).toHaveBeenCalledTimes(mockTools.length);

      // Final active tool should be the last one
      const lastTool = mockTools[mockTools.length - 1];
      expect(component.getActiveToolId()).toBe(lastTool.id);
    });
  });
});
