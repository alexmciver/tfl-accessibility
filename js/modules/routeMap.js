/**
 * Local Leaflet map for journey stages — no Google Embed key required.
 * Works on file:// and http(s) with OSM tiles.
 */

import { stationCoords } from '../data/stationCoords.js';

const LONDON = [51.5074, -0.1278];

const normaliseStation = (value = '') => String(value)
    .replace(/,\s*London$/i, '')
    .replace(/\s+Station$/i, '')
    .replace(/^accessible station near\s+/i, '')
    .trim();

export const lookupStationLatLon = (stationName = '') => {
    const key = normaliseStation(stationName);
    if (!key) return null;
    if (stationCoords[key]) return stationCoords[key];
    const match = Object.keys(stationCoords).find((name) => (
        name.toLowerCase() === key.toLowerCase()
    ));
    return match ? stationCoords[match] : null;
};

const modeColour = (mode = 'transit') => {
    if (mode === 'walking') return '#0f766e';
    if (mode === 'bus' || mode === 'transit') return '#0369a1';
    return '#0b1f3a';
};

export class RouteMap {
    constructor(element) {
        this.element = element;
        this.map = null;
        this.layer = null;
        this.ready = false;
    }

    ensure() {
        if (this.ready || !this.element || typeof window === 'undefined' || !window.L) {
            return this.ready;
        }

        this.map = window.L.map(this.element, {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: false
        }).setView(LONDON, 11);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.layer = window.L.layerGroup().addTo(this.map);
        this.ready = true;

        // Leaflet needs a size pass after becoming visible.
        setTimeout(() => this.map.invalidateSize(), 40);
        return true;
    }

    clear() {
        if (this.layer) this.layer.clearLayers();
    }

    reset() {
        this.clear();
        if (this.map) this.map.setView(LONDON, 11);
    }

    showStage({ from = '', to = '', mode = 'transit', label = '' } = {}) {
        if (!this.ensure()) return false;

        this.clear();
        this.map.invalidateSize();

        const origin = lookupStationLatLon(from);
        const destination = lookupStationLatLon(to);
        const points = [];

        const addMarker = (point, title, tone) => {
            if (!point) return;
            const colour = tone === 'start' ? '#0f766e' : tone === 'end' ? '#b45309' : '#0369a1';
            const marker = window.L.circleMarker([point.lat, point.lon], {
                radius: 9,
                color: '#fff',
                weight: 2,
                fillColor: colour,
                fillOpacity: 1
            }).bindPopup(`<strong>${title}</strong>`);
            this.layer.addLayer(marker);
            points.push([point.lat, point.lon]);
        };

        addMarker(origin, normaliseStation(from) || 'Start', 'start');
        addMarker(destination, normaliseStation(to) || 'End', 'end');

        const drawLine = (latLngs, dashed = false) => {
            if (!latLngs?.length) return;
            const line = window.L.polyline(latLngs, {
                color: modeColour(mode),
                weight: 5,
                opacity: 0.85,
                dashArray: (dashed || mode === 'walking') ? '6 8' : null
            });
            if (label) line.bindPopup(label);
            this.layer.addLayer(line);
        };

        if (origin && destination) {
            drawLine([[origin.lat, origin.lon], [destination.lat, destination.lon]], true);
            // Prefer a real foot/road corridor when OSRM is reachable (file:// / http).
            const profile = mode === 'walking' ? 'foot' : 'driving';
            const url = `https://router.project-osrm.org/route/v1/${profile}/`
                + `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`
                + '?overview=full&geometries=geojson';
            const requestId = `${from}|${to}|${mode}|${Date.now()}`;
            this._activeRequest = requestId;
            fetch(url)
                .then((response) => (response.ok ? response.json() : null))
                .then((payload) => {
                    if (this._activeRequest !== requestId || !this.layer) return;
                    const coords = payload?.routes?.[0]?.geometry?.coordinates;
                    if (!Array.isArray(coords) || !coords.length) return;
                    this.clear();
                    addMarker(origin, normaliseStation(from) || 'Start', 'start');
                    addMarker(destination, normaliseStation(to) || 'End', 'end');
                    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
                    drawLine(latLngs, mode === 'walking');
                    this.map.fitBounds(latLngs, { padding: [36, 36], maxZoom: 15 });
                })
                .catch(() => {
                    // Keep the straight-line corridor if routing is unavailable.
                });
        }

        if (points.length >= 2) {
            this.map.fitBounds(points, { padding: [36, 36], maxZoom: 15 });
        } else if (points.length === 1) {
            this.map.setView(points[0], 14);
        } else {
            this.map.setView(LONDON, 11);
            return false;
        }

        return Boolean(origin && destination);
    }
}
