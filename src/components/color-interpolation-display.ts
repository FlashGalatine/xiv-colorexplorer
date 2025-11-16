/**
 * XIV Dye Tools v2.0.0 - Color Interpolation Display Component
 *
 * Phase 12: Architecture Refactor
 * Displays color gradient and matching intermediate dyes
 *
 * @module components/color-interpolation-display
 */

import { BaseComponent } from './base-component';
import { ColorService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Interpolation step with dye match
 */
export interface InterpolationStep {
  position: number; // 0-1
  theoreticalColor: string;
  matchedDye: Dye | null;
  distance: number; // Distance from theoretical color
}

/**
 * Color Interpolation Display Component
 * Shows gradient and matching dyes for color transition
 */
export class ColorInterpolationDisplay extends BaseComponent {
  private startColor: string = '#FF0000';
  private endColor: string = '#0000FF';
  private steps: InterpolationStep[] = [];
  private colorSpace: 'rgb' | 'hsv' = 'hsv';

  constructor(
    container: HTMLElement,
    startColor: string = '#FF0000',
    endColor: string = '#0000FF',
    steps: InterpolationStep[] = [],
    colorSpace: 'rgb' | 'hsv' = 'hsv'
  ) {
    super(container);
    this.startColor = startColor;
    this.endColor = endColor;
    this.steps = steps;
    this.colorSpace = colorSpace;
  }

  /**
   * Render the interpolation display
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-4',
    });

    // Title
    const title = this.createElement('h3', {
      textContent: `Color Transition (${this.colorSpace.toUpperCase()} Space)`,
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });
    wrapper.appendChild(title);

    if (this.steps.length === 0) {
      const emptyState = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'No interpolation data available',
      });
      wrapper.appendChild(emptyState);
      this.container.innerHTML = '';
      this.element = wrapper;
      this.container.appendChild(this.element);
      return;
    }

    // Gradient bar
    const gradientBar = this.renderGradientBar();
    wrapper.appendChild(gradientBar);

    // Steps list
    const stepsList = this.renderStepsList();
    wrapper.appendChild(stepsList);

    // Quality metrics
    const metrics = this.renderMetrics();
    wrapper.appendChild(metrics);

    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Render the gradient bar
   */
  private renderGradientBar(): HTMLElement {
    const container = this.createElement('div', {
      className: 'space-y-2',
    });

    // Gradient display
    const label = this.createElement('div', {
      textContent: 'Color Gradient',
      className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    });

    const gradient = this.createElement('div', {
      className: 'h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md',
    });

    // Build gradient stops
    const gradientStops = this.steps
      .map((step) => `${step.theoreticalColor} ${Math.round(step.position * 100)}%`)
      .join(', ');

    gradient.style.background = `linear-gradient(to right, ${gradientStops})`;

    // Start and end labels
    const labels = this.createElement('div', {
      className: 'flex justify-between text-xs text-gray-600 dark:text-gray-400',
    });

    const startLabel = this.createElement('div', {
      className: 'flex items-center gap-1',
    });
    const startSwatch = this.createElement('div', {
      className: 'w-3 h-3 rounded border border-gray-400',
      attributes: {
        style: `background-color: ${this.startColor}`,
      },
    });
    const startText = this.createElement('span', { textContent: 'Start' });
    startLabel.appendChild(startSwatch);
    startLabel.appendChild(startText);

    const endLabel = this.createElement('div', {
      className: 'flex items-center gap-1',
    });
    const endSwatch = this.createElement('div', {
      className: 'w-3 h-3 rounded border border-gray-400',
      attributes: {
        style: `background-color: ${this.endColor}`,
      },
    });
    const endText = this.createElement('span', { textContent: 'End' });
    endLabel.appendChild(endSwatch);
    endLabel.appendChild(endText);

    labels.appendChild(startLabel);
    labels.appendChild(endLabel);

    container.appendChild(label);
    container.appendChild(gradient);
    container.appendChild(labels);

    return container;
  }

  /**
   * Render the steps list
   */
  private renderStepsList(): HTMLElement {
    const container = this.createElement('div', {
      className: 'space-y-2',
    });

    const label = this.createElement('div', {
      textContent: 'Intermediate Dyes',
      className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    });
    container.appendChild(label);

    const listContainer = this.createElement('div', {
      className: 'space-y-1 max-h-80 overflow-y-auto',
    });

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const item = this.renderStepItem(step, i);
      listContainer.appendChild(item);
    }

    container.appendChild(listContainer);

    return container;
  }

  /**
   * Render a single step item
   */
  private renderStepItem(step: InterpolationStep, index: number): HTMLElement {
    const item = this.createElement('div', {
      className:
        'flex items-center gap-3 p-2 rounded border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
    });

    // Position indicator
    const position = this.createElement('div', {
      textContent: `${Math.round(step.position * 100)}%`,
      className: 'text-xs font-bold text-gray-600 dark:text-gray-400 w-10 text-center',
    });
    item.appendChild(position);

    // Theoretical color swatch
    const theoreticalSwatch = this.createElement('div', {
      className: 'w-6 h-6 rounded border border-gray-300 dark:border-gray-600',
      attributes: {
        style: `background-color: ${step.theoreticalColor}`,
        title: `Theoretical: ${step.theoreticalColor}`,
      },
    });
    item.appendChild(theoreticalSwatch);

    if (step.matchedDye) {
      // Arrow
      const arrow = this.createElement('span', {
        textContent: '→',
        className: 'text-gray-400',
      });
      item.appendChild(arrow);

      // Matched dye swatch
      const matchedSwatch = this.createElement('div', {
        className: 'w-6 h-6 rounded border-2 border-gray-400',
        attributes: {
          style: `background-color: ${step.matchedDye.hex}`,
          title: step.matchedDye.hex,
        },
      });
      item.appendChild(matchedSwatch);

      // Dye info
      const info = this.createElement('div', {
        className: 'flex-1 min-w-0',
      });

      const name = this.createElement('div', {
        textContent: step.matchedDye.name,
        className: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
      });

      const distance = this.createElement('div', {
        textContent: `Distance: ${step.distance.toFixed(1)}`,
        className: `text-xs ${this.getDistanceColor(step.distance)} font-mono`,
      });

      info.appendChild(name);
      info.appendChild(distance);
      item.appendChild(info);
    } else {
      // No match found
      const noMatch = this.createElement('div', {
        textContent: 'No close match',
        className: 'text-xs text-gray-500 dark:text-gray-400 italic flex-1',
      });
      item.appendChild(noMatch);
    }

    return item;
  }

  /**
   * Get color class for distance
   */
  private getDistanceColor(distance: number): string {
    if (distance <= 30) {
      return 'text-green-600 dark:text-green-400';
    }
    if (distance <= 60) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (distance <= 100) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-red-600 dark:text-red-400';
  }

  /**
   * Render quality metrics
   */
  private renderMetrics(): HTMLElement {
    const container = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2',
    });

    const title = this.createElement('div', {
      textContent: 'Transition Quality',
      className: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    });
    container.appendChild(title);

    // Calculate metrics
    let matchedCount = 0;
    let totalDistance = 0;
    let maxDistance = 0;

    for (const step of this.steps) {
      if (step.matchedDye) {
        matchedCount++;
        totalDistance += step.distance;
        maxDistance = Math.max(maxDistance, step.distance);
      }
    }

    const avgDistance = matchedCount > 0 ? totalDistance / matchedCount : 0;
    const coverage = (matchedCount / this.steps.length) * 100;

    // Coverage
    const coverageDiv = this.createElement('div', {
      className: 'space-y-1',
    });

    const coverageLabel = this.createElement('div', {
      textContent: `Coverage: ${coverage.toFixed(0)}% (${matchedCount}/${this.steps.length} matched)`,
      className: 'text-xs text-gray-700 dark:text-gray-300',
    });

    const coverageBar = this.createElement('div', {
      className: 'h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    });

    const coverageFill = this.createElement('div', {
      className: 'h-full bg-blue-500',
      attributes: {
        style: `width: ${coverage}%`,
      },
    });

    coverageBar.appendChild(coverageFill);
    coverageDiv.appendChild(coverageLabel);
    coverageDiv.appendChild(coverageBar);
    container.appendChild(coverageDiv);

    // Average distance
    const avgDiv = this.createElement('div', {
      className: 'flex justify-between text-xs text-gray-700 dark:text-gray-300',
    });

    const avgLabel = this.createElement('span', {
      textContent: 'Average Distance:',
    });

    const avgValue = this.createElement('span', {
      textContent: avgDistance.toFixed(1),
      className: 'font-mono',
    });

    avgDiv.appendChild(avgLabel);
    avgDiv.appendChild(avgValue);
    container.appendChild(avgDiv);

    // Max distance
    const maxDiv = this.createElement('div', {
      className: 'flex justify-between text-xs text-gray-700 dark:text-gray-300',
    });

    const maxLabel = this.createElement('span', {
      textContent: 'Max Distance:',
    });

    const maxValue = this.createElement('span', {
      textContent: maxDistance.toFixed(1),
      className: 'font-mono',
    });

    maxDiv.appendChild(maxLabel);
    maxDiv.appendChild(maxValue);
    container.appendChild(maxDiv);

    return container;
  }

  /**
   * Update interpolation data
   */
  updateInterpolation(startColor: string, endColor: string, steps: InterpolationStep[]): void {
    this.startColor = startColor;
    this.endColor = endColor;
    this.steps = steps;
    this.update();
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Add interactivity if needed
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      startColor: this.startColor,
      endColor: this.endColor,
      stepCount: this.steps.length,
      colorSpace: this.colorSpace,
    };
  }
}
