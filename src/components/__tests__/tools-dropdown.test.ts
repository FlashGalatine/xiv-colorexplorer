/**
 * XIV Dye Tools - ToolsDropdown Component Tests
 *
 * Tests for the ToolsDropdown component
 * Covers rendering, dropdown behavior, tool selection, and event handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToolsDropdown, type ToolDef } from '../tools-dropdown';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
  expectElement,
} from './test-utils';

// ============================================================================
// Mock Data
// ============================================================================

const mockTools: ToolDef[] = [
  {
    id: 'harmony',
    name: 'Color Harmony',
    icon: '🎨',
    description: 'Generate harmonious color palettes',
  },
  {
    id: 'matcher',
    name: 'Color Matcher',
    icon: '🔍',
    description: 'Find matching dyes from images',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Checker',
    icon: '♿',
    description: 'Check colorblind accessibility',
  },
  {
    id: 'comparison',
    name: 'Dye Comparison',
    icon: '📊',
    description: 'Compare multiple dyes',
  },
];

// ============================================================================
// Tests
// ============================================================================

describe('ToolsDropdown', () => {
  let container: HTMLElement;
  let component: ToolsDropdown;

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
    it('should render dropdown button with correct attributes', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      expect(button).not.toBeNull();
      expect(button.textContent).toContain('Tools');
      expect(button.getAttribute('aria-label')).toBe('Toggle tools menu');
      expect(button.getAttribute('aria-haspopup')).toBe('true');
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should render dropdown menu with hidden class initially', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;
      expect(dropdown).not.toBeNull();
      expectElement.toHaveClass(dropdown, 'hidden');
    });

    it('should render all tool buttons', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const toolButtons = container.querySelectorAll('[data-tool-id]');
      expect(toolButtons.length).toBe(mockTools.length);
    });

    it('should render tool buttons with correct data-tool-id', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      mockTools.forEach((tool) => {
        const button = container.querySelector(`[data-tool-id="${tool.id}"]`);
        expect(button).not.toBeNull();
      });
    });

    it('should render tool name and description', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.textContent).toContain('Color Harmony');
      expect(harmonyBtn.textContent).toContain('Generate harmonious color palettes');
    });

    it('should render tool icon', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.textContent).toContain('🎨');
    });

    it('should render with empty tools array', () => {
      component = new ToolsDropdown(container, []);
      component.init();

      const toolButtons = container.querySelectorAll('[data-tool-id]');
      expect(toolButtons.length).toBe(0);
    });

    it('should set title attribute with tool description', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLElement;
      expect(harmonyBtn.getAttribute('title')).toBe('Generate harmonious color palettes');
    });
  });

  // ==========================================================================
  // Dropdown Toggle Behavior
  // ==========================================================================

  describe('Dropdown Toggle', () => {
    it('should open dropdown when button is clicked', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      button.click();

      expectElement.toNotHaveClass(dropdown, 'hidden');
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close dropdown when button is clicked twice', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      button.click(); // Open
      button.click(); // Close

      expectElement.toHaveClass(dropdown, 'hidden');
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should toggle dropdown state correctly', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;

      // Initial state
      expect(component['isDropdownOpen']).toBe(false);

      // Open
      button.click();
      expect(component['isDropdownOpen']).toBe(true);

      // Close
      button.click();
      expect(component['isDropdownOpen']).toBe(false);
    });

    it('should update aria-expanded when toggling', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;

      expect(button.getAttribute('aria-expanded')).toBe('false');

      button.click();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      button.click();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // ==========================================================================
  // Tool Selection
  // ==========================================================================

  describe('Tool Selection', () => {
    it('should emit tool-selected event when tool is clicked', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      // Click a tool
      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;
      harmonyBtn.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('should emit correct toolId in event detail', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      // Click a tool
      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;
      harmonyBtn.click();

      const event = eventHandler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.toolId).toBe('harmony');
    });

    it('should close dropdown after tool selection', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;
      expectElement.toNotHaveClass(dropdown, 'hidden');

      // Click a tool
      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;
      harmonyBtn.click();

      expectElement.toHaveClass(dropdown, 'hidden');
    });

    it('should emit events for all tools', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;

      mockTools.forEach((tool) => {
        button.click(); // Open dropdown
        const toolBtn = container.querySelector(`[data-tool-id="${tool.id}"]`) as HTMLButtonElement;
        toolBtn.click();
      });

      expect(eventHandler).toHaveBeenCalledTimes(mockTools.length);

      // Verify each tool was emitted
      mockTools.forEach((tool, index) => {
        const event = eventHandler.mock.calls[index][0] as CustomEvent;
        expect(event.detail.toolId).toBe(tool.id);
      });
    });

    it('should bubble custom event', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      // Listen on document to verify bubbling
      document.addEventListener('tool-selected', eventHandler);

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;
      harmonyBtn.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);

      // Cleanup
      document.removeEventListener('tool-selected', eventHandler);
    });
  });

  // ==========================================================================
  // Outside Click Behavior
  // ==========================================================================

  describe('Outside Click', () => {
    it('should close dropdown when clicking outside', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;
      expectElement.toNotHaveClass(dropdown, 'hidden');

      // Click outside (on document body)
      document.body.click();

      expectElement.toHaveClass(dropdown, 'hidden');
    });

    it('should not close dropdown when clicking inside dropdown', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      // Click inside dropdown (but not on a tool button)
      dropdown.click();

      expectElement.toNotHaveClass(dropdown, 'hidden');
    });

    it('should not close if dropdown is already closed', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      // Dropdown is closed, clicking outside should do nothing
      document.body.click();

      expectElement.toHaveClass(dropdown, 'hidden');
      expect(component['isDropdownOpen']).toBe(false);
    });
  });

  // ==========================================================================
  // Keyboard Behavior
  // ==========================================================================

  describe('Keyboard', () => {
    it('should close dropdown on Escape key', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;
      expectElement.toNotHaveClass(dropdown, 'hidden');

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expectElement.toHaveClass(dropdown, 'hidden');
    });

    it('should not close dropdown on other keys', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      // Press Enter
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      expectElement.toNotHaveClass(dropdown, 'hidden');
    });

    it('should not close if dropdown is already closed on Escape', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      // Dropdown is closed, Escape should do nothing
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expectElement.toHaveClass(dropdown, 'hidden');
      expect(component['isDropdownOpen']).toBe(false);
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('State Management', () => {
    it('should return correct state when closed', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const state = component['getState']();

      expect(state.isOpen).toBe(false);
      expect(state.toolCount).toBe(mockTools.length);
    });

    it('should return correct state when open', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button.click();

      const state = component['getState']();

      expect(state.isOpen).toBe(true);
      expect(state.toolCount).toBe(mockTools.length);
    });

    it('should return correct toolCount for empty tools array', () => {
      component = new ToolsDropdown(container, []);
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
      component = new ToolsDropdown(container, mockTools);
      expect(component['isInitialized']).toBe(false);

      component.init();

      expect(component['isInitialized']).toBe(true);
    });

    it('should clean up event listeners on destroy', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const listenerCount = component['listeners'].size;
      expect(listenerCount).toBeGreaterThan(0);

      component.destroy();

      expect(component['listeners'].size).toBe(0);
    });

    it('should update component correctly', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      // Open dropdown
      const button1 = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      button1.click();

      expect(component['isDropdownOpen']).toBe(true);

      // Update component (should re-render and reset state)
      component.update();

      // After update, dropdown should be closed (state is in private fields, not persisted)
      const button2 = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      expect(button2).not.toBeNull();
      expect(dropdown).not.toBeNull();
      expectElement.toHaveClass(dropdown, 'hidden');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle single tool', () => {
      const singleTool = [mockTools[0]];
      component = new ToolsDropdown(container, singleTool);
      component.init();

      const toolButtons = container.querySelectorAll('[data-tool-id]');
      expect(toolButtons.length).toBe(1);

      const state = component['getState']();
      expect(state.toolCount).toBe(1);
    });

    it('should handle tool with special characters in description', () => {
      const specialTools: ToolDef[] = [
        {
          id: 'special',
          name: 'Special & Tool',
          icon: '🔧',
          description: "Tool's description with <special> chars & symbols!",
        },
      ];

      component = new ToolsDropdown(container, specialTools);
      component.init();

      const toolBtn = container.querySelector('[data-tool-id="special"]') as HTMLElement;
      expect(toolBtn).not.toBeNull();
      expect(toolBtn.textContent).toContain('Special & Tool');
    });

    it('should handle rapid toggle clicks', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#tools-dropdown-menu') as HTMLElement;

      // Rapid clicks
      button.click();
      button.click();
      button.click();
      button.click();

      // Should be closed (even number of clicks)
      expectElement.toHaveClass(dropdown, 'hidden');
      expect(component['isDropdownOpen']).toBe(false);
    });

    it('should handle clicking same tool multiple times', () => {
      component = new ToolsDropdown(container, mockTools);
      component.init();

      const eventHandler = vi.fn();
      container.addEventListener('tool-selected', eventHandler);

      const button = container.querySelector('#tools-dropdown-btn') as HTMLButtonElement;

      // Click same tool 3 times
      for (let i = 0; i < 3; i++) {
        button.click();
        const harmonyBtn = container.querySelector('[data-tool-id="harmony"]') as HTMLButtonElement;
        harmonyBtn.click();
      }

      expect(eventHandler).toHaveBeenCalledTimes(3);

      // Each event should have same toolId
      for (let i = 0; i < 3; i++) {
        const event = eventHandler.mock.calls[i][0] as CustomEvent;
        expect(event.detail.toolId).toBe('harmony');
      }
    });
  });
});
