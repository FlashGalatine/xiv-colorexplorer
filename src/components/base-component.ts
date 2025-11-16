/**
 * XIV Dye Tools v2.0.0 - Base Component Class
 *
 * Phase 12: Architecture Refactor
 * Abstract base class for all UI components
 *
 * @module components/base-component
 */

import { ErrorHandler } from '@shared/error-handler';

/**
 * Options for creating HTML elements within components
 */
export interface ElementOptions {
  className?: string;
  id?: string;
  innerHTML?: string;
  textContent?: string;
  attributes?: Record<string, string>;
  dataAttributes?: Record<string, string>;
}

/**
 * Event handler type with component context
 */
export type EventHandler<T extends Event = Event> = (this: BaseComponent, event: T) => void;

/**
 * Component lifecycle hooks
 */
export interface ComponentLifecycle {
  onMount?(): void;
  onUnmount?(): void;
  onUpdate?(): void;
}

// ============================================================================
// Base Component Class
// ============================================================================

/**
 * Abstract base class for all UI components
 * Provides common functionality for rendering, event handling, and lifecycle
 */
export abstract class BaseComponent implements ComponentLifecycle {
  protected container: HTMLElement;
  protected element: HTMLElement | null = null;
  protected listeners: Map<
    string,
    { target: HTMLElement | Document | Window; handler: EventListener }
  > = new Map();
  protected isInitialized: boolean = false;
  protected isDestroyed: boolean = false;

  // Lifecycle hooks - optional for subclasses to override
  onMount?(): void;
  onUnmount?(): void;
  onUpdate?(): void;

  /**
   * Constructor - initialize component with container element
   */
  constructor(container: HTMLElement) {
    this.container = container;
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  /**
   * Initialize the component
   * Call after constructor to render and bind events
   */
  init(): this {
    if (this.isInitialized) {
      console.warn('Component already initialized');
      return this;
    }

    try {
      this.render();
      this.bindEvents();
      this.isInitialized = true;
      this.onMount?.();
      return this;
    } catch (error) {
      ErrorHandler.log(error);
      throw error;
    }
  }

  /**
   * Re-render the component
   */
  update(): void {
    if (!this.isInitialized) {
      console.warn('Component not initialized');
      return;
    }

    try {
      this.render();
      this.bindEvents();
      this.onUpdate?.();
    } catch (error) {
      ErrorHandler.log(error);
    }
  }

  /**
   * Destroy the component and clean up
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    try {
      this.unbindAllEvents();
      this.onUnmount?.();
      this.isDestroyed = true;
      this.element?.remove();
    } catch (error) {
      ErrorHandler.log(error);
    }
  }

  // ============================================================================
  // Abstract Methods - Must be implemented by subclasses
  // ============================================================================

  /**
   * Render the component to the DOM
   */
  abstract render(): void;

  /**
   * Bind event listeners
   */
  abstract bindEvents(): void;

  // ============================================================================
  // DOM Creation Utilities
  // ============================================================================

  /**
   * Create an HTML element with optional attributes
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementOptions
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    if (options) {
      if (options.className) {
        element.className = options.className;
      }
      if (options.id) {
        element.id = options.id;
      }
      if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
      }
      if (options.textContent) {
        element.textContent = options.textContent;
      }
      if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
          element.setAttribute(key, value);
        }
      }
      if (options.dataAttributes) {
        for (const [key, value] of Object.entries(options.dataAttributes)) {
          element.dataset[key] = value;
        }
      }
    }

    return element;
  }

  /**
   * Set element content
   */
  protected setContent(element: HTMLElement, content: string | HTMLElement): void {
    element.innerHTML = '';
    if (typeof content === 'string') {
      element.textContent = content;
    } else {
      element.appendChild(content);
    }
  }

  /**
   * Query selector within component
   */
  protected querySelector<T extends Element = Element>(selector: string): T | null {
    return (this.element || this.container).querySelector(selector) as T | null;
  }

  /**
   * Query all selectors within component
   */
  protected querySelectorAll<T extends Element = Element>(selector: string): T[] {
    return Array.from((this.element || this.container).querySelectorAll(selector)) as T[];
  }

  /**
   * Add class to element
   */
  protected addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  /**
   * Remove class from element
   */
  protected removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  /**
   * Toggle class on element
   */
  protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }

