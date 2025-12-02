import { DyeCardRenderer, type DyeCardOptions } from '../dye-card-renderer';
import { Dye } from '@shared/types';
import {
  createTestContainer,
  cleanupTestContainer,
  createComponent,
  cleanupComponent,
  expectElement,
  mockDyeData,
} from './test-utils';

// Mock Services
vi.mock('@services/index', async () => {
  return {
    LanguageService: {
      t: (key: string) => key,
      getDyeName: (id: number) => `Dye ${id}`,
      getCategory: (cat: string) => cat,
    },
    ColorService: {
      getColorDistance: () => 10.5,
    },
    APIService: {
      formatPrice: (price: number) => `${price}g`,
    },
  };
});

describe('DyeCardRenderer', () => {
  let container: HTMLElement;
  let component: DyeCardRenderer;
  const mockDye: Dye = mockDyeData[0];

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  describe('Rendering', () => {
    it('should render basic dye card', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({ dye: mockDye });
      container.appendChild(card);

      expect(card).not.toBeNull();
      expect(card.querySelector('.dye-swatch')).not.toBeNull();
      expect(card.textContent).toContain(`Dye ${mockDye.itemID}`);
    });

    it('should render sampled color swatch', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({
        dye: mockDye,
        sampledColor: '#FF0000',
      });
      container.appendChild(card);

      const swatches = card.querySelectorAll('.w-8.h-8');
      expect(swatches.length).toBe(2); // Sampled + Dye
    });

    it('should render distance info', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({
        dye: mockDye,
        sampledColor: '#FF0000',
      });
      container.appendChild(card);

      expect(card.textContent).toContain('matcher.distance: 10.5');
    });

    it('should render price when enabled', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({
        dye: mockDye,
        showPrice: true,
        price: { currentAverage: 500, lastUpdate: 0, world: 'Test' },
      });
      container.appendChild(card);

      expect(card.textContent).toContain('500g');
      expect(card.textContent).toContain('matcher.market');
    });

    it('should render N/A price when missing data', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({
        dye: mockDye,
        showPrice: true,
        price: undefined,
      });
      container.appendChild(card);

      expect(card.textContent).toContain('N/A');
    });

    it('should render extra info string', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const card = component.render({
        dye: mockDye,
        extraInfo: 'Extra Info',
      });
      container.appendChild(card);

      expect(card.textContent).toContain('Extra Info');
    });

    it('should render extra info element', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const extraEl = document.createElement('span');
      extraEl.textContent = 'Element Info';

      const card = component.render({
        dye: mockDye,
        extraInfo: extraEl,
      });
      container.appendChild(card);

      expect(card.textContent).toContain('Element Info');
    });

    it('should render actions', () => {
      [component, container] = createComponent(DyeCardRenderer);
      const actionBtn = document.createElement('button');
      actionBtn.textContent = 'Action';

      const card = component.render({
        dye: mockDye,
        actions: [actionBtn],
      });
      container.appendChild(card);

      expect(card.textContent).toContain('Action');
    });
  });

  describe('Events', () => {
    it('should handle hover events', () => {
      const onHover = vi.fn();
      [component, container] = createComponent(DyeCardRenderer);

      const card = component.render({
        dye: mockDye,
        onHover,
      });
      container.appendChild(card);

      card.dispatchEvent(new Event('mouseenter'));
      expect(onHover).toHaveBeenCalledWith(mockDye, true);

      card.dispatchEvent(new Event('mouseleave'));
      expect(onHover).toHaveBeenCalledWith(mockDye, false);
    });

    it('should handle click events', () => {
      const onClick = vi.fn();
      [component, container] = createComponent(DyeCardRenderer);

      const card = component.render({
        dye: mockDye,
        onClick,
      });
      container.appendChild(card);

      card.click();
      expect(onClick).toHaveBeenCalledWith(mockDye);
    });
  });
});
