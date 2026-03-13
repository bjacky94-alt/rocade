        const $ = (s) => document.querySelector(s);

        let appState = {
            screen: 'room-selection',
            selectedRoom: null,
            selectedAisle: null
        };

        function showToast(msg, type = 'info') {
            const container = $('#toast-container');
            const el = document.createElement('div');
            el.className = `toast ${type}`;
            el.innerHTML = `<span>${msg}</span>`;
            container.appendChild(el);
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateX(120%)';
                setTimeout(() => el.remove(), 400);
            }, 3000);
        }

        const generatePorts = (count, type) => Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            type: type,
            active: false
        }));

        const generateRange = (prefix, start, end, typeStr, portTypeStr, portCount, pad = false) => {
            const panels = [];
            for (let i = start; i <= end; i++) {
                const num = pad ? i.toString().padStart(2, '0') : i;
                panels.push({
                    type: typeStr,
                    name: `${prefix}${num}`,
                    ports: generatePorts(portCount, portTypeStr)
                });
            }
            return panels;
        };

        const createAisle = (id, specificConfig = null) => {
            if (specificConfig) return specificConfig;
            return {
                id: id,
                rows: [
                    { name: "Rangée LTI", panels: [...generateRange(`A${id} LTI C-`, 1, 3, 'rj45', 'rj45', 48), ...generateRange(`A${id} LTI F-`, 1, 8, 'fo', 'fiber', 12, true)] },
                    { name: "Rangée LTR", panels: [...generateRange(`A${id} LTR F-`, 1, 20, 'fo', 'fiber', 12, true), ...generateRange(`A${id} LTR C-`, 1, 20, 'rj45', 'rj45', 24, true)] }
                ]
            };
        };

        const ibmConfig = [
            { id: 1, rows: [{ name: "Rangée LTI (2.I.1)", panels: [...generateRange('2.I.1 C-1-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.1 F-1-', 1, 7, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.1 F-', 1, 12, 'fo', 'fiber', 12, true), ...generateRange('2.R.1 C-', 1, 12, 'rj45', 'rj45', 24, true)] }] },
            { id: 2, rows: [{ name: "Rangée LTI (2.I.1 & 2.I.2)", panels: [...generateRange('2.I.1 C-2-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.1 F-2-', 1, 7, 'fo', 'fiber', 12), ...generateRange('2.I.2 F-1-', 1, 4, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.2 F-', 1, 6, 'fo', 'fiber', 12, true), ...generateRange('2.R.2 F-', 9, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.2 C-', 1, 15, 'rj45', 'rj45', 24, true)] }] },
            { id: 3, rows: [{ name: "Rangée LTI", panels: [...generateRange('2.I.1 C-3-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.1 F-3-', 1, 7, 'fo', 'fiber', 12), ...generateRange('2.I.2 C-', 1, 4, 'rj45', 'rj45', 48, true), ...generateRange('2.I.3 C-3-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.3 C5-', 1, 2, 'rj45', 'rj45', 48, true)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.3 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.3 C-', 1, 12, 'rj45', 'rj45', 24, true)] }] },
            { id: 4, rows: [{ name: "Rangée LTI", panels: [...generateRange('2.I.1 C-4-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.1 F-4-', 1, 7, 'fo', 'fiber', 12), ...generateRange('2.I.4 C-4-', 1, 6, 'rj45', 'rj45', 48), ...generateRange('2.I.4 F-4-', 1, 6, 'fo', 'fiber', 12), ...generateRange('2.I.2 F-3-', 1, 4, 'fo', 'fiber', 12), ...generateRange('2.I.2 F-4-', 1, 4, 'fo', 'fiber', 12), ...generateRange('2.I.2 F-2-', 1, 4, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.4 F-', 1, 10, 'fo', 'fiber', 12, true), ...generateRange('2.R.4 F-', 13, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.4 C-', 1, 15, 'rj45', 'rj45', 24, true)] }] },
            { id: 5, rows: [{ name: "Rangée LTI", panels: [...generateRange('2.I.3 C-5-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.5 F-5-', 1, 7, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.5 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.5 C-', 1, 16, 'rj45', 'rj45', 24, true)] }] },
            { id: 6, rows: [{ name: "Rangée LTI", panels: [...generateRange('2.I.3 C-6-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.3 F-6-', 1, 7, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.6 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.6 C-', 1, 16, 'rj45', 'rj45', 24, true)] }] },
            { id: 7, rows: [{ name: "Rangée LTI", panels: [...generateRange('2.I.3 C-7-', 1, 2, 'rj45', 'rj45', 48), ...generateRange('2.I.3 F-7-', 1, 7, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('2.R.7 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('2.R.7 C-', 1, 16, 'rj45', 'rj45', 24, true)] }] }
        ];

        const cop7Config = [
            { id: 1, rows: [{ name: "Rangée LTI (5.I.4)", panels: [...generateRange('5.I.4 C-1-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.4 F-1-', 1, 8, 'fo', 'fiber', 12, true)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.1 F-', 1, 20, 'fo', 'fiber', 12, true), ...generateRange('5.R.1 C-', 1, 20, 'rj45', 'rj45', 24, true)] }] },
            { id: 2, rows: [{ name: "Rangée LTI (5.I.4)", panels: [...generateRange('5.I.4 C-2-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.4 F-2-', 1, 8, 'fo', 'fiber', 12, true)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.2 F-', 1, 20, 'fo', 'fiber', 12, true), ...generateRange('5.R.2 C-', 1, 20, 'rj45', 'rj45', 24, true)] }] },
            { id: 3, rows: [{ name: "Rangée LTI (5.I.1)", panels: [...generateRange('5.I.1 C-3-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.1 F-3-', 1, 8, 'fo', 'fiber', 12, true)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.3 F-', 1, 20, 'fo', 'fiber', 12, true), ...generateRange('5.R.3 C-', 1, 20, 'rj45', 'rj45', 24, true)] }] },
            { id: 4, rows: [{ name: "Rangée LTI (5.I.3)", panels: [...generateRange('5.I.3 C-4-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.3 F-4-', 1, 8, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.4 F-', 1, 20, 'fo', 'fiber', 12, true), ...generateRange('5.R.4 C-', 1, 20, 'rj45', 'rj45', 24, true)] }] },
            { id: 5, rows: [{ name: "Rangée LTI (5.I.3)", panels: [...generateRange('5.I.3 C-5-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.3 F-5-', 1, 8, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-1-', 1, 3, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-4-', 1, 2, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.5 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('5.R.5 C-', 1, 18, 'rj45', 'rj45', 24, true)] }] },
            { id: 6, rows: [{ name: "Rangée LTI (5.I.3)", panels: [...generateRange('5.I.3 C-6-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.3 F-6-', 1, 8, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-2-', 1, 2, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-3-', 1, 4, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-5-', 1, 2, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-7-', 1, 4, 'fo', 'fiber', 12), ...generateRange('5.I.3 F-9-', 1, 4, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.6 F-', 1, 16, 'fo', 'fiber', 12, true), ...generateRange('5.R.6 C-', 1, 18, 'rj45', 'rj45', 24, true)] }] },
            { id: 7, rows: [{ name: "Rangée LTI", panels: [...generateRange('5.I.1 C-7-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.1 F-7-', 1, 8, 'fo', 'fiber', 12, true), ...generateRange('5.I.2 C-7-', 1, 5, 'rj45', 'rj45', 48, true), ...generateRange('5.I.3 C-7-', 1, 4, 'rj45', 'rj45', 48), ...generateRange('5.I.4 C-7-', 5, 8, 'rj45', 'rj45', 48, true), ...generateRange('5.I.4 C-7-', 1, 4, 'rj45', 'rj45', 48, true), ...generateRange('5.I.4 F-7-', 1, 4, 'fo', 'fiber', 12, true), ...generateRange('5.I.4 F-7-', 5, 8, 'fo', 'fiber', 12), ...generateRange('5.I.4 F-7-', 9, 12, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.7 F-', 1, 15, 'fo', 'fiber', 12, true), ...generateRange('5.R.7 C-', 1, 14, 'rj45', 'rj45', 24, true)] }] },
            { id: 8, rows: [{ name: "Rangée LTI", panels: [...generateRange('5.I.1 C-8-', 1, 3, 'rj45', 'rj45', 48), ...generateRange('5.I.1 F-8-', 1, 8, 'fo', 'fiber', 12)] }, { name: "Rangée LTR", panels: [...generateRange('5.R.8 F-', 1, 18, 'fo', 'fiber', 12, true), ...generateRange('5.R.8 C-', 1, 18, 'rj45', 'rj45', 24, true)] }] }
        ];

        let appData = {
            'IBM': { name: 'Salle IBM', aisles: ibmConfig.map(c => createAisle(c.id, c)) },
            'COP7': { name: 'Salle COP7', aisles: cop7Config.map(c => createAisle(c.id, c)) }
        };

        let currentRoom = null;
        let currentAisle = null;
        let currentTab = 'all';
        let currentTypeFilter = 'all';
        let searchQuery = '';
        let draggedItem = null;
        let showActiveAislesOnly = false;
        let aisleSortMode = 'load';

        let syncTimer = null;

        function scheduleSync() {
            if (syncTimer) {
                clearTimeout(syncTimer);
            }
            syncTimer = setTimeout(() => {
                syncStateToServer();
            }, 250);
        }

        async function syncStateToServer() {
            const payload = {
                data: JSON.stringify(appData),
                uiState: JSON.stringify({
                    currentRoom,
                    currentAisle,
                    screen: appState.screen
                })
            };

            try {
                const response = await fetch('/api/rocade/state', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error('Erreur API de sauvegarde', await response.text());
                }
            } catch (err) {
                console.error('Erreur de synchronisation serveur:', err);
            }
        }

        function saveToLocalStorage() {
            scheduleSync();
        }

        async function loadFromServer() {
            try {
                const response = await fetch('/api/rocade/state');
                if (!response.ok) {
                    return false;
                }

                const payload = await response.json();
                if (!payload || !payload.data || !payload.uiState) {
                    return false;
                }

                appData = JSON.parse(payload.data);
                const state = JSON.parse(payload.uiState);

                if (state.currentRoom && state.currentAisle && state.screen === 'manager') {
                    currentRoom = state.currentRoom;
                    selectRoom(currentRoom);
                    setTimeout(() => selectAisle(state.currentAisle), 100);
                    return true;
                }

                if (state.currentRoom && state.screen === 'aisle-selection') {
                    currentRoom = state.currentRoom;
                    selectRoom(currentRoom);
                    return true;
                }
            } catch (err) {
                console.error('Erreur de chargement serveur:', err);
            }

            return false;
        }

        async function init() {
            const restored = await loadFromServer();
            if (!restored) {
                showRoomSelection();
            }
        }

        function openRoomAisle(roomKey, aisleId, e) {
            if (e) {
                e.stopPropagation();
            }
            selectRoom(roomKey);
            selectAisle(aisleId);
        }

        function getRoomOverview(room) {
            let totalRows = 0;
            let totalPorts = 0;
            let activePorts = 0;

            room.aisles.forEach(aisle => {
                totalRows += aisle.rows.length;
                aisle.rows.forEach(row => {
                    row.panels.forEach(panel => {
                        totalPorts += panel.ports.length;
                        activePorts += panel.ports.filter(p => p.active).length;
                    });
                });
            });

            const utilization = totalPorts > 0 ? Math.round((activePorts / totalPorts) * 100) : 0;

            return {
                aisles: room.aisles.length,
                totalRows,
                totalPorts,
                activePorts,
                utilization
            };
        }

        function getUtilizationClass(utilization) {
            if (utilization >= 90) return 'full';
            if (utilization >= 70) return 'high';
            if (utilization >= 35) return 'mid';
            return 'low';
        }

        function parseRowIdentity(rowName) {
            const upper = rowName.toUpperCase();
            const typeMatch = upper.match(/\b(LTR|LTI)\b/);

            if (!typeMatch) {
                return { type: null, emplacement: '' };
            }

            const type = typeMatch[1];
            const typeIndex = upper.indexOf(type);
            const tail = rowName.slice(typeIndex + type.length).trim();

            if (!tail) {
                return { type, emplacement: '' };
            }

            const emplacementMatch = tail.match(/[-\s\(]*([A-Za-z0-9.]+(?:-[A-Za-z0-9.]+)*)/);
            const emplacement = emplacementMatch ? emplacementMatch[1].toUpperCase() : '';

            return { type, emplacement };
        }

        function formatRowName(type, emplacement) {
            const cleanType = (type || '').toUpperCase();
            const cleanEmplacement = (emplacement || '').trim().toUpperCase();
            return cleanEmplacement ? `Rangée ${cleanType}-${cleanEmplacement}` : `Rangée ${cleanType}`;
        }

        function buildRowTabOptions(aisle) {
            const ltrEmplacements = new Set();
            let hasLtrGeneral = false;
            let hasLti = false;
            let hasOther = false;

            aisle.rows.forEach(row => {
                const identity = parseRowIdentity(row.name);

                if (identity.type === 'LTR') {
                    if (identity.emplacement) {
                        ltrEmplacements.add(identity.emplacement);
                    } else {
                        hasLtrGeneral = true;
                    }
                } else if (identity.type === 'LTI') {
                    hasLti = true;
                } else {
                    hasOther = true;
                }
            });

            const tabs = [];

            Array.from(ltrEmplacements)
                .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
                .forEach(emplacement => {
                    tabs.push({ key: `ltr:${emplacement}`, label: `LTR-${emplacement}` });
                });

            if (hasLtrGeneral) {
                tabs.push({ key: 'ltr', label: 'LTR' });
            }

            if (hasLti) {
                tabs.push({ key: 'lti', label: 'LTI' });
            }

            if (hasOther) {
                tabs.push({ key: 'other', label: 'Autres' });
            }

            if (tabs.length === 0) {
                tabs.push({ key: 'other', label: 'Autres' });
            }

            return tabs;
        }

        function shouldShowRowForTab(rowName, tabKey) {
            if (!tabKey || tabKey === 'all') {
                return true;
            }

            const identity = parseRowIdentity(rowName);

            if (tabKey === 'lti') {
                return identity.type === 'LTI';
            }

            if (tabKey === 'ltr') {
                return identity.type === 'LTR' && !identity.emplacement;
            }

            if (tabKey.startsWith('ltr:')) {
                const emplacement = tabKey.split(':')[1] || '';
                return identity.type === 'LTR' && identity.emplacement === emplacement;
            }

            if (tabKey === 'other') {
                return !identity.type;
            }

            return true;
        }

        function beginInlineEdit(targetEl, initialValue, onCommit, onCancel = null) {
            if (!targetEl) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inline-edit-input';
            input.value = initialValue || '';
            input.setAttribute('aria-label', 'Modifier le nom');

            let finished = false;

            const cleanup = () => {
                input.removeEventListener('keydown', onKeydown);
                input.removeEventListener('blur', onBlur);
            };

            const finish = (save) => {
                if (finished) return;
                finished = true;
                cleanup();

                if (save) {
                    const value = input.value.trim();
                    if (value) {
                        onCommit(value);
                        return;
                    }
                }

                if (typeof onCancel === 'function') {
                    onCancel();
                } else {
                    renderContent();
                }
            };

            const onKeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finish(true);
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    finish(false);
                }
            };

            const onBlur = () => finish(true);

            input.addEventListener('keydown', onKeydown);
            input.addEventListener('blur', onBlur);

            targetEl.replaceWith(input);
            input.focus();
            input.select();
        }

        function buildHomeAislesPreview(roomKey, room) {
            return room.aisles
                .map(aisle => {
                    let totalPorts = 0;
                    let activePorts = 0;

                    aisle.rows.forEach(row => {
                        row.panels.forEach(panel => {
                            totalPorts += panel.ports.length;
                            activePorts += panel.ports.filter(p => p.active).length;
                        });
                    });

                    const utilization = totalPorts > 0 ? Math.round((activePorts / totalPorts) * 100) : 0;
                    const utilClass = getUtilizationClass(utilization);

                    return `
                        <button class="aisle-tile ${utilClass}" onclick="openRoomAisle('${roomKey}', ${aisle.id}, event)">
                            <span class="aisle-tile-head">
                                <span class="aisle-tile-name">Allée ${aisle.id}</span>
                                <span class="aisle-tile-rate">${utilization}%</span>
                            </span>
                            <span class="aisle-tile-meta">${activePorts}/${totalPorts} ports actifs</span>
                            <span class="aisle-tile-bar">
                                <span class="aisle-tile-bar-fill ${utilClass}" style="width: ${utilization}%"></span>
                            </span>
                        </button>
                    `;
                })
                .join('');
        }

        function showRoomSelection() {
            appState.screen = 'room-selection';
            appState.selectedRoom = null;
            currentRoom = null;
            saveToLocalStorage();

            $('#headerStats').classList.add('hidden');
            $('#btnExport').classList.add('hidden');
            $('#btnImport').classList.add('hidden');
            $('#btnBack').classList.add('hidden');

            const ibmOverview = getRoomOverview(appData.IBM);
            const cop7Overview = getRoomOverview(appData.COP7);

            const ibmAislesPreview = buildHomeAislesPreview('IBM', appData.IBM);
            const cop7AislesPreview = buildHomeAislesPreview('COP7', appData.COP7);

            const container = $('#mainContent');
            container.innerHTML = `
                <div class="selection-screen">
                    <div class="selection-title">Bienvenue sur Rocade Manager</div>
                    <div class="selection-subtitle">Sélectionnez une salle ou accédez directement à une allée</div>
                    <div class="selection-grid room-grid">
                        <div class="selection-card room-card" onclick="selectRoom('IBM')">
                            <div class="selection-card-badge">${ibmOverview.aisles} Allées</div>
                            <div class="selection-card-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div class="selection-card-title">Salle IBM</div>
                            <div class="selection-card-info">
                                Gestion des châssis et ports réseau de la salle IBM
                            </div>
                            <div class="room-stats">
                                <div class="room-stat">
                                    <div class="room-stat-value">${ibmOverview.totalRows}</div>
                                    <div class="room-stat-label">Rangées</div>
                                </div>
                                <div class="room-stat">
                                    <div class="room-stat-value">${ibmOverview.activePorts}</div>
                                    <div class="room-stat-label">Ports actifs</div>
                                </div>
                                <div class="room-stat">
                                    <div class="room-stat-value">${ibmOverview.utilization}%</div>
                                    <div class="room-stat-label">Occupation</div>
                                </div>
                            </div>
                            <div class="room-aisles-block">
                                <div class="room-aisles-label">Allées de la salle</div>
                                <div class="room-aisles-preview">${ibmAislesPreview}</div>
                            </div>
                        </div>
                        <div class="selection-card room-card" onclick="selectRoom('COP7')">
                            <div class="selection-card-badge">${cop7Overview.aisles} Allées</div>
                            <div class="selection-card-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                                </svg>
                            </div>
                            <div class="selection-card-title">Salle COP7</div>
                            <div class="selection-card-info">
                                Gestion des châssis et ports réseau de la salle COP7
                            </div>
                            <div class="room-stats">
                                <div class="room-stat">
                                    <div class="room-stat-value">${cop7Overview.totalRows}</div>
                                    <div class="room-stat-label">Rangées</div>
                                </div>
                                <div class="room-stat">
                                    <div class="room-stat-value">${cop7Overview.activePorts}</div>
                                    <div class="room-stat-label">Ports actifs</div>
                                </div>
                                <div class="room-stat">
                                    <div class="room-stat-value">${cop7Overview.utilization}%</div>
                                    <div class="room-stat-label">Occupation</div>
                                </div>
                            </div>
                            <div class="room-aisles-block">
                                <div class="room-aisles-label">Allées de la salle</div>
                                <div class="room-aisles-preview">${cop7AislesPreview}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function selectRoom(roomKey) {
            appState.screen = 'manager';
            appState.selectedRoom = roomKey;
            currentRoom = roomKey;
            currentTab = 'all';

            const room = appData[roomKey];
            if (!room || room.aisles.length === 0) {
                showToast("Aucune allée disponible pour cette salle", "error");
                return;
            }

            const firstAisleId = room.aisles
                .map(a => a.id)
                .sort((a, b) => a - b)[0];

            currentAisle = firstAisleId;
            appState.selectedAisle = firstAisleId;
            saveToLocalStorage();

            $('#btnBack').classList.remove('hidden');

            $('#headerStats').classList.remove('hidden');
            $('#btnExport').classList.remove('hidden');
            $('#btnImport').classList.remove('hidden');

            renderContent();
            updateHeaderStats();
        }

        function selectAisle(aisleId) {
            appState.screen = 'manager';
            appState.selectedAisle = aisleId;
            currentAisle = aisleId;
            saveToLocalStorage();

            $('#headerStats').classList.remove('hidden');
            $('#btnExport').classList.remove('hidden');
            $('#btnImport').classList.remove('hidden');

            renderContent();
            updateHeaderStats();
        }

        function goBack() {
            if (appState.screen === 'aisle-selection') {
                showRoomSelection();
            } else if (appState.screen === 'manager') {
                showRoomSelection();
            }
        }

        function updateHeaderStats() {
            const room = appData[currentRoom];
            const aisle = room?.aisles.find(a => a.id === currentAisle);
            if (!aisle) return;

            let totalPorts = 0;
            let activePorts = 0;

            aisle.rows.forEach(row => {
                row.panels.forEach(panel => {
                    totalPorts += panel.ports.length;
                    activePorts += panel.ports.filter(p => p.active).length;
                });
            });

            const utilization = totalPorts > 0 ? Math.round((activePorts / totalPorts) * 100) : 0;

            $('#totalPorts').textContent = totalPorts;
            $('#activePorts').textContent = activePorts;
            $('#utilization').textContent = utilization + '%';
        }

        function buildAisleStats(room) {
            return room.aisles.map(a => {
                let totalPorts = 0;
                let activePorts = 0;

                a.rows.forEach(row => {
                    row.panels.forEach(panel => {
                        totalPorts += panel.ports.length;
                        activePorts += panel.ports.filter(p => p.active).length;
                    });
                });

                const utilization = totalPorts > 0 ? Math.round((activePorts / totalPorts) * 100) : 0;

                return {
                    id: a.id,
                    rowsCount: a.rows.length,
                    totalPorts,
                    activePorts,
                    utilization
                };
            });
        }

        function sortAisles(aisleStats) {
            if (aisleSortMode === 'numeric') {
                return [...aisleStats].sort((left, right) => left.id - right.id);
            }

            return [...aisleStats].sort((left, right) => {
                if (right.utilization !== left.utilization) return right.utilization - left.utilization;
                if (right.activePorts !== left.activePorts) return right.activePorts - left.activePorts;
                return left.id - right.id;
            });
        }

        function toggleActiveAislesOnly() {
            showActiveAislesOnly = !showActiveAislesOnly;

            const room = appData[currentRoom];
            if (!room) return;

            const aisleStats = sortAisles(buildAisleStats(room));
            if (showActiveAislesOnly) {
                const visible = aisleStats.filter(a => a.activePorts > 0);
                const currentVisible = visible.some(a => a.id === currentAisle);
                if (!currentVisible && visible.length > 0) {
                    currentAisle = visible[0].id;
                    appState.selectedAisle = currentAisle;
                }
            }

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        function toggleAisleSortMode() {
            aisleSortMode = aisleSortMode === 'load' ? 'numeric' : 'load';
            renderContent();
            saveToLocalStorage();
        }

        function renderContent() {
            const container = $('#mainContent');
            const room = appData[currentRoom];
            const aisle = room?.aisles.find(a => a.id === currentAisle);

            if (!room || !aisle) {
                container.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-dim);font-size:1.1rem;">Sélectionnez une allée</div>`;
                return;
            }

            const scrollPos = $('.scroll-area')?.scrollTop || 0;

            const sortedAisles = sortAisles(buildAisleStats(room));
            const visibleAisles = showActiveAislesOnly
                ? sortedAisles.filter(a => a.activePorts > 0)
                : sortedAisles;

            const rowTabOptions = buildRowTabOptions(aisle);
            if (!rowTabOptions.some(tab => tab.key === currentTab)) {
                currentTab = rowTabOptions[0]?.key || 'other';
            }

            let aisleTabsHTML = '';
            visibleAisles.forEach(a => {
                const utilization = a.utilization;
                const utilizationClass = utilization >= 90 ? 'full' : utilization >= 70 ? 'high' : '';
                const statusClass = utilization >= 90 ? 'status-full' : utilization >= 70 ? 'status-high' : utilization >= 35 ? 'status-mid' : 'status-low';

                aisleTabsHTML += `
                    <button class="tab tab-aisle ${statusClass} ${a.id === currentAisle ? 'active' : ''}" onclick="loadAisle(${a.id})" aria-current="${a.id === currentAisle ? 'page' : 'false'}">
                        <span class="tab-aisle-top">
                            <span class="tab-aisle-title">Allée ${a.id}</span>
                            <span class="tab-aisle-rate ${utilizationClass}">${utilization}%</span>
                        </span>
                        <span class="tab-aisle-meta">${a.rowsCount} rangées • ${a.activePorts}/${a.totalPorts} ports actifs</span>
                        <span class="tab-aisle-progress">
                            <span class="tab-aisle-progress-fill ${utilizationClass}" style="width: ${utilization}%"></span>
                        </span>
                    </button>
                `;
            });

            if (!aisleTabsHTML) {
                aisleTabsHTML = `<div class="aisle-empty">Aucune allée active pour le moment</div>`;
            }

            let rowTabsHTML = rowTabOptions
                .map(tab => `<button class="tab ${currentTab === tab.key ? 'active' : ''}" onclick="setTab('${tab.key}')">${tab.label}</button>`)
                .join('');

            const rowTabActionsHTML = `
                <div class="row-tab-actions">
                    <button class="tab-action-btn" onclick="addRowWithType('LTR')">+ LTR</button>
                    <button class="tab-action-btn" onclick="addRowWithType('LTI')">+ LTI</button>
                </div>
            `;

            let html = `
                <div class="toolbar">
                    <div class="toolbar-header">
                        <div class="breadcrumb">
                            <div class="breadcrumb-item">
                                <span style="color: var(--text-muted)">${room.name}</span>
                                <span class="breadcrumb-sep">/</span>
                            </div>
                            <div class="breadcrumb-current">Allée ${aisle.id}</div>
                        </div>
                        <div class="search-box">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input type="text" placeholder="Rechercher..." value="${searchQuery}" oninput="search(this.value)">
                        </div>
                    </div>
                    <div class="aisle-tabs-header">
                        <div class="aisle-tabs-label">Navigation des allées</div>
                        <div class="aisle-tabs-actions">
                            <button class="aisle-filter-btn" onclick="toggleAisleSortMode()">Tri: ${aisleSortMode === 'load' ? 'charge' : 'numérique'}</button>
                            <button class="aisle-filter-btn ${showActiveAislesOnly ? 'active' : ''}" onclick="toggleActiveAislesOnly()">Allées actives</button>
                            <div class="aisle-tabs-count">${visibleAisles.length}/${room.aisles.length} allées</div>
                        </div>
                    </div>
                    <div class="tabs tabs-aisles">
                        ${aisleTabsHTML}
                    </div>
                    <div class="toolbar-row">
                        <div class="row-tabs-wrap">
                            <div class="tabs tabs-rows">
                                ${rowTabsHTML}
                            </div>
                            ${rowTabActionsHTML}
                        </div>
                        <div class="sub-filters" style="flex: 0 0 auto;">
                            <div class="filter-label">Type:</div>
                            <button class="filter-pill ${currentTypeFilter === 'all' ? 'active' : ''}" onclick="setTypeFilter('all')">
                                <div class="dot" style="color: white"></div> Tous
                            </button>
                            <button class="filter-pill ${currentTypeFilter === 'rj45' ? 'active' : ''}" onclick="setTypeFilter('rj45')">
                                 <div class="dot" style="color: #fbbf24"></div> RJ45
                            </button>
                            <button class="filter-pill ${currentTypeFilter === 'fo' ? 'active' : ''}" onclick="setTypeFilter('fo')">
                                 <div class="dot" style="color: #60a5fa"></div> Fibre
                            </button>
                        </div>
                    </div>
                </div>
                <div class="scroll-area">
                    <div class="rows-container">
            `;

            aisle.rows.forEach(row => {
                const safeRowName = row.name.replace(/'/g, "\\'").replace(/\"/g, "&quot;");
                const showRow = shouldShowRowForTab(row.name, currentTab);

                if (!showRow) return;

                let rowTotalPorts = 0;
                let rowActivePorts = 0;
                row.panels.forEach(panel => {
                    rowTotalPorts += panel.ports.length;
                    rowActivePorts += panel.ports.filter(p => p.active).length;
                });

                html += `<div class="row-block">
                    <div class="row-header">
                        <div class="row-title" onclick="startRenameRow('${safeRowName}', event)" style="cursor: pointer;" title="Renommer la rangée">${row.name}</div>
                        <div class="row-stats" style="align-items: center;">
                            <div class="row-stat"><strong>${row.panels.length}</strong> Châssis</div>
                            <div class="row-stat"><strong>${rowActivePorts}</strong> / ${rowTotalPorts} Ports actifs</div>
                            <button class="tool-btn" onclick="delRow('${safeRowName}')" title="Supprimer la rangée">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panels-grid">`;

                row.panels.forEach((panel, pIdx) => {
                    if (searchQuery && !panel.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
                    if (currentTypeFilter === 'rj45' && panel.type !== 'rj45') return;
                    if (currentTypeFilter === 'fo' && panel.type !== 'fo') return;

                    html += renderPanel(panel, safeRowName, pIdx);
                });

                html += `
                    <div class="add-card" title="Ajouter un châssis"
                         ondragover="handleDragOver(event)"
                         ondragenter="handleDragEnter(event)"
                         ondragleave="handleDragLeave(event)"
                         ondrop="handleDropEnd(event, '${safeRowName}')">
                        <button class="btn" onclick="addPanel('${safeRowName}', 'rj45')">+ RJ45</button>
                        <button class="btn" onclick="addPanel('${safeRowName}', 'fo')">+ Fibre</button>
                    </div>
                </div></div>`;
            });

            html += `
                <div class="add-card" title="Ajouter une rangée" style="margin-top: 10px; border-color: var(--border-color); cursor: pointer;" onclick="addRow()">
                    <div style="display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-weight: 500;">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4"/>
                        </svg>
                        Ajouter une rangée
                    </div>
                </div>
            </div></div>`;
            container.innerHTML = html;
            const sa = $('.scroll-area');
            if(sa) sa.scrollTop = scrollPos;
        }

        function renderPanel(panel, rowName, pIdx) {
            const activeCount = panel.ports.filter(p => p.active).length;
            const usage = (activeCount / panel.ports.length) * 100;
            const usageClass = usage >= 90 ? 'full' : usage >= 70 ? 'high' : '';
            const isRJ45 = panel.type === 'rj45';

            let portsHtml = '';
            panel.ports.forEach((port, idx) => {
                const activeClass = port.active ? 'active' : '';
                const statusText = port.active ? 'Actif' : 'Inactif';
                const portNameDisplay = port.name ? ` : ${port.name}` : '';
                portsHtml += `
                    <div class="port ${activeClass}" onclick="togglePort('${rowName}', ${pIdx}, ${idx})" oncontextmenu="renamePort(event, '${rowName}', ${pIdx}, ${idx})">
                        <div class="port-tooltip">Port ${port.id}${portNameDisplay} - ${statusText}</div>
                        <div class="led"></div>
                        <div class="connector ${isRJ45 ? 'rj45-body' : 'fiber-body'}">
                            ${isRJ45 ?
                                '<div class="rj45-pins"><div class="rj45-pin"></div><div class="rj45-pin"></div><div class="rj45-pin"></div><div class="rj45-pin"></div><div class="rj45-pin"></div><div class="rj45-pin"></div></div>'
                                :
                                '<div class="lc-port"><div class="ferrule"></div></div><div class="lc-port"><div class="ferrule"></div></div>'
                            }
                        </div>
                        <div class="p-label">${port.id}</div>
                    </div>`;
            });

            return `
                <div class="panel ${panel.type}"
                     draggable="true"
                     ondragstart="handleDragStart(event, '${rowName}', ${pIdx})"
                     ondragover="handleDragOver(event)"
                     ondragenter="handleDragEnter(event)"
                     ondragleave="handleDragLeave(event)"
                     ondrop="handleDrop(event, '${rowName}', ${pIdx})"
                     ondragend="handleDragEnd(event)">
                    <div class="panel-header">
                        <div class="panel-info">
                            <div class="panel-name" onclick="startRenamePanel('${rowName}', ${pIdx}, event)">${panel.name}</div>
                            <div class="panel-meta">
                                ${panel.ports.length} Ports
                                ${activeCount > 0 ? `<span class="active-badge">${activeCount} ON</span>` : ''}
                            </div>
                            <div class="usage-bar">
                                <div class="usage-fill ${usageClass}" style="width: ${usage}%"></div>
                            </div>
                        </div>
                        <div class="panel-tools">
                            ${isRJ45 ? `
                            <button class="tool-btn" onclick="toggleRj45PortCount('${rowName}', ${pIdx})" title="Basculer entre 24 et 48 ports">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                                </svg>
                            </button>
                            ` : ''}
                            <button class="tool-btn" onclick="setAll('${rowName}', ${pIdx}, true)" title="Tout allumer">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </button>
                            <button class="tool-btn" onclick="setAll('${rowName}', ${pIdx}, false)" title="Tout éteindre">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                </svg>
                            </button>
                            <button class="tool-btn" onclick="delPanel('${rowName}', ${pIdx})" title="Supprimer">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="ports ${isRJ45 ? 'rj45' : 'fiber'}">${portsHtml}</div>
                </div>`;
        }

        function setTab(t) { currentTab = t; renderContent(); }
        function setTypeFilter(t) { currentTypeFilter = t; renderContent(); }
        function search(v) { searchQuery = v; renderContent(); }

        function loadAisle(aisleId) {
            currentAisle = aisleId;
            appState.selectedAisle = aisleId;
            searchQuery = '';
            currentTab = 'all';
            renderContent();
            updateHeaderStats();
        }

        function togglePort(rName, pIdx, ptIdx) {
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            row.panels[pIdx].ports[ptIdx].active = !row.panels[pIdx].ports[ptIdx].active;
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        function setAll(rName, pIdx, state) {
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            row.panels[pIdx].ports.forEach(p => p.active = state);
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast(state ? "Tous les ports activés" : "Tous les ports désactivés", "success");
        }

        function startRenamePanel(rName, pIdx, e) {
            e.stopPropagation();
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            if (!row) return;

            const panel = row.panels[pIdx];
            if (!panel) return;

            beginInlineEdit(
                e.currentTarget,
                panel.name,
                (newName) => {
                    panel.name = newName;
                    row.panels.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }));
                    renderContent();
                    saveToLocalStorage();
                    showToast("Nom du châssis mis à jour", "success");
                }
            );
        }

        function renamePort(e, rName, pIdx, ptIdx) {
            e.preventDefault();
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            const port = row.panels[pIdx].ports[ptIdx];
            const newN = prompt(`Nom ou description pour le port ${port.id} :`, port.name || "");
            if (newN !== null) {
                port.name = newN.trim();
                renderContent();
                saveToLocalStorage();
            }
        }

        function startRenameRow(oldName, e) {
            e.stopPropagation();
            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            const row = aisle.rows.find(r => r.name === oldName);
            if (!row) return;

            const identity = parseRowIdentity(row.name);

            const initialText = (identity.type === 'LTR' || identity.type === 'LTI')
                ? (identity.emplacement || '')
                : row.name;

            beginInlineEdit(
                e.currentTarget,
                initialText,
                (newValue) => {
                    const nextName = (identity.type === 'LTR' || identity.type === 'LTI')
                        ? formatRowName(identity.type, newValue)
                        : newValue;

                    if (aisle.rows.some(r => r !== row && r.name.toUpperCase() === nextName.toUpperCase())) {
                        showToast("Une rangée avec ce nom existe déjà", "error");
                        renderContent();
                        return;
                    }

                    row.name = nextName;
                    currentTab = 'all';
                    renderContent();
                    saveToLocalStorage();
                    showToast("Rangée renommée", "success");
                }
            );
        }

        function delRow(rName) {
            if (!confirm(`Êtes-vous sûr de vouloir supprimer la rangée "${rName}" et tous les châssis qu'elle contient ? Cette action est irréversible.`)) return;
            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            const rowIndex = aisle.rows.findIndex(r => r.name === rName);
            if (rowIndex > -1) {
                aisle.rows.splice(rowIndex, 1);
                currentTab = 'all';
                renderContent();
                updateHeaderStats();
                saveToLocalStorage();
                showToast("Rangée supprimée");
            }
        }

        function addRow() {
            const typeInput = prompt("Type de la rangée (LTR ou LTI) :", "LTR");
            if (!typeInput) return;

            const rowType = typeInput.trim().toUpperCase();
            if (rowType !== 'LTR' && rowType !== 'LTI') {
                showToast("Type invalide. Utilisez LTR ou LTI.", "error");
                return;
            }

            const emplacementInput = prompt("Emplacement (ex: E10, M10) :", "E10");
            if (!emplacementInput || !emplacementInput.trim()) return;

            const rowName = formatRowName(rowType, emplacementInput);

            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            if (aisle.rows.some(r => r.name.toUpperCase() === rowName.toUpperCase())) {
                showToast("Une rangée avec ce nom existe déjà", "error");
                return;
            }

            aisle.rows.push({
                name: rowName,
                panels: []
            });
            renderContent();
            saveToLocalStorage();
            showToast("Rangée ajoutée", "success");
        }

        function delPanel(rName, pIdx) {
            if (!confirm("Supprimer ce châssis ?")) return;
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            row.panels.splice(pIdx, 1);
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast("Châssis supprimé");
        }

        function addPanel(rName, type) {
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);

            const defaultName = type === 'rj45' ? 'Nouveau RJ45' : 'Nouveau FO';
            const panelName = prompt("Nom du nouveau châssis :", defaultName);

            if (panelName === null) return;
            const finalName = panelName.trim() || defaultName;

            const count = type === 'fo' ? 12 : 24;

            row.panels.push({
                type: type,
                name: finalName,
                ports: generatePorts(count, type === 'rj45' ? 'rj45' : 'fiber')
            });

            row.panels.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }));

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast("Châssis ajouté", "success");
        }

        function addRowWithType(rowType) {
            const safeType = (rowType || '').toUpperCase();
            if (safeType !== 'LTR' && safeType !== 'LTI') return;

            const emplacementInput = prompt(`Emplacement pour ${safeType} (ex: E10, M10) :`, safeType === 'LTR' ? 'E10' : 'I10');
            if (!emplacementInput || !emplacementInput.trim()) return;

            const rowName = formatRowName(safeType, emplacementInput);
            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            if (!aisle) return;

            if (aisle.rows.some(r => r.name.toUpperCase() === rowName.toUpperCase())) {
                showToast("Cette rangée existe déjà", "error");
                return;
            }

            aisle.rows.push({ name: rowName, panels: [] });
            currentTab = safeType === 'LTR' ? `ltr:${emplacementInput.trim().toUpperCase()}` : 'lti';
            renderContent();
            saveToLocalStorage();
            showToast(`${rowName} ajoutée`, 'success');
        }

        function toggleRj45PortCount(rName, pIdx) {
            const row = appData[currentRoom].aisles.find(a => a.id === currentAisle).rows.find(r => r.name === rName);
            const panel = row.panels[pIdx];

            if (panel.type !== 'rj45') return;

            const currentCount = panel.ports.length;
            const newCount = currentCount === 24 ? 48 : 24;

            if (newCount === currentCount) return;

            if (newCount > currentCount) {
                const newPorts = generatePorts(newCount - currentCount, 'rj45');
                newPorts.forEach((p, i) => p.id = currentCount + i + 1);
                panel.ports = panel.ports.concat(newPorts);
            } else {
                if (confirm(`Attention, réduire à ${newCount} ports supprimera les données des ports supérieurs. Continuer ?`)) {
                    panel.ports = panel.ports.slice(0, newCount);
                } else {
                    return;
                }
            }

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast(`Châssis mis à jour (${newCount} ports)`, "success");
        }

        function exportData() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `rocade_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            showToast("Configuration exportée avec succès", "success");
        }

        function triggerImport() { $('#fileInput').click(); }

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (!file) return;
            const r = new FileReader();
            r.onload = async (ev) => {
                try {
                    appData = JSON.parse(ev.target.result);
                    await syncStateToServer();
                    await init();
                    showToast("Configuration importée avec succès", "success");
                } catch(err) {
                    showToast("Erreur : fichier invalide", "error");
                }
                e.target.value = '';
            };
            r.readAsText(file);
        }

        async function resetData() {
            if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) return;
            try {
                const response = await fetch('/api/rocade/state', { method: 'DELETE' });
                if (!response.ok) {
                    showToast("Impossible de réinitialiser côté serveur", "error");
                    return;
                }
                location.reload();
            } catch (err) {
                console.error('Erreur de réinitialisation:', err);
                showToast("Erreur réseau lors de la réinitialisation", "error");
            }
        }

        function handleDragStart(e, rName, pIdx) {
            draggedItem = { rowName: rName, panelIndex: pIdx };
            setTimeout(() => { if(e.target) e.target.classList.add('dragging'); }, 0);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', pIdx);
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDragEnter(e) {
            e.preventDefault();
            const dropTarget = e.target.closest('.panel') || e.target.closest('.add-card');
            if (dropTarget) dropTarget.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            const dropTarget = e.target.closest('.panel') || e.target.closest('.add-card');
            if (dropTarget && !dropTarget.contains(e.relatedTarget)) {
                dropTarget.classList.remove('drag-over');
            }
        }

        function handleDragEnd(e) {
            if(e.target) e.target.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            draggedItem = null;
        }

        function handleDrop(e, targetRowName, targetIdx) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

            if (!draggedItem) return;

            const sourceRowName = draggedItem.rowName;
            const sourceIdx = draggedItem.panelIndex;

            if (sourceRowName === targetRowName && sourceIdx === targetIdx) return;

            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            const sourceRow = aisle.rows.find(r => r.name === sourceRowName);
            const targetRow = aisle.rows.find(r => r.name === targetRowName);

            if (!sourceRow || !targetRow) return;

            const [movedPanel] = sourceRow.panels.splice(sourceIdx, 1);

            let insertIdx = targetIdx;
            if (sourceRowName === targetRowName && sourceIdx < targetIdx) {
                insertIdx--;
            }

            targetRow.panels.splice(insertIdx, 0, movedPanel);

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        function handleDropEnd(e, targetRowName) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

            if (!draggedItem) return;

            const sourceRowName = draggedItem.rowName;
            const sourceIdx = draggedItem.panelIndex;

            const aisle = appData[currentRoom].aisles.find(a => a.id === currentAisle);
            const sourceRow = aisle.rows.find(r => r.name === sourceRowName);
            const targetRow = aisle.rows.find(r => r.name === targetRowName);

            if (!sourceRow || !targetRow) return;

            if (sourceRowName === targetRowName && sourceIdx === sourceRow.panels.length - 1) return;

            const [movedPanel] = sourceRow.panels.splice(sourceIdx, 1);
            targetRow.panels.push(movedPanel);

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        init();
