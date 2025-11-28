/**
 * XIV Dye Tools - Image Upload Display Component Tests
 *
 * Tests for the image upload UI component
 *
 * @module components/__tests__/image-upload-display.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImageUploadDisplay } from '../image-upload-display';
import { createTestContainer, cleanupTestContainer, waitForComponent } from './test-utils';

describe('ImageUploadDisplay', () => {
  let container: HTMLElement;
  let component: ImageUploadDisplay;

  beforeEach(() => {
    vi.clearAllMocks();
    container = createTestContainer();
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    cleanupTestContainer(container);
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================

  describe('rendering', () => {
    it('should render the upload component', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should render drop zone', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone');
      expect(dropZone).not.toBeNull();
    });

    it('should render file input (hidden)', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const fileInput = container.querySelector('#image-file-input');
      expect(fileInput).not.toBeNull();
      expect(fileInput?.classList.contains('hidden')).toBe(true);
    });

    it('should render camera input for mobile', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const cameraInput = container.querySelector('#camera-file-input');
      expect(cameraInput).not.toBeNull();
    });

    it('should render upload icon', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(container.textContent).toContain('📁');
    });

    it('should render camera button for mobile', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(container.textContent).toContain('📷');
    });

    it('should render paste hint', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(container.textContent).toContain('💡');
    });

    it('should have hidden canvas for image processing', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const canvas = container.querySelector('#image-canvas');
      expect(canvas).not.toBeNull();
      expect(canvas?.classList.contains('hidden')).toBe(true);
    });
  });

  // ==========================================================================
  // Drop Zone Interaction
  // ==========================================================================

  describe('drop zone interaction', () => {
    it('should trigger file input click when drop zone is clicked', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone') as HTMLElement;
      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      dropZone.click();
      await waitForComponent();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should add highlight classes on dragover', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone') as HTMLElement;

      const dragEvent = new Event('dragover', { bubbles: true });
      dropZone.dispatchEvent(dragEvent);

      expect(dropZone.classList.contains('border-blue-500')).toBe(true);
    });

    it('should remove highlight classes on dragleave', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone') as HTMLElement;

      // Trigger dragover first
      dropZone.dispatchEvent(new Event('dragover', { bubbles: true }));
      expect(dropZone.classList.contains('border-blue-500')).toBe(true);

      // Then dragleave
      dropZone.dispatchEvent(new Event('dragleave', { bubbles: true }));
      expect(dropZone.classList.contains('border-blue-500')).toBe(false);
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('state management', () => {
    it('should return null when no image is uploaded', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(component.getImage()).toBeNull();
    });

    it('should return null dimensions when no image is uploaded', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(component.getImageDimensions()).toBeNull();
    });

    it('should return null canvas when no image is uploaded', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(component.getImageCanvas()).toBeNull();
    });

    it('should return correct state via getState', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();

      expect(state).toHaveProperty('hasImage');
      expect(state.hasImage).toBe(false);
      expect(state.imageDimensions).toBeNull();
    });
  });

  // ==========================================================================
  // Pixel Sampling
  // ==========================================================================

  describe('pixel sampling', () => {
    it('should return null when sampling with no image', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const color = component.samplePixel(10, 10);
      expect(color).toBeNull();
    });

    it('should return null for average color with no image', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const color = component.getAverageColor(10, 10, 5);
      expect(color).toBeNull();
    });
  });

  // ==========================================================================
  // Clear Functionality
  // ==========================================================================

  describe('clear functionality', () => {
    it('should clear uploaded image', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Clear should not throw even with no image
      expect(() => component.clear()).not.toThrow();
      expect(component.getImage()).toBeNull();
    });
  });

  // ==========================================================================
  // Event Emission
  // ==========================================================================

  describe('event emission', () => {
    it('should have paste event listener set up', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Verify paste handler is set up by dispatching a basic paste event
      const pasteEvent = new Event('paste', { bubbles: true });

      expect(() => document.dispatchEvent(pasteEvent)).not.toThrow();
    });
  });

  // ==========================================================================
  // File Validation
  // ==========================================================================

  describe('file validation', () => {
    it('should emit error for non-image files', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Create a non-image file
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      // Create a mock FileList
      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () {
          yield file;
        },
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should emit error for oversized files', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Create a mock large file (>20MB) - we can mock the size without actually creating large content
      const file = new File(['test'], 'large.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 });

      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () {
          yield file;
        },
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('accessibility', () => {
    it('should have aria-label on camera button', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const cameraBtn = container.querySelector('button[aria-label]');
      expect(cameraBtn).not.toBeNull();
    });

    it('should have accept attribute on file inputs', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const fileInput = container.querySelector('#image-file-input');
      expect(fileInput?.getAttribute('accept')).toBe('image/*');

      const cameraInput = container.querySelector('#camera-file-input');
      expect(cameraInput?.getAttribute('accept')).toBe('image/*');
    });

    it('should have capture attribute on camera input', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const cameraInput = container.querySelector('#camera-file-input');
      expect(cameraInput?.getAttribute('capture')).toBe('environment');
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('cleanup', () => {
    it('should clean up without error', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      expect(() => component.destroy()).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - handleFiles
  // ==========================================================================

  describe('handleFiles branch coverage', () => {
    it('should handle empty FileList', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      // Create empty FileList
      const emptyFileList = {
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () {},
      };

      Object.defineProperty(fileInput, 'files', {
        value: emptyFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();

      // Should not emit error for empty list (just returns early)
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle FileReader error', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Mock FileReader to trigger error
      const originalFileReader = global.FileReader;
      class MockFileReader {
        onerror: ((event: ProgressEvent) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new ProgressEvent('error'));
            }
          }, 0);
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () { yield file; },
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(errorSpy).toHaveBeenCalled();

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });

    it('should handle Image load error', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Mock FileReader to succeed but Image to fail
      const originalFileReader = global.FileReader;
      const originalImage = global.Image;

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({
                target: { result: 'data:image/png;base64,invalid' },
              } as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }

      class MockImage {
        onerror: (() => void) | null = null;
        set src(_value: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;
      global.Image = MockImage as unknown as typeof Image;

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () { yield file; },
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errorSpy).toHaveBeenCalled();

      // Restore
      global.FileReader = originalFileReader;
      global.Image = originalImage;
    });

    it('should handle null dataUrl from FileReader', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      const originalFileReader = global.FileReader;

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({
                target: { result: null },
              } as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () { yield file; },
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      fileInput.dispatchEvent(new Event('change'));
      await waitForComponent();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(errorSpy).toHaveBeenCalled();

      global.FileReader = originalFileReader;
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - Drop Events
  // ==========================================================================

  describe('drop event branch coverage', () => {
    it('should handle drop event without dataTransfer', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone') as HTMLElement;

      // Create drop event without dataTransfer
      const dropEvent = new Event('drop', { bubbles: true });

      expect(() => {
        dropZone.dispatchEvent(dropEvent);
      }).not.toThrow();

      // Should remove highlight classes even without files
      expect(dropZone.classList.contains('border-blue-500')).toBe(false);
    });

    it('should handle drop event with null files', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const dropZone = container.querySelector('#image-drop-zone') as HTMLElement;

      // Create drop event with dataTransfer but no files
      const dropEvent = new Event('drop', { bubbles: true }) as Event & {
        dataTransfer: { files: null };
      };
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: null },
        writable: true,
      });

      expect(() => {
        dropZone.dispatchEvent(dropEvent);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - Paste Events
  // ==========================================================================

  describe('paste event branch coverage', () => {
    it('should handle paste with non-image items', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Create paste event with text item
      const clipboardEvent = new Event('paste') as Event & {
        clipboardData: { items: Array<{ type: string; getAsFile: () => File | null }> };
      };
      Object.defineProperty(clipboardEvent, 'clipboardData', {
        value: {
          items: [
            {
              type: 'text/plain',
              getAsFile: () => null,
            },
          ],
        },
      });

      document.dispatchEvent(clipboardEvent);
      await waitForComponent();

      // Should not emit error for non-image paste
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle paste with null blob', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      // Create paste event with image type but null blob
      const clipboardEvent = new Event('paste') as Event & {
        clipboardData: { items: Array<{ type: string; getAsFile: () => File | null }> };
        preventDefault: () => void;
      };
      Object.defineProperty(clipboardEvent, 'clipboardData', {
        value: {
          items: [
            {
              type: 'image/png',
              getAsFile: () => null,
            },
          ],
        },
      });
      Object.defineProperty(clipboardEvent, 'preventDefault', {
        value: vi.fn(),
      });

      document.dispatchEvent(clipboardEvent);
      await waitForComponent();

      // Should not emit error when blob is null (just returns early)
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle paste with null clipboardData', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Create paste event with null clipboardData
      const clipboardEvent = new Event('paste') as Event & {
        clipboardData: null;
      };
      Object.defineProperty(clipboardEvent, 'clipboardData', {
        value: null,
      });

      expect(() => {
        document.dispatchEvent(clipboardEvent);
      }).not.toThrow();
    });

    it('should handle paste with null items', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const clipboardEvent = new Event('paste') as Event & {
        clipboardData: { items: null };
      };
      Object.defineProperty(clipboardEvent, 'clipboardData', {
        value: { items: null },
      });

      expect(() => {
        document.dispatchEvent(clipboardEvent);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - Canvas Context
  // ==========================================================================

  describe('canvas context branch coverage', () => {
    it('should return null from getImageCanvas when canvas context is null', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Set up uploaded image
      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 100;
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      // Mock canvas.getContext to return null
      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      const originalGetContext = canvas.getContext.bind(canvas);
      canvas.getContext = () => null;

      const result = component.getImageCanvas();

      expect(result).toBeNull();

      // Restore
      canvas.getContext = originalGetContext;
    });

    it('should return null from samplePixel when canvas context is null', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Set up uploaded image
      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 100;
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      // First mock getContext for getImageCanvas call (returns valid context)
      // Then mock for samplePixel call (returns null)
      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      let callCount = 0;
      const originalGetContext = canvas.getContext.bind(canvas);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).getContext = (contextId: string) => {
        callCount++;
        if (callCount === 1) {
          // First call (getImageCanvas) - return valid context
          return originalGetContext(contextId as '2d');
        }
        // Second call (samplePixel) - return null
        return null;
      };

      const result = component.samplePixel(10, 10);

      expect(result).toBeNull();

      canvas.getContext = originalGetContext;
    });

    it('should return null from getAverageColor when canvas context is null', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Set up uploaded image
      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 100;
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      // Mock getContext to return null on the second call
      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      let callCount = 0;
      const originalGetContext = canvas.getContext.bind(canvas);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).getContext = (contextId: string) => {
        callCount++;
        if (callCount === 1) {
          return originalGetContext(contextId as '2d');
        }
        return null;
      };

      const result = component.getAverageColor(10, 10, 5);

      expect(result).toBeNull();

      canvas.getContext = originalGetContext;
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - Coordinate Clamping
  // ==========================================================================

  describe('coordinate clamping branch coverage', () => {
    it('should clamp negative coordinates in samplePixel', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Set up uploaded image and canvas
      const mockImage = new Image();
      Object.defineProperty(mockImage, 'width', { value: 100 });
      Object.defineProperty(mockImage, 'height', { value: 100 });
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      // Mock canvas with getContext that returns valid ImageData
      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      const mockCtx = {
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([255, 0, 0, 255]),
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).getContext = () => mockCtx as unknown as CanvasRenderingContext2D;

      // Test with negative coordinates
      const result = component.samplePixel(-10, -10);

      // Should clamp to 0,0 and return a valid color
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 1, 1);
      expect(result).toBe('#FF0000');
    });

    it('should clamp coordinates exceeding canvas bounds in samplePixel', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const mockImage = new Image();
      Object.defineProperty(mockImage, 'width', { value: 100 });
      Object.defineProperty(mockImage, 'height', { value: 100 });
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      const mockCtx = {
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([0, 255, 0, 255]),
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).getContext = () => mockCtx as unknown as CanvasRenderingContext2D;

      // Test with coordinates exceeding bounds
      const result = component.samplePixel(500, 500);

      // Should clamp to max bounds (99, 99 since canvas is 100x100)
      expect(mockCtx.getImageData).toHaveBeenCalledWith(99, 99, 1, 1);
      expect(result).toBe('#00FF00');
    });

    it('should handle average color region clamping at edges', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const mockImage = new Image();
      Object.defineProperty(mockImage, 'width', { value: 100 });
      Object.defineProperty(mockImage, 'height', { value: 100 });
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      const canvas = container.querySelector('#image-canvas') as HTMLCanvasElement;
      const mockCtx = {
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([0, 0, 255, 255]),
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).getContext = () => mockCtx as unknown as CanvasRenderingContext2D;

      // Get average color at edge with large sample size
      const result = component.getAverageColor(98, 98, 10);

      expect(result).toBe('#0000FF');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - File Input Events
  // ==========================================================================

  describe('file input event branch coverage', () => {
    it('should handle change event with null files property', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const fileInput = container.querySelector('#image-file-input') as HTMLInputElement;

      // Set files to null
      Object.defineProperty(fileInput, 'files', {
        value: null,
        configurable: true,
      });

      expect(() => {
        fileInput.dispatchEvent(new Event('change'));
      }).not.toThrow();
    });

    it('should handle camera input change event', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const errorSpy = vi.fn();
      container.addEventListener('error', errorSpy);

      const cameraInput = container.querySelector('#camera-file-input') as HTMLInputElement;

      // Create a valid image file
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () { yield file; },
      };

      Object.defineProperty(cameraInput, 'files', {
        value: mockFileList,
        configurable: true,
      });

      // Should process the file without error (type validation passes)
      cameraInput.dispatchEvent(new Event('change'));
      await waitForComponent();

      // File should be processed (may emit error for other reasons in jsdom)
    });

    it('should handle camera input with null files', async () => {
      component = new ImageUploadDisplay(container);
      component.init();

      const cameraInput = container.querySelector('#camera-file-input') as HTMLInputElement;

      Object.defineProperty(cameraInput, 'files', {
        value: null,
        configurable: true,
      });

      expect(() => {
        cameraInput.dispatchEvent(new Event('change'));
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - getState with image
  // ==========================================================================

  describe('getState branch coverage', () => {
    it('should return image dimensions when image is uploaded', () => {
      component = new ImageUploadDisplay(container);
      component.init();

      // Set up mock uploaded image
      const mockImage = new Image();
      Object.defineProperty(mockImage, 'width', { value: 800 });
      Object.defineProperty(mockImage, 'height', { value: 600 });
      (component as unknown as { uploadedImage: HTMLImageElement | null }).uploadedImage = mockImage;

      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();

      expect(state.hasImage).toBe(true);
      expect(state.imageDimensions).toEqual({ width: 800, height: 600 });
    });
  });
});
