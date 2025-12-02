import { ChangelogModal, showChangelogIfUpdated } from '../changelog-modal';
import { ModalService } from '@services/modal-service';
import { StorageService } from '@services/storage-service';
import { LanguageService } from '@services/language-service';
import { APP_VERSION, STORAGE_KEYS } from '@shared/constants';

// Mock Constants
vi.mock('@shared/constants', () => ({
  APP_VERSION: '2.3.0',
  STORAGE_KEYS: {
    LAST_VERSION_VIEWED: 'last_version_viewed',
  },
}));

// Mock Virtual Changelog
vi.mock('virtual:changelog', () => ({
  changelogEntries: [
    {
      version: '2.3.0',
      date: '2023-10-27',
      highlights: ['New Feature A', 'Bug Fix B'],
    },
    {
      version: '2.2.0',
      date: '2023-10-20',
      highlights: ['Old Feature C'],
    },
  ],
}));

// Mock Services
vi.mock('@services/modal-service', () => ({
  ModalService: {
    showChangelog: vi.fn(() => 'modal-id'),
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
    t: vi.fn((key) => key),
  },
}));

describe('ChangelogModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('shouldShow', () => {
    it('should return false if no last version (first visit)', () => {
      vi.mocked(StorageService.getItem).mockReturnValue(null);
      expect(ChangelogModal.shouldShow()).toBe(false);
    });

    it('should return false if version matches', () => {
      vi.mocked(StorageService.getItem).mockReturnValue('2.3.0');
      expect(ChangelogModal.shouldShow()).toBe(false);
    });

    it('should return true if version differs', () => {
      vi.mocked(StorageService.getItem).mockReturnValue('2.2.0');
      expect(ChangelogModal.shouldShow()).toBe(true);
    });
  });

  describe('markAsViewed', () => {
    it('should save current version to storage', () => {
      ChangelogModal.markAsViewed();
      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_VERSION_VIEWED,
        '2.3.0'
      );
    });
  });

  describe('reset', () => {
    it('should remove version from storage', () => {
      ChangelogModal.reset();
      expect(StorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.LAST_VERSION_VIEWED);
    });
  });

  describe('show', () => {
    it('should call ModalService.showChangelog', () => {
      const modal = new ChangelogModal();
      modal.show();

      expect(ModalService.showChangelog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('changelog.title'),
          closable: true,
        })
      );
    });

    it('should not show if already showing', () => {
      const modal = new ChangelogModal();
      modal.show();
      modal.show();
      expect(ModalService.showChangelog).toHaveBeenCalledTimes(1);
    });

    it('should mark as viewed on close', () => {
      const modal = new ChangelogModal();
      modal.show();

      const options = vi.mocked(ModalService.showChangelog).mock.calls[0][0];
      // @ts-ignore
      options.onClose();

      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_VERSION_VIEWED,
        '2.3.0'
      );
    });
  });

  describe('Content Generation', () => {
    it('should generate content with highlights', () => {
      const modal = new ChangelogModal();
      // Access private method via casting or just check show arguments
      modal.show();
      const options = vi.mocked(ModalService.showChangelog).mock.calls[0][0];
      const content = options.content as HTMLElement;

      expect(content.textContent).toContain('New Feature A');
      expect(content.textContent).toContain('Bug Fix B');
    });

    it('should include previous updates summary', () => {
      const modal = new ChangelogModal();
      modal.show();
      const options = vi.mocked(ModalService.showChangelog).mock.calls[0][0];
      const content = options.content as HTMLElement;

      expect(content.textContent).toContain('changelog.previousUpdates');
      expect(content.innerHTML).toContain('v2.2.0');
      expect(content.textContent).toContain('Old Feature C');
    });
  });

  describe('showChangelogIfUpdated', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show modal if update detected', () => {
      vi.mocked(StorageService.getItem).mockReturnValue('2.2.0'); // Update needed

      showChangelogIfUpdated();

      vi.runAllTimers();

      expect(ModalService.showChangelog).toHaveBeenCalled();
    });

    it('should NOT show modal if no update', () => {
      vi.mocked(StorageService.getItem).mockReturnValue('2.3.0'); // No update

      showChangelogIfUpdated();

      vi.runAllTimers();

      expect(ModalService.showChangelog).not.toHaveBeenCalled();
    });
  });
});
