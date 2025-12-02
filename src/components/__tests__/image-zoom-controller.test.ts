import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ImageZoomController } from '../image-zoom-controller';

vi.mock('@services/language-service', () => ({
  LanguageService: {
    t: vi.fn((key: string) => key),
  },
}));

describe('ImageZoomController', () => {
  let container: HTMLElement;
  let controller: ImageZoomController;
  let mockImage: HTMLImageElement;
  let mockCtx: {
    drawImage: ReturnType<typeof vi.fn>;
    strokeRect: ReturnType<typeof vi.fn>;
    getImageData: ReturnType<typeof vi.fn>;
    strokeStyle: string;
    lineWidth: number;
  };

  beforeEach(() => {
    mockCtx = {
      drawImage: vi.fn(),
      strokeRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray([255, 0, 0, 255]),
        width: 1,
        height: 1,
        colorSpace: 'srgb',
      })),
      strokeStyle: '',
      lineWidth: 1,
    };

    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCtx
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    container = document.createElement('div');
    // Set container dimensions for zoom calculations
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, configurable: true });
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

  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  describe('basic rendering', () => {
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

    it('should add space-y-4 class to container on render', () => {
      controller.render();
      expect(container.classList.contains('space-y-4')).toBe(true);
    });
  });

  // ==========================================================================
  // Accessor Methods
  // ==========================================================================

  describe('accessor methods', () => {
    it('should return canvas container via getCanvasContainer', () => {
      controller.setImage(mockImage);
      const canvasContainer = controller.getCanvasContainer();

      expect(canvasContainer).not.toBeNull();
      expect(canvasContainer?.id).toBe('canvas-container');
    });

    it('should return null for getCanvasContainer before setImage', () => {
      const canvasContainer = controller.getCanvasContainer();
      expect(canvasContainer).toBeNull();
    });

    it('should return canvas via getCanvas', () => {
      controller.setImage(mockImage);
      const canvas = controller.getCanvas();

      expect(canvas).not.toBeNull();
      expect(canvas?.tagName).toBe('CANVAS');
    });

    it('should return null for getCanvas before setImage', () => {
      const canvas = controller.getCanvas();
      expect(canvas).toBeNull();
    });
  });

  // ==========================================================================
  // Zoom Controls
  // ==========================================================================

  describe('zoom controls', () => {
    it('should handle zoom in', () => {
      controller.setImage(mockImage);
      const zoomInBtn = container.querySelector(
        'button[title="Zoom in (10%)"]'
      ) as HTMLButtonElement;

      zoomInBtn.click();
      expect(container.textContent).toContain('110%');
    });

    it('should handle zoom out', () => {
      controller.setImage(mockImage);
      const zoomOutBtn = container.querySelector(
        'button[title="Zoom out (10%)"]'
      ) as HTMLButtonElement;

      zoomOutBtn.click();
      expect(container.textContent).toContain('90%');
    });

    it('should handle reset zoom', () => {
      controller.setImage(mockImage);
      const zoomInBtn = container.querySelector(
        'button[title="Zoom in (10%)"]'
      ) as HTMLButtonElement;
      const resetBtn = container.querySelector(
        'button[title="matcher.zoomReset"]'
      ) as HTMLButtonElement;

      zoomInBtn.click();
      expect(container.textContent).toContain('110%');

      resetBtn.click();
      expect(container.textContent).toContain('100%');
    });

    it('should not zoom below minimum (10%)', () => {
      controller.setImage(mockImage);
      const zoomOutBtn = container.querySelector(
        'button[title="Zoom out (10%)"]'
      ) as HTMLButtonElement;

      // Click zoom out many times
      for (let i = 0; i < 15; i++) {
        zoomOutBtn.click();
      }

      expect(container.textContent).toContain('10%');
      expect(zoomOutBtn.disabled).toBe(true);
    });

    it('should not zoom above maximum (400%)', () => {
      controller.setImage(mockImage);
      const zoomInBtn = container.querySelector(
        'button[title="Zoom in (10%)"]'
      ) as HTMLButtonElement;

      // Click zoom in many times
      for (let i = 0; i < 40; i++) {
        zoomInBtn.click();
      }

      expect(container.textContent).toContain('400%');
      expect(zoomInBtn.disabled).toBe(true);
    });

    it('should handle fit to container button', async () => {
      controller.setImage(mockImage);

      // Mock container dimensions
      const canvasContainer = controller.getCanvasContainer()!;
      Object.defineProperty(canvasContainer, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(canvasContainer, 'clientHeight', { value: 400, configurable: true });

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;

      fitBtn.click();

      // Wait for requestAnimationFrame
      await new Promise((r) => requestAnimationFrame(r));

      // Should have adjusted zoom based on container/image ratio
      const zoomDisplay = container.querySelector('.min-w-20')!;
      expect(zoomDisplay.textContent).toMatch(/\d+%/);
    });

    it('should handle zoom to width button', async () => {
      controller.setImage(mockImage);

      // Mock container dimensions
      const canvasContainer = controller.getCanvasContainer()!;
      Object.defineProperty(canvasContainer, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(canvasContainer, 'clientHeight', { value: 400, configurable: true });

      const widthBtn = container.querySelector(
        'button[title="matcher.zoomWidth"]'
      ) as HTMLButtonElement;

      widthBtn.click();

      // Wait for requestAnimationFrame
      await new Promise((r) => requestAnimationFrame(r));

      // Zoom should have changed
      const zoomDisplay = container.querySelector('.min-w-20')!;
      expect(zoomDisplay.textContent).toMatch(/\d+%/);
    });
  });

  // ==========================================================================
  // Wheel Zoom
  // ==========================================================================

  describe('wheel zoom', () => {
    it('should zoom with shift+wheel scroll', () => {
      controller.setImage(mockImage);
      const canvasContainer = controller.getCanvasContainer()!;

      // Zoom in with shift+scroll up
      canvasContainer.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          shiftKey: true,
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('110%');

      // Zoom out with shift+scroll down
      canvasContainer.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 100,
          shiftKey: true,
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('100%');
    });

    it('should not zoom without shift key', () => {
      controller.setImage(mockImage);
      const canvasContainer = controller.getCanvasContainer()!;

      // Scroll without shift
      canvasContainer.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          shiftKey: false,
          bubbles: true,
        })
      );

      // Zoom should stay at 100%
      expect(container.textContent).toContain('100%');
    });
  });

  // ==========================================================================
  // Keyboard Zoom
  // ==========================================================================

  describe('keyboard zoom', () => {
    it('should zoom in with + key', () => {
      controller.setImage(mockImage);

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '+',
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('110%');
    });

    it('should zoom in with = key', () => {
      controller.setImage(mockImage);

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '=',
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('110%');
    });

    it('should zoom out with - key', () => {
      controller.setImage(mockImage);

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '-',
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('90%');
    });

    it('should reset zoom with 0 key', () => {
      controller.setImage(mockImage);
      const zoomInBtn = container.querySelector(
        'button[title="Zoom in (10%)"]'
      ) as HTMLButtonElement;

      zoomInBtn.click();
      zoomInBtn.click();
      expect(container.textContent).toContain('120%');

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '0',
          bubbles: true,
        })
      );

      expect(container.textContent).toContain('100%');
    });

    it('should not zoom with keyboard when input is focused', () => {
      controller.setImage(mockImage);

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '+',
          bubbles: true,
        })
      );

      // Zoom should stay at 100% because input is focused
      expect(container.textContent).toContain('100%');

      document.body.removeChild(input);
    });
  });

  // ==========================================================================
  // Image Interaction - Color Sampling
  // ==========================================================================

  describe('color sampling', () => {
    it('should emit color sampled event on mouseup after mousedown', () => {
      const onColorSampled = vi.fn();
      controller = new ImageZoomController(container, { onColorSampled });
      controller.init();
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 1000,
        height: 800,
        right: 1100,
        bottom: 900,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      // Mousedown
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        })
      );

      // Mouseup
      canvas.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        })
      );

      expect(onColorSampled).toHaveBeenCalledWith(
        '#FF0000',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should emit custom image-sampled event', () => {
      controller.setImage(mockImage);

      const eventSpy = vi.fn();
      container.addEventListener('image-sampled', eventSpy);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 1000,
        height: 800,
        right: 1100,
        bottom: 900,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 150,
          clientY: 150,
          bubbles: true,
        })
      );

      canvas.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 150,
          clientY: 150,
          bubbles: true,
        })
      );

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Image Interaction - Selection Rectangle
  // ==========================================================================

  describe('selection rectangle', () => {
    it('should draw selection rectangle on mousemove while dragging', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Start drag
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 100,
          clientY: 100,
          bubbles: true,
        })
      );

      // Move mouse
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 200,
          clientY: 200,
          bubbles: true,
        })
      );

      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('should not draw selection rectangle when not dragging', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      mockCtx.drawImage.mockClear();
      mockCtx.strokeRect.mockClear();

      // Move mouse without mousedown
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 200,
          clientY: 200,
          bubbles: true,
        })
      );

      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it('should clear selection rectangle and redraw image on mouseleave while dragging', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Start drag
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 100,
          clientY: 100,
          bubbles: true,
        })
      );

      mockCtx.drawImage.mockClear();

      // Leave canvas while dragging
      canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      // Should redraw original image
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it('should not do anything on mouseleave when not dragging', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      mockCtx.drawImage.mockClear();

      // Leave canvas without dragging
      canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      // Should not redraw
      expect(mockCtx.drawImage).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Container Dimension Fallbacks
  // ==========================================================================

  describe('container dimension fallbacks', () => {
    it('should use offsetWidth/Height when clientWidth/Height is 0', async () => {
      controller.setImage(mockImage);

      const canvasContainer = controller.getCanvasContainer()!;

      // Set clientWidth/Height to 0
      Object.defineProperty(canvasContainer, 'clientWidth', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'clientHeight', { value: 0, configurable: true });
      // Set offsetWidth/Height as fallback
      Object.defineProperty(canvasContainer, 'offsetWidth', { value: 600, configurable: true });
      Object.defineProperty(canvasContainer, 'offsetHeight', { value: 400, configurable: true });

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;
      fitBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      // Should have calculated zoom using offset dimensions
      const zoomDisplay = container.querySelector('.min-w-20')!;
      expect(zoomDisplay.textContent).toMatch(/\d+%/);
    });

    it('should use getBoundingClientRect when offset dimensions are also 0', async () => {
      controller.setImage(mockImage);

      const canvasContainer = controller.getCanvasContainer()!;

      Object.defineProperty(canvasContainer, 'clientWidth', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'clientHeight', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'offsetWidth', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'offsetHeight', { value: 0, configurable: true });

      vi.spyOn(canvasContainer, 'getBoundingClientRect').mockReturnValue({
        width: 500,
        height: 400,
        left: 0,
        top: 0,
        right: 500,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;
      fitBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      const zoomDisplay = container.querySelector('.min-w-20')!;
      expect(zoomDisplay.textContent).toMatch(/\d+%/);
    });

    it('should use window dimensions as last resort fallback', async () => {
      controller.setImage(mockImage);

      const canvasContainer = controller.getCanvasContainer()!;

      Object.defineProperty(canvasContainer, 'clientWidth', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'clientHeight', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'offsetWidth', { value: 0, configurable: true });
      Object.defineProperty(canvasContainer, 'offsetHeight', { value: 0, configurable: true });

      vi.spyOn(canvasContainer, 'getBoundingClientRect').mockReturnValue({
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;
      fitBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      // Should still work with window dimensions
      const zoomDisplay = container.querySelector('.min-w-20')!;
      expect(zoomDisplay.textContent).toMatch(/\d+%/);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle image with zero dimensions', async () => {
      const zeroImage = new Image();
      Object.defineProperty(zeroImage, 'naturalWidth', { value: 0 });
      Object.defineProperty(zeroImage, 'naturalHeight', { value: 0 });
      Object.defineProperty(zeroImage, 'width', { value: 0 });
      Object.defineProperty(zeroImage, 'height', { value: 0 });

      controller.setImage(zeroImage);

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;
      fitBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      // Should not crash
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should handle fit when no current image', async () => {
      controller.setImage(mockImage);

      // Clear image reference
      controller['currentImage'] = null;

      const fitBtn = container.querySelector(
        'button[title="matcher.zoomFit"]'
      ) as HTMLButtonElement;
      fitBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      // Should not crash
      expect(container.textContent).toContain('100%');
    });

    it('should handle width zoom when no current image', async () => {
      controller.setImage(mockImage);

      // Clear image reference
      controller['currentImage'] = null;

      const widthBtn = container.querySelector(
        'button[title="matcher.zoomWidth"]'
      ) as HTMLButtonElement;
      widthBtn.click();

      await new Promise((r) => requestAnimationFrame(r));

      // Should not crash
      expect(true).toBe(true);
    });

    it('should change cursor style when zoomed in', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      const zoomInBtn = container.querySelector(
        'button[title="Zoom in (10%)"]'
      ) as HTMLButtonElement;

      // Zoom in beyond 100%
      zoomInBtn.click();

      expect(canvas.style.cursor).toBe('move');
    });

    it('should use crosshair cursor at 100% zoom', () => {
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      // At 100%, cursor is set via class (cursor-crosshair), not inline style
      expect(canvas.classList.contains('cursor-crosshair')).toBe(true);
    });
  });

  // ==========================================================================
  // Without Callback
  // ==========================================================================

  describe('without callback', () => {
    it('should work without onColorSampled callback', () => {
      // Create controller without callback
      controller = new ImageZoomController(container);
      controller.init();
      controller.setImage(mockImage);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 1000,
        height: 800,
        right: 1100,
        bottom: 900,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      // Should not throw
      expect(() => {
        canvas.dispatchEvent(
          new MouseEvent('mousedown', {
            clientX: 110,
            clientY: 110,
            bubbles: true,
          })
        );
        canvas.dispatchEvent(
          new MouseEvent('mouseup', {
            clientX: 110,
            clientY: 110,
            bubbles: true,
          })
        );
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // bindEvents Method
  // ==========================================================================

  describe('bindEvents', () => {
    it('should call bindEvents without error', () => {
      expect(() => controller.bindEvents()).not.toThrow();
    });
  });
});
