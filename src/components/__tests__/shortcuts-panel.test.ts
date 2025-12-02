/**
 * XIV Dye Tools - Shortcuts Panel Component Tests
 *
 * @module components/__tests__/shortcuts-panel.test
 */

import { showShortcutsPanel } from '../shortcuts-panel';

// Mock ModalService - define mock inside factory to avoid hoisting issues
vi.mock('@services/index', () => ({
  ModalService: {
    show: vi.fn().mockReturnValue('modal-id-123'),
  },
  LanguageService: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'shortcuts.title': 'Keyboard Shortcuts',
        'shortcuts.navigation': 'Navigation',
        'shortcuts.switchTool': 'Switch between tools',
        'shortcuts.closeModal': 'Close modal or dropdown',
        'shortcuts.quickActions': 'Quick Actions',
        'shortcuts.toggleTheme': 'Toggle theme',
        'shortcuts.cycleLanguage': 'Cycle language',
        'shortcuts.showHelp': 'Show this panel',
        'shortcuts.dyeSelection': 'Dye Selection',
        'shortcuts.focusSelector': 'Focus dye selector',
        'shortcuts.navigateDyes': 'Navigate between dyes',
        'shortcuts.selectDye': 'Select focused dye',
        'shortcuts.platformHint': 'Tip',
        'shortcuts.useModifier': 'Use Ctrl for system shortcuts',
      };
      return translations[key] || key;
    }),
  },
}));

// Import the mocked service to get reference to the mock function
import { ModalService } from '@services/index';

describe('showShortcutsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Configuration', () => {
    it('should call ModalService.show with correct type', () => {
      showShortcutsPanel();

      expect(ModalService.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom',
        })
      );
    });

    it('should set correct title', () => {
      showShortcutsPanel();

      expect(ModalService.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Keyboard Shortcuts',
        })
      );
    });

    it('should set size to sm', () => {
      showShortcutsPanel();

      expect(ModalService.show).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 'sm',
        })
      );
    });

    it('should be closable', () => {
      showShortcutsPanel();

      expect(ModalService.show).toHaveBeenCalledWith(
        expect.objectContaining({
          closable: true,
          closeOnBackdrop: true,
          closeOnEscape: true,
        })
      );
    });

    it('should return modal ID', () => {
      const modalId = showShortcutsPanel();

      expect(modalId).toBe('modal-id-123');
    });
  });

  describe('Panel Content', () => {
    it('should include content element', () => {
      showShortcutsPanel();

      expect(ModalService.show).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.any(HTMLElement),
        })
      );
    });

    it('should have shortcuts-panel class', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      expect(call.content.className).toContain('shortcuts-panel');
    });

    it('should contain three shortcut groups', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;
      const groups = content.querySelectorAll('.shortcut-group');

      expect(groups.length).toBe(3);
    });

    it('should have Navigation group with shortcuts', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Navigation');
      expect(content.textContent).toContain('1-5');
      expect(content.textContent).toContain('Esc');
    });

    it('should have Quick Actions group with shortcuts', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Quick Actions');
      expect(content.textContent).toContain('Shift + T');
      expect(content.textContent).toContain('Shift + L');
      expect(content.textContent).toContain('?');
    });

    it('should have Dye Selection group with shortcuts', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Dye Selection');
      expect(content.textContent).toContain('Tab');
      expect(content.textContent).toContain('↑↓←→');
      expect(content.textContent).toContain('Enter');
    });

    it('should have keyboard badges with kbd element', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;
      const kbdElements = content.querySelectorAll('kbd');

      expect(kbdElements.length).toBeGreaterThan(0);
    });

    it('should include platform hint', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;

      expect(content.textContent).toContain('Tip');
    });
  });

  describe('Platform Detection', () => {
    it('should show appropriate modifier key hint', () => {
      showShortcutsPanel();

      const call = ModalService.show.mock.calls[0][0];
      const content = call.content as HTMLElement;

      // On non-Mac platforms, should show Ctrl
      expect(content.textContent).toContain('Ctrl');
    });
  });
});
