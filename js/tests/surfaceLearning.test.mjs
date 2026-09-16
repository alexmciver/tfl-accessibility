import assert from 'node:assert/strict';
import { shouldPreferSurfaceRoute, shareLocality } from '../modules/localSurface.js';
import { resolveAccessPolicy } from '../modules/accessPolicy.js';
import { buildDynamicRecommendations } from '../modules/routingEngine.js';
import {
    clearRouteMemory,
    learnFromFeedback,
    learnHubOverride,
    isLearnedSurfacePair,
    getLearnedHub,
    pairKey
} from '../modules/routeLearning.js';

clearRouteMemory();

assert.equal(shareLocality('Clapham Common', 'Clapham High Street'), true);
assert.equal(shareLocality('East Acton', 'East Finchley'), false);
assert.equal(shareLocality('West Ham', 'West Ruislip'), false);
assert.equal(shareLocality('High Barnet', 'High Street Kensington'), false);
assert.equal(shareLocality('New Cross', 'New Cross Gate'), true);
assert.equal(
    shouldPreferSurfaceRoute('Clapham Common', 'Clapham High Street', 'None', 'None'),
    true
);
assert.equal(
    shouldPreferSurfaceRoute('Clapham High Street', 'Clapham Junction', 'None', 'Full'),
    true
);
assert.equal(
    shouldPreferSurfaceRoute('East Acton', 'East Finchley', 'None', 'None'),
    false
);

const policy = resolveAccessPolicy('None', 'None', {}, {
    start: 'Clapham Common',
    end: 'Clapham High Street'
});
assert.equal(policy.preferSurfaceRoute, true);
assert.equal(policy.originRerouteRequired, false);
assert.equal(policy.destinationTransferRequired, false);

const result = await buildDynamicRecommendations({
    apiKey: '',
    start: 'Clapham Common',
    end: 'Clapham High Street',
    startAccessibility: 'None',
    endAccessibility: 'None',
    profile: { wheelchair: true }
});

assert.equal(result.policy.preferSurfaceRoute, true);
assert.equal(result.recommended.surfaceRoute, true);
assert.match(result.recommended.title, /bus or walk/i);
assert.equal(
    decodeURIComponent(result.recommended.mapUrl).includes('Chiswick Park'),
    false,
    'Must not route via Chiswick Park'
);
assert.match(decodeURIComponent(result.recommended.mapUrl), /Clapham Common/);
assert.match(decodeURIComponent(result.recommended.mapUrl), /Clapham High Street/);
assert.ok(isLearnedSurfacePair('Clapham Common', 'Clapham High Street'));

const localOntoFull = await buildDynamicRecommendations({
    apiKey: '',
    start: 'Clapham High Street',
    end: 'Clapham Junction',
    startAccessibility: 'None',
    endAccessibility: 'Full',
    profile: { maxWalkMins: 10 }
});
assert.equal(localOntoFull.policy.preferSurfaceRoute, true);
assert.equal(localOntoFull.recommended.surfaceRoute, true);
assert.match(decodeURIComponent(localOntoFull.recommended.mapUrl), /Clapham High Street/);
assert.match(decodeURIComponent(localOntoFull.recommended.mapUrl), /Clapham Junction/);
assert.equal(
    decodeURIComponent(localOntoFull.recommended.mapUrl).includes('saddr=Clapham Junction')
        && decodeURIComponent(localOntoFull.recommended.mapUrl).includes('daddr=Clapham Junction'),
    false,
    'Must not collapse both ends to Clapham Junction'
);

// Distant false-positive must not surface-first or auto-learn.
clearRouteMemory();
const distant = await buildDynamicRecommendations({
    apiKey: '',
    start: 'East Acton',
    end: 'East Finchley',
    startAccessibility: 'None',
    endAccessibility: 'None',
    profile: {}
});
assert.equal(distant.policy.preferSurfaceRoute, false);
assert.equal(isLearnedSurfacePair('East Acton', 'East Finchley'), false);

// Feedback can teach a non-local pair.
clearRouteMemory();
learnFromFeedback({
    start: 'Angel',
    end: 'Bank',
    feedback: 'prefer-surface'
});
assert.equal(isLearnedSurfacePair('Angel', 'Bank'), true);
assert.ok(pairKey('Angel', 'Bank').includes('angel'));

const learnedPolicy = resolveAccessPolicy('None', 'Partial', {}, {
    start: 'Angel',
    end: 'Bank'
});
assert.equal(learnedPolicy.preferSurfaceRoute, true);

// Wrong-hub feedback demotes hubs instead of reinforcing them.
clearRouteMemory();
learnHubOverride('Aldgate', 'Tower Hill Station, London', { weight: 2, source: 'auto' });
assert.equal(getLearnedHub('Aldgate'), 'Tower Hill');
learnFromFeedback({
    start: 'Aldgate',
    end: 'Bank',
    feedback: 'wrong-hub',
    liveContext: { originHub: 'Tower Hill Station, London' }
});
assert.equal(isLearnedSurfacePair('Aldgate', 'Bank'), true);
assert.equal(getLearnedHub('Aldgate'), null);

console.log('surface learning tests passed');
