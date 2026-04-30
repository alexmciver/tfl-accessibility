import assert from 'node:assert/strict';
import { classifyAccessibilityScenario } from '../modules/routingEngine.js';

const run = () => {
    assert.equal(classifyAccessibilityScenario('Full', 'Full'), 'Full->Full');
    assert.equal(classifyAccessibilityScenario('Full', 'None'), 'Full->None');
    assert.equal(classifyAccessibilityScenario('Partial', 'Interchange'), 'Partial->Interchange');
    assert.equal(classifyAccessibilityScenario('None', 'Full'), 'None->Full');
    console.log('routingEngine scenario tests passed');
};

run();
