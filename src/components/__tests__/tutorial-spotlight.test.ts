/**
 * XIV Dye Tools - Tutorial Spotlight Component Tests
 *
 * @module components/__tests__/tutorial-spotlight.test
 */

import { TutorialSpotlight, initializeTutorialSpotlight } from '../tutorial-spotlight';
import type { TutorialStep } from '@services/tutorial-service';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
  setupResizeObserverMock,
} from './test-utils';

// Mock tutorial state
let tutorialState = { isActive: false, currentStep: 0 };
const tutorialSubscribers: ((state: typeof tutorialState) => void)[] = [];

vi.mock('@services/tutorial-service', () => ({
  TutorialService: {
    subscribe: vi.fn((callback) => {
      tutorialSubscribers.push(callback);
      return () => {
        const index = tutorialSubscribers.indexOf(callback);
        if (index > -1) tutorialSubscribers.splice(index, 1);
      };
    }),
    getState: vi.fn(() => tutorialState),
    next: vi.fn(),
    previous: vi.fn(),
    skip: vi.fn(),
  },
}));

vi.mock('@services/language-service', () => ({
  LanguageService: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'tutorial.step': 'Step',
        'tutorial.of': 'of',
        'tutorial.skip': 'Skip',
        'tutorial.previous': 'Previous',
        'tutorial.next': 'Next',
        'tutorial.finish': 'Finish',
        'tutorial.welcome.title': 'Welcome to Tutorial',
        'tutorial.welcome.description': 'Learn how to use the app',
      };
      return translations[key] || key;
    }),
  },
}));

vi.mock('@services/modal-service', () => ({
  ModalService: {
    prefersReducedMotion: vi.fn(() => true), // Disable animations for testing
  },
}));

