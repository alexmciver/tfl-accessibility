import { getAccessMeta, scoreJourneyAccess } from './stationSearch.js';
import { profileSummary } from './accessProfile.js';

const CERTAINTY = {
    high: { level: 'high', label: 'High certainty', className: 'certainty-high' },
    medium: { level: 'medium', label: 'Check carefully', className: 'certainty-medium' },
    low: { level: 'low', label: 'Needs contingency', className: 'certainty-low' }
};

const levelCertainty = (accessibility) => {
    if (accessibility === 'Full') return CERTAINTY.high;
    if (accessibility === 'Interchange' || accessibility === 'Partial') return CERTAINTY.medium;
    return CERTAINTY.low;
};

const liftHitsStation = (liftMessages = [], stationName = '') => {
    const target = String(stationName || '').trim();
    if (!target) return false;
    return liftMessages.some((message) => {
        const text = String(message || '');
        if (!text) return false;
        // Reuse the same equality/prefix rules as live lift matching (Bank ⊈ Embankment).
        const normalise = (value) => String(value)
            .toLowerCase()
            .replace(/['’]/g, '')
            .replace(/\bstation\b/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
        const left = normalise(text);
        const right = normalise(target);
        if (!left || !right) return false;
        if (left === right) return true;
        // Message often embeds the station name as a phrase, not the whole string.
        const padded = ` ${left} `;
        return padded.includes(` ${right} `);
    });
};

/**
 * Score a planned journey for access confidence, including profile and live lift context.
 */
export const buildConfidenceReport = ({
    start,
    end,
    startAccessibility,
    endAccessibility,
    planA,
    planB,
    liveContext = {},
    profile = {}
}) => {
    const base = scoreJourneyAccess(startAccessibility, endAccessibility);
    let score = base.score;
    const why = [];

    const liftMessages = (liveContext.liftMessages || []).slice();
    const disrupted = (liveContext.disruptedLines || []).length > 0;
    if (disrupted) {
        score -= 18;
        why.push('Live lift disruption reported on this corridor.');
    } else if (!liveContext.degraded) {
        why.push('No matching lift disruptions found for this corridor right now.');
    }

    if (profile.wheelchair && (startAccessibility !== 'Full' || endAccessibility !== 'Full')) {
        score -= 12;
        why.push('Wheelchair profile: one or both stations are not fully street-to-platform step-free.');
    }
    if (profile.rampNeeded) {
        score -= 4;
        why.push('Boarding ramp flagged — ask staff at departure and arrival.');
    }
    if (profile.noEscalators) {
        why.push('No-escalator preference noted — prefer lift-signed routes and surface options where ranked higher.');
    }

    const walkSteps = (planA?.steps || []).filter((step) => step.type === 'walk');
    const estimatedWalk = walkSteps.length * 4;
    if (estimatedWalk > (profile.maxWalkMins || 10)) {
        score -= 8;
        why.push(`Walking segments may exceed your ${profile.maxWalkMins} minute preference.`);
    }

    if (planA?.tflCorrected) {
        score += 2;
        why.push('Free Flow corrected TfL street-access gaps with accessible hubs before ranking Plan A.');
    } else if (planA?.tflLive && planA?.freeflowVerified) {
        score += 4;
        why.push('Plan A uses live TfL timing where published street-to-train access agrees.');
    } else if (planA?.freeflowVerified) {
        score += 3;
        why.push('Plan A is Free Flow verified against published station accessibility (not TfL labels alone).');
    } else if (planA?.tflLive) {
        why.push('Live TfL journey present — still cross-check street access; TfL step-free is not street-to-train truth.');
    } else {
        why.push('Plan A uses published station access guidance (live TfL journey not available).');
    }

    if (profile.wheelchair && (startAccessibility === 'Interchange' || endAccessibility === 'Interchange')) {
        why.push('Wheelchair profile: interchange-only stations are treated as street-constrained until confirmed Full.');
    }

    score = Math.max(12, Math.min(99, Math.round(score)));

    let grade = 'Constrained';
    if (score >= 90) grade = 'Excellent';
    else if (score >= 75) grade = 'Strong';
    else if (score >= 55) grade = 'Plan carefully';

    const summary = why[0] || base.summary;

    const scoredSteps = (planA?.steps || []).map((step, index) => {
        let certainty = CERTAINTY.high;
        if (step.type === 'walk' || step.type === 'bus') {
            certainty = profile.wheelchair ? CERTAINTY.medium : CERTAINTY.high;
        }
        if (index === 0) {
            const startCert = levelCertainty(startAccessibility);
            if (startCert.level === 'low') certainty = CERTAINTY.low;
            else if (startCert.level === 'medium' && certainty.level === 'high') certainty = CERTAINTY.medium;
            if (liftHitsStation(liftMessages, start)) certainty = CERTAINTY.low;
        }
        if (index === (planA.steps.length - 1)) {
            const endCert = levelCertainty(endAccessibility);
            if (endCert.level === 'low') certainty = CERTAINTY.low;
            else if (endCert.level === 'medium' && certainty.level === 'high') certainty = CERTAINTY.medium;
            if (liftHitsStation(liftMessages, end)) certainty = CERTAINTY.low;
        }
        if (disrupted && step.type === 'tube') {
            if (certainty.level === 'high') certainty = CERTAINTY.medium;
        }
        return {
            ...step,
            certainty
        };
    });

    const assistanceStations = [];
    if (startAccessibility !== 'Full' || profile.rampNeeded || profile.wheelchair) {
        assistanceStations.push({
            station: start,
            reason: startAccessibility === 'Full'
                ? 'Boarding ramp / staff help requested in your profile.'
                : `${getAccessMeta(startAccessibility).label} — staff help may be needed.`
        });
    }
    if (endAccessibility !== 'Full' || profile.rampNeeded || profile.wheelchair) {
        assistanceStations.push({
            station: end,
            reason: endAccessibility === 'Full'
                ? 'Arrival assistance may help with alighting.'
                : `${getAccessMeta(endAccessibility).label} — plan assistance at arrival.`
        });
    }

    const coach = {
        now: [],
        atStation: [],
        ifFails: []
    };
    coach.now.push(`Travel from ${start} to ${end} using Plan A (${planA?.title || 'recommended route'}).`);
    if (planA?.durationMins) {
        coach.now.push(`Allow about ${planA.durationMins} minutes, with ${planA.interchangeCount ?? 0} interchange(s).`);
    }
    coach.atStation.push('Follow signed step-free / lift routes and ask staff for a boarding ramp if you need one.');
    if (liftMessages.length) {
        coach.atStation.push(...liftMessages.slice(0, 2));
    }
    if (planB) {
        coach.ifFails.push(`Switch to Plan B: ${planB.title}. ${planB.rationale || ''}`.trim());
    } else {
        coach.ifFails.push('If lifts fail, leave at the nearest full step-free station and finish by accessible bus.');
    }
    coach.ifFails.push('Re-check TfL lift status before you leave home and again at the ticket hall.');

    return {
        score,
        grade,
        summary,
        why,
        profileLine: profileSummary(profile),
        scoredSteps,
        assistanceStations,
        coach,
        startMeta: getAccessMeta(startAccessibility),
        endMeta: getAccessMeta(endAccessibility)
    };
};

export const buildAssistanceBriefing = ({ start, end, confidence, planA, planB }) => {
    const stations = (confidence.assistanceStations || [])
        .map((item) => `- ${item.station}: ${item.reason}`)
        .join('\n') || '- No specific assistance stations flagged.';
    return [
        'Free Flow Routes — assistance briefing',
        `Journey: ${start} → ${end}`,
        `Access confidence: ${confidence.score} (${confidence.grade})`,
        `Profile: ${confidence.profileLine}`,
        `Plan A: ${planA?.title || 'Recommended'} — ${planA?.rationale || ''}`,
        planB ? `Plan B (if lifts fail): ${planB.title}` : '',
        'Stations that may need staff help:',
        stations,
        'Links: TfL staff help https://tfl.gov.uk/transport-accessibility/help-from-staff',
        'Passenger Assist https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/',
        'Always re-check live lift status with TfL before travel.'
    ].filter(Boolean).join('\n');
};
