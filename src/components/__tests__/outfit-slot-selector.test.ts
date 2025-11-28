/**
 * XIV Dye Tools - Outfit Slot Selector Component Tests
 *
 * Tests for outfit slot selection and dye assignment
 * Tests rendering and state without DyeSelector integration
 *
 * @module components/__tests__/outfit-slot-selector.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OutfitSlotSelector } from '../outfit-slot-selector';
import { createTestContainer, cleanupTestContainer } from './test-utils';

// Mock DyeSelector as a proper class
vi.mock('../dye-selector', () => ({
  DyeSelector: class MockDyeSelector {
    container: HTMLElement;
    options: Record<string, unknown>;
    constructor(container: HTMLElement, options?: Record<string, unknown>) {
      this.container = container;
      this.options = options || {};
    }
    init() {
      // No-op
    }
    destroy() {
      // No-op
    }
  },
}));

describe('OutfitSlotSelector', () => {
  let container: HTMLElement;
  let component: OutfitSlotSelector;

  beforeEach(() => {
    vi.clearAllMocks();
    container = createTestContainer();
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    cleanupTestContainer(container);
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================

  describe('rendering', () => {
    it('should render the outfit slot selector', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should render all 6 equipment slots', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      // Check for slot names
      expect(container.textContent).toContain('Head');
      expect(container.textContent).toContain('Body');
      expect(container.textContent).toContain('Hands');
      expect(container.textContent).toContain('Legs');
      expect(container.textContent).toContain('Feet');
      expect(container.textContent).toContain('Weapon');
    });

    it('should render slot icons', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      // Check for emoji icons
      expect(container.textContent).toContain('👑'); // Head
      expect(container.textContent).toContain('👔'); // Body
      expect(container.textContent).toContain('🧤'); // Hands
      expect(container.textContent).toContain('👖'); // Legs
      expect(container.textContent).toContain('👞'); // Feet
      expect(container.textContent).toContain('⚔️'); // Weapon
    });

    it('should render dual dyes toggle', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const toggle = container.querySelector('#dual-dyes-toggle');
      expect(toggle).not.toBeNull();
    });

    it('should render primary dye selector containers for each slot', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots = ['head', 'body', 'hands', 'legs', 'feet', 'weapon'];
      for (const slot of slots) {
        const primaryContainer = container.querySelector(`#dye-selector-${slot}-primary`);
        expect(primaryContainer).not.toBeNull();
      }
    });

    it('should not render secondary selectors when dual dyes disabled', () => {
      component = new OutfitSlotSelector(container, false);
      component.init();

      const secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      expect(secondaryContainer).toBeNull();
    });

    it('should render secondary selectors when dual dyes enabled', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      expect(secondaryContainer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Dual Dyes Toggle
  // ==========================================================================

  describe('dual dyes toggle', () => {
    it('should initialize with dual dyes disabled by default', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const toggle = container.querySelector('#dual-dyes-toggle') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it('should initialize with dual dyes enabled when passed true', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const toggle = container.querySelector('#dual-dyes-toggle') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });
  });

  // ==========================================================================
  // Slot Selection
  // ==========================================================================

  describe('getSelectedSlots', () => {
    it('should return all slots with null values initially', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots = component.getSelectedSlots();

      expect(slots.length).toBe(6);
      for (const slot of slots) {
        expect(slot.primary).toBeNull();
        expect(slot.secondary).toBeNull();
      }
    });

    it('should return copy of slot data', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots1 = component.getSelectedSlots();
      const slots2 = component.getSelectedSlots();

      // Should be different array instances
      expect(slots1).not.toBe(slots2);
    });
  });

  // ==========================================================================
  // Color Getters
  // ==========================================================================

  describe('getPrimaryColors', () => {
    it('should return empty object when no dyes selected', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const colors = component.getPrimaryColors();
      expect(Object.keys(colors).length).toBe(0);
    });
  });

  describe('getSecondaryColors', () => {
    it('should return empty object when no dyes selected', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const colors = component.getSecondaryColors();
      expect(Object.keys(colors).length).toBe(0);
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('state management', () => {
    it('should return correct state via getState', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();

      expect(state).toHaveProperty('slotCount', 6);
      expect(state).toHaveProperty('selectedSlotCount', 0);
      expect(state).toHaveProperty('dualDyesEnabled', true);
    });
  });

  // ==========================================================================
  // Event Emission
  // ==========================================================================

  describe('event emission', () => {
    it('should have slot-changed event handler setup', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      // The event listener is set up in bindEvents
      // We verify by checking the primary containers exist
      const primaryContainer = container.querySelector('#dye-selector-head-primary');
      expect(primaryContainer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('cleanup', () => {
    it('should clean up on destroy without error', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      expect(() => component.destroy()).not.toThrow();
    });

    it('should allow creating new component after destroy', () => {
      component = new OutfitSlotSelector(container);
      component.init();
      component.destroy();

      // Clear the container
      container.innerHTML = '';

      const newComponent = new OutfitSlotSelector(container);
      newComponent.init();

      expect(newComponent.getSelectedSlots().length).toBe(6);

      newComponent.destroy();
    });
  });

  // ==========================================================================
  // Slot Structure
  // ==========================================================================

  describe('slot structure', () => {
    it('should have correct slot IDs', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots = component.getSelectedSlots();
      const slotIds = slots.map((s) => s.id);

      expect(slotIds).toContain('head');
      expect(slotIds).toContain('body');
      expect(slotIds).toContain('hands');
      expect(slotIds).toContain('legs');
      expect(slotIds).toContain('feet');
      expect(slotIds).toContain('weapon');
    });

    it('should have correct slot names', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots = component.getSelectedSlots();
      const slotNames = slots.map((s) => s.name);

      expect(slotNames).toContain('Head');
      expect(slotNames).toContain('Body');
      expect(slotNames).toContain('Hands');
      expect(slotNames).toContain('Legs');
      expect(slotNames).toContain('Feet');
      expect(slotNames).toContain('Weapon');
    });

    it('should have correct slot icons', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const slots = component.getSelectedSlots();
      const slotIcons = slots.map((s) => s.icon);

      expect(slotIcons).toContain('👑');
      expect(slotIcons).toContain('👔');
      expect(slotIcons).toContain('🧤');
      expect(slotIcons).toContain('👖');
      expect(slotIcons).toContain('👞');
      expect(slotIcons).toContain('⚔️');
    });
  });

  // ==========================================================================
  // Primary Labels
  // ==========================================================================

  describe('labels', () => {
    it('should render Primary Dye labels', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      expect(container.textContent).toContain('Primary Dye');
    });

    it('should render Secondary Dye labels when dual dyes enabled', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      expect(container.textContent).toContain('Secondary Dye');
    });
  });

  // ==========================================================================
  // Dual Dyes Toggle Event
  // ==========================================================================

  describe('dual dyes toggle change event', () => {
    it('should update enableDualDyes when toggle is changed', () => {
      component = new OutfitSlotSelector(container, false);
      component.init();

      const toggle = container.querySelector('#dual-dyes-toggle') as HTMLInputElement;
      expect(toggle.checked).toBe(false);

      // Simulate toggle change
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));

      // Component should re-render with dual dyes enabled
      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();
      expect(state.dualDyesEnabled).toBe(true);
    });

    it('should re-render secondary selectors after toggle enabled', () => {
      component = new OutfitSlotSelector(container, false);
      component.init();

      // Initially no secondary containers
      let secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      expect(secondaryContainer).toBeNull();

      // Enable dual dyes
      const toggle = container.querySelector('#dual-dyes-toggle') as HTMLInputElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));

      // Now secondary containers should exist
      secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      expect(secondaryContainer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Primary Dye Selection Events
  // ==========================================================================

  describe('primary dye selection events', () => {
    it('should handle selection-changed event on primary container', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const emitSpy = vi.spyOn(component, 'emit');

      const primaryContainer = container.querySelector('#dye-selector-head-primary');
      const mockDye = {
        id: 1,
        itemID: 30001,
        name: 'Test Dye',
        hex: '#FF0000',
        rgb: { r: 255, g: 0, b: 0 },
        hsv: { h: 0, s: 100, v: 100 },
        category: 'Red',
        acquisition: 'Vendor',
      };

      // Dispatch selection-changed event with mock dye
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [mockDye] },
        bubbles: true,
      });
      primaryContainer?.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('slot-changed', expect.objectContaining({
        slotId: 'head',
        primary: mockDye,
      }));
    });

    it('should handle empty selection on primary container', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const emitSpy = vi.spyOn(component, 'emit');

      const primaryContainer = container.querySelector('#dye-selector-head-primary');

      // Dispatch selection-changed event with empty selection
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [] },
        bubbles: true,
      });
      primaryContainer?.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('slot-changed', expect.objectContaining({
        slotId: 'head',
        primary: null,
      }));
    });

    it('should handle selection-changed without detail', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const emitSpy = vi.spyOn(component, 'emit');

      const primaryContainer = container.querySelector('#dye-selector-head-primary');

      // Dispatch selection-changed event without detail
      const event = new CustomEvent('selection-changed', { bubbles: true });
      primaryContainer?.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('slot-changed', expect.objectContaining({
        slotId: 'head',
        primary: null,
      }));
    });
  });

  // ==========================================================================
  // Secondary Dye Selection Events
  // ==========================================================================

  describe('secondary dye selection events', () => {
    it('should handle selection-changed event on secondary container', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const emitSpy = vi.spyOn(component, 'emit');

      const secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      const mockDye = {
        id: 2,
        itemID: 30002,
        name: 'Secondary Dye',
        hex: '#0000FF',
        rgb: { r: 0, g: 0, b: 255 },
        hsv: { h: 240, s: 100, v: 100 },
        category: 'Blue',
        acquisition: 'Vendor',
      };

      // Dispatch selection-changed event with mock dye
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [mockDye] },
        bubbles: true,
      });
      secondaryContainer?.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('slot-changed', expect.objectContaining({
        slotId: 'head',
        secondary: mockDye,
      }));
    });

    it('should handle empty selection on secondary container', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const emitSpy = vi.spyOn(component, 'emit');

      const secondaryContainer = container.querySelector('#dye-selector-head-secondary');

      // Dispatch selection-changed event with empty selection
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [] },
        bubbles: true,
      });
      secondaryContainer?.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('slot-changed', expect.objectContaining({
        slotId: 'head',
        secondary: null,
      }));
    });
  });

  // ==========================================================================
  // Color Getters with Selected Dyes
  // ==========================================================================

  describe('getPrimaryColors with selected dyes', () => {
    it('should return primary colors when dyes are selected', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const mockDye = {
        id: 1,
        itemID: 30001,
        name: 'Red Dye',
        hex: '#FF0000',
        rgb: { r: 255, g: 0, b: 0 },
        hsv: { h: 0, s: 100, v: 100 },
        category: 'Red',
        acquisition: 'Vendor',
      };

      // Simulate dye selection via event
      const primaryContainer = container.querySelector('#dye-selector-head-primary');
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [mockDye] },
        bubbles: true,
      });
      primaryContainer?.dispatchEvent(event);

      const colors = component.getPrimaryColors();
      expect(colors.head).toBe('#FF0000');
    });
  });

  describe('getSecondaryColors with selected dyes', () => {
    it('should return secondary colors when dyes are selected', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      const mockDye = {
        id: 2,
        itemID: 30002,
        name: 'Blue Dye',
        hex: '#0000FF',
        rgb: { r: 0, g: 0, b: 255 },
        hsv: { h: 240, s: 100, v: 100 },
        category: 'Blue',
        acquisition: 'Vendor',
      };

      // Simulate dye selection via event
      const secondaryContainer = container.querySelector('#dye-selector-head-secondary');
      const event = new CustomEvent('selection-changed', {
        detail: { selectedDyes: [mockDye] },
        bubbles: true,
      });
      secondaryContainer?.dispatchEvent(event);

      const colors = component.getSecondaryColors();
      expect(colors.head).toBe('#0000FF');
    });
  });

  // ==========================================================================
  // Slot Card Display with Selected Dyes
  // ==========================================================================

  describe('slot card display with selected dyes', () => {
    type ComponentWithSlots = OutfitSlotSelector & {
      slots: Array<{
        id: string;
        name: string;
        icon: string;
        primary: { id: number; name: string; hex: string } | null;
        secondary: { id: number; name: string; hex: string } | null;
      }>;
    };

    it('should render primary dye display when primary is set', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      // Access private slots and set a primary dye
      const comp = component as unknown as ComponentWithSlots;
      comp.slots[0].primary = { id: 1, name: 'Red Dye', hex: '#FF0000' } as unknown as { id: number; name: string; hex: string };

      // Re-render
      component.update();

      // Check if the dye display is rendered
      const text = container.textContent || '';
      expect(text).toContain('Red Dye');
    });

    it('should render secondary dye display when secondary is set and dual dyes enabled', () => {
      component = new OutfitSlotSelector(container, true);
      component.init();

      // Access private slots and set a secondary dye
      const comp = component as unknown as ComponentWithSlots;
      comp.slots[0].secondary = { id: 2, name: 'Blue Dye', hex: '#0000FF' } as unknown as { id: number; name: string; hex: string };

      // Re-render
      component.update();

      // Check if the dye display is rendered
      const text = container.textContent || '';
      expect(text).toContain('Blue Dye');
    });

    it('should render color swatch with correct background color', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      // Access private slots and set a primary dye
      const comp = component as unknown as ComponentWithSlots;
      comp.slots[0].primary = { id: 1, name: 'Red Dye', hex: '#FF0000' } as unknown as { id: number; name: string; hex: string };

      // Re-render
      component.update();

      // Check for element with the background color style
      const swatches = container.querySelectorAll('[style*="background-color"]');
      const swatchStyles = Array.from(swatches).map(s => s.getAttribute('style'));
      const hasRedSwatch = swatchStyles.some(s => s?.includes('#FF0000'));
      expect(hasRedSwatch).toBe(true);
    });
  });

  // ==========================================================================
  // getSelectedSlots with selected dyes
  // ==========================================================================

  describe('getSelectedSlots with selected dyes', () => {
    type ComponentWithSlots = OutfitSlotSelector & {
      slots: Array<{
        id: string;
        name: string;
        icon: string;
        primary: { id: number; itemID: number; name: string; hex: string } | null;
        secondary: { id: number; itemID: number; name: string; hex: string } | null;
      }>;
    };

    it('should return copies of dye objects', () => {
      component = new OutfitSlotSelector(container);
      component.init();

      const mockDye = {
        id: 1,
        itemID: 30001,
        name: 'Test Dye',
        hex: '#FF0000',
      };

      // Set primary dye directly
      const comp = component as unknown as ComponentWithSlots;
      comp.slots[0].primary = mockDye as unknown as { id: number; itemID: number; name: string; hex: string };

      const slots = component.getSelectedSlots();
      const headSlot = slots.find(s => s.id === 'head');

      // Should be a copy, not the same object reference
      expect(headSlot?.primary).not.toBe(mockDye);
      expect(headSlot?.primary?.name).toBe('Test Dye');
    });
  });
});
