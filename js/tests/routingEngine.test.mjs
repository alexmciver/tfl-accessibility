import assert from 'node:assert/strict';
import { classifyAccessibilityScenario, buildDynamicRecommendations } from '../modules/routingEngine.js';

const run = async () => {
    assert.equal(classifyAccessibilityScenario('Full', 'Full'), 'Full->Full');
    assert.equal(classifyAccessibilityScenario('Full', 'None'), 'Full->None');
    assert.equal(classifyAccessibilityScenario('Partial', 'Interchange'), 'Partial->Interchange');
    assert.equal(classifyAccessibilityScenario('None', 'Full'), 'None->Full');

    const keylessResult = await buildDynamicRecommendations({
        apiKey: '',
        start: 'Abbey Road',
        end: 'Acton Central',
        startAccessibility: 'Full',
        endAccessibility: 'Full'
    });
    assert.match(keylessResult.recommended.mapUrl, /maps\.google\.com\/maps\?output=embed&saddr=/);
    assert.match(keylessResult.recommended.mapUrl, /daddr=/);
    assert.match(keylessResult.recommended.mapUrl, /output=embed/);

    const keyedResult = await buildDynamicRecommendations({
        apiKey: 'test-key',
        start: 'Abbey Road',
        end: 'Acton Central',
        startAccessibility: 'Full',
        endAccessibility: 'Full'
    });
    assert.match(keyedResult.recommended.mapUrl, /google\.com\/maps\/embed\/v1\/directions\?key=test-key/);

    const inaccessibleDestinationResult = await buildDynamicRecommendations({
        apiKey: '',
        start: 'Abbey Road',
        end: 'Aldgate',
        startAccessibility: 'Full',
        endAccessibility: 'None'
    });
    assert.equal(inaccessibleDestinationResult.policy.destinationTransferRequired, true);
    assert.match(inaccessibleDestinationResult.liveContext.destinationHub, /Liverpool Street Station, London/);
    assert.match(inaccessibleDestinationResult.recommended.steps[1].text, /Liverpool Street Station, London/);
    console.log('routingEngine scenario tests passed');
};

await run();
