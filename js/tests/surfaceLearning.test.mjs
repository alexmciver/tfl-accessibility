import assert from 'node:assert/strict';
import { shouldPreferSurfaceRoute, shareLocality } from '../modules/localSurface.js';
import { resolveAccessPolicy } from '../modules/accessPolicy.js';
import { buildDynamicRecommendations } from '../modules/routingEngine.js';
import {
    clearRouteMemory,
    learnFromFeedback,
    isLearnedSurfacePair,
    pairKey
} from '../modules/routeLearning.js';

clearRouteMemory();

assert.equal(shareLocality('Clapham Common', 'Clapham High Street'), true);
assert.equal(
    shouldPreferSurfaceRoute('Clapham Common', 'Clapham High Street', 'None', 'None'),
    true
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

console.log('surface learning tests passed');
