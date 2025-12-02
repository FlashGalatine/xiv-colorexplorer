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
