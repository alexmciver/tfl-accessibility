import assert from 'node:assert/strict';
import { classifyAccessibilityScenario, buildDynamicRecommendations } from '../modules/routingEngine.js';
import { stationsDataFallback } from '../data/stationsData.js';

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

    const categories = ['Full', 'Interchange', 'Partial', 'None'];
    const stationsByCategory = categories.reduce((acc, category) => {
        acc[category] = Object.entries(stationsDataFallback)
            .filter(([, accessibility]) => accessibility === category)
            .map(([station]) => station)
            .slice(0, 8);
        return acc;
    }, {});

    for (const startCategory of categories) {
        for (const endCategory of categories) {
            const startStations = stationsByCategory[startCategory];
            const endStations = stationsByCategory[endCategory];
            assert.ok(startStations.length > 0, `Missing start stations for ${startCategory}`);
            assert.ok(endStations.length > 0, `Missing end stations for ${endCategory}`);

            for (const startStation of startStations) {
                for (const endStation of endStations) {
                    if (startStation === endStation) continue;
                    const result = await buildDynamicRecommendations({
                        apiKey: '',
                        start: startStation,
                        end: endStation,
                        startAccessibility: startCategory,
                        endAccessibility: endCategory
                    });

                    assert.equal(result.scenario, `${startCategory}->${endCategory}`);
                    assert.equal(
                        result.policy.originRerouteRequired,
                        ['None', 'Partial'].includes(startCategory),
                        `Origin reroute policy mismatch for ${startStation} -> ${endStation}`
                    );
                    assert.equal(
                        result.policy.destinationTransferRequired,
                        ['None', 'Partial', 'Interchange'].includes(endCategory),
                        `Destination transfer policy mismatch for ${startStation} -> ${endStation}`
                    );
                    assert.ok(result.recommended, `Missing recommended option for ${startStation} -> ${endStation}`);
                    assert.ok(result.recommended.mapUrl.includes('output=embed'), `Missing embedded map for ${startStation} -> ${endStation}`);
                    assert.ok(result.recommended.steps.length > 0, `Missing route steps for ${startStation} -> ${endStation}`);
                }
            }
        }
    }

    console.log('routingEngine scenario tests passed');
};

await run();
