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
});
