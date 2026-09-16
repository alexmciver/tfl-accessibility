import assert from 'node:assert/strict';
import { findLiftDisruptionsForStation } from '../modules/tflApi.js';

const disruptions = [
    {
        stopPointName: 'Wembley Park Station',
        message: 'No lift service between the street and ticket hall.'
    },
    {
        stopPointName: 'Clapham Junction Station',
        message: 'Step free access is not available due to a faulty lift.'
    }
];

assert.equal(findLiftDisruptionsForStation(disruptions, 'Wembley Park').length, 1);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Green Park').length, 0);
assert.equal(findLiftDisruptionsForStation(disruptions, 'Clapham Junction').length, 1);

console.log('tflApi helper tests passed');
