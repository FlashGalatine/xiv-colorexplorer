/**
 * XIV Dye Tools v2.0.0 - Image Upload Display Component
 *
 * Phase 12: Architecture Refactor
 * Handles image upload via drag-drop, file input, and clipboard paste
 *
 * @module components/image-upload-display
 */

import { BaseComponent } from './base-component';

/**
 * Image Upload Display Component
 * Provides multiple ways to upload images for color matching
 */
export class ImageUploadDisplay extends BaseComponent {
  private uploadedImage: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isDragging: boolean = false;

  constructor(container: HTMLElement) {
    super(container);
  }

  /**
   * Render the component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-4',
    });

    // Title
    const title = this.createElement('h3', {
      textContent: 'Upload Image',
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });
    wrapper.appendChild(title);

    // Drop zone
    const dropZone = this.createElement('div', {
      id: 'image-drop-zone',
      className:
        'relative w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors',
    });

    const dropContent = this.createElement('div', {
      className: 'space-y-3',
    });

    const icon = this.createElement('div', {
      textContent: '📁',
      className: 'text-4xl',
    });

    const text = this.createElement('div', {
      className: 'space-y-1',
    });

    const mainText = this.createElement('div', {
      textContent: 'Drag and drop an image here',
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });

    const subText = this.createElement('div', {
      textContent: 'or click to select a file',
      className: 'text-sm text-gray-600 dark:text-gray-400',
    });

    text.appendChild(mainText);
    text.appendChild(subText);

    const fileInput = this.createElement('input', {
      attributes: {
        type: 'file',
        accept: 'image/*',
        id: 'image-file-input',
      },
      className: 'hidden',
    });

    dropContent.appendChild(icon);
    dropContent.appendChild(text);
    dropZone.appendChild(dropContent);
    dropZone.appendChild(fileInput);
    wrapper.appendChild(dropZone);

    // Info text
    const info = this.createElement('p', {
      textContent: 'Supported formats: PNG, JPG, WebP, GIF. Maximum size: 10MB',
      className: 'text-xs text-gray-500 dark:text-gray-400 text-center',
    });
    wrapper.appendChild(info);

    // Keyboard shortcut hint (theme-aware)
    const shortcut = this.createElement('div', {
      textContent: '💡 Tip: Paste an image using Ctrl+V (Cmd+V on Mac)',
      className: 'p-2 rounded text-xs border',
      attributes: {
        style: `
          background-color: color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background));
          color: var(--theme-primary);
          border-color: color-mix(in srgb, var(--theme-primary) 30%, var(--theme-border));
        `,
      },
    });
    wrapper.appendChild(shortcut);

    // Canvas for image display (hidden, used internally)
    this.canvas = this.createElement('canvas', {
      attributes: {
        id: 'image-canvas',
      },
      className: 'hidden',
    });
    wrapper.appendChild(this.canvas);

    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const dropZone = this.querySelector<HTMLElement>('#image-drop-zone');
    const fileInput = this.querySelector<HTMLInputElement>('#image-file-input');

    if (dropZone) {
      // Drag and drop
      this.on(dropZone, 'dragover', (e: Event) => {
        e.preventDefault();
        dropZone.classList.add(
          'border-blue-500',
          'dark:border-blue-400',
          'bg-blue-50',
          'dark:bg-blue-900/10'
        );
        this.isDragging = true;
      });

      this.on(dropZone, 'dragleave', () => {
        dropZone.classList.remove(
          'border-blue-500',
          'dark:border-blue-400',
          'bg-blue-50',
          'dark:bg-blue-900/10'
        );
        this.isDragging = false;
      });

      this.on(dropZone, 'drop', (e: Event) => {
        e.preventDefault();
        dropZone.classList.remove(
          'border-blue-500',
          'dark:border-blue-400',
          'bg-blue-50',
          'dark:bg-blue-900/10'
        );
        this.isDragging = false;

        const dragEvent = e as DragEvent;
        if (dragEvent.dataTransfer?.files) {
          this.handleFiles(dragEvent.dataTransfer.files);
        }
      });

      // Click to select file
      this.on(dropZone, 'click', () => {
        fileInput?.click();
      });
    }

    // File input change
    if (fileInput) {
      this.on(fileInput, 'change', () => {
        if (fileInput.files) {
          this.handleFiles(fileInput.files);
        }
      });
    }

    // Paste from clipboard
    this.on(document, 'paste', (e: Event) => {
      const pasteEvent = e as ClipboardEvent;
      const items = pasteEvent.clipboardData?.items;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            pasteEvent.preventDefault();
            const blob = items[i].getAsFile();
            if (blob) {
              this.handleFiles([blob] as unknown as FileList);
            }
          }
        }
      }
    });
  }

  /**
   * Handle file selection
   */
  private handleFiles(files: FileList | File[]): void {
    const file = files instanceof FileList ? files[0] : files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.emit('error', { message: 'Please select an image file' });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.emit('error', { message: 'Image must be smaller than 10MB' });
      return;
    }

    // Read file
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const dataUrl = event.target?.result as string;

      if (!dataUrl) {
        this.emit('error', { message: 'Failed to read image' });
        return;
      }

      // Create image element
      const img = new Image();

      img.onload = () => {
        this.uploadedImage = img;
        this.emit('image-loaded', { image: img, dataUrl });
      };

      img.onerror = () => {
        this.emit('error', { message: 'Failed to load image' });
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      this.emit('error', { message: 'Failed to read file' });
    };

    reader.readAsDataURL(file);
  }

  /**
   * Get uploaded image
   */
  getImage(): HTMLImageElement | null {
    return this.uploadedImage;
  }

  /**
   * Get image data as canvas
   */
  getImageCanvas(): HTMLCanvasElement | null {
    if (!this.uploadedImage || !this.canvas) return null;

    this.canvas.width = this.uploadedImage.width;
    this.canvas.height = this.uploadedImage.height;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(this.uploadedImage, 0, 0);

    return this.canvas;
  }

  /**
   * Sample pixel color from image
   */
  samplePixel(x: number, y: number): string | null {
    const canvas = this.getImageCanvas();
    if (!canvas) return null;

    // Clamp coordinates to canvas bounds
    const clampedX = Math.min(Math.max(0, Math.floor(x)), canvas.width - 1);
    const clampedY = Math.min(Math.max(0, Math.floor(y)), canvas.height - 1);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
    const data = imageData.data;

    // Convert RGBA to hex
    const hex = `#${((data[0] << 16) | (data[1] << 8) | data[2]).toString(16).padStart(6, '0').toUpperCase()}`;

    return hex;
  }

  /**
   * Get average color of region
   */
  getAverageColor(x: number, y: number, size: number = 1): string | null {
    const canvas = this.getImageCanvas();
    if (!canvas) return null;

    // Clamp region to canvas bounds
    const startX = Math.max(0, Math.floor(x - size / 2));
    const startY = Math.max(0, Math.floor(y - size / 2));
    const width = Math.min(size, canvas.width - startX);
    const height = Math.min(size, canvas.height - startY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(startX, startY, width, height);
    const data = imageData.data;

    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      // Skip alpha channel
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;

    return hex;
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(): { width: number; height: number } | null {
    if (!this.uploadedImage) return null;

    return {
      width: this.uploadedImage.width,
      height: this.uploadedImage.height,
    };
  }

  /**
   * Clear uploaded image
   */
  clear(): void {
    this.uploadedImage = null;
    this.update();
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      hasImage: this.uploadedImage !== null,
      imageDimensions: this.uploadedImage
        ? { width: this.uploadedImage.width, height: this.uploadedImage.height }
        : null,
    };
  }
}
