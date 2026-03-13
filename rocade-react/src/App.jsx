import { useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultData, ensureCop7HasEightAisles, generatePorts } from './data/defaultData';

const EMPTY_FO_PORTS = Array.from({ length: 12 }, (_, i) => i + 1);

function roomStats(room) {
  let totalPorts = 0;
  let activePorts = 0;
  let rows = 0;
  room.aisles.forEach((a) => {
    rows += a.rows.length;
    a.rows.forEach((r) => {
      r.panels.forEach((p) => {
        totalPorts += p.ports.length;
        activePorts += p.ports.filter((x) => x.active).length;
      });
    });
  });
  const utilization = totalPorts ? Math.round((activePorts / totalPorts) * 100) : 0;
  return { totalPorts, activePorts, rows, utilization, aisles: room.aisles.length };
}

function aisleStats(aisle) {
  let totalPorts = 0;
  let activePorts = 0;
  aisle.rows.forEach((r) => {
    r.panels.forEach((p) => {
      totalPorts += p.ports.length;
      activePorts += p.ports.filter((x) => x.active).length;
    });
  });
  const utilization = totalPorts ? Math.round((activePorts / totalPorts) * 100) : 0;
  return { totalPorts, activePorts, utilization };
}

function utilizationClass(value) {
  if (value >= 90) return 'u-full';
  if (value >= 70) return 'u-high';
  if (value >= 35) return 'u-mid';
  return 'u-low';
}

function extractSubTabKeyFromRowName(rowName) {
  return rowName.replace(/^rang[ée]e\s*/i, '').trim();
}

