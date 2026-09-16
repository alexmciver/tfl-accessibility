import assert from 'node:assert/strict';
import { findLiftDisruptionsForStation, stationNameMatches } from '../modules/tflApi.js';

const disruptions = [
    {
        stopPointName: 'Wembley Park Station',
        message: 'No lift service between the street and ticket hall.'
    },
    {
        stopPointName: 'Clapham Junction Station',
        message: 'Step free access is not available due to a faulty lift.'
    },
    {
        stopPointName: 'Embankment',
        message: 'Lift out at Embankment'
    },
    {
        stopPointName: 'Bank',
        message: 'Lift out at Bank'
    }
];

assert.equal(findLiftDisruptionsForStation(disruptions, 'Wembley Park').length, 1);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Green Park').length, 0);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Clapham Junction').length, 1);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Bank').length, 1);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Embankment').length, 1);
assert.equal(stationNameMatches('Embankment', 'Bank'), false);
assert.equal(stationNameMatches('Bank', 'Embankment'), false);
assert.equal(stationNameMatches('Wembley Park Station', 'Wembley Park'), true);

console.log('tflApi helper tests passed');
