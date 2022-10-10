import {
    fetchTFL,
} from './tfl.js';

const tflInfo = await fetchTFL();

console.log(tflInfo);