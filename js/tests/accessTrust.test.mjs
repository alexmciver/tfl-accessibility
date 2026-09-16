import assert from 'node:assert/strict';
import { resolveAccessPolicy } from '../modules/accessPolicy.js';
import { buildJourneyGuidance } from '../modules/journeyGuidance.js';
import { assessTflTrust, trustBannerCopy } from '../modules/tflTrust.js';
import { buildDynamicRecommendations } from '../modules/routingEngine.js';

const policyNoneFull = resolveAccessPolicy('None', 'Full');
assert.equal(policyNoneFull.originRerouteRequired, true);
assert.equal(policyNoneFull.destinationTransferRequired, false);
assert.equal(policyNoneFull.accessFirst, true);

const policyInterchangeDefault = resolveAccessPolicy('Interchange', 'Full');
assert.equal(policyInterchangeDefault.originRerouteRequired, true);
assert.equal(policyInterchangeDefault.accessFirst, true);

const policyInterchangeWheelchair = resolveAccessPolicy('Interchange', 'Full', { wheelchair: true });
assert.equal(policyInterchangeWheelchair.originRerouteRequired, true);
assert.equal(policyInterchangeWheelchair.wheelchairStrict, true);

const noneFullGuidance = buildJourneyGuidance('Aldgate', 'Abbey Road', 'None', 'Full');
assert.match(noneFullGuidance.headline, /accessible hub/i);
assert.match(noneFullGuidance.items[0], /Aldgate/);
assert.doesNotMatch(noneFullGuidance.items[0], /hub near Abbey Road/);

const trust = assessTflTrust({
    startAccessibility: 'None',
    endAccessibility: 'Full',
    policy: policyNoneFull,
    usedHubQuery: true,
    liveJourneyCount: 1
});
assert.equal(trust.differsFromTfl, true);
assert.equal(trust.trustLevel, 'corrected');
assert.ok(trustBannerCopy(trust));

const inaccessibleOrigin = await buildDynamicRecommendations({
    apiKey: '',
    start: 'Aldgate',
    end: 'Abbey Road',
    startAccessibility: 'None',
    endAccessibility: 'Full',
    profile: { wheelchair: true }
});
assert.equal(inaccessibleOrigin.trust.differsFromTfl, true);
assert.equal(inaccessibleOrigin.recommended.freeflowVerified, true);
assert.equal(inaccessibleOrigin.recommended.id.includes('hub') || inaccessibleOrigin.recommended.freeflowVerified, true);
assert.match(inaccessibleOrigin.recommended.badge || '', /Free Flow|hub|verified/i);
assert.equal(
    decodeURIComponent(inaccessibleOrigin.recommended.mapUrl).includes('saddr=Aldgate Station'),
    false
);

const wheelchairInterchange = await buildDynamicRecommendations({
    apiKey: '',
    start: 'Aldgate East',
    end: 'Abbey Road',
    startAccessibility: 'Interchange',
    endAccessibility: 'Full',
    profile: { wheelchair: true }
});
assert.equal(wheelchairInterchange.policy.originRerouteRequired, true);
assert.match(wheelchairInterchange.recommended.steps[0].text, /accessible hub/i);

const interchangeDefault = await buildDynamicRecommendations({
    apiKey: '',
    start: 'Aldgate East',
    end: 'Abbey Road',
    startAccessibility: 'Interchange',
    endAccessibility: 'Full',
    profile: {}
});
assert.equal(interchangeDefault.policy.originRerouteRequired, true);
assert.equal(interchangeDefault.policy.accessFirst, true);

console.log('access trust tests passed');
