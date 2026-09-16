const runtime = typeof globalThis !== 'undefined' ? globalThis : {};

/** Read at call-time so runtime-keys.js can load first. */
export const getGoogleMapsApiKey = () => (
    runtime.FREEFLOW_GOOGLE_MAPS_API_KEY || ''
);

export const getTflAppKey = () => (
    runtime.FREEFLOW_TFL_APP_KEY || ''
);

/** @deprecated Prefer getGoogleMapsApiKey() — kept for existing imports. */
export const API_KEY = getGoogleMapsApiKey();
/** @deprecated Prefer getTflAppKey() */
export const TFL_APP_KEY = getTflAppKey();