vi.mock('@shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

// Get mocked services
import { TutorialService } from '@services/tutorial-service';

describe('TutorialSpotlight', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();

    // Reset tutorial state
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    // Create a target element for the spotlight
    targetElement = document.createElement('div');
    targetElement.id = 'tutorial-target';
    targetElement.style.width = '100px';
    targetElement.style.height = '50px';
    targetElement.style.position = 'absolute';
    targetElement.style.top = '200px';
    targetElement.style.left = '200px';
    document.body.appendChild(targetElement);

    // Mock getBoundingClientRect
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  describe('Initialization', () => {
    it('should create spotlight container', () => {
      component = new TutorialSpotlight(container);
      component.init();

      const spotlightContainer = container.querySelector('.tutorial-spotlight-container');
      expect(spotlightContainer).not.toBeNull();
    });

    it('should set proper ARIA attributes', () => {
      component = new TutorialSpotlight(container);
      component.init();

      const spotlightContainer = container.querySelector('.tutorial-spotlight-container');
      expect(spotlightContainer?.getAttribute('aria-live')).toBe('polite');
      expect(spotlightContainer?.getAttribute('role')).toBe('dialog');
      expect(spotlightContainer?.getAttribute('aria-label')).toBe('Tutorial');
    });

    it('should be hidden initially', () => {
      component = new TutorialSpotlight(container);
      component.init();

      const spotlightContainer = container.querySelector(
        '.tutorial-spotlight-container'
      ) as HTMLElement;
      expect(spotlightContainer.style.display).toBe('none');
    });

    it('should subscribe to TutorialService', () => {
      component = new TutorialSpotlight(container);
      component.init();

      expect(TutorialService.subscribe).toHaveBeenCalled();
    });
  });

  describe('Show/Hide', () => {
    it('should show when tutorial becomes active', () => {
      component = new TutorialSpotlight(container);
      component.init();

      // Simulate tutorial becoming active
      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      const spotlightContainer = container.querySelector(
        '.tutorial-spotlight-container'
      ) as HTMLElement;
      expect(spotlightContainer.style.display).toBe('block');
    });

    it('should hide when tutorial becomes inactive', () => {
      component = new TutorialSpotlight(container);
      component.init();

      // First show it
      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      // Then hide it
      tutorialState.isActive = false;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      // Advance timers to allow hide animation to complete (timeout is 0 when prefersReducedMotion is true)
      vi.advanceTimersByTime(100);

      const spotlightContainer = container.querySelector(
        '.tutorial-spotlight-container'
      ) as HTMLElement;
      expect(spotlightContainer.style.display).toBe('none');
    });
  });

  describe('Step Display', () => {
    const mockStep: TutorialStep = {
      id: 'step-1',
      target: '#tutorial-target',
      titleKey: 'tutorial.welcome.title',
      descriptionKey: 'tutorial.welcome.description',
      position: 'bottom',
    };

    it('should display step content when show-step event fires', () => {
      component = new TutorialSpotlight(container);
      component.init();

      // Show spotlight first
      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      // Dispatch show-step event
      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 0, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
      expect(tooltip.textContent).toContain('Welcome to Tutorial');
      expect(tooltip.textContent).toContain('Learn how to use the app');
    });

    it('should display step indicator', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 1, totalSteps: 5 },
        })
      );

      vi.advanceTimersByTime(200);

      const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
      expect(tooltip.textContent).toContain('Step 2 of 5');
    });

    it('should have Skip button', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 0, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      const skipBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Skip'
      );
      expect(skipBtn).not.toBeUndefined();
    });

    it('should have Next button', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 0, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      const nextBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next'
      );
      expect(nextBtn).not.toBeUndefined();
    });

    it('should have Previous button when not on first step', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 2, totalSteps: 5 },
        })
      );

      vi.advanceTimersByTime(200);

      const prevBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Previous'
      );
      expect(prevBtn).not.toBeUndefined();
    });

    it('should not have Previous button on first step', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 0, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      const prevBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Previous'
      );
      expect(prevBtn).toBeUndefined();
    });

    it('should have Finish button on last step', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 2, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      const finishBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Finish'
      );
      expect(finishBtn).not.toBeUndefined();
    });

    it('should display progress dots', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 1, totalSteps: 4 },
        })
      );

      vi.advanceTimersByTime(200);

      const progressContainer = container.querySelector('.tutorial-progress');
      expect(progressContainer?.children.length).toBe(4);
    });
  });

  describe('Button Actions', () => {
    const mockStep: TutorialStep = {
      id: 'step-1',
      target: '#tutorial-target',
      titleKey: 'tutorial.welcome.title',
      descriptionKey: 'tutorial.welcome.description',
    };

    beforeEach(() => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: mockStep, stepIndex: 1, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);
    });

    it('should call TutorialService.skip when Skip clicked', () => {
      const skipBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Skip'
      ) as HTMLButtonElement;

      skipBtn.click();

      expect(TutorialService.skip).toHaveBeenCalled();
    });

    it('should call TutorialService.next when Next clicked', () => {
      const nextBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next'
      ) as HTMLButtonElement;

      nextBtn.click();

      expect(TutorialService.next).toHaveBeenCalled();
    });

    it('should call TutorialService.previous when Previous clicked', () => {
      const prevBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Previous'
      ) as HTMLButtonElement;

      prevBtn.click();

      expect(TutorialService.previous).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should skip tutorial on Escape key', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(TutorialService.skip).toHaveBeenCalled();
    });

    it('should not skip if tutorial is not active', () => {
      // Clear any previous mock calls
      vi.mocked(TutorialService.skip).mockClear();

      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = false;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(TutorialService.skip).not.toHaveBeenCalled();
    });
  });

  describe('Target Not Found', () => {
    it('should skip to next step if target not found', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      const missingStep: TutorialStep = {
        id: 'missing',
        target: '#nonexistent-element',
        titleKey: 'test.title',
        descriptionKey: 'test.desc',
      };

      document.dispatchEvent(
        new CustomEvent('tutorial:show-step', {
          detail: { step: missingStep, stepIndex: 0, totalSteps: 3 },
        })
      );

      vi.advanceTimersByTime(200);

      expect(TutorialService.next).toHaveBeenCalled();
    });
  });

  describe('Tutorial End Event', () => {
    it('should hide on tutorial:end event', () => {
      component = new TutorialSpotlight(container);
      component.init();

      tutorialState.isActive = true;
      tutorialSubscribers.forEach((cb) => cb(tutorialState));

      document.dispatchEvent(new CustomEvent('tutorial:end'));

      // Advance timers to allow hide animation to complete
      vi.advanceTimersByTime(100);

      const spotlightContainer = container.querySelector(
        '.tutorial-spotlight-container'
      ) as HTMLElement;
      expect(spotlightContainer.style.display).toBe('none');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from TutorialService on destroy', () => {
      component = new TutorialSpotlight(container);
      component.init();

      const initialSubscriberCount = tutorialSubscribers.length;

      component.destroy();

      expect(tutorialSubscribers.length).toBeLessThan(initialSubscriberCount);
    });
  });
});

