const PROFILE_KEY = 'freeflow_access_profile';

export const DEFAULT_PROFILE = {
    wheelchair: false,
    noEscalators: false,
    rampNeeded: false,
    maxWalkMins: 10
};

export const loadAccessProfile = () => {
    try {
        const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        return {
            wheelchair: Boolean(raw.wheelchair),
            noEscalators: Boolean(raw.noEscalators),
            rampNeeded: Boolean(raw.rampNeeded),
            maxWalkMins: Number.isFinite(Number(raw.maxWalkMins)) ? Number(raw.maxWalkMins) : DEFAULT_PROFILE.maxWalkMins
        };
    } catch (error) {
        return { ...DEFAULT_PROFILE };
    }
};

export const saveAccessProfile = (profile) => {
    const next = {
        wheelchair: Boolean(profile.wheelchair),
        noEscalators: Boolean(profile.noEscalators),
        rampNeeded: Boolean(profile.rampNeeded),
        maxWalkMins: Math.max(1, Math.min(45, Number(profile.maxWalkMins) || DEFAULT_PROFILE.maxWalkMins))
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
};

export const profileSummary = (profile) => {
    const parts = [];
    if (profile.wheelchair) parts.push('wheelchair / scooter');
    if (profile.noEscalators) parts.push('no escalators');
    if (profile.rampNeeded) parts.push('boarding ramp');
    parts.push(`max walk ${profile.maxWalkMins} mins`);
    return parts.join(' · ');
};

export const readProfileFromForm = (root = document) => ({
    wheelchair: Boolean(root.querySelector('#profile-wheelchair')?.checked),
    noEscalators: Boolean(root.querySelector('#profile-no-escalators')?.checked),
    rampNeeded: Boolean(root.querySelector('#profile-ramp')?.checked),
    maxWalkMins: Number(root.querySelector('#profile-max-walk')?.value) || DEFAULT_PROFILE.maxWalkMins
});

export const writeProfileToForm = (profile, root = document) => {
    const wheelchair = root.querySelector('#profile-wheelchair');
    const noEscalators = root.querySelector('#profile-no-escalators');
    const ramp = root.querySelector('#profile-ramp');
    const maxWalk = root.querySelector('#profile-max-walk');
    if (wheelchair) wheelchair.checked = profile.wheelchair;
    if (noEscalators) noEscalators.checked = profile.noEscalators;
    if (ramp) ramp.checked = profile.rampNeeded;
    if (maxWalk) maxWalk.value = String(profile.maxWalkMins);
};
