/**
 * XIV Dye Tools v2.0.0 - Components Module
 *
 * Centralized exports for all UI components
 *
 * @module components
 */

export {
  BaseComponent,
  type ElementOptions,
  type EventHandler,
  type ComponentLifecycle,
} from './base-component';
export { AppLayout } from './app-layout';
export { ThemeSwitcher } from './theme-switcher';
export { LanguageSelector } from './language-selector';
export { DyeSelector, type DyeSelectorOptions } from './dye-selector';
export { ColorDisplay, type ColorDisplayOptions } from './color-display';
export { HarmonyType, type HarmonyTypeInfo } from './harmony-type';
export { HarmonyGeneratorTool } from './harmony-generator-tool';
export { ColorDistanceMatrix } from './color-distance-matrix';
export { DyeComparisonChart, type ChartType } from './dye-comparison-chart';
export { DyeComparisonTool } from './dye-comparison-tool';
export { ColorInterpolationDisplay, type InterpolationStep } from './color-interpolation-display';
export { DyeMixerTool } from './dye-mixer-tool';
export { ColorblindnessDisplay, type VisionTypeInfo } from './colorblindness-display';
export {
  AccessibilityCheckerTool,
  type DyeAccessibilityResult,
  type DyePairResult,
} from './accessibility-checker-tool';
export { ImageUploadDisplay } from './image-upload-display';
export { ColorPickerDisplay } from './color-picker-display';
export { ColorMatcherTool } from './color-matcher-tool';
export { ColorWheelDisplay } from './color-wheel-display';
export { MobileBottomNav, type MobileToolDef } from './mobile-bottom-nav';
export { ToolsDropdown, type ToolDef } from './tools-dropdown';
export { MarketBoard } from './market-board';
export { PaletteExporter, type PaletteData, type PaletteExporterOptions } from './palette-exporter';
export { ModalContainer } from './modal-container';
export { WelcomeModal, showWelcomeIfFirstVisit } from './welcome-modal';
export { ChangelogModal, showChangelogIfUpdated } from './changelog-modal';
export {
  createInfoIcon,
  createLabelWithInfo,
  addInfoIconTo,
  TOOLTIP_CONTENT,
  type InfoTooltipOptions,
} from './info-tooltip';
export { DyePreviewOverlay } from './dye-preview-overlay';
export {
  createDyeActionDropdown,
  type DyeAction,
  type DyeActionCallback,
} from './dye-action-dropdown';
export { TutorialSpotlight, initializeTutorialSpotlight } from './tutorial-spotlight';
export { offlineBanner } from './offline-banner';
export {
  showCollectionManagerModal,
  showCreateCollectionDialog,
} from './collection-manager-modal';
export {
  showAddToCollectionMenu,
  closeAddToCollectionMenu,
  isAddToCollectionMenuOpen,
  type AddToCollectionMenuOptions,
} from './add-to-collection-menu';
