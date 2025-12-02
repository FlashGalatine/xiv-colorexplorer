import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ImageZoomController } from '../image-zoom-controller';
import { ICON_ZOOM_FIT, ICON_ZOOM_WIDTH } from '@shared/ui-icons';
import { LanguageService } from '@services/language-service';

vi.mock('@services/language-service', () => ({
    LanguageService: {
        t: vi.fn((key) => key),
    },
}));

describe('ImageZoomController', () => {
    let container: HTMLElement;
    let controller: ImageZoomController;
    let mockImage: HTMLImageElement;

    beforeEach(() => {
        // Mock canvas getContext
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            drawImage: vi.fn(),
            strokeRect: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray([255, 0, 0, 255]),
                width: 1,
                height: 1,
                colorSpace: 'srgb'
            })),
        })) as any;

        container = document.createElement('div');
        document.body.appendChild(container);

        mockImage = new Image();
        mockImage.width = 1000;
        mockImage.height = 800;
        // Mock naturalWidth/naturalHeight
        Object.defineProperty(mockImage, 'naturalWidth', { value: 1000 });
        Object.defineProperty(mockImage, 'naturalHeight', { value: 800 });

        controller = new ImageZoomController(container);
        controller.init();
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    it('should render zoom controls and canvas container when image is set', () => {
        controller.setImage(mockImage);

        expect(container.querySelector('button[title="matcher.zoomFit"]')).toBeTruthy();
        expect(container.querySelector('button[title="matcher.zoomWidth"]')).toBeTruthy();
        expect(container.querySelector('#canvas-container')).toBeTruthy();
        expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should initialize zoom level to 100%', () => {
        controller.setImage(mockImage);
        const zoomDisplay = container.textContent;
        expect(zoomDisplay).toContain('100%');
    });

    it('should handle zoom in', () => {
        controller.setImage(mockImage);
        const zoomInBtn = container.querySelector('button[title="Zoom in (10%)"]') as HTMLButtonElement;

        zoomInBtn.click();
        expect(container.textContent).toContain('110%');
    });

    it('should handle zoom out', () => {
        controller.setImage(mockImage);
        const zoomOutBtn = container.querySelector('button[title="Zoom out (10%)"]') as HTMLButtonElement;

        zoomOutBtn.click();
        expect(container.textContent).toContain('90%');
    });

    it('should handle reset zoom', () => {
        controller.setImage(mockImage);
        const zoomInBtn = container.querySelector('button[title="Zoom in (10%)"]') as HTMLButtonElement;
        const resetBtn = container.querySelector('button[title="matcher.zoomReset"]') as HTMLButtonElement;

        zoomInBtn.click();
        expect(container.textContent).toContain('110%');

        resetBtn.click();
        expect(container.textContent).toContain('100%');
    });

    it('should emit color sampled event on image click', () => {
        const onColorSampled = vi.fn();
        controller = new ImageZoomController(container, { onColorSampled });
        controller.init();
        controller.setImage(mockImage);

        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        // Context is already mocked in beforeEach

        // Simulate click interaction
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
            left: 100,
            top: 100,
            width: 1000,
            height: 800,
            right: 1100,
            bottom: 900,
            x: 100,
            y: 100,
            toJSON: () => { }
        });

        // Mousedown
        canvas.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 110, // 10px offset
            clientY: 110,
            bubbles: true
        }));

        // Mouseup
        canvas.dispatchEvent(new MouseEvent('mouseup', {
            clientX: 110,
            clientY: 110,
            bubbles: true
        }));

        expect(onColorSampled).toHaveBeenCalledWith('#FF0000', expect.any(Number), expect.any(Number));
    });
});
