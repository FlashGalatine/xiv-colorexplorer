/**
 * XIV Dye Tools - Tool Header Component Tests
 *
 * @module components/__tests__/tool-header.test
 */

import { ToolHeader, ToolHeaderOptions } from '../tool-header';
import { createTestContainer, cleanupTestContainer, cleanupComponent } from './test-utils';

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

describe('ToolHeader', () => {
  let container: HTMLElement;
  let component: ToolHeader;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  describe('Rendering', () => {
    it('should render title', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
      };
      component = new ToolHeader(container, options);
      component.init();

      const title = container.querySelector('h2');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('Test Tool');
    });

    it('should render title with icon', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
        icon: '🎨',
      };
      component = new ToolHeader(container, options);
      component.init();

      const title = container.querySelector('h2');
      expect(title?.textContent).toContain('🎨');
      expect(title?.textContent).toContain('Test Tool');
    });

    it('should render description when provided', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
        description: 'This is a test description',
      };
      component = new ToolHeader(container, options);
      component.init();

      const desc = container.querySelector('p');
      expect(desc).not.toBeNull();
      expect(desc?.textContent).toBe('This is a test description');
    });

    it('should not render description when not provided', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
      };
      component = new ToolHeader(container, options);
      component.init();

      const desc = container.querySelector('p');
      expect(desc).toBeNull();
    });

    it('should render action buttons when provided', () => {
      const button1 = document.createElement('button');
      button1.textContent = 'Action 1';
      const button2 = document.createElement('button');
      button2.textContent = 'Action 2';

      const options: ToolHeaderOptions = {
        title: 'Test Tool',
        actions: [button1, button2],
      };
      component = new ToolHeader(container, options);
      component.init();

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('Action 1');
      expect(buttons[1].textContent).toBe('Action 2');
    });

    it('should not render actions container when actions is empty array', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
        actions: [],
      };
      component = new ToolHeader(container, options);
      component.init();

      // Should only have the main header div, not actions container
      const header = container.firstElementChild;
      expect(header?.children.length).toBe(1); // Only title
    });
  });

  describe('Styling', () => {
    it('should have centered text alignment', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
      };
      component = new ToolHeader(container, options);
      component.init();

      const header = container.firstElementChild as HTMLElement;
      expect(header?.className).toContain('text-center');
    });

    it('should have proper spacing', () => {
      const options: ToolHeaderOptions = {
        title: 'Test Tool',
      };
      component = new ToolHeader(container, options);
      component.init();

      const header = container.firstElementChild as HTMLElement;
      expect(header?.className).toContain('mb-8');
      expect(header?.className).toContain('space-y-4');
    });
  });
});
