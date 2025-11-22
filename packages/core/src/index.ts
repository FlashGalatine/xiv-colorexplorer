// Services
export { ColorService } from './services/ColorService.js';
export { DyeService } from './services/DyeService.js';
export { APIService, MemoryCacheBackend } from './services/APIService.js';
export type { ICacheBackend } from './services/APIService.js';

// Types
export type {
    Dye,
    RGB,
    HSV,
    HexColor,
    VisionType,
    Matrix3x3,
    ColorblindMatrices,
    ErrorSeverity,
    PriceData,
    CachedData,
} from './types/index.js';
export { AppError, ErrorCode, createHexColor } from './types/index.js';

// Constants
export {
    RGB_MIN,
    RGB_MAX,
    HUE_MIN,
    HUE_MAX,
    SATURATION_MIN,
    SATURATION_MAX,
    VALUE_MIN,
    VALUE_MAX,
    COLOR_DISTANCE_MAX,
    VISION_TYPES,
    VISION_TYPE_LABELS,
    BRETTEL_MATRICES,
    PATTERNS,
    UNIVERSALIS_API_BASE,
    UNIVERSALIS_API_TIMEOUT,
    UNIVERSALIS_API_RETRY_COUNT,
    UNIVERSALIS_API_RETRY_DELAY,
    API_CACHE_TTL,
    API_DEBOUNCE_DELAY,
    API_CACHE_VERSION,
    API_MAX_RESPONSE_SIZE,
    API_RATE_LIMIT_DELAY,
} from './constants/index.js';

// Utils
export {
    clamp,
    lerp,
    round,
    distance,
    unique,
    groupBy,
    sortByProperty,
    filterNulls,
    isValidHexColor,
    isValidRGB,
    isValidHSV,
    isString,
    isNumber,
    isArray,
    isObject,
    isNullish,
    sleep,
    retry,
    generateChecksum,
} from './utils/index.js';

// Data (for browser environments - to be injected)
export { default as dyeDatabase } from './data/colors_xiv.json' with { type: 'json' };

// Version
export const VERSION = '1.0.0';
