/**
 * XIV Dye Tools v2.0.0 - Color Wheel Display Component
 *
 * Phase 12: Architecture Refactor
 * Visualizes color harmony relationships on an interactive color wheel
 *
 * @module components/color-wheel-display
 */

import { BaseComponent } from './base-component';
import { ColorService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Color Wheel Display Component
 * Shows color harmony relationships on an SVG color wheel
 */
export class ColorWheelDisplay extends BaseComponent {
  private baseColor: string;
  private harmonyDyes: Dye[];
  private harmonyType: string;
  private wheelSize: number = 200;
  private wheelCenter: number = 100;
  private wheelRadius: number = 80;

  constructor(
    container: HTMLElement,
    baseColor: string,
    harmonyDyes: Dye[],
    harmonyType: string,
    size: number = 200
  ) {
    super(container);
    this.baseColor = baseColor;
    this.harmonyDyes = harmonyDyes;
    this.harmonyType = harmonyType;
    this.wheelSize = size;
    this.wheelCenter = size / 2;
    this.wheelRadius = size / 2.5;
  }

  /**
   * Render the color wheel component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'flex justify-center',
    });

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.wheelSize} ${this.wheelSize}`);
    svg.setAttribute('width', String(this.wheelSize));
    svg.setAttribute('height', String(this.wheelSize));
    svg.classList.add('color-wheel');

    // Draw color segments (60 segments = 6° each)
    const segments = 60;
    for (let i = 0; i < segments; i++) {
      const hue = (i / segments) * 360;
      const angle1 = ((i / segments) * 360 - 90) * (Math.PI / 180);
      const angle2 = (((i + 1) / segments) * 360 - 90) * (Math.PI / 180);

      // Create path for the segment
      const x1 = this.wheelCenter + this.wheelRadius * Math.cos(angle1);
      const y1 = this.wheelCenter + this.wheelRadius * Math.sin(angle1);
      const x2 = this.wheelCenter + this.wheelRadius * Math.cos(angle2);
      const y2 = this.wheelCenter + this.wheelRadius * Math.sin(angle2);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const pathData = `M ${this.wheelCenter} ${this.wheelCenter} L ${x1} ${y1} A ${this.wheelRadius} ${this.wheelRadius} 0 0 1 ${x2} ${y2} Z`;
      path.setAttribute('d', pathData);
      path.setAttribute('fill', `hsl(${hue}, 100%, 50%)`);
      path.setAttribute('opacity', '0.7');
      svg.appendChild(path);
    }

    // Get base color hue
    const baseRgb = ColorService.hexToRgb(this.baseColor);
    const baseHsv = ColorService.rgbToHsv(baseRgb.r, baseRgb.g, baseRgb.b);
    const baseHue = baseHsv.h;

    // Draw connection lines from base to harmony colors
    for (const dye of this.harmonyDyes) {
      const harmonyRgb = ColorService.hexToRgb(dye.hex);
      const harmonyHsv = ColorService.rgbToHsv(harmonyRgb.r, harmonyRgb.g, harmonyRgb.b);
      const harmonyHue = harmonyHsv.h;

      const baseAngle = (baseHue - 90) * (Math.PI / 180);
      const harmonyAngle = (harmonyHue - 90) * (Math.PI / 180);

      const x1 = this.wheelCenter + this.wheelRadius * 0.4 * Math.cos(baseAngle);
      const y1 = this.wheelCenter + this.wheelRadius * 0.4 * Math.sin(baseAngle);
      const x2 = this.wheelCenter + this.wheelRadius * Math.cos(harmonyAngle);
      const y2 = this.wheelCenter + this.wheelRadius * Math.sin(harmonyAngle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', 'rgba(100, 100, 100, 0.6)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(line);
    }

    // Draw color dots for harmony colors
    for (const dye of this.harmonyDyes) {
      const harmonyRgb = ColorService.hexToRgb(dye.hex);
      const harmonyHsv = ColorService.rgbToHsv(harmonyRgb.r, harmonyRgb.g, harmonyRgb.b);
      const harmonyHue = harmonyHsv.h;

      const harmonyAngle = (harmonyHue - 90) * (Math.PI / 180);
      const x = this.wheelCenter + this.wheelRadius * Math.cos(harmonyAngle);
      const y = this.wheelCenter + this.wheelRadius * Math.sin(harmonyAngle);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', dye.hex);
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      circle.classList.add('cursor-pointer');

      // Add tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = dye.name;
      circle.appendChild(title);

      svg.appendChild(circle);
    }

    // Draw base color dot (larger)
    const baseAngle = (baseHue - 90) * (Math.PI / 180);
    const baseDotRadius = this.wheelRadius * 0.4;
    const baseX = this.wheelCenter + baseDotRadius * Math.cos(baseAngle);
    const baseY = this.wheelCenter + baseDotRadius * Math.sin(baseAngle);

    const baseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    baseCircle.setAttribute('cx', String(baseX));
    baseCircle.setAttribute('cy', String(baseY));
    baseCircle.setAttribute('r', '10');
    baseCircle.setAttribute('fill', this.baseColor);
    baseCircle.setAttribute('stroke', 'white');
    baseCircle.setAttribute('stroke-width', '2');
    svg.appendChild(baseCircle);

    wrapper.appendChild(svg);
    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   * Color wheel is a static visualization with no interactive elements
   */
  bindEvents(): void {
    // No event binding needed for color wheel display
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      baseColor: this.baseColor,
      harmonyType: this.harmonyType,
      dyeCount: this.harmonyDyes.length,
    };
  }
}
