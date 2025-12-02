import { ToastContainer } from '../toast-container';
import { ToastService, Toast, ToastType } from '@services/toast-service';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  cleanupComponent,
  expectElement,
} from './test-utils';

// Mock ToastService
vi.mock('@services/toast-service', () => {
  let subscribers: ((toasts: Toast[]) => void)[] = [];
  let currentToasts: Toast[] = [];

  return {
    ToastService: {
      subscribe: vi.fn((callback) => {
        subscribers.push(callback);
        return () => {
          subscribers = subscribers.filter((s) => s !== callback);
        };
      }),
      dismiss: vi.fn((id) => {
        currentToasts = currentToasts.filter((t) => t.id !== id);
        subscribers.forEach((cb) => cb(currentToasts));
      }),
      prefersReducedMotion: vi.fn(() => false),
      // Helper to trigger updates manually in tests
      _updateToasts: (toasts: Toast[]) => {
        currentToasts = toasts;
        subscribers.forEach((cb) => cb(currentToasts));
      },
    },
  };
});

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

describe('ToastContainer', () => {
  let container: HTMLElement;
  let component: ToastContainer;

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
    it('should subscribe to ToastService on init', () => {
      [component, container] = renderComponent(ToastContainer);
      expect(ToastService.subscribe).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test Message',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      ToastService._updateToasts([toast]);

      const toastEl = container.querySelector('.toast');
      expect(toastEl).not.toBeNull();
      expect(toastEl?.textContent).toContain('Test Message');
    });

    it('should render details if provided', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Message',
        details: 'Details',
        type: 'info',
        duration: 3000,
      };

      // @ts-ignore
      ToastService._updateToasts([toast]);

      expect(container.textContent).toContain('Details');
    });

    it('should apply correct classes for types', () => {
      [component, container] = renderComponent(ToastContainer);

      const types: ToastType[] = ['success', 'error', 'warning', 'info'];

      types.forEach((type) => {
        const toast: Toast = {
          id: `toast-${type}`,
          message: type,
          type: type,
          duration: 3000,
        };

        // @ts-ignore
        ToastService._updateToasts([toast]);

        const toastEl = container.querySelector(`[data-toast-id="toast-${type}"]`);
        expect(toastEl?.classList.contains(`toast-${type}`)).toBe(true);
      });
    });

    it('should set correct ARIA roles', () => {
      [component, container] = renderComponent(ToastContainer);

      const errorToast: Toast = { id: 'error', message: 'Error', type: 'error', duration: 3000 };
      // @ts-ignore
      ToastService._updateToasts([errorToast]);

      let toastEl = container.querySelector('[data-toast-id="error"]');
      expect(toastEl?.getAttribute('role')).toBe('alert');
      expect(toastEl?.getAttribute('aria-live')).toBe('assertive');

      const successToast: Toast = {
        id: 'success',
        message: 'Success',
        type: 'success',
        duration: 3000,
      };
      // @ts-ignore
      ToastService._updateToasts([successToast]);

      toastEl = container.querySelector('[data-toast-id="success"]');
      expect(toastEl?.getAttribute('role')).toBe('status');
      expect(toastEl?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Interactions', () => {
    it('should dismiss toast on button click', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      ToastService._updateToasts([toast]);

      const dismissBtn = container.querySelector(
        'button[aria-label="Dismiss notification"]'
      ) as HTMLElement;
      dismissBtn.click();

      expect(ToastService.dismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should dismiss toast on Escape key', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      ToastService._updateToasts([toast]);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(ToastService.dismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should NOT dismiss non-dismissible toast on Escape key', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: false,
      };

      // @ts-ignore
      ToastService._updateToasts([toast]);

      vi.clearAllMocks();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(ToastService.dismiss).not.toHaveBeenCalled();
    });
  });
});