  /**
   * Check if element has class
   */
  protected hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  // ============================================================================
  // Event Handling
  // ============================================================================

  /**
   * Add event listener with automatic context binding
   */
  protected on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Document | Window,
    event: K,
    handler: EventHandler<HTMLElementEventMap[K]>
  ): void {
    const boundHandler = handler.bind(this) as EventListener;

    if (target instanceof HTMLElement) {
      target.addEventListener(event as string, boundHandler);
    } else if (target instanceof Document || target instanceof Window) {
      target.addEventListener(event as string, boundHandler);
    }

    // Store listener for cleanup
    const key = `${event}_${Math.random()}`;
    this.listeners.set(key, { target, handler: boundHandler });
  }

  /**
   * Remove specific event listener
   */
  protected off<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Document | Window,
    event: K,
    handler: EventListener
  ): void {
    target.removeEventListener(event as string, handler);

    // Remove from stored listeners
    for (const [key, listener] of this.listeners.entries()) {
      if (listener.target === target && listener.handler === handler) {
        this.listeners.delete(key);
        break;
      }
    }
  }

  /**
   * Remove all event listeners
   */
  private unbindAllEvents(): void {
    for (const { target, handler } of this.listeners.values()) {
      for (const event in target) {
        if (event.startsWith('on')) {
          try {
            target.removeEventListener(event.slice(2), handler);
          } catch {
            // Ignore errors during cleanup
          }
        }
      }
    }
    this.listeners.clear();
  }

  /**
   * Emit custom event from component
   */
  protected emit<T extends CustomEvent>(eventName: string, detail?: T['detail']): boolean {
    const event = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
    return (this.element || this.container).dispatchEvent(event);
  }

  /**
   * Listen for custom events
   */
  protected onCustom(eventName: string, handler: (event: CustomEvent) => void): void {
    const boundHandler = (event: Event) => {
      if (event instanceof CustomEvent) {
        handler.call(this, event);
      }
    };

    (this.element || this.container).addEventListener(eventName, boundHandler);
    this.listeners.set(`custom_${eventName}`, {
      target: this.element || this.container,
      handler: boundHandler,
    });
  }

  // ============================================================================
  // State Management Utilities
  // ============================================================================

  /**
   * Get component state (for subclasses to override)
   */
  protected getState(): Record<string, unknown> {
    return {};
  }

  /**
   * Set component state (for subclasses to override)
   */
  protected setState(_newState: Record<string, unknown>): void {
    // Subclasses should override this to implement state management
  }

  // ============================================================================
  // Visibility and Styling
  // ============================================================================

  /**
   * Show the component
   */
  show(): void {
    if (this.element) {
      this.element.style.display = '';
    }
  }

  /**
   * Hide the component
   */
  hide(): void {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Check if component is visible
   */
  isVisible(): boolean {
    return this.element ? this.element.style.display !== 'none' : false;
  }

  /**
   * Set component CSS
   */
  setStyle(styles: Partial<CSSStyleDeclaration>): void {
    if (!this.element) return;

    for (const [key, value] of Object.entries(styles)) {
      (this.element.style as unknown as Record<string, string>)[key] = value as string;
    }
  }

  // ============================================================================
  // Debugging & Utilities
  // ============================================================================

  /**
   * Get component debug info
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      name: this.constructor.name,
      initialized: this.isInitialized,
      destroyed: this.isDestroyed,
      element: this.element?.tagName,
      container: this.container.tagName,
      listeners: this.listeners.size,
      state: this.getState(),
    };
  }

  /**
   * Log debug info
   */
  debug(): void {
    console.info(`🔍 ${this.constructor.name} Debug Info`);
    console.info(this.getDebugInfo());
    console.info('--- End Debug Info ---');
  }
}
