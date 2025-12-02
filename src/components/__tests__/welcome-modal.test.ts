/**
 * XIV Dye Tools - Welcome Modal Component Tests
 *
 * @module components/__tests__/welcome-modal.test
 */

import { WelcomeModal, showWelcomeIfFirstVisit } from '../welcome-modal';

// Mock services
const mockShowWelcome = vi.fn().mockReturnValue('welcome-modal-id');
const mockDismiss = vi.fn();

vi.mock('@services/modal-service', () => ({
  ModalService: {
    showWelcome: vi.fn().mockReturnValue('welcome-modal-id'),
    dismiss: vi.fn(),
  },
}));

vi.mock('@services/storage-service', () => ({
  StorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('@services/language-service', () => ({
  LanguageService: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'welcome.title': 'Welcome to XIV Dye Tools',
        'welcome.intro': 'Find the perfect dyes for your FFXIV glamours!',
        'welcome.dontShowAgain': "Don't show this again",
        'welcome.getStarted': 'Get Started',
        'welcome.quickTips': 'Quick Tips',
        'welcome.tip1': 'Click tool names to switch',
        'welcome.tip2': 'Prices from Universalis',
        'welcome.tip3': 'Settings saved locally',
        'tools.harmony.shortName': 'Harmony',
        'tools.matcher.shortName': 'Matcher',
        'tools.comparison.shortName': 'Comparison',
        'tools.mixer.shortName': 'Mixer',
        'tools.accessibility.shortName': 'Accessibility',
        'welcome.tools.harmony': 'Find harmonious dye combinations',
        'welcome.tools.matcher': 'Match colors from images',
        'welcome.tools.comparison': 'Compare dyes side by side',
        'welcome.tools.mixer': 'Mix dye colors together',
        'welcome.tools.accessibility': 'Check color accessibility',
      };
      return translations[key] || key;
    }),
  },
}));

vi.mock('@shared/constants', () => ({
  STORAGE_KEYS: {
    WELCOME_SEEN: 'xivdye_welcome_seen',
    LAST_VERSION_VIEWED: 'xivdye_last_version',
  },
  APP_NAME: 'XIV Dye Tools',
  APP_VERSION: '2.0.0',
}));

vi.mock('@shared/tool-icons', () => ({
  ICON_TOOL_HARMONY: '<svg>harmony</svg>',
  ICON_TOOL_MATCHER: '<svg>matcher</svg>',
  ICON_TOOL_COMPARISON: '<svg>comparison</svg>',
  ICON_TOOL_MIXER: '<svg>mixer</svg>',
  ICON_TOOL_ACCESSIBILITY: '<svg>accessibility</svg>',
}));

// Get mocked services
import { ModalService } from '@services/modal-service';
import { StorageService } from '@services/storage-service';

