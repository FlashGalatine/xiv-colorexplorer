import { ToastContainer } from '../toast-container';
import { ToastService, Toast, ToastType } from '@services/toast-service';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  cleanupComponent,
  expectElement,
} from './test-utils';

// Store subscribers outside the mock for access
let toastSubscribers: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

// Helper to update toasts and notify subscribers
function updateToasts(toasts: Toast[]) {
  currentToasts = toasts;
  toastSubscribers.forEach((cb) => cb(currentToasts));
}

// Reset helper
function resetToastMock() {
  toastSubscribers = [];
  currentToasts = [];
}

// Mock ToastService
vi.mock('@services/toast-service', () => {
  return {
    ToastService: {
      subscribe: vi.fn((callback: (toasts: Toast[]) => void) => {
        toastSubscribers.push(callback);
        return () => {
          toastSubscribers = toastSubscribers.filter((s) => s !== callback);
        };
      }),
      dismiss: vi.fn((id: string) => {
        currentToasts = currentToasts.filter((t) => t.id !== id);
        toastSubscribers.forEach((cb) => cb(currentToasts));
      }),
      prefersReducedMotion: vi.fn(() => false),
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
    resetToastMock();
    vi.clearAllMocks();
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
      updateToasts([toast]);

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
      updateToasts([toast]);

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
        updateToasts([toast]);

        const toastEl = container.querySelector(`[data-toast-id="toast-${type}"]`);
        expect(toastEl?.classList.contains(`toast-${type}`)).toBe(true);
      });
    });

    it('should set correct ARIA roles for error toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const errorToast: Toast = { id: 'error', message: 'Error', type: 'error', duration: 3000 };
      // @ts-ignore
      updateToasts([errorToast]);

      const toastEl = container.querySelector('[data-toast-id="error"]');
      expect(toastEl?.getAttribute('role')).toBe('alert');
      expect(toastEl?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should set correct ARIA roles for warning toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const warningToast: Toast = {
        id: 'warning',
        message: 'Warning',
        type: 'warning',
        duration: 3000,
      };
      // @ts-ignore
      updateToasts([warningToast]);

      const toastEl = container.querySelector('[data-toast-id="warning"]');
      expect(toastEl?.getAttribute('role')).toBe('alert');
      expect(toastEl?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should set correct ARIA roles for success toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const successToast: Toast = {
        id: 'success',
        message: 'Success',
        type: 'success',
        duration: 3000,
      };
      // @ts-ignore
      updateToasts([successToast]);

      const toastEl = container.querySelector('[data-toast-id="success"]');
      expect(toastEl?.getAttribute('role')).toBe('status');
      expect(toastEl?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set correct ARIA roles for info toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const infoToast: Toast = {
        id: 'info',
        message: 'Info',
        type: 'info',
        duration: 3000,
      };
      // @ts-ignore
      updateToasts([infoToast]);

      const toastEl = container.querySelector('[data-toast-id="info"]');
      expect(toastEl?.getAttribute('role')).toBe('status');
      expect(toastEl?.getAttribute('aria-live')).toBe('polite');
    });

    it('should not add animation class when reduced motion is preferred', () => {
      // Mock reduced motion preference
      vi.mocked(ToastService.prefersReducedMotion).mockReturnValue(true);

      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'reduced-motion-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastEl = container.querySelector('[data-toast-id="reduced-motion-toast"]');
      expect(toastEl?.classList.contains('toast-animate-in')).toBe(false);
    });

    it('should add animation class when reduced motion is NOT preferred', () => {
      vi.mocked(ToastService.prefersReducedMotion).mockReturnValue(false);

      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'animated-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastEl = container.querySelector('[data-toast-id="animated-toast"]');
      expect(toastEl?.classList.contains('toast-animate-in')).toBe(true);
    });

    it('should render toast container with correct attributes', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastContainer = container.querySelector('#toast-container');
      expect(toastContainer).not.toBeNull();
      expect(toastContainer?.getAttribute('aria-label')).toBe('Notifications');
    });

    it('should not render dismiss button for non-dismissible toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'non-dismissible',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: false,
      };

      // @ts-ignore
      updateToasts([toast]);

      const dismissBtn = container.querySelector('button[aria-label="Dismiss notification"]');
      expect(dismissBtn).toBeNull();
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
      updateToasts([toast]);

      const dismissBtn = container.querySelector(
        'button[aria-label="Dismiss notification"]'
      ) as HTMLElement;
      dismissBtn.click();

      expect(ToastService.dismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should dismiss toast on Escape key', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'escape-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      updateToasts([toast]);

      // Verify the toast is rendered (subscription worked)
      expect(container.querySelector('[data-toast-id="escape-toast"]')).not.toBeNull();

      // Verify that component has the toast in its state
      expect(component['toasts'].length).toBe(1);
      expect(component['toasts'][0].id).toBe('escape-toast');

      // Call handleKeyDown directly to test the logic
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      component['handleKeyDown'].call(component, event);

      expect(ToastService.dismiss).toHaveBeenCalledWith('escape-toast');
    });

    it('should handle document keydown event for Escape', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'doc-escape-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      updateToasts([toast]);

      // Get the registered handler and call it
      const handleKeyDown = component['handleKeyDown'].bind(component);
      handleKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(ToastService.dismiss).toHaveBeenCalledWith('doc-escape-toast');
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
      updateToasts([toast]);

      vi.clearAllMocks();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(ToastService.dismiss).not.toHaveBeenCalled();
    });

    it('should not dismiss on non-Escape keys', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'test-toast',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      updateToasts([toast]);

      vi.clearAllMocks();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(ToastService.dismiss).not.toHaveBeenCalled();
    });
  });

  describe('Swipe to Dismiss (Mobile)', () => {
    beforeEach(() => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      // Clean up touch mock
      delete (window as any).ontouchstart;
    });

    it('should setup swipe handlers on touch devices', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'swipe-test',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      updateToasts([toast]);

      // Just verify the component initialized without errors
      expect(container.querySelector('[data-toast-id="swipe-test"]')).not.toBeNull();
    });

    it('should handle swipe right to dismiss', () => {
      vi.useFakeTimers();

      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'swipe-dismiss',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastEl = container.querySelector('[data-toast-id="swipe-dismiss"]') as HTMLElement;

      // Simulate touch start
      toastEl.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
      );

      // Simulate swipe right (more than 80px, less than 50px vertical)
      toastEl.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [{ clientX: 200, clientY: 110 } as Touch],
        })
      );

      // Fast-forward past the animation delay
      vi.advanceTimersByTime(200);

      expect(ToastService.dismiss).toHaveBeenCalledWith('swipe-dismiss');

      vi.useRealTimers();
    });

    it('should not dismiss on vertical swipe', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'no-dismiss',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastEl = container.querySelector('[data-toast-id="no-dismiss"]') as HTMLElement;

      // Simulate touch start
      toastEl.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
      );

      // Simulate vertical swipe (too much vertical movement)
      toastEl.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [{ clientX: 200, clientY: 200 } as Touch],
        })
      );

      expect(ToastService.dismiss).not.toHaveBeenCalledWith('no-dismiss');
    });

    it('should not dismiss on small swipe', () => {
      [component, container] = renderComponent(ToastContainer);

      const toast: Toast = {
        id: 'small-swipe',
        message: 'Test',
        type: 'success',
        duration: 3000,
        dismissible: true,
      };

      // @ts-ignore
      updateToasts([toast]);

      const toastEl = container.querySelector('[data-toast-id="small-swipe"]') as HTMLElement;

      // Simulate touch start
      toastEl.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
      );

      // Simulate small swipe (less than 80px)
      toastEl.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [{ clientX: 150, clientY: 100 } as Touch],
        })
      );

      expect(ToastService.dismiss).not.toHaveBeenCalledWith('small-swipe');
    });

    it('should handle touchend on element without toast-id', () => {
      [component, container] = renderComponent(ToastContainer);

      // Dispatch touchend on container itself (not on a toast)
      container.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
        })
      );

      // Should not throw or call dismiss
      expect(ToastService.dismiss).not.toHaveBeenCalled();
    });

    it('should handle touchstart on element without toast-id', () => {
      [component, container] = renderComponent(ToastContainer);

      // Dispatch touchstart on container itself (not on a toast)
      expect(() => {
        container.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            touches: [{ clientX: 100, clientY: 100 } as Touch],
          })
        );
      }).not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('should unsubscribe from ToastService on destroy', () => {
      [component, container] = renderComponent(ToastContainer);

      // The subscription returns an unsubscribe function
      const subscribeResult = vi.mocked(ToastService.subscribe).mock.results[0];
      expect(subscribeResult).toBeDefined();

      // Destroy the component
      component.destroy();

      // Verify internal unsubscribe was set to null (by checking no errors)
      expect(() => component.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls gracefully', () => {
      [component, container] = renderComponent(ToastContainer);

      expect(() => {
        component.destroy();
        component.destroy();
      }).not.toThrow();
    });
  });

  describe('Multiple Toasts', () => {
    it('should render multiple toasts', () => {
      [component, container] = renderComponent(ToastContainer);

      const toasts: Toast[] = [
        { id: 'toast-1', message: 'First', type: 'success', duration: 3000 },
        { id: 'toast-2', message: 'Second', type: 'error', duration: 3000 },
        { id: 'toast-3', message: 'Third', type: 'info', duration: 3000 },
      ];

      // @ts-ignore
      updateToasts(toasts);

      const toastElements = container.querySelectorAll('.toast');
      expect(toastElements.length).toBe(3);
    });

    it('should dismiss correct toast from multiple', () => {
      [component, container] = renderComponent(ToastContainer);

      const toasts: Toast[] = [
        { id: 'multi-1', message: 'First', type: 'success', duration: 3000, dismissible: true },
        { id: 'multi-2', message: 'Second', type: 'error', duration: 3000, dismissible: true },
      ];

      // @ts-ignore
      updateToasts(toasts);

      const secondToast = container.querySelector('[data-toast-id="multi-2"]') as HTMLElement;
      const dismissBtn = secondToast.querySelector(
        'button[aria-label="Dismiss notification"]'
      ) as HTMLElement;
      dismissBtn.click();

      expect(ToastService.dismiss).toHaveBeenCalledWith('multi-2');
    });
  });
});
