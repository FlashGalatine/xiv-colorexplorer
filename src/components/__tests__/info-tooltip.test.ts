import {
  createInfoIcon,
  createLabelWithInfo,
  addInfoIconTo,
  TOOLTIP_CONTENT,
} from '../info-tooltip';
import { TooltipService } from '@services/tooltip-service';
import { createTestContainer, cleanupTestContainer } from './test-utils';

// Mock TooltipService
vi.mock('@services/tooltip-service', () => ({
  TooltipService: {
    attach: vi.fn(),
  },
}));

describe('InfoTooltip', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  describe('createInfoIcon', () => {
    it('should create an icon button', () => {
      const icon = createInfoIcon({ content: 'Test tooltip' });

      expect(icon.tagName).toBe('BUTTON');
      expect(icon.textContent).toBe('ⓘ');
      expect(icon.classList.contains('info-tooltip-icon')).toBe(true);
    });

    it('should attach tooltip via service', () => {
      const icon = createInfoIcon({
        content: 'Test content',
        position: 'top',
        ariaLabel: 'Help',
      });

      expect(TooltipService.attach).toHaveBeenCalledWith(icon, {
        content: 'Test content',
        position: 'top',
        showOnFocus: true,
      });

      expect(icon.getAttribute('aria-label')).toBe('Help');
    });

    it('should use default aria-label if not provided', () => {
      const icon = createInfoIcon({ content: 'Test' });
      expect(icon.getAttribute('aria-label')).toBe('More information');
    });
  });

  describe('createLabelWithInfo', () => {
    it('should create container with label and icon', () => {
      const element = createLabelWithInfo('Label Text', 'Tooltip Content');

      expect(element.tagName).toBe('SPAN');
      expect(element.classList.contains('inline-flex')).toBe(true);

      const label = element.firstElementChild;
      expect(label?.textContent).toBe('Label Text');

      const icon = element.querySelector('button');
      expect(icon).not.toBeNull();
      expect(TooltipService.attach).toHaveBeenCalled();
    });
  });

  describe('addInfoIconTo', () => {
    it('should append icon to element', () => {
      const parent = document.createElement('div');
      const icon = addInfoIconTo(parent, 'Tooltip Content');

      expect(parent.contains(icon)).toBe(true);
      expect(icon.tagName).toBe('BUTTON');
      expect(TooltipService.attach).toHaveBeenCalled();
    });
  });

  describe('Constants', () => {
    it('should export TOOLTIP_CONTENT', () => {
      expect(TOOLTIP_CONTENT).toBeDefined();
      expect(TOOLTIP_CONTENT.deviance).toBeDefined();
    });
  });
});
