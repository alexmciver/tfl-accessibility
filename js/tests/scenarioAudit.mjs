/**
 * Audits every accessibility scenario combination (Full / Interchange / Partial / None).
 *
 * Run: node js/tests/scenarioAudit.mjs
 * Exit code 1 if any invariant fails.
 */
import assert from 'node:assert/strict';
import { buildDynamicRecommendations } from '../modules/routingEngine.js';
import { stationsDataFallback } from '../data/stationsData.js';

const CATEGORIES = ['Full', 'Interchange', 'Partial', 'None'];

const pickStations = (category, limit = 3) => Object.entries(stationsDataFallback)
    .filter(([, accessibility]) => accessibility === category)
    .map(([station]) => station)
    .slice(0, limit);

const decodeMap = (url = '') => {
    try {
        return decodeURIComponent(url);
    } catch (error) {
        return url;
    }
};

const expectsOriginReroute = (startCategory) => ['None', 'Partial', 'Interchange'].includes(startCategory);
const expectsDestinationTransfer = (endCategory) => ['None', 'Partial', 'Interchange'].includes(endCategory);

const failures = [];
const rows = [];

const recordFailure = (label, detail) => {
    failures.push(`${label}: ${detail}`);
};

for (const startCategory of CATEGORIES) {
    for (const endCategory of CATEGORIES) {
        const starts = pickStations(startCategory);
        const ends = pickStations(endCategory);
        assert.ok(starts.length, `No stations for ${startCategory}`);
        assert.ok(ends.length, `No stations for ${endCategory}`);

        const start = starts[0];
        const end = ends.find((station) => station !== start) || ends[0];
        if (start === end) {
            rows.push({ scenario: `${startCategory}->${endCategory}`, note: 'skipped (same station)' });
            continue;
        }

        const result = await buildDynamicRecommendations({
            apiKey: '',
            start,
            end,
            startAccessibility: startCategory,
            endAccessibility: endCategory
        });

        const scenario = `${startCategory}->${endCategory}`;
        const mapText = decodeMap(result.recommended?.mapUrl || '');
        const stepText = (result.recommended?.steps || []).map((step) => step.text).join(' ');
        const originExpected = result.policy.preferSurfaceRoute
            ? false
            : expectsOriginReroute(startCategory);
        const destinationExpected = result.policy.preferSurfaceRoute
            ? false
            : expectsDestinationTransfer(endCategory);

        if (result.scenario !== scenario) {
            recordFailure(scenario, `scenario label was ${result.scenario}`);
        }
        if (result.policy.originRerouteRequired !== originExpected) {
            recordFailure(scenario, `originRerouteRequired expected ${originExpected}`);
        }
        if (result.policy.destinationTransferRequired !== destinationExpected) {
            recordFailure(scenario, `destinationTransferRequired expected ${destinationExpected}`);
        }
        if (!result.recommended?.steps?.length) {
            recordFailure(scenario, 'missing recommended steps');
        }

        // Inaccessible origins must not appear as Tube map starts — unless surface-first.
        if (originExpected && !result.policy.preferSurfaceRoute && mapText.includes(`saddr=${start} Station`)) {
            recordFailure(scenario, `map still starts at inaccessible/partial origin ${start}`);
        }
        if (originExpected && !result.policy.preferSurfaceRoute && !/accessible hub|bus\/walk transfer from/i.test(stepText)) {
            recordFailure(scenario, 'steps missing origin hub transfer');
        }
        if (result.policy.preferSurfaceRoute && !/bus|walk/i.test(stepText)) {
            recordFailure(scenario, 'surface plan missing bus/walk guidance');
        }

        // Inaccessible / constrained destinations must leave rail at a hub, not claim a direct Tube finish.
        if (endCategory === 'None' && mapText.includes(`daddr=${end} Station`) && !mapText.includes(' to:')) {
            // Direct daddr to inaccessible end with no waypoints is unsafe.
            recordFailure(scenario, `map ends directly at inaccessible destination ${end}`);
        }
        if (destinationExpected && endCategory === 'None' && !/final constrained segment|bus\/walking transfer/i.test(stepText)) {
            recordFailure(scenario, 'steps missing destination transfer');
        }

        // None -> Full must reroute at origin and finish at the Full destination.
        if (startCategory === 'None' && endCategory === 'Full') {
            if (!originExpected || destinationExpected) {
                recordFailure(scenario, 'None->Full policy should be origin reroute only');
            }
            if (!/Station, London/.test(mapText)) {
                recordFailure(scenario, 'None->Full map should use an accessible hub label');
            }
        }

        rows.push({
            scenario,
            example: `${start} → ${end}`,
            originReroute: result.policy.originRerouteRequired,
            destinationTransfer: result.policy.destinationTransferRequired,
            corrected: Boolean(result.trust?.differsFromTfl),
            plan: result.recommended?.title || 'n/a',
            mapOk: !(originExpected && mapText.includes(`saddr=${start} Station`))
        });
    }
}

console.log('Accessibility scenario audit');
console.log('============================');
for (const row of rows) {
    if (row.note) {
        console.log(`${row.scenario.padEnd(22)} ${row.note}`);
        continue;
    }
    console.log(
        `${row.scenario.padEnd(22)} ${row.example.padEnd(36)} `
        + `origin=${row.originReroute ? 'hub' : 'direct'} `
        + `dest=${row.destinationTransfer ? 'hub' : 'direct'} `
        + `tflFix=${row.corrected ? 'yes' : 'no'} `
        + `mapOk=${row.mapOk ? 'yes' : 'NO'} `
        + `| ${row.plan}`
    );
}

if (failures.length) {
    console.error('\nFailures:');
    failures.forEach((item) => console.error(` - ${item}`));
    process.exit(1);
}

console.log(`\nAll ${rows.filter((row) => !row.note).length} scenario samples passed.`);
