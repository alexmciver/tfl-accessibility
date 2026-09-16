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
    assert.equal(keylessResult.degraded, true);
    assert.equal((keylessResult.liveContext.journeyStrategies || []).length, 0);
    assert.match(keylessResult.recommended.mapUrl, /maps\.google\.com\/maps\?output=embed&saddr=/);
    assert.match(keylessResult.recommended.mapUrl, /daddr=/);
    assert.match(keylessResult.recommended.mapUrl, /output=embed/);
    assert.match(keylessResult.assumptions.join(' '), /Live TfL data unavailable/);

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
    const destHubName = inaccessibleDestinationResult.liveContext.destinationHub.replace(/ Station, London$/i, '');
    assert.equal(stationsDataFallback[destHubName], 'Full');
    assert.match(inaccessibleDestinationResult.recommended.steps[1].text, new RegExp(destHubName));

    const inaccessibleOriginResult = await buildDynamicRecommendations({
        apiKey: '',
        start: 'Aldgate',
        end: 'Abbey Road',
        startAccessibility: 'None',
        endAccessibility: 'Full'
    });
    assert.equal(inaccessibleOriginResult.scenario, 'None->Full');
    assert.equal(inaccessibleOriginResult.policy.originRerouteRequired, true);
    assert.equal(inaccessibleOriginResult.policy.destinationTransferRequired, false);
    const originHubName = inaccessibleOriginResult.liveContext.originHub.replace(/ Station, London$/i, '');
    assert.equal(stationsDataFallback[originHubName], 'Full');
    assert.match(inaccessibleOriginResult.recommended.steps[0].text, /Aldgate/);
    assert.match(inaccessibleOriginResult.recommended.steps[0].text, new RegExp(originHubName));
    assert.equal(
        decodeURIComponent(inaccessibleOriginResult.recommended.mapUrl).includes('saddr=Aldgate Station'),
        false,
        'None->Full map must not start at the inaccessible origin'
    );
    assert.match(decodeURIComponent(inaccessibleOriginResult.recommended.mapUrl), new RegExp(`saddr=${originHubName} Station`));

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
                    if (result.policy.preferSurfaceRoute) {
                        assert.equal(result.policy.originRerouteRequired, false);
                        assert.equal(result.policy.destinationTransferRequired, false);
                        assert.equal(result.recommended.surfaceRoute, true);
                    } else {
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
                        if (['None', 'Partial'].includes(startCategory) || ['None', 'Partial', 'Interchange'].includes(endCategory)) {
                            assert.equal(result.trust.differsFromTfl, true, `Expected TfL correction flag for ${startStation} -> ${endStation}`);
                            assert.equal(result.recommended.freeflowVerified, true);
                        }
                    }
                    assert.ok(result.recommended, `Missing recommended option for ${startStation} -> ${endStation}`);
                    assert.ok(result.recommended.mapUrl.includes('output=embed'), `Missing embedded map for ${startStation} -> ${endStation}`);
                    assert.ok(result.recommended.steps.length > 0, `Missing route steps for ${startStation} -> ${endStation}`);

                    const mapText = decodeURIComponent(result.recommended.mapUrl);
                    if (['None', 'Partial'].includes(startCategory) && !result.policy.preferSurfaceRoute) {
                        assert.equal(
                            mapText.includes(`saddr=${startStation} Station`),
                            false,
                            `Map must not start at constrained origin ${startStation} -> ${endStation}`
                        );
                        assert.match(
                            result.recommended.steps[0].text,
                            /accessible hub|bus\/walk transfer/i,
                            `Origin hub step missing for ${startStation} -> ${endStation}`
                        );
                    }
                    if (result.policy.preferSurfaceRoute) {
                        assert.match(result.recommended.steps[0].text, /bus|walk/i);
                    }
                }
            }
        }
    }

    console.log('routingEngine scenario tests passed');
};

await run();
