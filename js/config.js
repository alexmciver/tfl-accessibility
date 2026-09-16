const runtime = typeof globalThis !== 'undefined' ? globalThis : {};
export const API_KEY = runtime.FREEFLOW_GOOGLE_MAPS_API_KEY || '';
export const TFL_APP_KEY = runtime.FREEFLOW_TFL_APP_KEY || '';
