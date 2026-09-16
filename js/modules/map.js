import { getGoogleMapsApiKey } from '../config.js';
import { RouteMap, lookupStationLatLon } from './routeMap.js';

/**
 * Build a Google Maps directions URL for “open externally”.
 */
export const buildExternalMapsUrl = (origin, destination, mode = 'transit') => {
    const travelmode = mode === 'walking' ? 'walking' : mode === 'driving' ? 'driving' : 'transit';
    return `https://www.google.com/maps/dir/?api=1`
        + `&origin=${encodeURIComponent(origin)}`
        + `&destination=${encodeURIComponent(destination)}`
        + `&travelmode=${travelmode}`;
};

const stationLabel = (name = '') => {
    const clean = String(name)
        .replace(/,\s*London$/i, '')
        .replace(/\s+Station$/i, '')
        .replace(/^accessible station near\s+/i, '')
        .trim();
    return clean ? `${clean} Station, London` : '';
};

/** Google Maps Embed API directions URL (requires FREEFLOW_GOOGLE_MAPS_API_KEY). */
export const buildGoogleEmbedUrl = (apiKey, origin, destination, mode = 'transit', waypoints = []) => {
    if (!apiKey || !origin || !destination) return '';
    let url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}`
        + `&origin=${encodeURIComponent(origin)}`
        + `&destination=${encodeURIComponent(destination)}`
        + `&mode=${encodeURIComponent(mode)}`
        + `&zoom=13`;
    if (waypoints.length > 0) {
        url += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
    }
    return url;
};

export class MapService {
    constructor() {
        this.googleFrame = null;
        this.leafletHost = null;
        this.routeMap = null;
        this.externalLink = null;
        this.fallbackNote = null;
    }

    get apiKey() {
        return getGoogleMapsApiKey();
    }

    get mode() {
        return this.apiKey && this.googleFrame ? 'google' : 'leaflet';
    }

    async initialize({ googleFrame = null, leafletHost = null, externalLink = null, fallbackNote = null } = {}) {
        this.googleFrame = googleFrame;
        this.leafletHost = leafletHost;
        this.externalLink = externalLink;
        this.fallbackNote = fallbackNote;

        if (this.mode === 'leaflet' && leafletHost && !this.routeMap) {
            this.routeMap = new RouteMap(leafletHost);
        }

        this.applyShellVisibility();
    }

    applyShellVisibility() {
        const usingGoogle = this.mode === 'google';
        if (this.googleFrame) {
            this.googleFrame.hidden = !usingGoogle;
            if (!usingGoogle) this.googleFrame.removeAttribute('src');
        }
        if (this.leafletHost) {
            this.leafletHost.hidden = usingGoogle;
        }
        if (this.fallbackNote) {
            this.fallbackNote.hidden = usingGoogle;
        }
        if (!usingGoogle && this.leafletHost && !this.routeMap) {
            this.routeMap = new RouteMap(this.leafletHost);
        }
    }

    showStage(stage = {}) {
        this.applyShellVisibility();

        const from = stage.from || stage.origin || '';
        const to = stage.to || stage.destination || '';
        const mode = stage.mode || 'transit';
        const origin = stationLabel(from);
        const destination = stationLabel(to);

        if (this.externalLink && origin && destination) {
            this.externalLink.href = buildExternalMapsUrl(origin, destination, mode);
            this.externalLink.hidden = false;
        }

        if (this.mode === 'google' && this.googleFrame) {
            const embedFromStage = typeof stage.url === 'string' && stage.url.includes('/maps/embed/v1/')
                ? stage.url
                : '';
            const embed = embedFromStage || buildGoogleEmbedUrl(this.apiKey, origin, destination, mode);
            if (embed) {
                this.googleFrame.src = embed;
                this.googleFrame.title = `Google route map: ${stage.label || `${from} → ${to}`}`;
                return true;
            }
        }

        if (this.routeMap) {
            return this.routeMap.showStage({
                from,
                to,
                mode,
                label: stage.label || ''
            });
        }

        return false;
    }

    planRoute(startStation, endStation) {
        this.showStage({
            from: startStation,
            to: endStation,
            mode: 'transit',
            label: `${startStation} → ${endStation}`
        });
    }

    reset() {
        if (this.googleFrame) this.googleFrame.src = '';
        if (this.routeMap) this.routeMap.reset();
        if (this.externalLink) {
            this.externalLink.hidden = true;
            this.externalLink.removeAttribute('href');
        }
    }
}
