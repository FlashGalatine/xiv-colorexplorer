import {
  LoadingSpinner,
  createInlineSpinner,
  createBlockSpinner,
  getSpinnerHTML,
} from '../loading-spinner';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  cleanupComponent,
  expectElement,
} from './test-utils';

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

// Mock logger
vi.mock('@shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ErrorHandler
vi.mock('@shared/error-handler', () => ({
  ErrorHandler: {
    log: vi.fn(),
  },
}));

describe('LoadingSpinner', () => {
  let container: HTMLElement;
  let component: LoadingSpinner;

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

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      [component, container] = renderComponent(LoadingSpinner);

      const options = component['options'];
      expect(options.size).toBe('md');
      expect(options.message).toBe('');
      expect(options.inline).toBe(false);
    });

    it('should accept custom options', () => {
      [component, container] = renderComponent(LoadingSpinner);
      component = new LoadingSpinner(container, {
        size: 'lg',
        message: 'Loading...',
        inline: true,
      });
      component.init();

      const options = component['options'];
      expect(options.size).toBe('lg');
      expect(options.message).toBe('Loading...');
      expect(options.inline).toBe(true);
    });
  });

  describe('Rendering', () => {
    it('should render spinner svg', () => {
      [component, container] = renderComponent(LoadingSpinner);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.classList.contains('loading-spinner')).toBe(true);
    });

    it('should render message when provided', () => {
      component = new LoadingSpinner(container, { message: 'Please wait' });
      component.init();

      const message = container.querySelector('span:not(.sr-only)');
      expect(message).not.toBeNull();
      expect(message?.textContent).toBe('Please wait');
    });

    it('should render sr-only text when no message provided', () => {
      [component, container] = renderComponent(LoadingSpinner);

      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).not.toBeNull();
      expect(srOnly?.textContent).toBe('Loading...');
    });

    it('should apply size classes', () => {
      component = new LoadingSpinner(container, { size: 'sm' });
      component.init();
      expect(container.querySelector('.spinner-sm')).not.toBeNull();

      component.setSize('lg');
      expect(container.querySelector('.spinner-lg')).not.toBeNull();
    });
  });

  describe('Updates', () => {
    it('should update message', () => {
      [component, container] = renderComponent(LoadingSpinner);
      component.setMessage('New message');

      const message = container.querySelector('span:not(.sr-only)');
      expect(message?.textContent).toBe('New message');
    });

    it('should update size', () => {
      [component, container] = renderComponent(LoadingSpinner);
      component.setSize('sm');

      expect(container.querySelector('.spinner-sm')).not.toBeNull();
    });
  });

  describe('Factory Functions', () => {
    it('createInlineSpinner should create inline spinner', () => {
      const spinner = createInlineSpinner(container, 'Inline');
      const options = spinner['options'];
      expect(options.inline).toBe(true);
      expect(options.size).toBe('sm');
      expect(options.message).toBe('Inline');
    });

    it('createBlockSpinner should create block spinner', () => {
      const spinner = createBlockSpinner(container, 'Block');
      const options = spinner['options'];
      expect(options.inline).toBe(false);
      expect(options.size).toBe('md');
      expect(options.message).toBe('Block');
    });

    it('getSpinnerHTML should return HTML string', () => {
      const html = getSpinnerHTML('lg', 'HTML');
      expect(html).toContain('spinner-lg');
      expect(html).toContain('HTML');
    });
  });
});