function getSubTabsFromRows(rows) {
  const seen = new Set();
  return rows
    .map((r) => extractSubTabKeyFromRowName(r.name))
    .filter((name) => {
      const key = name.toUpperCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((name) => ({ key: name, label: name }));
}

function findRowIndexForSubTab(rows, subTabKey) {
  const target = subTabKey.trim().toUpperCase();
  return rows.findIndex((r) => extractSubTabKeyFromRowName(r.name).toUpperCase() === target);
}

function buildFoPlacement(panels) {
  const foEntries = panels
    .map((panel, index) => ({ panel, index }))
    .filter(({ panel }) => panel.type === 'fo');

  const used = new Set();
  foEntries.forEach(({ panel }) => {
    if (Number.isInteger(panel.foPosition) && panel.foPosition >= 0) {
      used.add(panel.foPosition);
    }
  });

  let cursor = 0;
  const bySlot = new Map();
  const byPanelIndex = new Map();

  foEntries.forEach(({ panel, index }) => {
    let slot = panel.foPosition;
    if (!Number.isInteger(slot) || slot < 0 || bySlot.has(slot)) {
      while (used.has(cursor) || bySlot.has(cursor)) cursor += 1;
      slot = cursor;
      cursor += 1;
    }

    bySlot.set(slot, { panel, index, slot });
    byPanelIndex.set(index, slot);
  });

  const maxUsedSlot = bySlot.size ? Math.max(...bySlot.keys()) : -1;
  const minSlots = Math.max(4, bySlot.size);
  const slotCount = Math.max(minSlots, maxUsedSlot + 1);

  return { bySlot, byPanelIndex, slotCount };
}

function buildLtiOrderedGroups(panels) {
  const groups = [];
  let currentFoGroup = [];

  const flushFoGroups = () => {
    if (!currentFoGroup.length) return;

    for (let i = 0; i < currentFoGroup.length; i += 4) {
      groups.push({ type: 'fo-group', items: currentFoGroup.slice(i, i + 4) });
    }

    currentFoGroup = [];
  };

  panels.forEach((item) => {
    if (item.panel.type === 'fo') {
      currentFoGroup.push(item);
      return;
    }

    flushFoGroups();
    groups.push({ type: 'panel', item });
  });

  flushFoGroups();
  return groups;
}

function renderEmptyFoPorts() {
  return (
    <div className="ports fiber ports-empty" aria-hidden="true">
      {EMPTY_FO_PORTS.map((portId) => (
        <div key={`empty-fo-port-${portId}`} className="port fo port-empty">
          <span className="led" />
          <span className="connector fiber-body">
            <span className="lc-port"><span className="ferrule" /></span>
            <span className="lc-port"><span className="ferrule" /></span>
          </span>
          <span className="p-label">{portId}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [appData, setAppData] = useState(createDefaultData);
  const [screen, setScreen] = useState('room-selection');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentAisle, setCurrentAisle] = useState(null);
  const [topNavMode, setTopNavMode] = useState('aisle');
  const [currentSubTab, setCurrentSubTab] = useState('');
  const [search, setSearch] = useState('');
  const [editingPanel, setEditingPanel] = useState(null);
  const [toast, setToast] = useState('');
  const fileRef = useRef(null);
  const syncTimerRef = useRef(null);

  const room = currentRoom ? appData[currentRoom] : null;
  const aisle = room?.aisles.find((a) => a.id === currentAisle) || null;

  function rowMatchesSubTab(rowName, subTab) {
    if (!subTab) return true;

    const rowKey = extractSubTabKeyFromRowName(rowName).toUpperCase();
    const target = subTab.toUpperCase();

    if (target === 'LTI') {
      return rowKey === 'LTI' || rowKey.startsWith('LTI-');
    }

    return rowKey === target;
  }

  const allSubTabs = useMemo(() => {
    if (!aisle) return [];
    return getSubTabsFromRows(aisle.rows || []);
  }, [aisle]);

  const subTabs = useMemo(() => {
    if (!aisle) return [];
    if (topNavMode === 'lti') {
      return allSubTabs.filter((tab) => tab.key.toUpperCase().startsWith('LTI'));
    }

    return allSubTabs.filter((tab) => !tab.key.toUpperCase().startsWith('LTI'));
  }, [aisle, allSubTabs, topNavMode]);

  const roomSummary = useMemo(() => {
    return {
      IBM: roomStats(appData.IBM),
      COP7: roomStats(appData.COP7),
    };
  }, [appData]);

  const ltiAisleStats = useMemo(() => {
    if (!aisle) return { totalPorts: 0, activePorts: 0, utilization: 0 };

    let totalPorts = 0;
    let activePorts = 0;

    aisle.rows.forEach((r) => {
      const key = extractSubTabKeyFromRowName(r.name).toUpperCase();
      if (!(key === 'LTI' || key.startsWith('LTI-'))) return;

      r.panels.forEach((p) => {
        totalPorts += p.ports.length;
        activePorts += p.ports.filter((x) => x.active).length;
      });
    });

    const utilization = totalPorts ? Math.round((activePorts / totalPorts) * 100) : 0;
    return { totalPorts, activePorts, utilization };
  }, [aisle]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/rocade/state');
        if (!res.ok) return;
        const payload = await res.json();
        if (!payload?.data || !payload?.uiState) return;

        const nextData = ensureCop7HasEightAisles(JSON.parse(payload.data));
        const uiState = JSON.parse(payload.uiState);

        setAppData(nextData);
        if (uiState.currentRoom && uiState.currentAisle) {
          setCurrentRoom(uiState.currentRoom);
          setCurrentAisle(uiState.currentAisle);
          setScreen(uiState.screen || 'manager');
        }
      } catch {
        // no-op: local initial data remains if server state unavailable
      }
    })();
  }, []);

  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/rocade/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: JSON.stringify(appData),
            uiState: JSON.stringify({ currentRoom, currentAisle, screen }),
          }),
        });
      } catch {
        // no-op for offline mode
      }
    }, 300);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [appData, currentRoom, currentAisle, screen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!subTabs.length) {
      if (currentSubTab) setCurrentSubTab('');
      return;
    }

    const target = currentSubTab.toUpperCase();
    const exists =
      subTabs.some((tab) => tab.key.toUpperCase() === target) ||
      (target === 'LTI' && subTabs.some((tab) => tab.key.toUpperCase().startsWith('LTI')));

    if (!exists) {
      setCurrentSubTab(subTabs[0].key);
    }
  }, [subTabs, currentSubTab]);

  function openRoom(roomKey) {
    const firstAisleObj = appData[roomKey].aisles[0];
    const firstAisle = firstAisleObj?.id;
    const firstSubTabs = getSubTabsFromRows(firstAisleObj?.rows || []);
    setCurrentRoom(roomKey);
    setCurrentAisle(firstAisle || null);
    setTopNavMode('aisle');
    setCurrentSubTab(firstSubTabs.find((tab) => !tab.key.toUpperCase().startsWith('LTI'))?.key || firstSubTabs[0]?.key || '');
    setScreen('manager');
    setSearch('');
  }

  function backHome() {
    setScreen('room-selection');
    setCurrentRoom(null);
    setCurrentAisle(null);
    setTopNavMode('aisle');
    setCurrentSubTab('');
    setSearch('');
  }

  function mutateAisle(updater) {
    setAppData((prev) => {
      const clone = structuredClone(prev);
      const targetRoom = clone[currentRoom];
      const targetAisle = targetRoom.aisles.find((a) => a.id === currentAisle);
      if (!targetAisle) return prev;
      updater(targetAisle);
      return clone;
    });
  }

  function togglePort(rowIndex, panelIndex, portIndex) {
    mutateAisle((targetAisle) => {
      const port = targetAisle.rows[rowIndex].panels[panelIndex].ports[portIndex];
      port.active = !port.active;
    });
  }

  function setAll(rowIndex, panelIndex, state) {
    mutateAisle((targetAisle) => {
      targetAisle.rows[rowIndex].panels[panelIndex].ports.forEach((p) => {
        p.active = state;
      });
    });
    setToast(state ? 'Tous les ports activés' : 'Tous les ports désactivés');
  }

  function addPanel(rowIndex, type, rj45PortCount = 24) {
    const name = window.prompt('Nom du châssis', type === 'rj45' ? 'Nouveau RJ45' : '');
    if (name == null) return;
    mutateAisle((targetAisle) => {
      const portCount = type === 'rj45' ? rj45PortCount : 12;
      targetAisle.rows[rowIndex].panels.push({
        name: type === 'rj45' ? (name.trim() || 'Nouveau RJ45') : name.trim(),
        type,
        ports: generatePorts(portCount, type === 'rj45' ? 'rj45' : 'fiber'),
      });
    });
    setToast('Châssis ajouté');
  }

  function startInlineRenamePanel(rowIndex, panelIndex, currentName) {
    setEditingPanel({ rowIndex, panelIndex, value: currentName });
  }

  function updateInlineRenameValue(value) {
    setEditingPanel((prev) => (prev ? { ...prev, value } : prev));
  }

  function commitInlineRenamePanel(rowIndex, panelIndex) {
    const nextName = (editingPanel?.value || '').trim();
    setEditingPanel(null);
    if (!nextName) return;

    mutateAisle((targetAisle) => {
      targetAisle.rows[rowIndex].panels[panelIndex].name = nextName;
    });
  }

  function cancelInlineRenamePanel() {
    setEditingPanel(null);
  }

  function deletePanel(rowIndex, panelIndex) {
    if (!window.confirm('Supprimer ce châssis ?')) return;
    mutateAisle((targetAisle) => {
      targetAisle.rows[rowIndex].panels.splice(panelIndex, 1);
    });
    setToast('Châssis supprimé');
  }

  function movePanelOnSameRow(rowIndex, panelIndex, direction) {
    mutateAisle((targetAisle) => {
      const panels = targetAisle.rows[rowIndex].panels;
      const current = panels[panelIndex];
      if (!current || current.type !== 'fo') return;

      const placement = buildFoPlacement(panels);
      const currentSlot = placement.byPanelIndex.get(panelIndex);
      if (!Number.isInteger(currentSlot)) return;

      const targetSlot = direction === 'left' ? currentSlot - 1 : currentSlot + 1;
      if (targetSlot < 0) return;

      const occupant = placement.bySlot.get(targetSlot);
      current.foPosition = targetSlot;

      if (occupant) {
        panels[occupant.index].foPosition = currentSlot;
      }
    });
  }

  function deleteRow(rowIndex) {
    if (!window.confirm('Supprimer cette rangée et ses châssis ?')) return;
    mutateAisle((targetAisle) => {
      targetAisle.rows.splice(rowIndex, 1);
    });
    setToast('Rangée supprimée');
  }

  function addSubTab() {
    const defaultName = topNavMode === 'lti' ? 'LTI-' : '';
    const name = window.prompt('Nom du nouvel onglet (ex: LTR-D09, LTI-09, SUP)', defaultName);
    if (name == null) return;

    let nextTab = name.trim();
    if (topNavMode === 'lti' && nextTab && !nextTab.toUpperCase().startsWith('LTI')) {
      nextTab = `LTI-${nextTab}`;
    }
    if (!nextTab) return;

    const exists = allSubTabs.some((tab) => tab.key.toUpperCase() === nextTab.toUpperCase());
    if (exists) {
      setToast('Cet onglet existe déjà');
      return;
    }

    mutateAisle((targetAisle) => {
      targetAisle.rows.push({ name: `Rangée ${nextTab}`, panels: [] });
    });
    setCurrentSubTab(nextTab);
    setToast('Onglet ajouté');
  }

  function renameCurrentSubTab() {
    if (!currentSubTab || !aisle) return;
    const currentRowIndex = findRowIndexForSubTab(aisle.rows || [], currentSubTab);
    if (currentRowIndex < 0) return;

    const next = window.prompt('Nouveau nom de l\'onglet', currentSubTab);
    if (next == null) return;

    const nextTab = next.trim();
    if (!nextTab) return;

    const exists = allSubTabs.some(
      (tab) => tab.key.toUpperCase() === nextTab.toUpperCase() && tab.key.toUpperCase() !== currentSubTab.toUpperCase()
    );
    if (exists) {
      setToast('Un onglet avec ce nom existe déjà');
      return;
    }

    mutateAisle((targetAisle) => {
      const idx = findRowIndexForSubTab(targetAisle.rows || [], currentSubTab);
      if (idx >= 0) targetAisle.rows[idx].name = `Rangée ${nextTab}`;
    });
    setCurrentSubTab(nextTab);
    setToast('Onglet renommé');
  }

  function deleteCurrentSubTab() {
    if (!currentSubTab || !aisle) return;
    if (!window.confirm(`Supprimer l'onglet ${currentSubTab} et ses châssis ?`)) return;

    const remaining = subTabs.filter((tab) => tab.key.toUpperCase() !== currentSubTab.toUpperCase());
    mutateAisle((targetAisle) => {
      const idx = findRowIndexForSubTab(targetAisle.rows || [], currentSubTab);
      if (idx >= 0) targetAisle.rows.splice(idx, 1);
    });
    setCurrentSubTab(remaining[0]?.key || '');
    setToast('Onglet supprimé');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rocade_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function resetData() {
    if (!window.confirm('Réinitialiser toutes les données ?')) return;
    await fetch('/api/rocade/state', { method: 'DELETE' });
    setAppData(createDefaultData());
    setScreen('room-selection');
    setCurrentRoom(null);
    setCurrentAisle(null);
    setToast('Données réinitialisées');
  }

  function importFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = ensureCop7HasEightAisles(JSON.parse(String(reader.result)));
        setAppData(parsed);
        setToast('Import réussi');
      } catch {
        setToast('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);
  }

  if (screen === 'room-selection') {
    return (
      <div className="app shell">
        <header className="header hero">
          <div className="brand-line">Rocade Manager</div>
          <h1>Console d'occupation reseau</h1>
          <p>Selectionnez une salle pour piloter les allees, rangees, chassis et ports.</p>
        </header>
        <main className="home">
          {Object.entries(appData).map(([key, value]) => {
            const stats = roomSummary[key];
            return (
              <button key={key} className="room-card" onClick={() => openRoom(key)}>
                <div className="room-head">
                  <h2>{value.name}</h2>
                  <span className={`room-rate ${utilizationClass(stats.utilization)}`}>{stats.utilization}%</span>
                </div>
                <p className="room-sub">{stats.aisles} allees · {stats.rows} rangees</p>
                <div className="room-kpis">
                  <div className="kpi">
                    <span className="kpi-label">Ports actifs</span>
                    <span className="kpi-value mono">{stats.activePorts}</span>
                  </div>
                  <div className="kpi">
                    <span className="kpi-label">Total ports</span>
                    <span className="kpi-value mono">{stats.totalPorts}</span>
                  </div>
                </div>
                <div className="room-progress">
                  <span className={`room-progress-fill ${utilizationClass(stats.utilization)}`} style={{ width: `${stats.utilization}%` }} />
                </div>
              </button>
            );
          })}
        </main>
        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    );
  }

  const aStats = aisle ? aisleStats(aisle) : { totalPorts: 0, activePorts: 0, utilization: 0 };
  const currentTopLabel = topNavMode === 'lti' ? 'Allee LTI' : `Allee ${currentAisle}`;

  return (
    <div className="app shell">
      <header className="header row">
        <div className="title-wrap">
          <div className="brand-line">Rocade Manager</div>
          <h1>{room?.name} / {currentTopLabel}</h1>
          <p className="header-sub">Pilotage en temps reel des chassis et ports</p>
        </div>
        <div className="header-kpis">
          <div className="header-kpi">
            <span className="kpi-label">Actifs</span>
            <span className="kpi-value mono">{aStats.activePorts}</span>
          </div>
          <div className="header-kpi">
            <span className="kpi-label">Total</span>
            <span className="kpi-value mono">{aStats.totalPorts}</span>
          </div>
          <div className="header-kpi">
            <span className="kpi-label">Occupation</span>
            <span className={`kpi-value mono ${utilizationClass(aStats.utilization)}`}>{aStats.utilization}%</span>
          </div>
        </div>
        <div className="actions">
          <button onClick={backHome}>Retour</button>
          <button onClick={exportData}>Exporter</button>
          <button onClick={() => fileRef.current?.click()}>Importer</button>
          <button className="danger" onClick={resetData}>Réinitialiser</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </header>

      <section className="toolbar">
        <div className="row">
          <div className="tabs">
            {room?.aisles.map((a) => {
              const stats = aisleStats(a);
              return (
                <button
                  key={a.id}
                  className={`aisle-tab ${a.id === currentAisle && topNavMode === 'aisle' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentAisle(a.id);
                    setTopNavMode('aisle');
                    const nextTabs = getSubTabsFromRows(a.rows || []);
                    const firstRegular = nextTabs.find((tab) => !tab.key.toUpperCase().startsWith('LTI'));
                    setCurrentSubTab(firstRegular?.key || nextTabs[0]?.key || '');
                  }}
                >
                  <span className="aisle-tab-title">Allee {a.id}</span>
                  <span className={`aisle-tab-rate ${utilizationClass(stats.utilization)}`}>{stats.utilization}%</span>
                </button>
              );
            })}
            {currentRoom === 'COP7' ? (
              <button
                className={`aisle-tab ${topNavMode === 'lti' ? 'active' : ''}`}
                onClick={() => {
                  setTopNavMode('lti');
                  const ltiTab = allSubTabs.find((tab) => tab.key.toUpperCase().startsWith('LTI'));
                  setCurrentSubTab(ltiTab?.key || 'LTI');
                }}
              >
                <span className="aisle-tab-title">Allee LTI</span>
                <span className={`aisle-tab-rate ${utilizationClass(ltiAisleStats.utilization)}`}>{ltiAisleStats.utilization}%</span>
              </button>
            ) : null}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher châssis" />
        </div>
        <div className="row subtabs-row">
          <div className="tabs subtabs" aria-label="Sous-onglets allee">
            {subTabs.map((tab) => (
              <button
                key={tab.key}
                className={currentSubTab === tab.key ? 'active' : ''}
                onClick={() => setCurrentSubTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="subtabs-actions">
            <button onClick={addSubTab}>+ Onglet</button>
            <button onClick={renameCurrentSubTab} disabled={!currentSubTab}>Renommer</button>
            <button className="danger" onClick={deleteCurrentSubTab} disabled={!currentSubTab}>Supprimer</button>
          </div>
        </div>
      </section>

      <main className="manager">
        {(aisle?.rows || [])
          .map((row, idx) => ({ row, idx }))
          .filter(({ row }) => rowMatchesSubTab(row.name, currentSubTab))
          .map(({ row: r, idx: rowIndex }) => {
            const orderedPanels = r.panels
              .map((panel, originalIndex) => ({ panel, originalIndex }))
              .filter(({ panel }) => panel.name.toLowerCase().includes(search.toLowerCase()));

            const rjPanels = orderedPanels.filter(({ panel }) => panel.type === 'rj45');
            const foPanels = orderedPanels.filter(({ panel }) => panel.type === 'fo');
            const foPlacement = buildFoPlacement(r.panels);
            const isLtiMode = topNavMode === 'lti';
            const ltiGroups = isLtiMode ? buildLtiOrderedGroups(orderedPanels) : [];

            const renderEmptyFoPanel = (key, extraClass = '') => (
              <section key={key} className={`panel panel-empty${extraClass ? ` ${extraClass}` : ''}`} aria-hidden="true">
                <div className="row panel-top">
                  <div className="panel-title-wrap">
                    <div className="panel-name-empty">&nbsp;</div>
                    <div className="panel-sub">FO - nom vide</div>
                    <div className="panel-progress" />
                  </div>
                </div>
                {renderEmptyFoPorts()}
              </section>
            );

            const renderPanelCard = ({ panel: p, originalIndex: panelIndex }) => {
              const active = p.ports.filter((x) => x.active).length;
              const usage = p.ports.length ? Math.round((active / p.ports.length) * 100) : 0;
              const panelSlot = p.type === 'fo' ? foPlacement.byPanelIndex.get(panelIndex) : null;
              const canMoveLeft = Number.isInteger(panelSlot) && panelSlot > 0;
              const canMoveRight = Number.isInteger(panelSlot) && panelSlot < foPlacement.slotCount - 1;

              return (
                <section className={`panel ${p.type === 'rj45' ? 'panel-rj45' : ''}`} key={p.name + panelIndex}>
                  <div className="row panel-top">
                    <div className="panel-title-wrap">
                      {editingPanel?.rowIndex === rowIndex && editingPanel?.panelIndex === panelIndex ? (
                        <input
                          className="panel-rename-input"
                          value={editingPanel.value}
                          autoFocus
                          onChange={(e) => updateInlineRenameValue(e.target.value)}
                          onBlur={() => commitInlineRenamePanel(rowIndex, panelIndex)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitInlineRenamePanel(rowIndex, panelIndex);
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelInlineRenamePanel();
                            }
                          }}
                        />
                      ) : (
                        <button
                          className="panel-name-btn"
                          onClick={() => startInlineRenamePanel(rowIndex, panelIndex, p.name)}
                          title="Cliquer pour renommer"
                        >
                          {p.name}
                        </button>
                      )}
                      {p.type !== 'rj45' ? (
                        <>
                          <div className="panel-sub">{p.type.toUpperCase()} - {active}/{p.ports.length} actifs</div>
                          <div className="panel-progress">
                            <span className={`panel-progress-fill ${utilizationClass(usage)}`} style={{ width: `${usage}%` }} />
                          </div>
                        </>
                      ) : null}
                    </div>
                    {p.type === 'rj45' ? (
                      <div className="panel-middle">
                        <div className="panel-sub">{p.type.toUpperCase()} - {active}/{p.ports.length} actifs</div>
                        <div className="panel-progress">
                          <span className={`panel-progress-fill ${utilizationClass(usage)}`} style={{ width: `${usage}%` }} />
                        </div>
                      </div>
                    ) : null}
                    <div className="actions">
                      {p.type === 'fo' ? (
                        <>
                          <button
                            className="icon-btn fo-move-btn"
                            onClick={() => movePanelOnSameRow(rowIndex, panelIndex, 'left')}
                            title="Déplacer vers la gauche"
                            aria-label="Déplacer vers la gauche"
                            disabled={!canMoveLeft}
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="icon-btn fo-move-btn"
                            onClick={() => movePanelOnSameRow(rowIndex, panelIndex, 'right')}
                            title="Déplacer vers la droite"
                            aria-label="Déplacer vers la droite"
                            disabled={!canMoveRight}
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </>
                      ) : null}
                      <button className="icon-btn" onClick={() => setAll(rowIndex, panelIndex, true)} title="Tout allumer" aria-label="Tout allumer">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="icon-btn" onClick={() => setAll(rowIndex, panelIndex, false)} title="Tout eteindre" aria-label="Tout eteindre">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button className="icon-btn danger" onClick={() => deletePanel(rowIndex, panelIndex)} title="Supprimer" aria-label="Supprimer">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 7h16M9 7V5h6v2m-8 0l1 12h8l1-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className={`ports ${p.type === 'rj45' ? `rj45 ${p.ports.length > 24 ? 'rj45-48' : ''}` : 'fiber'}`}>
                    {p.ports.map((port, portIndex) => (
                      <button
                        key={port.id}
                        className={port.active ? `port active ${p.type}` : `port ${p.type}`}
                        onClick={() => togglePort(rowIndex, panelIndex, portIndex)}
                        title={`Port ${port.id}${port.name ? ` : ${port.name}` : ''}`}
                        aria-label={`Port ${port.id}`}
                      >
                        <span className="led" />
                        {p.type === 'rj45' ? (
                          <span className="connector rj45-body" aria-hidden="true">
                            <span className="rj45-pins">
                              <span className="rj45-pin" />
                              <span className="rj45-pin" />
                              <span className="rj45-pin" />
                              <span className="rj45-pin" />
                              <span className="rj45-pin" />
                              <span className="rj45-pin" />
                            </span>
                          </span>
                        ) : (
                          <span className="connector fiber-body" aria-hidden="true">
                            <span className="lc-port"><span className="ferrule" /></span>
                            <span className="lc-port"><span className="ferrule" /></span>
                          </span>
                        )}
                        <span className="p-label">{port.id}</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            };

            return (
          <article className="row-block" key={r.name + rowIndex}>
            <div className="row-header">
              <h3>{r.name}</h3>
              <button className="danger" onClick={() => deleteRow(rowIndex)}>Supprimer rangée</button>
            </div>
            {isLtiMode ? (
              <>
                {ltiGroups.map((group, groupIndex) => {
                  if (group.type === 'panel') {
                    return (
                      <section className="panel-group" key={`lti-panel-${rowIndex}-${groupIndex}`}>
                        <div className="panels panels-rj45">
                          {renderPanelCard(group.item)}
                        </div>
                      </section>
                    );
                  }

                  const foItems = group.items;
                  return (
                    <section className="panel-group panel-group-fo" key={`lti-fo-${rowIndex}-${groupIndex}`}>
                      <div className="panels panels-fo">
                        {Array.from({ length: 4 }, (_, slot) => {
                          const item = foItems[slot];
                          if (!item) return renderEmptyFoPanel(`lti-fo-empty-${rowIndex}-${groupIndex}-${slot}`);
                          return renderPanelCard(item);
                        })}
                      </div>
                    </section>
                  );
                })}
              </>
            ) : (
              <>
            {rjPanels.length > 0 ? (
              <section className="panel-group">
                <div className="group-divider">
                  <span className="group-title">RJ45</span>
                </div>
                <div className="panels panels-rj45">
                  {rjPanels.map(renderPanelCard)}
                </div>
              </section>
            ) : null}

            {foPanels.length > 0 ? (
              <section className="panel-group panel-group-fo">
                <div className="group-divider">
                  <span className="group-title">FO</span>
                </div>
                <div className="panels panels-fo">
                  {Array.from({ length: foPlacement.slotCount }, (_, slot) => {
                    const item = foPlacement.bySlot.get(slot);
                    if (!item) {
                          return renderEmptyFoPanel(`fo-empty-${rowIndex}-${slot}`);
                    }

                    const visible = foPanels.find(({ originalIndex }) => originalIndex === item.index);
                    if (!visible) {
                          return renderEmptyFoPanel(`fo-filtered-${rowIndex}-${slot}`, 'panel-empty-filtered');
                    }

                    return renderPanelCard(visible);
                  })}
                </div>
              </section>
            ) : null}
              </>
            )}
            <div className="add-panel">
              <button onClick={() => addPanel(rowIndex, 'rj45', 24)}>+ RJ45 (24)</button>
              <button onClick={() => addPanel(rowIndex, 'rj45', 48)}>+ RJ45 (48)</button>
              <button onClick={() => addPanel(rowIndex, 'fo')}>+ Fibre</button>
            </div>
          </article>
        );})}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
