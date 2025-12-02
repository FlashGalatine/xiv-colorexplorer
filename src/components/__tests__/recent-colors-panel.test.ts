import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RecentColorsPanel } from '../recent-colors-panel';
import { StorageService } from '@services/storage-service';
import { AnnouncerService } from '@services/announcer-service';

// Mock services
vi.mock('@services/storage-service', () => ({
    StorageService: {
        getItem: vi.fn(),
        setItem: vi.fn(),
    },
}));

vi.mock('@services/announcer-service', () => ({
    AnnouncerService: {
        announce: vi.fn(),
    },
}));

describe('RecentColorsPanel', () => {
    let container: HTMLElement;
    let panel: RecentColorsPanel;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        // Reset mocks
        vi.clearAllMocks();
        vi.mocked(StorageService.getItem).mockReturnValue([]);

        panel = new RecentColorsPanel(container);
        panel.init();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render hidden initially if no recent colors', () => {
        expect(container.style.display).toBe('none');
    });

    it('should load recent colors from storage on init', () => {
        const mockColors = [{ hex: '#FF0000', timestamp: 123 }];
        vi.mocked(StorageService.getItem).mockReturnValue(mockColors);

        panel = new RecentColorsPanel(container);
        panel.init();

        expect(StorageService.getItem).toHaveBeenCalled();
        expect(container.style.display).toBe('block');
        expect(container.querySelectorAll('button[data-recent-index]').length).toBe(1);
    });

    it('should add recent color and save to storage', () => {
        panel.addRecentColor('#00FF00');

        expect(container.style.display).toBe('block');
        expect(container.querySelectorAll('button[data-recent-index]').length).toBe(1);
        expect(StorageService.setItem).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([expect.objectContaining({ hex: '#00FF00' })])
        );
    });

    it('should limit recent colors to max', () => {
        // Add 15 colors
        for (let i = 0; i < 15; i++) {
            panel.addRecentColor(`#${i.toString(16).padStart(6, '0')}`);
        }

        const buttons = container.querySelectorAll('button[data-recent-index]');
        expect(buttons.length).toBe(10); // Default max is 10
    });

    it('should emit callback when color clicked', () => {
        const onColorSelected = vi.fn();
        panel = new RecentColorsPanel(container, { onColorSelected });
        panel.init();

        panel.addRecentColor('#0000FF');

        const button = container.querySelector('button[data-recent-index="0"]') as HTMLButtonElement;
        button.click();

        expect(onColorSelected).toHaveBeenCalledWith('#0000FF');
        expect(AnnouncerService.announce).toHaveBeenCalled();
    });

    it('should clear history', () => {
        panel.addRecentColor('#FF00FF');
        expect(container.querySelectorAll('button[data-recent-index]').length).toBe(1);

        const clearBtn = container.querySelector('button[title="Clear recent colors history"]') as HTMLButtonElement;
        clearBtn.click();

        expect(container.style.display).toBe('none');
        expect(StorageService.setItem).toHaveBeenCalledWith(expect.any(String), []);
        expect(AnnouncerService.announce).toHaveBeenCalledWith('Recent colors cleared');
    });
});
