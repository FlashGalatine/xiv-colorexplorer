import { ModalContainer } from '../modal-container';
import { ModalService, Modal } from '@services/modal-service';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  cleanupComponent,
  expectElement,
} from './test-utils';

// Mock ModalService
vi.mock('@services/modal-service', () => {
  let subscribers: ((modals: Modal[]) => void)[] = [];
  let currentModals: Modal[] = [];

  return {
    ModalService: {
      subscribe: vi.fn((callback) => {
        subscribers.push(callback);
        return () => {
          subscribers = subscribers.filter((s) => s !== callback);
        };
      }),
      getTopModal: vi.fn(() => currentModals[currentModals.length - 1]),
      dismiss: vi.fn((id) => {
        currentModals = currentModals.filter((m) => m.id !== id);
        subscribers.forEach((cb) => cb(currentModals));
      }),
      prefersReducedMotion: vi.fn(() => false),
      // Helper to trigger updates manually in tests
      _updateModals: (modals: Modal[]) => {
        currentModals = modals;
        subscribers.forEach((cb) => cb(currentModals));
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

describe('ModalContainer', () => {
  let container: HTMLElement;
  let component: ModalContainer;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    document.body.style.overflow = ''; // Reset body style
  });

  describe('Initialization', () => {
    it('should subscribe to ModalService on init', () => {
      [component, container] = renderComponent(ModalContainer);
      expect(ModalService.subscribe).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render nothing when no modals', () => {
      [component, container] = renderComponent(ModalContainer);
      // @ts-ignore
      ModalService._updateModals([]);

      expect(container.innerHTML).toBe('');
    });

    it('should render a modal when added', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test Modal',
        content: 'Modal Content',
        closable: true,
        type: 'default',
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      const dialog = container.querySelector('.modal-dialog');
      expect(dialog).not.toBeNull();
      expect(dialog?.textContent).toContain('Test Modal');
      expect(dialog?.textContent).toContain('Modal Content');
    });

    it('should lock body scroll when modal is open', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test',
        content: 'Content',
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test',
        content: 'Content',
      };

      // @ts-ignore
      ModalService._updateModals([modal]);
      expect(document.body.style.overflow).toBe('hidden');

      // @ts-ignore
      ModalService._updateModals([]);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Interactions', () => {
    it('should dismiss modal on close button click', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test',
        content: 'Content',
        closable: true,
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      const closeBtn = container.querySelector('button[aria-label="Close modal"]') as HTMLElement;
      closeBtn.click();

      expect(ModalService.dismiss).toHaveBeenCalledWith('test-modal');
    });

    it('should dismiss modal on backdrop click if allowed', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test',
        content: 'Content',
        closable: true,
        closeOnBackdrop: true,
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      const backdrop = container.querySelector('.modal-backdrop') as HTMLElement;
      backdrop.click();

      expect(ModalService.dismiss).toHaveBeenCalledWith('test-modal');
    });

    it('should NOT dismiss modal on backdrop click if NOT allowed', () => {
      [component, container] = renderComponent(ModalContainer);

      const modal: Modal = {
        id: 'test-modal',
        title: 'Test',
        content: 'Content',
        closable: true,
        closeOnBackdrop: false,
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      const backdrop = container.querySelector('.modal-backdrop') as HTMLElement;
      backdrop.click();

      // Should not have been called again (it might have been called in previous tests, so check count or reset mocks)
      vi.clearAllMocks();
      backdrop.click();
      expect(ModalService.dismiss).not.toHaveBeenCalled();
    });

    it('should handle confirm button click', () => {
      [component, container] = renderComponent(ModalContainer);
      const onConfirm = vi.fn();

      const modal: Modal = {
        id: 'confirm-modal',
        title: 'Confirm',
        content: 'Are you sure?',
        type: 'confirm',
        onConfirm,
      };

      // @ts-ignore
      ModalService._updateModals([modal]);

      const confirmBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Confirm'
      ) as HTMLElement;
      confirmBtn.click();

      expect(onConfirm).toHaveBeenCalled();
      expect(ModalService.dismiss).toHaveBeenCalledWith('confirm-modal');
    });
  });
});
