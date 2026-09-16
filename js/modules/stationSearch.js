const ACCESS_META = {
    Full: { label: 'Full step-free', short: 'Full', rank: 4, className: 'access-full' },
    Interchange: { label: 'Interchange only', short: 'Interchange', rank: 3, className: 'access-interchange' },
    Partial: { label: 'Partial step-free', short: 'Partial', rank: 2, className: 'access-partial' },
    None: { label: 'Not step-free', short: 'None', rank: 1, className: 'access-none' }
};

export const getAccessMeta = (level) => ACCESS_META[level] || {
    label: 'Unknown access',
    short: 'Unknown',
    rank: 0,
    className: 'access-unknown'
};

export const scoreJourneyAccess = (startLevel, endLevel) => {
    const start = getAccessMeta(startLevel).rank;
    const end = getAccessMeta(endLevel).rank;
    const total = start + end;
    if (startLevel === 'Full' && endLevel === 'Full') {
        return { score: 98, grade: 'Excellent', summary: 'Both stations are fully step-free.' };
    }
    if (total >= 6) {
        return { score: 82, grade: 'Strong', summary: 'Most of this journey should stay step-free with careful interchange checks.' };
    }
    if (total >= 4) {
        return { score: 64, grade: 'Plan carefully', summary: 'Expect at least one constrained segment and prepare a transfer option.' };
    }
    return { score: 38, grade: 'Constrained', summary: 'This journey needs accessible hubs and transfer planning.' };
};

/**
 * Accessible station combobox synced to a hidden <select>.
 */
export class StationCombobox {
    constructor({
        input,
        listbox,
        select,
        badge,
        stations = [],
        getFilterMode = () => 'all',
        onChange = () => {}
    }) {
        this.input = input;
        this.listbox = listbox;
        this.select = select;
        this.badge = badge;
        this.stations = stations;
        this.getFilterMode = getFilterMode;
        this.onChange = onChange;
        this.activeIndex = -1;
        this.open = false;
        this.boundId = `${input.id}-listbox`;
        this.listbox.id = this.boundId;
        this.input.setAttribute('aria-controls', this.boundId);
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.setAttribute('role', 'combobox');
        this.listbox.setAttribute('role', 'listbox');
        this.setupEvents();
    }

    setStations(stations) {
        this.stations = stations;
    }

    setupEvents() {
        this.input.addEventListener('input', () => {
            this.renderOptions(this.input.value);
            this.openList();
        });
        this.input.addEventListener('focus', () => {
            this.input.select();
            this.renderOptions(this.input.value);
            this.openList();
        });
        this.input.addEventListener('keydown', (event) => this.onKeyDown(event));
        this.input.addEventListener('blur', () => {
            // Commit exact typed names so planning works without a list click.
            window.setTimeout(() => this.commitTypedValue(), 0);
        });
        this.listbox.addEventListener('mousedown', (event) => {
            const option = event.target.closest('[role="option"]');
            if (!option) return;
            event.preventDefault();
            this.selectStation(option.dataset.value);
        });
        document.addEventListener('click', (event) => {
            if (!this.input.closest('.station-combobox')?.contains(event.target)) {
                this.closeList();
            }
        });
    }

    filteredStations(query = '') {
        const normalised = query.trim().toLowerCase();
        const mode = this.getFilterMode();
        return this.stations
            .filter((station) => {
                if (mode === 'step-free' && !['Full', 'Partial', 'Interchange'].includes(station.accessibility)) {
                    return false;
                }
                if (!normalised) return true;
                return station.name.toLowerCase().includes(normalised);
            })
            .slice(0, 12);
    }

    renderOptions(query = '') {
        const matches = this.filteredStations(query);
        this.listbox.innerHTML = '';
        this.activeIndex = -1;

        if (matches.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'combobox-empty';
            empty.textContent = modeMessage(this.getFilterMode());
            this.listbox.appendChild(empty);
            return;
        }

        matches.forEach((station, index) => {
            const meta = getAccessMeta(station.accessibility);
            const option = document.createElement('li');
            option.id = `${this.boundId}-opt-${index}`;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.dataset.value = station.name;
            option.innerHTML = `
                <span class="combobox-name">${escapeText(station.name)}</span>
                <span class="access-chip ${meta.className}">${escapeText(meta.label)}</span>
            `;
            this.listbox.appendChild(option);
        });
    }

    onKeyDown(event) {
        const options = [...this.listbox.querySelectorAll('[role="option"]')];
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.openList();
            this.setActive(Math.min(this.activeIndex + 1, options.length - 1), options);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.setActive(Math.max(this.activeIndex - 1, 0), options);
        } else if (event.key === 'Enter') {
            // Always stop Enter from submitting the planner form and clearing the page.
            event.preventDefault();
            if (this.open && this.activeIndex >= 0 && options[this.activeIndex]) {
                this.selectStation(options[this.activeIndex].dataset.value);
                return;
            }
            const typed = this.input.value.trim().toLowerCase();
            const exact = this.stations.find((station) => station.name.toLowerCase() === typed);
            const firstVisible = options[0]?.dataset.value;
            if (exact) {
                this.selectStation(exact.name);
            } else if (firstVisible) {
                this.selectStation(firstVisible);
            }
        } else if (event.key === 'Escape') {
            this.closeList();
        }
    }

    setActive(index, options) {
        options.forEach((option) => option.setAttribute('aria-selected', 'false'));
        this.activeIndex = index;
        if (index < 0 || !options[index]) {
            this.input.removeAttribute('aria-activedescendant');
            return;
        }
        options[index].setAttribute('aria-selected', 'true');
        this.input.setAttribute('aria-activedescendant', options[index].id);
        options[index].scrollIntoView({ block: 'nearest' });
    }

    openList() {
        this.open = true;
        this.listbox.hidden = false;
        this.input.setAttribute('aria-expanded', 'true');
    }

    closeList() {
        this.open = false;
        this.listbox.hidden = true;
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');
        this.activeIndex = -1;
    }

    selectStation(name) {
        const station = this.stations.find((item) => item.name === name);
        if (!station) return;
        this.input.value = station.name;
        this.select.value = station.name;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.updateBadge(station.accessibility);
        this.closeList();
        this.onChange(station);
    }

    commitTypedValue() {
        const typed = this.input.value.trim();
        if (!typed) {
            this.select.value = '';
            this.updateBadge('');
            return '';
        }
        if (this.select.value && this.select.value.toLowerCase() === typed.toLowerCase()) {
            return this.select.value;
        }
        const exact = this.stations.find((station) => station.name.toLowerCase() === typed.toLowerCase());
        if (exact) {
            this.selectStation(exact.name);
            return exact.name;
        }
        return this.select.value || '';
    }

    updateBadge(level) {
        if (!this.badge) return;
        if (!level) {
            this.badge.textContent = '';
            this.badge.className = 'access-chip';
            return;
        }
        const meta = getAccessMeta(level);
        this.badge.className = `access-chip ${meta.className}`;
        this.badge.textContent = meta.label;
    }

    clear() {
        this.input.value = '';
        this.select.value = '';
        this.updateBadge('');
        this.closeList();
    }

    setValue(name) {
        if (!name) {
            this.clear();
            return;
        }
        this.selectStation(name);
    }

    getValue() {
        return this.commitTypedValue() || this.select.value;
    }
}

const modeMessage = (mode) => (
    mode === 'step-free'
        ? 'No matching step-free stations. Try a different spelling or turn off the step-free filter.'
        : 'No matching stations. Try a different spelling.'
);

const escapeText = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
