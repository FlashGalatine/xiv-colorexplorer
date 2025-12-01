import { MarketBoard } from '../components/market-board';
import { PriceData } from '@shared/types';
import { BaseComponent } from '../components/base-component';

export interface PricingState {
    showPrices: boolean;
    priceData: Map<number, PriceData>;
    marketBoard: MarketBoard | null;
    onPricesLoaded?: () => void;
    initMarketBoard(container: HTMLElement): Promise<void>;
    setupMarketBoardListeners(container: HTMLElement): void;
    fetchPrices(): Promise<void>;
    cleanupMarketBoard(): void;
}

export const PricingMixin = {
    async initMarketBoard(this: BaseComponent & PricingState, container: HTMLElement): Promise<void> {
        if (!this.marketBoard) {
            this.marketBoard = new MarketBoard(container);
            await this.marketBoard.loadServerData();
            this.marketBoard.init();
            this.setupMarketBoardListeners(container);

            // Get initial showPrices state
            this.showPrices = this.marketBoard.getShowPrices();
        }
    },

    setupMarketBoardListeners(this: BaseComponent & PricingState, container: HTMLElement): void {
        container.addEventListener('toggle-prices', (event: Event) => {
            const customEvent = event as CustomEvent;
            this.showPrices = customEvent.detail?.showPrices ?? false;
            if (this.showPrices) {
                void this.fetchPrices();
            } else {
                this.priceData.clear();
                this.onPricesLoaded?.();
            }
        });

        container.addEventListener('server-changed', () => {
            if (this.showPrices) {
                void this.fetchPrices();
            }
        });

        container.addEventListener('categories-changed', () => {
            if (this.showPrices) {
                void this.fetchPrices();
            }
        });

        container.addEventListener('refresh-requested', () => {
            if (this.showPrices) {
                void this.fetchPrices();
            }
        });
    },

    async fetchPrices(this: BaseComponent & PricingState): Promise<void> {
        // This method should be overridden or implemented by the component
        // to fetch prices for the specific items it cares about.
        // However, since the logic varies (matchedDyes vs selectedDyes),
        // we might need to make this abstract or expect the component to implement a specific method.

        // Let's assume the component implements a method to fetch prices
        // or we can emit an event or call a callback.

        // Actually, looking at the tools:
        // ColorMatcherTool: fetchPricesForMatchedDyes()
        // HarmonyGeneratorTool: fetchPricesForCurrentDyes()
        // DyeComparisonTool: fetchPricesForSelectedDyes()

        // We can define a standard method name like `updatePrices()` that the component must implement.
        if (typeof (this as any).updatePrices === 'function') {
            await (this as any).updatePrices();
        }
    },

    cleanupMarketBoard(this: BaseComponent & PricingState): void {
        if (this.marketBoard) {
            this.marketBoard.destroy();
            this.marketBoard = null;
        }
        this.priceData.clear();
    }
};
