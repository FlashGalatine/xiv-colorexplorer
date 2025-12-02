/**
 * Type definitions for experimental Browser APIs
 */

export interface EyeDropper {
  open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
}

export interface EyeDropperConstructor {
  new (): EyeDropper;
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}
