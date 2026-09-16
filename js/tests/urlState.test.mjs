import assert from 'node:assert/strict';
import {
    resolveStationName,
    readPlannerUrl,
    writePlannerUrl,
    clearPlannerUrl
} from '../modules/urlState.js';

const stations = {
    "Clapham Common": "None",
    "Clapham High Street": "None",
    "King’s Cross St. Pancras": "Interchange",
    "Abbey Road": "Full"
};

assert.equal(resolveStationName("Clapham Common", stations), "Clapham Common");
assert.equal(resolveStationName("king's cross st. pancras", stations), "King’s Cross St. Pancras");
assert.equal(resolveStationName("Missing", stations), "");

const parsed = readPlannerUrl(
    stations,
    '?from=Clapham%20Common&to=Clapham%20High%20Street&wheelchair=1&walk=15&plan=1'
);
assert.equal(parsed.from, 'Clapham Common');
assert.equal(parsed.to, 'Clapham High Street');
assert.equal(parsed.profile.wheelchair, true);
assert.equal(parsed.profile.maxWalkMins, 15);
assert.equal(parsed.plan, true);
assert.equal(parsed.hasQuery, true);

const empty = readPlannerUrl(stations, '');
assert.equal(empty.profile, null);
assert.equal(empty.hasQuery, false);

// Node has no real history — smoke-check that writers no-op safely.
writePlannerUrl({ from: 'Abbey Road', to: 'Clapham Common', plan: true });
clearPlannerUrl();

console.log('urlState tests passed');
