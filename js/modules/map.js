import { API_KEY } from '../config.js';
import { RouteMap, lookupStationLatLon } from './routeMap.js';

/**
 * Build a Google Maps directions URL for “open externally”.
 * Embeds without a key are blocked by Google (403) — local Leaflet is the on-page map.
 */
export const buildExternalMapsUrl = (origin, destination, mode = 'transit') => {
    const travelmode = mode === 'walking' ? 'walking' : mode === 'driving' ? 'driving' : 'transit';
    return `https://www.google.com/maps/dir/?api=1`
        + `&origin=${encodeURIComponent(origin)}`
        + `&destination=${encodeURIComponent(destination)}`
        + `&travelmode=${travelmode}`;
};

export class MapService {
    constructor() {
        this.API_KEY = API_KEY;
        this.mapElement = null;
        this.routeMap = null;
        this.externalLink = null;
    }

    async initialize(mapElement, externalLink = null) {
        this.mapElement = mapElement;
        this.externalLink = externalLink;
        if (mapElement) {
            this.routeMap = new RouteMap(mapElement);
        }
    }

    showStage(stage = {}) {
        if (!this.routeMap) return;
        const from = stage.from || stage.origin || '';
        const to = stage.to || stage.destination || '';
        const ok = this.routeMap.showStage({
            from,
            to,
            mode: stage.mode || 'transit',
            label: stage.label || ''
        });

        if (this.externalLink) {
            const originLabel = `${String(from).replace(/ Station, London$/i, '')} Station, London`;
            const destLabel = `${String(to).replace(/ Station, London$/i, '')} Station, London`;
            this.externalLink.href = buildExternalMapsUrl(originLabel, destLabel, stage.mode || 'transit');
            this.externalLink.hidden = !(lookupStationLatLon(from) && lookupStationLatLon(to));
        }

        return ok;
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
        if (this.routeMap) this.routeMap.reset();
        if (this.externalLink) {
            this.externalLink.hidden = true;
            this.externalLink.removeAttribute('href');
        }
    }
}
