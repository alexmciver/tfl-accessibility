/**
 * Optional runtime keys — copy to js/runtime-keys.js and fill in values.
 * Loaded before js/boot.js in index.html.
 *
 * Live lifts/journeys work without a TfL key. Set one for higher rate limits:
 * https://api.tfl.gov.uk/
 *
 * Set FREEFLOW_TFL_LIVE = 0 to force degraded (offline) guidance in the browser.
 * Set FREEFLOW_GOOGLE_MAPS_API_KEY for Google Maps Embed directions
 * (Maps Embed API + billing enabled). Without it the planner falls back
 * to an approximate OSM map — Google keyless embeds are blocked (403).
 * https://developers.google.com/maps/documentation/embed/get-api-key
 */
globalThis.FREEFLOW_TFL_APP_KEY = '';
globalThis.FREEFLOW_GOOGLE_MAPS_API_KEY = '';
globalThis.FREEFLOW_TFL_LIVE = 1;
