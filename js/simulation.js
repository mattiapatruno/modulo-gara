/* ============================================================
   SIMULATION.JS — Live scoring simulation loop
   ============================================================ */

let _simTimer   = null;
let _simRunning = false;

/**
 * Start the simulation loop.
 * @param {Function} onScoreEvent  Callback: (eventObj) => void
 */
function startSimulation(onScoreEvent) {
  if (_simRunning) return;
  _simRunning = true;
  scheduleNext();

  function scheduleNext() {
    if (!_simRunning) return;
    const delay = 10000; // 10 s
    _simTimer = setTimeout(tick, delay);
  }

  function tick() {
    if (!_simRunning) return;

    const comp = COMPETITIONS.find(c => c.id === 'gara-q2-2026');
    if (!comp || !comp.criteria.length) { scheduleNext(); return; }

    // Pick a random agent
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    // ---- Main competition event ----
    const crit  = comp.criteria[Math.floor(Math.random() * comp.criteria.length)];
    const vars  = generateVarsForAsset(crit.assetId);
    const pts   = evaluateFormula(crit.formula, vars);

    if (pts > 0) {
      onScoreEvent({
        scope:        'main',
        agentId:      agent.id,
        criterioId:   crit.id,
        assetId:      crit.assetId,
        assetLabel:   getAssetLabelShort(crit.assetId),
        contractType: crit.contractType,
        vars,
        pts,
        timestamp:    new Date()
      });
    }

    // ---- Sottogara event (40% chance) ----
    if (Math.random() < 0.40 && comp.sottogare.length) {
      const sg   = comp.sottogare[Math.floor(Math.random() * comp.sottogare.length)];
      if (sg.criteria.length) {
        const sgc   = sg.criteria[Math.floor(Math.random() * sg.criteria.length)];
        const sgv   = generateVarsForAsset(sgc.assetId);
        const sgpts = evaluateFormula(sgc.formula, sgv);
        if (sgpts > 0) {
          onScoreEvent({
            scope:        sg.id,
            agentId:      agent.id,
            criterioId:   sgc.id,
            assetId:      sgc.assetId,
            assetLabel:   getAssetLabelShort(sgc.assetId),
            contractType: sgc.contractType,
            vars:         sgv,
            pts:          sgpts,
            timestamp:    new Date()
          });
        }
      }
    }

    scheduleNext();
  }
}

function stopSimulation() {
  _simRunning = false;
  if (_simTimer) { clearTimeout(_simTimer); _simTimer = null; }
}