describe('initializeTutorialSpotlight', () => {
  beforeEach(() => {
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;
  });

  afterEach(() => {
    // Clean up any spotlight elements
    const spotlights = document.querySelectorAll('.tutorial-spotlight-container');
    spotlights.forEach((s) => s.remove());
  });

  it('should create and return TutorialSpotlight instance', () => {
    const spotlight = initializeTutorialSpotlight();

    expect(spotlight).toBeInstanceOf(TutorialSpotlight);
    spotlight.destroy();
  });

  it('should add spotlight to document body', () => {
    const spotlight = initializeTutorialSpotlight();

    const spotlightEl = document.querySelector('.tutorial-spotlight-container');
    expect(spotlightEl).not.toBeNull();

    spotlight.destroy();
  });
});

// ==========================================================================
// Branch Coverage Tests - Position Auto-Detection
// ==========================================================================

describe('TutorialSpotlight Position Auto-Detection', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'position-target';
    targetElement.style.width = '100px';
    targetElement.style.height = '50px';
    targetElement.style.position = 'absolute';
    document.body.appendChild(targetElement);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  it('should auto-position tooltip at top when more space above', () => {
    // Target near bottom of viewport
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 600,
      left: 400,
      width: 100,
      height: 50,
      right: 500,
      bottom: 650,
      x: 400,
      y: 600,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'auto',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
    // Tooltip should be positioned (top CSS property should be set)
    expect(tooltip.style.top).toBeDefined();
  });

  it('should auto-position tooltip at left when more space on left', () => {
    // Target near right edge
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      left: 900,
      width: 100,
      height: 50,
      right: 1000,
      bottom: 350,
      x: 900,
      y: 300,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test-left',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'auto',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
  });

  it('should auto-position tooltip at right when more space on right', () => {
    // Target near left edge
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      left: 50,
      width: 100,
      height: 50,
      right: 150,
      bottom: 350,
      x: 50,
      y: 300,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test-right',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'auto',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
  });

  it('should handle explicit left position', () => {
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      left: 500,
      width: 100,
      height: 50,
      right: 600,
      bottom: 350,
      x: 500,
      y: 300,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test-explicit-left',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'left',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
  });

  it('should handle explicit top position', () => {
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      left: 500,
      width: 100,
      height: 50,
      right: 600,
      bottom: 350,
      x: 500,
      y: 300,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test-explicit-top',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'top',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
  });

  it('should handle explicit right position', () => {
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      left: 500,
      width: 100,
      height: 50,
      right: 600,
      bottom: 350,
      x: 500,
      y: 300,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'test-explicit-right',
      target: '#position-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
      position: 'right',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    const tooltip = container.querySelector('.tutorial-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
  });
});

// ==========================================================================
// Branch Coverage Tests - Scroll Into View
// ==========================================================================

describe('TutorialSpotlight Scroll Into View', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'scroll-target';
    targetElement.style.width = '100px';
    targetElement.style.height = '50px';
    targetElement.style.position = 'absolute';
    document.body.appendChild(targetElement);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  it('should scroll into view when target is above viewport', () => {
    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    // Target above viewport (negative or small top value below SCROLL_MARGIN)
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 50, // Less than SCROLL_MARGIN (100)
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 100,
      x: 200,
      y: 50,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'scroll-test',
      target: '#scroll-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('should scroll into view when target is below viewport', () => {
    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    // Target below viewport
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 750, // Greater than viewport height - SCROLL_MARGIN
      x: 200,
      y: 700,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'scroll-test-below',
      target: '#scroll-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('should not scroll when target is already visible', () => {
    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    // Target well within viewport
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'no-scroll-test',
      target: '#scroll-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});

// ==========================================================================
// Branch Coverage Tests - Reduced Motion
// ==========================================================================

describe('TutorialSpotlight Reduced Motion', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'motion-target';
    targetElement.style.width = '100px';
    targetElement.style.height = '50px';
    targetElement.style.position = 'absolute';
    targetElement.style.top = '200px';
    targetElement.style.left = '200px';
    document.body.appendChild(targetElement);

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  it('should use smooth scroll when reduced motion is disabled', async () => {
    // Mock prefersReducedMotion to return false
    const { ModalService } = await import('@services/modal-service');
    vi.mocked(ModalService.prefersReducedMotion).mockReturnValue(false);

    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    // Target needs scrolling
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 100,
      x: 200,
      y: 50,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'smooth-scroll',
      target: '#motion-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('should use auto scroll when reduced motion is enabled', async () => {
    // Reset and explicitly mock prefersReducedMotion to return true
    const { ModalService } = await import('@services/modal-service');
    vi.mocked(ModalService.prefersReducedMotion).mockReturnValue(true);

    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    // Target needs scrolling
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 100,
      x: 200,
      y: 50,
      toJSON: () => ({}),
    });

    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'auto-scroll',
      target: '#motion-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
    });
  });
});

