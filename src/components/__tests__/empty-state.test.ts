import {
  EmptyState,
  createEmptyState,
  getEmptyStateHTML,
  EMPTY_STATE_PRESETS,
} from '../empty-state';
import { createTestContainer, cleanupTestContainer, cleanupComponent } from './test-utils';

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

describe('EmptyState', () => {
  let container: HTMLElement;
  let component: EmptyState;

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
    it('should render basic empty state', () => {
      component = new EmptyState(container, {
        icon: '🔍',
        title: 'No results',
        description: 'Try again',
      });
      component.init();

      const title = container.querySelector('.empty-state-title');
      const desc = container.querySelector('.empty-state-description');
      const icon = container.querySelector('.empty-state-icon');

      expect(title?.textContent).toBe('No results');
      expect(desc?.textContent).toBe('Try again');
      expect(icon?.textContent).toBe('🔍');
    });

    it('should render SVG icon correctly', () => {
      component = new EmptyState(container, {
        icon: '<svg>test</svg>',
        title: 'SVG Icon',
      });
      component.init();

      const icon = container.querySelector('.empty-state-icon');
      expect(icon?.innerHTML).toContain('<svg>test</svg>');
    });

    it('should render action buttons', () => {
      const onAction = vi.fn();
      const onSecondary = vi.fn();

      component = new EmptyState(container, {
        icon: 'x',
        title: 'Actions',
        actionLabel: 'Primary',
        onAction,
        secondaryActionLabel: 'Secondary',
        onSecondaryAction: onSecondary,
      });
      component.init();

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('Primary');
      expect(buttons[1].textContent).toBe('Secondary');

      buttons[0].click();
      expect(onAction).toHaveBeenCalled();

      buttons[1].click();
      expect(onSecondary).toHaveBeenCalled();
    });
  });

  describe('Factory Functions', () => {
    it('createEmptyState should return initialized component', () => {
      const state = createEmptyState(container, {
        icon: 'T',
        title: 'Test',
      });

      expect(state).toBeInstanceOf(EmptyState);
      expect(container.querySelector('.empty-state')).not.toBeNull();
    });

    it('getEmptyStateHTML should return HTML string', () => {
      const html = getEmptyStateHTML({
        icon: 'H',
        title: 'HTML',
        description: 'Desc',
      });

      expect(html).toContain('empty-state');
      expect(html).toContain('HTML');
      expect(html).toContain('Desc');
    });

    it('getEmptyStateHTML should handle SVG icons', () => {
      const html = getEmptyStateHTML({
        icon: '<svg>icon</svg>',
        title: 'SVG',
      });

      expect(html).toContain('<svg>icon</svg>');
    });

    it('getEmptyStateHTML should escape non-SVG icons', () => {
      const html = getEmptyStateHTML({
        icon: '<script>',
        title: 'XSS',
      });

      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Presets', () => {
    it('should have presets defined', () => {
      expect(EMPTY_STATE_PRESETS.noSearchResults('query')).toBeDefined();
      expect(EMPTY_STATE_PRESETS.error('msg')).toBeDefined();
      expect(EMPTY_STATE_PRESETS.loading()).toBeDefined();
    });
  });
});