describe('WelcomeModal', () => {
  let modal: WelcomeModal;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    modal = new WelcomeModal();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Static Methods', () => {
    describe('shouldShow', () => {
      it('should return true when welcome not seen', () => {
        vi.mocked(StorageService.getItem).mockReturnValue(false);

        expect(WelcomeModal.shouldShow()).toBe(true);
      });

      it('should return false when welcome already seen', () => {
        vi.mocked(StorageService.getItem).mockReturnValue(true);

        expect(WelcomeModal.shouldShow()).toBe(false);
      });
    });

    describe('markAsSeen', () => {
      it('should set welcome seen flag', () => {
        WelcomeModal.markAsSeen();

        expect(StorageService.setItem).toHaveBeenCalledWith('xivdye_welcome_seen', true);
      });

      it('should set version to prevent changelog', () => {
        WelcomeModal.markAsSeen();

        expect(StorageService.setItem).toHaveBeenCalledWith('xivdye_last_version', '2.0.0');
      });
    });

    describe('reset', () => {
      it('should remove welcome seen flag', () => {
        WelcomeModal.reset();

        expect(StorageService.removeItem).toHaveBeenCalledWith('xivdye_welcome_seen');
      });
    });
  });

  describe('show', () => {
    it('should call ModalService.showWelcome', () => {
      modal.show();

      expect(ModalService.showWelcome).toHaveBeenCalled();
    });

    it('should set correct title', () => {
      modal.show();

      expect(ModalService.showWelcome).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Welcome to XIV Dye Tools',
        })
      );
    });

    it('should set size to lg', () => {
      modal.show();

      expect(ModalService.showWelcome).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 'lg',
        })
      );
    });

    it('should be closable', () => {
      modal.show();

      expect(ModalService.showWelcome).toHaveBeenCalledWith(
        expect.objectContaining({
          closable: true,
          closeOnBackdrop: true,
          closeOnEscape: true,
        })
      );
    });

    it('should not show again if already showing', () => {
      modal.show();
      modal.show();

      expect(ModalService.showWelcome).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content', () => {
    it('should include introduction text', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Find the perfect dyes');
    });

    it('should render 5 tool cards', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;

      // Tool cards are in a grid
      const grid = content.querySelector('.grid');
      expect(grid?.children.length).toBe(5);
    });

    it('should display tool names', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Harmony');
      expect(content.textContent).toContain('Matcher');
      expect(content.textContent).toContain('Comparison');
      expect(content.textContent).toContain('Mixer');
      expect(content.textContent).toContain('Accessibility');
    });

    it('should include quick tips section', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Quick Tips');
      expect(content.textContent).toContain('Click tool names to switch');
      expect(content.textContent).toContain('Prices from Universalis');
      expect(content.textContent).toContain('Settings saved locally');
    });

    it('should have "dont show again" checkbox', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const checkbox = content.querySelector('#welcome-dont-show') as HTMLInputElement;

      expect(checkbox).not.toBeNull();
      expect(checkbox.type).toBe('checkbox');
    });

    it('should have "Get Started" button', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const button = Array.from(content.querySelectorAll('button')).find(
        (b) => b.textContent === 'Get Started'
      );

      expect(button).not.toBeUndefined();
    });
  });

  describe('close', () => {
    it('should dismiss modal', () => {
      modal.show();
      modal.close();

      expect(ModalService.dismiss).toHaveBeenCalledWith('welcome-modal-id');
    });

    it('should do nothing if not showing', () => {
      modal.close();

      expect(ModalService.dismiss).not.toHaveBeenCalled();
    });
  });

  describe('Get Started Button', () => {
    it('should close modal and mark as seen on click', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const button = Array.from(content.querySelectorAll('button')).find(
        (b) => b.textContent === 'Get Started'
      ) as HTMLButtonElement;

      button.click();

      expect(ModalService.dismiss).toHaveBeenCalledWith('welcome-modal-id');
      expect(StorageService.setItem).toHaveBeenCalledWith('xivdye_welcome_seen', true);
    });
  });

  describe('Dont Show Again Checkbox', () => {
    it('should mark as seen on close if checkbox is checked', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const checkbox = content.querySelector('#welcome-dont-show') as HTMLInputElement;

      // Check the checkbox
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));

      // Trigger onClose callback
      call.onClose?.();

      expect(StorageService.setItem).toHaveBeenCalledWith('xivdye_welcome_seen', true);
    });

    it('should not mark as seen on close if checkbox is not checked', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];

      // Trigger onClose without checking checkbox
      call.onClose?.();

      // Should not be called (only version update might be called)
      expect(StorageService.setItem).not.toHaveBeenCalledWith('xivdye_welcome_seen', true);
    });
  });

  describe('Tool Card Interactions', () => {
    it('should have hover effects on tool cards', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const grid = content.querySelector('.grid');
      const toolCard = grid?.firstElementChild as HTMLElement;

      expect(toolCard.className).toContain('cursor-pointer');
      expect(toolCard.className).toContain('transition-colors');
    });

    it('should have tool descriptions as tooltips', () => {
      modal.show();

      const call = vi.mocked(ModalService.showWelcome).mock.calls[0][0];
      const content = call.content as HTMLElement;
      const grid = content.querySelector('.grid');
      const toolCard = grid?.firstElementChild as HTMLElement;

      expect(toolCard.title).toBe('Find harmonious dye combinations');
    });
  });
});

describe('showWelcomeIfFirstVisit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show modal if first visit', () => {
    vi.mocked(StorageService.getItem).mockReturnValue(false);

    showWelcomeIfFirstVisit();

    // Advance timer past the delay
    vi.advanceTimersByTime(600);

    expect(ModalService.showWelcome).toHaveBeenCalled();
  });

  it('should not show modal if already seen', () => {
    vi.mocked(StorageService.getItem).mockReturnValue(true);

    showWelcomeIfFirstVisit();

    vi.advanceTimersByTime(600);

    expect(ModalService.showWelcome).not.toHaveBeenCalled();
  });

  it('should delay showing modal', () => {
    vi.mocked(StorageService.getItem).mockReturnValue(false);

    showWelcomeIfFirstVisit();

    // Before delay
    expect(ModalService.showWelcome).not.toHaveBeenCalled();

    // After delay
    vi.advanceTimersByTime(600);
    expect(ModalService.showWelcome).toHaveBeenCalled();
  });
});
