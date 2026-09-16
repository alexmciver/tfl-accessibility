import assert from 'node:assert/strict';
import { stationsDataFallback } from '../data/stationsData.js';
import {
    pickBestFullHub,
    resolveAccessibleHubStation,
    resolveAccessibleHubLabel,
    buildExampleJourneys,
    scoreHubCandidate
} from '../modules/hubResolver.js';
import { clearRouteMemory } from '../modules/routeLearning.js';

clearRouteMemory();

const claphamHub = pickBestFullHub('Clapham Common');
assert.equal(claphamHub, 'Clapham Junction');
assert.equal(stationsDataFallback[claphamHub], 'Full');
assert.ok(scoreHubCandidate('Clapham Common', 'Clapham Junction') > scoreHubCandidate('Clapham Common', 'Abbey Road'));

const aldgatesHub = resolveAccessibleHubStation('Aldgate', 'None');
assert.equal(aldgatesHub, null, 'Weak alphabetical neighbours must not be invented offline');
assert.match(resolveAccessibleHubLabel('Aldgate', 'None'), /accessible station near Aldgate/i);

const examples = buildExampleJourneys(stationsDataFallback, 4);
assert.ok(examples.length >= 2);
examples.forEach((pair) => {
    assert.equal(stationsDataFallback[pair.start], 'Full');
    assert.equal(stationsDataFallback[pair.end], 'Full');
    assert.notEqual(pair.start, pair.end);
});

console.log('hubResolver tests passed');