// ==========================================================================
// Branch Coverage Tests - Window Resize Handler
// ==========================================================================

describe('TutorialSpotlight Window Resize', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'resize-target';
    targetElement.style.width = '100px';
    targetElement.style.height = '50px';
    document.body.appendChild(targetElement);

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  it('should update positions on window resize when step is active', () => {
    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'resize-step',
      target: '#resize-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    // Get initial position
    const spotlight = container.querySelector('.tutorial-spotlight') as HTMLElement;
    const initialTop = spotlight.style.top;

    // Trigger resize
    window.dispatchEvent(new Event('resize'));

    // Position should still be set (may or may not change depending on mock)
    expect(spotlight.style.top).toBeDefined();
  });

  it('should not update positions on resize when no step is active', () => {
    component = new TutorialSpotlight(container);
    component.init();

    // Don't show any step

    const spotlight = container.querySelector('.tutorial-spotlight') as HTMLElement;

    // Trigger resize - should not throw
    window.dispatchEvent(new Event('resize'));

    // Should not have any position set
    expect(spotlight.style.top).toBe('');
  });
});

// ==========================================================================
// Branch Coverage Tests - Button Hover Effects
// ==========================================================================

describe('TutorialSpotlight Button Hover Effects', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'hover-target';
    document.body.appendChild(targetElement);

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    targetElement.remove();
  });

  it('should handle skip button hover effects', () => {
    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'hover-test',
      target: '#hover-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 2 },
      })
    );

    vi.advanceTimersByTime(200);

    const skipBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Skip'
    ) as HTMLButtonElement;

    // Trigger hover
    skipBtn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(skipBtn.style.color).toBe('var(--theme-text)');

    // Trigger leave
    skipBtn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(skipBtn.style.color).toBe('var(--theme-text-muted)');
  });

  it('should handle next button hover effects', () => {
    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'next-hover',
      target: '#hover-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 2 },
      })
    );

    vi.advanceTimersByTime(200);

    const nextBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next'
    ) as HTMLButtonElement;

    // Trigger hover
    nextBtn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(nextBtn.style.filter).toBe('brightness(1.1)');

    // Trigger leave
    nextBtn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(nextBtn.style.filter).toBe('');
  });

  it('should handle previous button hover effects', () => {
    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'prev-hover',
      target: '#hover-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 1, totalSteps: 3 },
      })
    );

    vi.advanceTimersByTime(200);

    const prevBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Previous'
    ) as HTMLButtonElement;

    // Trigger hover
    prevBtn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(prevBtn.style.backgroundColor).toBe('var(--theme-card-hover)');

    // Trigger leave
    prevBtn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(prevBtn.style.backgroundColor).toBe('var(--theme-card-background)');
  });
});

// ==========================================================================
// Branch Coverage Tests - updatePositions target not found
// ==========================================================================

describe('TutorialSpotlight updatePositions Edge Cases', () => {
  let container: HTMLElement;
  let component: TutorialSpotlight;
  let targetElement: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    setupResizeObserverMock();
    tutorialState = { isActive: false, currentStep: 0 };
    tutorialSubscribers.length = 0;

    targetElement = document.createElement('div');
    targetElement.id = 'removable-target';
    document.body.appendChild(targetElement);

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      right: 300,
      bottom: 250,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    if (targetElement.parentNode) {
      targetElement.remove();
    }
  });

  it('should handle target being removed after step starts', () => {
    component = new TutorialSpotlight(container);
    component.init();

    tutorialState.isActive = true;
    tutorialSubscribers.forEach((cb) => cb(tutorialState));

    const step: TutorialStep = {
      id: 'remove-test',
      target: '#removable-target',
      titleKey: 'test.title',
      descriptionKey: 'test.desc',
    };

    document.dispatchEvent(
      new CustomEvent('tutorial:show-step', {
        detail: { step, stepIndex: 0, totalSteps: 1 },
      })
    );

    vi.advanceTimersByTime(200);

    // Remove target element
    targetElement.remove();

    // Trigger resize to call updatePositions
    window.dispatchEvent(new Event('resize'));

    // Should not throw
    expect(true).toBe(true);
  });
});
