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
        let searchQuery = '';
        let showActiveAislesOnly = false;

        const STORAGE_DATA_KEY = 'rocade_app_data_v1';
        const STORAGE_UI_KEY = 'rocade_app_ui_v1';
        const IS_STATIC_DEPLOY = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
        const CONFIGURED_CLOUD_API_BASE = (window.__ROCADE_CLOUD_API__ || '').trim().replace(/\/$/, '');
        const CLOUD_API_BASE = CONFIGURED_CLOUD_API_BASE || '';
        const CLOUD_ENABLED = !IS_STATIC_DEPLOY || Boolean(CLOUD_API_BASE);

        function apiUrl(path) {
            if (CLOUD_API_BASE) {
                return `${CLOUD_API_BASE}${path}`;
            }
            return path;
        }

        let syncTimer = null;

        function setCloudSyncStatus(message, status = 'idle') {
            const statusEl = $('#cloudSyncStatus');
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.dataset.status = status;
        }

        function setCloudSaveLoading(isLoading) {
            const saveButton = $('#btnCloudSave');
            if (!saveButton) return;
            saveButton.classList.toggle('is-loading', isLoading);
        }

        function formatTimeFromIso(isoValue) {
            if (!isoValue) return '';

            const dt = new Date(isoValue);
            if (Number.isNaN(dt.getTime())) {
                return '';
            }

            return dt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function scheduleSync() {
            if (syncTimer) {
                clearTimeout(syncTimer);
            }
            syncTimer = setTimeout(() => {
                syncStateToServer();
            }, 250);
        }

        async function syncStateToServer(options = {}) {
            const {
                showSuccessToast = false,
                showErrorToast = false
            } = options;

            const payload = {
                data: JSON.stringify(appData),
                uiState: JSON.stringify({
                    currentRoom,
                    currentAisle,
                    screen: appState.screen
                })
            };

            if (!CLOUD_ENABLED) {
                localStorage.setItem(STORAGE_DATA_KEY, payload.data);
                localStorage.setItem(STORAGE_UI_KEY, payload.uiState);
                setCloudSyncStatus('Mode local: sauvegarde navigateur', 'idle');

                if (showSuccessToast) {
                    showToast('Sauvegarde locale effectuée (pas de cloud sur ce mode)', 'success');
                }

                return true;
            }

            try {
                setCloudSaveLoading(true);
                setCloudSyncStatus('Synchronisation cloud en cours...', 'syncing');

                const response = await fetch(apiUrl('/api/rocade/state'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const result = await response.json();
                const savedAt = formatTimeFromIso(result.updatedAt);
                const label = savedAt
                    ? `Cloud synchronise a ${savedAt}`
                    : 'Cloud synchronise';

                setCloudSyncStatus(label, 'ok');

                if (showSuccessToast) {
                    showToast('Donnees sauvegardees dans le cloud', 'success');
                }

                return true;
            } catch (err) {
                console.error('Erreur de synchronisation serveur:', err);
                setCloudSyncStatus('Erreur de synchronisation cloud', 'error');

                if (showErrorToast) {
                    showToast('Echec de la sauvegarde cloud', 'error');
                }

                return false;
            } finally {
                setCloudSaveLoading(false);
            }
        }

        function saveToLocalStorage() {
            scheduleSync();
        }

        async function saveCloudNow() {
            await syncStateToServer({ showSuccessToast: true, showErrorToast: true });
        }

        async function loadFromServer() {
            const tryLoadFromLocal = () => {
                try {
                    const localData = localStorage.getItem(STORAGE_DATA_KEY);
                    const localUiState = localStorage.getItem(STORAGE_UI_KEY);
                    if (!localData || !localUiState) {
                        return false;
                    }

                    appData = JSON.parse(localData);
                    ensureCop7RequestedRows();
                    ensureCop7MainLtrOrderFromDetailedRows();
                    const state = JSON.parse(localUiState);

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
                    console.error('Erreur de chargement local:', err);
                }

                return false;
            };

            if (!CLOUD_ENABLED) {
                setCloudSyncStatus('Mode local: sauvegarde navigateur', 'idle');
                return tryLoadFromLocal();
            }

            try {
                const response = await fetch(apiUrl('/api/rocade/state'));
                if (!response.ok) {
                    setCloudSyncStatus('Cloud indisponible, tentative locale', 'error');
                    return tryLoadFromLocal();
                }

                const payload = await response.json();
                if (!payload || !payload.data || !payload.uiState) {
                    setCloudSyncStatus('Aucune sauvegarde cloud trouvee', 'idle');
                    return false;
                }

                appData = JSON.parse(payload.data);
                const loadedAt = formatTimeFromIso(payload.updatedAt);
                const loadedLabel = loadedAt
                    ? `Cloud charge (${loadedAt})`
                    : 'Cloud charge';
                setCloudSyncStatus(loadedLabel, 'ok');

                const wasNormalized = ensureCop7RequestedRows();
                const wasAligned = ensureCop7MainLtrOrderFromDetailedRows();
                if (wasNormalized || wasAligned) {
                    await syncStateToServer();
                }
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
                setCloudSyncStatus('Erreur de chargement cloud', 'error');
            }

            return tryLoadFromLocal();
        }

        async function init() {
            const restored = await loadFromServer();
            if (!restored) {
                const wasNormalized = ensureCop7RequestedRows();
                const wasAligned = ensureCop7MainLtrOrderFromDetailedRows();
                if (wasNormalized || wasAligned) {
                    await syncStateToServer();
                }
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

        function normalizeEmplacementToken(token) {
            const clean = (token || '').trim().toUpperCase();
            const match = clean.match(/^([A-Z]+)?(\d+)$/);
            if (!match) return clean;

            const prefix = match[1] || '';
            const number = String(parseInt(match[2], 10));
            return `${prefix}${number}`;
        }

        function formatRowName(type, emplacement) {
            const cleanType = (type || '').toUpperCase();
            const cleanEmplacement = (emplacement || '').trim().toUpperCase();
            return cleanEmplacement ? `Rangée ${cleanType}-${cleanEmplacement}` : `Rangée ${cleanType}`;
        }

        function computeRowsStats(rows) {
            let totalPorts = 0;
            let activePorts = 0;

            rows.forEach(row => {
                row.panels.forEach(panel => {
                    totalPorts += panel.ports.length;
                    activePorts += panel.ports.filter(p => p.active).length;
                });
            });

            const utilization = totalPorts > 0 ? Math.round((activePorts / totalPorts) * 100) : 0;
            return { totalPorts, activePorts, utilization };
        }

        function ensureLtiVirtualRows(room) {
            if (!room) return [];
            if (Array.isArray(room.ltiVirtualRows) && room.ltiVirtualRows.length === 4) {
                return room.ltiVirtualRows;
            }

            const groupedPanels = { 1: [], 2: [], 3: [], 4: [] };

            room.aisles.forEach(aisle => {
                aisle.rows.forEach(row => {
                    const identity = parseRowIdentity(row.name);
                    if (identity.type !== 'LTI') return;

                    (row.panels || []).forEach(panel => {
                        const panelName = (panel?.name || '').trim();
                        const match = panelName.match(/^5[.\-]I[.\-](\d)\b/i);
                        if (!match) return;

                        const family = parseInt(match[1], 10);
                        if (family >= 1 && family <= 4) {
                            groupedPanels[family].push(JSON.parse(JSON.stringify(panel)));
                        }
                    });
                });
            });

            room.ltiVirtualRows = [1, 2, 3, 4].map(i => ({
                name: `LTI-${String(i).padStart(2, '0')}`,
                panels: groupedPanels[i]
            }));

            return room.ltiVirtualRows;
        }

        function buildLtiVirtualAisle(room) {
            return { id: 'LTI', rows: ensureLtiVirtualRows(room) };
        }

        function getCurrentAisleData() {
            const room = appData[currentRoom];
            if (!room) return null;
            if (currentAisle === 'LTI') return buildLtiVirtualAisle(room);
            return room.aisles.find(a => a.id === currentAisle) || null;
        }

        function getRowForCurrentContext(rName) {
            const aisle = getCurrentAisleData();
            if (!aisle) return null;
            return aisle.rows.find(r => r.name === rName) || null;
        }

        function syncLtiPanelPortStates(sourcePanel) {
            const room = appData[currentRoom];
            if (!room || !sourcePanel) return false;

            const sourceName = (sourcePanel.name || '').trim();
            if (!sourceName || !Array.isArray(sourcePanel.ports)) return false;

            const syncPorts = targetPanel => {
                if (!targetPanel || targetPanel === sourcePanel || !Array.isArray(targetPanel.ports)) return false;
                if (targetPanel.type !== sourcePanel.type || (targetPanel.name || '').trim() !== sourceName) return false;

                let changed = false;
                targetPanel.ports.forEach((port, index) => {
                    if (!sourcePanel.ports[index]) return;
                    const next = Boolean(sourcePanel.ports[index].active);
                    if (port.active !== next) {
                        port.active = next;
                        changed = true;
                    }
                });
                return changed;
            };

            let changed = false;

            room.aisles.forEach(aisle => {
                aisle.rows.forEach(row => {
                    if (parseRowIdentity(row.name).type !== 'LTI') return;
                    (row.panels || []).forEach(panel => {
                        changed = syncPorts(panel) || changed;
                    });
                });
            });

            if (Array.isArray(room.ltiVirtualRows)) {
                room.ltiVirtualRows.forEach(row => {
                    (row.panels || []).forEach(panel => {
                        changed = syncPorts(panel) || changed;
                    });
                });
            }

            return changed;
        }

        function ensureCop7RequestedRows() {
            const room = appData.COP7;
            if (!room || !Array.isArray(room.aisles)) return false;

            const targetByAisle = {
                1: 9,
                2: 14,
                3: 19,
                4: 24,
                5: 28,
                6: 33,
                7: 39,
                8: 44,
            };

            const ltrLetters = ['D', 'F', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W'];
            let changed = false;

            room.aisles.forEach(aisle => {
                const targetNum = targetByAisle[aisle.id];
                if (!targetNum || !Array.isArray(aisle.rows)) return;

                const existing = new Set(
                    aisle.rows
                        .map(row => parseRowIdentity(row.name))
                        .filter(identity => identity.type)
                        .map(identity => `${identity.type}:${normalizeEmplacementToken(identity.emplacement)}`)
                );

                ltrLetters.forEach(letter => {
                    const emplacement = `${letter}${targetNum}`;
                    const key = `LTR:${normalizeEmplacementToken(emplacement)}`;

                    if (!existing.has(key)) {
                        aisle.rows.push({ name: formatRowName('LTR', emplacement), panels: [] });
                        existing.add(key);
                        changed = true;
                    }
                });

                const ltiEmplacement = `${targetNum}`;
                const ltiKey = `LTI:${normalizeEmplacementToken(ltiEmplacement)}`;
                if (!existing.has(ltiKey)) {
                    aisle.rows.push({ name: formatRowName('LTI', ltiEmplacement), panels: [] });
                    changed = true;
                }
            });

            return changed;
        }

        function ensureCop7MainLtrOrderFromDetailedRows() {
            const room = appData.COP7;
            if (!room || !Array.isArray(room.aisles)) return false;

            const suffixByAisle = {
                1: '9',
                2: '14',
                3: '19',
                4: '24',
                5: '28',
                6: '33',
                7: '39',
                8: '44',
            };

            const ltrLetters = ['W', 'U', 'S', 'Q', 'O', 'M', 'K', 'I', 'F', 'D'];
            let changed = false;

            const getPanelSortKey = panel => {
                const name = (panel?.name || '').trim();
                if (panel?.type === 'rj45') {
                    const cMatch = name.match(/C-(\d+)$/i);
                    return [0, cMatch ? parseInt(cMatch[1], 10) : 999, name];
                }
                const fMatch = name.match(/F-(\d+)$/i);
                return [1, fMatch ? parseInt(fMatch[1], 10) : 999, name];
            };

            room.aisles.forEach(aisle => {
                const suffix = suffixByAisle[aisle.id];
                if (!suffix || !Array.isArray(aisle.rows)) return;

                const rowsByName = new Map(aisle.rows.map(row => [row.name, row]));
                const mainLtrRow = rowsByName.get('Rangée LTR');
                if (!mainLtrRow) return;

                const collected = [];
                const seen = new Set();

                ltrLetters.forEach(letter => {
                    const detailedRow = rowsByName.get(`Rangée LTR-${letter}${suffix}`);
                    if (!detailedRow || !Array.isArray(detailedRow.panels)) return;

                    detailedRow.panels.forEach(panel => {
                        const name = (panel?.name || '').trim();
                        if (!name || name.toLowerCase() === 'rocade vide') return;

                        const key = `${panel.type}::${name}`;
                        if (seen.has(key)) return;
                        seen.add(key);
                        collected.push(JSON.parse(JSON.stringify(panel)));
                    });
                });

                if (collected.length === 0) return;

                collected.sort((a, b) => {
                    const [ta, na, sa] = getPanelSortKey(a);
                    const [tb, nb, sb] = getPanelSortKey(b);
                    if (ta !== tb) return ta - tb;
                    if (na !== nb) return na - nb;
                    return sa.localeCompare(sb, 'fr', { numeric: true });
                });

                const currentSignature = JSON.stringify(mainLtrRow.panels || []);
                const nextSignature = JSON.stringify(collected);
                if (currentSignature !== nextSignature) {
                    mainLtrRow.panels = collected;
                    changed = true;
                }
            });

            return changed;
        }

        function syncCop7LtrPanelPortStates(aisleId, sourceRowName, sourcePanel) {
            if (currentRoom !== 'COP7') return false;
            if (!sourcePanel || !sourcePanel.name) return false;

            const sourceName = sourcePanel.name.trim();
            if (!/^5\.R\./i.test(sourceName)) return false;

            const room = appData.COP7;
            const aisle = room?.aisles?.find(a => a.id === aisleId);
            if (!aisle || !Array.isArray(aisle.rows)) return false;

            const mainRow = aisle.rows.find(r => r.name === 'Rangée LTR');
            const sourceRow = aisle.rows.find(r => r.name === sourceRowName);
            if (!sourceRow) return false;

            const sourceType = sourcePanel.type;
            const sourceActiveByPortId = new Map(
                (sourcePanel.ports || []).map(port => [port.id, Boolean(port.active)])
            );

            const isSourceMain = sourceRowName === 'Rangée LTR';
            const targets = isSourceMain
                ? aisle.rows.filter(r => r !== sourceRow && r.name.startsWith('Rangée LTR-'))
                : (mainRow ? [mainRow] : []);

            let changed = false;
            targets.forEach(row => {
                const panel = (row.panels || []).find(p => p.type === sourceType && (p.name || '').trim() === sourceName);
                if (!panel || !Array.isArray(panel.ports)) return;

                panel.ports.forEach(port => {
                    if (!sourceActiveByPortId.has(port.id)) return;
                    const next = sourceActiveByPortId.get(port.id);
                    if (port.active !== next) {
                        port.active = next;
                        changed = true;
                    }
                });
            });

            return changed;
        }

        function buildRowTabOptions(aisle) {
            // Si on est en mode LTI virtuel, afficher uniquement LTI-01 à LTI-04
            if (aisle.id === 'LTI') {
                return [
                    { key: 'lti:01', label: 'LTI-01' },
                    { key: 'lti:02', label: 'LTI-02' },
                    { key: 'lti:03', label: 'LTI-03' },
                    { key: 'lti:04', label: 'LTI-04' },
                ];
            }

            const ltrEmplacements = new Set();
            let hasLtrGeneral = false;
            let hasLti = false;
            let hasOther = false;

            aisle.rows.forEach(row => {
                const identity = parseRowIdentity(row.name);

                if (identity.type === 'LTR') {
                    if (identity.emplacement) {
                        ltrEmplacements.add(normalizeEmplacementToken(identity.emplacement));
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

            if (hasOther) {
                tabs.push({ key: 'other', label: 'Autres' });
            }

            if (hasLti) {
                tabs.push({ key: 'lti', label: 'LTI' });
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

            // Mode LTI virtuel : filtrer par lti:01 à lti:04
            if (tabKey.startsWith('lti:')) {
                // Cherche LTI-X
                const num = tabKey.split(':')[1];
                // Accepte Rangée LTI-01, Rangée LTI-02, etc.
                return identity.type === 'LTI' && identity.emplacement === num;
            }

            if (tabKey === 'lti') {
                return identity.type === 'LTI';
            }

            if (tabKey === 'ltr') {
                return identity.type === 'LTR' && !identity.emplacement;
            }

            if (tabKey.startsWith('ltr:')) {
                const emplacement = normalizeEmplacementToken(tabKey.split(':')[1] || '');
                return identity.type === 'LTR' && normalizeEmplacementToken(identity.emplacement) === emplacement;
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
            if (!room) return;

            const isLtiAisleMode = currentAisle === 'LTI';
            const aisle = isLtiAisleMode
                ? buildLtiVirtualAisle(room)
                : room.aisles.find(a => a.id === currentAisle);
            if (!aisle) return;

            const { totalPorts, activePorts, utilization } = computeRowsStats(aisle.rows);

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
            return [...aisleStats].sort((left, right) => left.id - right.id);
        }

        function toggleActiveAislesOnly() {
            showActiveAislesOnly = !showActiveAislesOnly;

            const room = appData[currentRoom];
            if (!room) return;

            const aisleStats = sortAisles(buildAisleStats(room));
            if (showActiveAislesOnly && currentAisle !== 'LTI') {
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

        function renderContent() {
            const container = $('#mainContent');
            const room = appData[currentRoom];
            const isLtiAisleMode = currentAisle === 'LTI';
            const baseAisle = room?.aisles.find(a => a.id === currentAisle);
            const ltiAisle = room ? buildLtiVirtualAisle(room) : null;
            const aisle = isLtiAisleMode ? ltiAisle : baseAisle;

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

            if (ltiAisle) {
                const ltiStats = computeRowsStats(ltiAisle.rows);
                const ltiUtilClass = ltiStats.utilization >= 90 ? 'full' : ltiStats.utilization >= 70 ? 'high' : '';

                aisleTabsHTML += `
                    <button class="tab tab-aisle ${isLtiAisleMode ? 'active' : ''}" onclick="loadLtiAisle()" aria-current="${isLtiAisleMode ? 'page' : 'false'}">
                        <span class="tab-aisle-top">
                            <span class="tab-aisle-title">Allée LTI</span>
                            <span class="tab-aisle-rate ${ltiUtilClass}">${ltiStats.utilization}%</span>
                        </span>
                        <span class="tab-aisle-meta">${ltiAisle.rows.length} rangées • ${ltiStats.activePorts}/${ltiStats.totalPorts} ports actifs</span>
                        <span class="tab-aisle-progress">
                            <span class="tab-aisle-progress-fill ${ltiUtilClass}" style="width: ${ltiStats.utilization}%"></span>
                        </span>
                    </button>
                `;
            }

            if (!aisleTabsHTML) {
                aisleTabsHTML = `<div class="aisle-empty">Aucune allée active pour le moment</div>`;
            }

            const ltrPlacementTabs = rowTabOptions.filter(tab => tab.key.startsWith('ltr:'));
            const ltrLtiTabs = rowTabOptions.filter(tab => tab.key === 'ltr' || tab.key === 'lti');
            const otherRowTabs = rowTabOptions.filter(tab => !(tab.key.startsWith('ltr:') || tab.key === 'ltr' || tab.key === 'lti'));

            const renderRowTabButton = (tab) =>
                `<button class="tab ${currentTab === tab.key ? 'active' : ''}" onclick="setTab('${tab.key}')">${tab.label}</button>`;

            const rowTabsMainHTML = ltrPlacementTabs.map(renderRowTabButton).join('');
            const rowTabsModesHTML = ltrLtiTabs.map(renderRowTabButton).join('');
            const rowTabsOtherHTML = otherRowTabs.map(renderRowTabButton).join('');

            const rowTabsHTML = `
                <div class="row-tabs-line">
                    <div class="tabs tabs-rows tabs-rows-main">
                        ${rowTabsMainHTML}
                    </div>
                    ${rowTabsModesHTML ? `<div class="row-tabs-divider"></div><div class="tabs tabs-rows tabs-rows-modes">${rowTabsModesHTML}</div>` : ''}
                    ${rowTabsOtherHTML ? `<div class="row-tabs-divider"></div><div class="tabs tabs-rows tabs-rows-other">${rowTabsOtherHTML}</div>` : ''}
                </div>
            `;

            const rowActionsBlock = isLtiAisleMode ? '' : `
                <div class="row-tab-actions">
                    <button class="tab-action-btn" onclick="addRow()">Ajouter</button>
                    <button class="tab-action-btn" onclick="renameCurrentRowFromToolbar()">Renommer</button>
                    <button class="tab-action-btn" onclick="deleteCurrentRowFromToolbar()">Supprimer</button>
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
                            <div class="breadcrumb-current">${isLtiAisleMode ? 'Allée LTI' : `Allée ${aisle.id}`}</div>
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
                            <button class="aisle-filter-btn ${showActiveAislesOnly ? 'active' : ''}" onclick="toggleActiveAislesOnly()">Allées actives</button>
                            <div class="aisle-tabs-count">${visibleAisles.length}/${room.aisles.length} allées</div>
                        </div>
                    </div>
                    <div class="tabs tabs-aisles">
                        ${aisleTabsHTML}
                    </div>
                    <div class="toolbar-row">
                        <div class="row-tabs-header">
                            <div class="row-tabs-label">Navigation des rangées</div>
                            <div class="row-tabs-count">${rowTabOptions.length} onglets</div>
                        </div>
                        <div class="row-tabs-wrap">
                            ${rowTabsHTML}
                            ${rowActionsBlock}
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
                            ${isLtiAisleMode ? '' : `
                            <button class="tool-btn" onclick="delRow('${safeRowName}')" title="Supprimer la rangée">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                            `}
                        </div>
                    </div>
                    <div class="panels-grid panels-grid-main">`;

                const visiblePanels = row.panels
                    .map((panel, pIdx) => ({ panel, pIdx }))
                    .filter(({ panel }) => !searchQuery || panel.name.toLowerCase().includes(searchQuery.toLowerCase()));

                for (let i = 0; i < visiblePanels.length; i++) {
                    const { panel, pIdx } = visiblePanels[i];

                    if (currentAisle === 'LTI' && panel.type === 'fo' && panel.ports.length === 12) {
                        const foBlock = collectLtiFoBlock(visiblePanels, i);
                        if (foBlock) {
                            html += renderGroupedFoPanels(foBlock, safeRowName, false);
                            i = foBlock.nextIndex - 1;
                            continue;
                        }
                    }

                    html += renderPanel(panel, safeRowName, pIdx, false);
                }

                html += `</div>`;

                html += `
                    <div class="add-card" title="Ajouter un châssis">
                        <button class="btn" onclick="addPanel('${safeRowName}', 'rj45')">+ RJ45</button>
                        <button class="btn" onclick="addPanel('${safeRowName}', 'fo')">+ Fibre</button>
                    </div>
                </div></div>`;
            });

            html += `
            </div></div>`;
            container.innerHTML = html;
            const sa = $('.scroll-area');
            if(sa) sa.scrollTop = scrollPos;
        }

        function renderMoveControls(moveUpCall, moveDownCall) {
            return `
                <div class="panel-move-controls">
                    <button class="tool-btn" onclick="${moveUpCall}" title="Monter">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                        </svg>
                    </button>
                    <button class="tool-btn" onclick="${moveDownCall}" title="Descendre">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        function collectLtiFoBlock(visiblePanels, startIndex) {
            const first = visiblePanels[startIndex];
            if (!first) return null;

            const firstPanel = first.panel;
            if (currentAisle !== 'LTI' || firstPanel.type !== 'fo' || firstPanel.ports.length !== 12) {
                return null;
            }

            const groupedPanels = [];
            let cursor = startIndex;

            while (cursor < visiblePanels.length) {
                const candidate = visiblePanels[cursor];
                const candidatePanel = candidate.panel;

                if (candidatePanel.type !== 'fo' || candidatePanel.ports.length !== 12) {
                    break;
                }

                if (firstPanel.groupId) {
                    if (candidatePanel.groupId !== firstPanel.groupId) {
                        break;
                    }
                } else if (candidatePanel.groupId || groupedPanels.length >= 4) {
                    break;
                }

                groupedPanels.push(candidate);
                cursor++;
            }

            if (!groupedPanels.length) return null;
            return {
                groupedPanels,
                nextIndex: cursor,
                startPanelIndex: first.pIdx,
                blockSize: groupedPanels.length,
                groupId: firstPanel.groupId || null
            };
        }

        function renderGroupedFoPanels(foBlock, rowName, readOnly = false) {
            if (!foBlock || !foBlock.groupedPanels.length) return '';

            const first = foBlock.groupedPanels[0];
            const moveControlsHtml = currentAisle === 'LTI'
                ? renderMoveControls(
                    foBlock.groupId
                        ? `movePanelGroup('${rowName}', '${foBlock.groupId}', -1)`
                        : `movePanelBlock('${rowName}', ${foBlock.startPanelIndex}, ${foBlock.blockSize}, -1)`,
                    foBlock.groupId
                        ? `movePanelGroup('${rowName}', '${foBlock.groupId}', 1)`
                        : `movePanelBlock('${rowName}', ${foBlock.startPanelIndex}, ${foBlock.blockSize}, 1)`
                )
                : '';

            const panelsHtml = foBlock.groupedPanels
                .map(({ panel, pIdx }) => renderPanel(panel, rowName, pIdx, readOnly, false))
                .join('');

            return `
                <div class="panel-shell panel-shell-movable panel-group-shell">
                    ${moveControlsHtml}
                    <div class="panels-grid panels-grid-fo panel-group-grid">
                        ${panelsHtml}
                    </div>
                </div>
            `;
        }

        function renderPanel(panel, rowName, pIdx, readOnly = false, showMoveControls = null) {
            const activeCount = panel.ports.filter(p => p.active).length;
            const usage = (activeCount / panel.ports.length) * 100;
            const usageClass = usage >= 90 ? 'full' : usage >= 70 ? 'high' : '';
            const isRJ45 = panel.type === 'rj45';
            const isEmptyPanel = (panel.name || '').trim().toLowerCase() === 'rocade vide';
            const canMovePanel = showMoveControls === null ? currentAisle === 'LTI' : showMoveControls;
            const panelClasses = `panel ${panel.type}${!isRJ45 && panel.ports.length === 24 ? ' panel-wide' : ''}${isEmptyPanel ? ' panel-empty' : ''}`;
            const portsClasses = `ports ${isRJ45 ? 'rj45' : 'fiber'}${!isRJ45 && panel.ports.length === 24 ? ' fiber-24' : ''}`;
            const panelNameHtml = `<div class="panel-name${isRJ45 ? '' : ' panel-name-fo'}" onclick="startRenamePanel('${rowName}', ${pIdx}, event)">${panel.name}</div>`;
            const moveControlsHtml = canMovePanel
                ? renderMoveControls(
                    `movePanel('${rowName}', ${pIdx}, -1)`,
                    `movePanel('${rowName}', ${pIdx}, 1)`
                )
                : '';

            let portsHtml = '';
            panel.ports.forEach((port, idx) => {
                const activeClass = port.active ? 'active' : '';
                const statusText = port.active ? 'Actif' : 'Inactif';
                const portNameDisplay = port.name ? ` : ${port.name}` : '';
                portsHtml += `
                    <div class="port ${activeClass}" ${readOnly ? '' : `onclick="togglePort('${rowName}', ${pIdx}, ${idx})" oncontextmenu="renamePort(event, '${rowName}', ${pIdx}, ${idx})"`}>
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
                <div class="panel-shell${canMovePanel ? ' panel-shell-movable' : ''}">
                    ${moveControlsHtml}
                    <div class="${panelClasses}">
                        <div class="panel-header">
                        <div class="panel-info">
                            <div class="panel-headline">
                                ${panelNameHtml}
                                <div class="panel-meta">
                                    <span>${panel.ports.length} Ports</span>
                                    <div class="usage-bar usage-bar-inline">
                                        <div class="usage-fill ${usageClass}" style="width: ${usage}%"></div>
                                    </div>
                                    ${activeCount > 0 ? `<span class="active-badge">${activeCount} ON</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="panel-tools">
                            ${readOnly ? '' : `${isRJ45 ? `
                            <button class="tool-btn" onclick="toggleRj45PortCount('${rowName}', ${pIdx})" title="Basculer entre 24 et 48 ports">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                                </svg>
                            </button>
                            ` : ''}
                            <button class="tool-btn" onclick="delPanel('${rowName}', ${pIdx})" title="Vider (Rocade vide)">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                            <button class="tool-btn tool-btn-danger" onclick="deletePanelLine('${rowName}', ${pIdx})" title="Supprimer la ligne">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                            `}
                        </div>
                    </div>
                    <div class="${portsClasses}">${portsHtml}</div>
                    </div>
                </div>`;
        }

        function setTab(t) { currentTab = t; renderContent(); }
        function search(v) { searchQuery = v; renderContent(); }

        function getRowsForCurrentTab(aisle) {
            if (!aisle) return [];
            return aisle.rows.filter(row => shouldShowRowForTab(row.name, currentTab));
        }

        function renameCurrentRowFromToolbar() {
            const aisle = appData[currentRoom]?.aisles.find(a => a.id === currentAisle);
            if (!aisle) return;

            const rows = getRowsForCurrentTab(aisle);
            if (rows.length !== 1) {
                showToast("Sélectionnez un onglet qui correspond à une seule rangée pour renommer", "error");
                return;
            }

            const row = rows[0];
            const identity = parseRowIdentity(row.name);
            const initialText = (identity.type === 'LTR' || identity.type === 'LTI')
                ? (identity.emplacement || '')
                : row.name;

            const input = prompt("Nouveau nom / emplacement :", initialText);
            if (input === null) return;
            const value = input.trim();
            if (!value) return;

            const nextName = (identity.type === 'LTR' || identity.type === 'LTI')
                ? formatRowName(identity.type, value)
                : value;

            if (aisle.rows.some(r => r !== row && r.name.toUpperCase() === nextName.toUpperCase())) {
                showToast("Une rangée avec ce nom existe déjà", "error");
                return;
            }

            row.name = nextName;
            renderContent();
            saveToLocalStorage();
            showToast("Rangée renommée", "success");
        }

        function deleteCurrentRowFromToolbar() {
            const aisle = appData[currentRoom]?.aisles.find(a => a.id === currentAisle);
            if (!aisle) return;

            const rows = getRowsForCurrentTab(aisle);
            if (rows.length !== 1) {
                showToast("Sélectionnez un onglet qui correspond à une seule rangée pour supprimer", "error");
                return;
            }

            const rowName = rows[0].name;
            delRow(rowName);
        }

        function loadAisle(aisleId) {
            currentAisle = aisleId;
            appState.selectedAisle = aisleId;
            searchQuery = '';
            currentTab = 'all';
            renderContent();
            updateHeaderStats();
        }

        function loadLtiAisle() {
            currentAisle = 'LTI';
            appState.selectedAisle = 'LTI';
            searchQuery = '';
            currentTab = 'lti';
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        function togglePort(rName, pIdx, ptIdx) {
            const row = getRowForCurrentContext(rName);
            if (!row || !row.panels[pIdx] || !row.panels[pIdx].ports[ptIdx]) return;
            row.panels[pIdx].ports[ptIdx].active = !row.panels[pIdx].ports[ptIdx].active;
            syncLtiPanelPortStates(row.panels[pIdx]);
            syncCop7LtrPanelPortStates(currentAisle, rName, row.panels[pIdx]);
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
        }

        function setAll(rName, pIdx, state) {
            const row = getRowForCurrentContext(rName);
            if (!row || !row.panels[pIdx]) return;
            row.panels[pIdx].ports.forEach(p => p.active = state);
            syncLtiPanelPortStates(row.panels[pIdx]);
            syncCop7LtrPanelPortStates(currentAisle, rName, row.panels[pIdx]);
            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast(state ? "Tous les ports activés" : "Tous les ports désactivés", "success");
        }

        function startRenamePanel(rName, pIdx, e) {
            e.stopPropagation();
            const row = getRowForCurrentContext(rName);
            if (!row) return;

            const panel = row.panels[pIdx];
            if (!panel) return;

            beginInlineEdit(
                e.currentTarget,
                panel.name,
                (newName) => {
                    panel.name = newName;
                    renderContent();
                    saveToLocalStorage();
                    showToast("Nom du châssis mis à jour", "success");
                }
            );
        }

        function renamePort(e, rName, pIdx, ptIdx) {
            e.preventDefault();
            const row = getRowForCurrentContext(rName);
            if (!row || !row.panels[pIdx] || !row.panels[pIdx].ports[ptIdx]) return;
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
                const prevTab = currentTab;
                const prevTabOptions = buildRowTabOptions(aisle);
                const prevTabIndex = prevTabOptions.findIndex(t => t.key === prevTab);

                aisle.rows.splice(rowIndex, 1);

                const newTabOptions = buildRowTabOptions(aisle);
                if (newTabOptions.some(t => t.key === prevTab)) {
                    currentTab = prevTab;
                } else if (newTabOptions.length > 0) {
                    const fallbackIndex = Math.min(prevTabIndex >= 0 ? prevTabIndex : 0, newTabOptions.length - 1);
                    currentTab = newTabOptions[fallbackIndex].key;
                } else {
                    currentTab = 'all';
                }

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
            if (!confirm("Vider ce châssis ?")) return;
            const row = getRowForCurrentContext(rName);
            if (!row) return;
            const panel = row.panels[pIdx];
            if (!panel) return;

            panel.name = 'Rocade vide';
            panel.ports = panel.ports.map((port, index) => ({
                ...port,
                id: port.id || index + 1,
                name: '',
                active: false,
            }));

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast("Châssis vidé");
        }

        function deletePanelLine(rName, pIdx) {
            if (!confirm("Supprimer définitivement cette ligne ?")) return;
            const row = getRowForCurrentContext(rName);
            if (!row) return;
            if (pIdx < 0 || pIdx >= row.panels.length) return;

            row.panels.splice(pIdx, 1);

            renderContent();
            updateHeaderStats();
            saveToLocalStorage();
            showToast("Ligne supprimée", "success");
        }

        function addPanel(rName, type) {
            const row = getRowForCurrentContext(rName);
            if (!row) return;

            if (type === 'fo') {
                if (currentAisle === 'LTI') {
                    const choice = prompt(
                        "Format fibre :\n1 = 4 blocs de 12 ports\n2 = 1 ligne de 24 ports",
                        "1"
                    );

                    if (choice === null) return;

                    if (choice.trim() === '2') {
                        row.panels.push({
                            type: 'fo',
                            name: 'Rocade vide',
                            ports: generatePorts(24, 'fiber')
                        });

                        renderContent();
                        updateHeaderStats();
                        saveToLocalStorage();
                        showToast("Châssis fibre 24 ports ajouté", "success");
                        return;
                    }
                }

                const groupId = `fo12-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

                for (let i = 0; i < 4; i++) {
                    row.panels.push({
                        type: 'fo',
                        name: 'Rocade vide',
                        ports: generatePorts(12, 'fiber'),
                        groupId
                    });
                }

                renderContent();
                updateHeaderStats();
                saveToLocalStorage();
                showToast("4 châssis fibre ajoutés", "success");
                return;
            }

            const defaultName = 'Nouveau RJ45';
            const panelName = prompt("Nom du nouveau châssis :", defaultName);

            if (panelName === null) return;
            const finalName = panelName.trim() || defaultName;

            row.panels.push({
                type: 'rj45',
                name: finalName,
                ports: generatePorts(24, 'rj45')
            });

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
            const row = getRowForCurrentContext(rName);
            if (!row || !row.panels[pIdx]) return;
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

        function movePanel(rName, pIdx, direction) {
            const row = getRowForCurrentContext(rName);
            if (!row || !Array.isArray(row.panels)) return;

            const targetIdx = pIdx + direction;
            if (targetIdx < 0 || targetIdx >= row.panels.length) return;

            const [panel] = row.panels.splice(pIdx, 1);
            row.panels.splice(targetIdx, 0, panel);

            renderContent();
            saveToLocalStorage();
        }

        function getPanelUnitBounds(panels, startIdx) {
            const panel = panels[startIdx];
            if (!panel) return null;

            if (panel.type === 'fo' && panel.ports.length === 12 && panel.groupId) {
                let start = startIdx;
                let end = startIdx;

                while (start > 0) {
                    const prev = panels[start - 1];
                    if (!prev || prev.groupId !== panel.groupId || prev.type !== 'fo' || prev.ports.length !== 12) break;
                    start--;
                }

                while (end < panels.length - 1) {
                    const next = panels[end + 1];
                    if (!next || next.groupId !== panel.groupId || next.type !== 'fo' || next.ports.length !== 12) break;
                    end++;
                }

                return { start, end };
            }

            if (currentAisle === 'LTI' && panel.type === 'fo' && panel.ports.length === 12 && !panel.groupId) {
                let runStart = startIdx;
                let runEnd = startIdx;

                while (runStart > 0) {
                    const prev = panels[runStart - 1];
                    if (!prev || prev.type !== 'fo' || prev.ports.length !== 12 || prev.groupId) break;
                    runStart--;
                }

                while (runEnd < panels.length - 1) {
                    const next = panels[runEnd + 1];
                    if (!next || next.type !== 'fo' || next.ports.length !== 12 || next.groupId) break;
                    runEnd++;
                }

                const offsetInRun = startIdx - runStart;
                const blockStart = runStart + Math.floor(offsetInRun / 4) * 4;
                const blockEnd = Math.min(blockStart + 3, runEnd);

                return { start: blockStart, end: blockEnd };
            }

            return { start: startIdx, end: startIdx };
        }

        function movePanelBlock(rName, startIdx, blockSize, direction) {
            const row = getRowForCurrentContext(rName);
            if (!row || !Array.isArray(row.panels)) return;

            const safeStartIdx = Number(startIdx);
            const safeBlockSize = Number(blockSize);
            if (!Number.isInteger(safeStartIdx) || !Number.isInteger(safeBlockSize) || safeBlockSize <= 0) return;
            if (safeStartIdx < 0 || safeStartIdx + safeBlockSize > row.panels.length) return;

            const movingPanels = row.panels.slice(safeStartIdx, safeStartIdx + safeBlockSize);
            const isValidFoBlock = movingPanels.every(panel => panel?.type === 'fo' && panel.ports?.length === 12);
            if (!isValidFoBlock) return;

            const currentBounds = { start: safeStartIdx, end: safeStartIdx + safeBlockSize - 1 };

            if (direction < 0) {
                if (currentBounds.start === 0) return;
                const previousBounds = getPanelUnitBounds(row.panels, currentBounds.start - 1);
                if (!previousBounds) return;

                row.panels.splice(currentBounds.start, safeBlockSize);
                row.panels.splice(previousBounds.start, 0, ...movingPanels);
            } else {
                if (currentBounds.end >= row.panels.length - 1) return;
                const nextBounds = getPanelUnitBounds(row.panels, currentBounds.end + 1);
                if (!nextBounds) return;

                row.panels.splice(currentBounds.start, safeBlockSize);
                const insertAt = nextBounds.end - safeBlockSize + 1;
                row.panels.splice(insertAt, 0, ...movingPanels);
            }

            renderContent();
            saveToLocalStorage();
        }

        function movePanelGroup(rName, groupId, direction) {
            const row = getRowForCurrentContext(rName);
            if (!row || !Array.isArray(row.panels)) return;

            const startIdx = row.panels.findIndex(panel => panel.groupId === groupId && panel.type === 'fo' && panel.ports.length === 12);
            if (startIdx === -1) return;

            const currentBounds = getPanelUnitBounds(row.panels, startIdx);
            if (!currentBounds) return;

            if (direction < 0) {
                if (currentBounds.start === 0) return;
                const previousBounds = getPanelUnitBounds(row.panels, currentBounds.start - 1);
                if (!previousBounds) return;

                const movingPanels = row.panels.splice(currentBounds.start, currentBounds.end - currentBounds.start + 1);
                row.panels.splice(previousBounds.start, 0, ...movingPanels);
            } else {
                if (currentBounds.end >= row.panels.length - 1) return;
                const nextBounds = getPanelUnitBounds(row.panels, currentBounds.end + 1);
                if (!nextBounds) return;

                const movingPanels = row.panels.splice(currentBounds.start, currentBounds.end - currentBounds.start + 1);
                const insertAt = nextBounds.end - (currentBounds.end - currentBounds.start + 1) + 1;
                row.panels.splice(insertAt, 0, ...movingPanels);
            }

            renderContent();
            saveToLocalStorage();
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
                    ensureCop7RequestedRows();
                    ensureCop7MainLtrOrderFromDetailedRows();
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

            if (!CLOUD_ENABLED) {
                localStorage.removeItem(STORAGE_DATA_KEY);
                localStorage.removeItem(STORAGE_UI_KEY);
                location.reload();
                return;
            }

            try {
                const response = await fetch(apiUrl('/api/rocade/state'), { method: 'DELETE' });
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

        init();
