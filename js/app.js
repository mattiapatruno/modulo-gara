/* ============================================================
   APP.JS — State, rendering, event handling
   ============================================================ */

// ---- State ----
let state = {};

// ---- Team color maps (full class strings for Tailwind v3 static scan) ----
const TC = {
  badge:  {
    emerald: 'bg-emerald-100 text-emerald-800',
    indigo:  'bg-indigo-100 text-indigo-800',
    amber:   'bg-amber-100 text-amber-800',
    sky:     'bg-sky-100 text-sky-800',
    rose:    'bg-rose-100 text-rose-800'
  },
  bar:    {
    emerald: 'bg-emerald-500', indigo: 'bg-indigo-500',
    amber:   'bg-amber-500',   sky:    'bg-sky-400',    rose: 'bg-rose-500'
  },
  avatar: {
    emerald: 'bg-emerald-500', indigo: 'bg-indigo-500',
    amber:   'bg-amber-500',   sky:    'bg-sky-400',    rose: 'bg-rose-500'
  },
  border: {
    emerald: 'border-emerald-200', indigo: 'border-indigo-200',
    amber:   'border-amber-200',   sky:    'border-sky-200',    rose: 'border-rose-200'
  },
  leftBorder: {
    emerald: 'border-l-emerald-500', indigo: 'border-l-indigo-500',
    amber:   'border-l-amber-500',   sky:    'border-l-sky-500',    rose: 'border-l-rose-500'
  },
  gradient: {
    emerald: 'from-emerald-500 to-emerald-600',
    indigo:  'from-indigo-500 to-indigo-600',
    amber:   'from-amber-500 to-amber-600',
    sky:     'from-sky-400 to-sky-500',
    rose:    'from-rose-500 to-rose-600'
  }
};

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  state = getInitialState();
  renderNav();
  render();
  startSimulation(onScoreEvent);
});

// ================================================================
// NAVIGATION
// ================================================================
function navigate(section) {
  state.currentSection = section;
  renderNav();
  render();
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobile-overlay').classList.add('hidden');
}

function render() {
  ['configuratore', 'classifica', 'scheda'].forEach(s => {
    document.getElementById(`section-${s}`).classList.toggle('hidden', state.currentSection !== s);
  });
  if      (state.currentSection === 'configuratore') renderConfiguratore();
  else if (state.currentSection === 'classifica')    renderClassifica();
  else if (state.currentSection === 'scheda')        renderScheda();
}

function renderNav() {
  ['configuratore', 'classifica', 'scheda'].forEach(s => {
    document.querySelector(`[data-nav="${s}"]`)?.classList.toggle('active', state.currentSection === s);
  });
  const titles = { configuratore: 'Configuratore Gare', classifica: 'Classifica Live', scheda: 'Scheda Riepilogativa' };
  const el = document.getElementById('page-title');
  if (el) el.textContent = titles[state.currentSection] || '';

  const rb = document.getElementById('role-badge');
  if (rb) {
    rb.textContent = state.isAdmin ? 'STORE Admin' : 'Delegato';
    rb.className   = state.isAdmin
      ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700'
      : 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700';
  }
  const desc = document.getElementById('role-desc-sidebar');
  if (desc) desc.textContent = state.isAdmin ? 'STORE · Vista Completa' : 'Delegato · Team Emerald';

  const track = document.getElementById('role-toggle-track');
  if (track) track.classList.toggle('on', state.isAdmin);
}

// ================================================================
// CONFIGURATORE
// ================================================================
function renderConfiguratore() {
  const el = document.getElementById('section-configuratore');
  el.innerHTML = state.selectedGaraId ? buildGaraDetail(state.selectedGaraId) : buildGaraList();
}

// ---- Gara list (card grid) ----
function buildGaraList() {
  const statusMap = {
    attiva:    { cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Attiva' },
    bozza:     { cls: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400',    label: 'Bozza' },
    terminata: { cls: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400',   label: 'Terminata' }
  };

  const cards = state.competitions.map(g => {
    const s = statusMap[g.status] || statusMap.bozza;
    const isAttiva = g.status === 'attiva';
    return `
      <div class="bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
           onclick="openGara('${g.id}')">
        <div class="p-5">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="w-11 h-11 ${isAttiva ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              ${isAttiva ? '🏆' : '📁'}
            </div>
            <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}">
              <span class="w-1.5 h-1.5 rounded-full ${s.dot}${isAttiva ? ' live-pulse' : ''}"></span>${s.label}
            </span>
          </div>
          <h3 class="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">${g.name}</h3>
          <p class="text-xs text-gray-400 mt-1">${formatDate(g.startDate)} – ${formatDate(g.endDate)}</p>
          <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900">${g.criteria.length}</p>
              <p class="text-xs text-gray-400">Criteri</p>
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900">${g.sottogare.length}</p>
              <p class="text-xs text-gray-400">Sottogare</p>
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900">${g.numSquadre}</p>
              <p class="text-xs text-gray-400">Squadre</p>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between">
          <span class="text-xs text-gray-400">${g.hideScoreLastDays > 0 ? `Punteggi nascosti ultimi ${g.hideScoreLastDays}gg` : 'Punteggi sempre visibili'}</span>
          <span class="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">Apri →</span>
        </div>
      </div>`;
  }).join('');

  return `<div class="section-anim">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">Gare di Produzione</h2>
        <p class="text-sm text-gray-500 mt-1">${state.competitions.length} gare configurate</p>
      </div>
      ${state.isAdmin ? `<button onclick="openModalCreaGara()"
          class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-semibold shadow-sm transition-colors">
          <span class="text-lg leading-none">+</span> Crea Gara
        </button>` : ''}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">${cards}</div>
  </div>`;
}

function openGara(id) { state.selectedGaraId = id; state.selectedGaraSubtab = 'criteri'; renderConfiguratore(); }
function closeGara()  { state.selectedGaraId = null; renderConfiguratore(); }
function setGaraSubtab(t) { state.selectedGaraSubtab = t; renderConfiguratore(); }
function deleteGara(id) {
  if (!confirm('Eliminare questa gara?')) return;
  state.competitions = state.competitions.filter(g => g.id !== id);
  renderConfiguratore();
}

// ---- Gara detail ----
function buildGaraDetail(garaId) {
  const gara = state.competitions.find(g => g.id === garaId);
  if (!gara) return buildGaraList();
  const stab = state.selectedGaraSubtab;
  const statusColor = { attiva:'text-emerald-600', bozza:'text-gray-400', terminata:'text-slate-400' };
  const tabs = [
    { id:'criteri',   label:'Criteri', count: gara.criteria.length },
    { id:'sottogare', label:'Sottogare', count: gara.sottogare.length },
    { id:'squadre',   label:'Squadre', count: null }
  ];
  const content = stab === 'criteri' ? buildCriteriTab(gara)
                : stab === 'sottogare' ? buildSottogareTab(gara)
                : buildSquadreTab(gara);

  return `<div class="section-anim">
    <!-- Breadcrumb + back -->
    <div class="flex items-center gap-2 mb-5 text-sm">
      <button onclick="closeGara()" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Gare</button>
      <span class="text-gray-300">/</span>
      <span class="text-gray-600 font-medium">${gara.name}</span>
    </div>

    <!-- Gara header card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center gap-5">
      <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🏆</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 flex-wrap">
          <h2 class="text-xl font-extrabold text-gray-900">${gara.name}</h2>
          <span class="text-sm font-medium ${statusColor[gara.status]||'text-gray-400'} capitalize">${gara.status}</span>
        </div>
        <p class="text-sm text-gray-500 mt-0.5">${formatDate(gara.startDate)} – ${formatDate(gara.endDate)} · ${gara.numSquadre} squadre</p>
      </div>
      ${state.isAdmin && gara.status !== 'attiva' ? `
        <button onclick="deleteGara('${gara.id}')" class="px-3 py-1.5 text-xs font-medium text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">Elimina</button>` : ''}
    </div>

    <!-- Sub-tabs -->
    <div class="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
      ${tabs.map(t => `
        <button onclick="setGaraSubtab('${t.id}')"
                class="px-4 py-2 text-sm font-semibold rounded-lg transition-all ${stab === t.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}">
          ${t.label}${t.count !== null ? ` <span class="ml-1 text-xs font-bold opacity-60">${t.count}</span>` : ''}
        </button>`).join('')}
    </div>

    ${content}
  </div>`;
}

// ---- Criteri tab ----
function buildCriteriTab(gara) {
  const rows = gara.criteria.map(c => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-5 py-3.5">
        <div class="flex items-center gap-2">
          <span class="text-base">${ASSET_DEFINITIONS[c.assetId]?.icon || '📦'}</span>
          <span class="text-sm font-semibold text-gray-800">${getAssetLabelShort(c.assetId)}</span>
        </div>
      </td>
      <td class="px-5 py-3.5">
        <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">${c.contractType}</span>
      </td>
      <td class="px-5 py-3.5">
        <code class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-mono font-semibold border border-indigo-100">${formulaToString(c.formula)}</code>
      </td>
      ${state.isAdmin ? `<td class="px-5 py-3.5">
        <button onclick="deleteCriterio('${gara.id}','${c.id}')"
                class="px-2.5 py-1 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors">Rimuovi</button>
      </td>` : '<td></td>'}
    </tr>`).join('');

  const empty = !gara.criteria.length ? `
    <tr><td colspan="4" class="px-5 py-12 text-center">
      <p class="text-4xl mb-2">📋</p>
      <p class="text-gray-500 font-medium">Nessun criterio definito</p>
      ${state.isAdmin ? '<p class="text-sm text-gray-400 mt-1">Aggiungi il primo criterio di punteggio.</p>' : ''}
    </td></tr>` : '';

  return `<div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-gray-700 text-sm uppercase tracking-wider">Criteri di punteggio</h3>
      ${state.isAdmin ? `<button onclick="openModalAddCriterio('${gara.id}',null)"
          class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          + Aggiungi Criterio</button>` : ''}
    </div>
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo Contratto</th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Formula Punteggio</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">${rows}${empty}</tbody>
      </table>
    </div>
  </div>`;
}

function deleteCriterio(garaId, criterioId) {
  const g = state.competitions.find(g => g.id === garaId);
  if (g) { g.criteria = g.criteria.filter(c => c.id !== criterioId); renderConfiguratore(); }
}

// ---- Sottogare tab ----
function buildSottogareTab(gara) {
  const cards = gara.sottogare.map(sg => {
    const isAttiva = sg.status === 'attiva';
    const criteriHtml = sg.criteria.map(c => `
      <div class="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
        <div class="flex items-center gap-2">
          <span>${ASSET_DEFINITIONS[c.assetId]?.icon || '📦'}</span>
          <span class="text-sm text-gray-700 font-medium">${getAssetLabelShort(c.assetId)}</span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">${c.contractType}</span>
        </div>
        <code class="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">${formulaToString(c.formula)}</code>
      </div>`).join('');

    const extraHtml = sg.punteggiExtra.map(pe => `
      <div class="flex items-center justify-between py-2 border-b border-amber-100 last:border-0">
        <span class="text-sm text-amber-800">🎯 ${pe.label}</span>
        <span class="font-bold text-amber-700 text-sm">+${pe.points} pt</span>
      </div>`).join('');

    return `<div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div class="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
        <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚡</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-bold text-gray-900">${sg.name}</p>
            ${isAttiva ? `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Attiva</span>` : `<span class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">Bozza</span>`}
          </div>
          <p class="text-xs text-gray-400 mt-0.5">${sg.duration} · Fino al ${formatDate(sg.endDate)}</p>
        </div>
        ${state.isAdmin ? `<button onclick="openModalAddCriterio('${gara.id}','${sg.id}')"
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap transition-colors">+ Criterio</button>` : ''}
      </div>
      <div class="px-5 py-3">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Criteri</p>
        ${criteriHtml || '<p class="text-sm text-gray-400 py-2">Nessun criterio.</p>'}
      </div>
      ${sg.punteggiExtra.length ? `
        <div class="px-5 py-3 bg-amber-50 border-t border-amber-100">
          <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Punteggi Extra</p>
          ${extraHtml}
        </div>` : ''}
    </div>`;
  }).join('');

  const empty = !gara.sottogare.length ? `
    <div class="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center">
      <p class="text-4xl mb-2">⚡</p>
      <p class="text-gray-500 font-medium">Nessuna sottogara configurata</p>
    </div>` : '';

  return `<div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-gray-700 text-sm uppercase tracking-wider">Mini-gare</h3>
      ${state.isAdmin ? `<button onclick="openModalAddSottogara('${gara.id}')"
          class="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm">
          ⚡ Aggiungi Sottogara</button>` : ''}
    </div>
    <div class="space-y-4">${cards}${empty}</div>
  </div>`;
}

// ---- Squadre tab ----
function buildSquadreTab(gara) {
  const cards = TEAMS.slice(0, gara.numSquadre).map((team, i) => {
    const agents = getAgentsByTeam(team.id);
    return `<div class="bg-white rounded-2xl border-l-4 ${TC.leftBorder[team.color]||'border-l-gray-300'} border border-gray-200 overflow-hidden shadow-sm">
      <div class="p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-gradient-to-br ${TC.gradient[team.color]||'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">${team.initials}</div>
          <div>
            <p class="font-bold text-gray-900">${team.name} <span class="text-base">${team.emoji}</span></p>
            <p class="text-xs text-gray-400">${agents.length} agenti · Capogruppo: ${agents[0]?.name?.split(' ')[0] || '—'}</p>
          </div>
        </div>
        <div class="space-y-1.5 pl-1">
          ${agents.map(a => `
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <div class="w-5 h-5 ${TC.avatar[team.color]||'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-bold">${a.initials[0]}</div>
              ${a.name}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-bold text-gray-700 text-sm uppercase tracking-wider">Raggruppamenti</h3>
        <p class="text-xs text-gray-400 mt-0.5">${gara.numSquadre} squadre · Distribuzione automatica per capacità produttiva</p>
      </div>
      ${state.isAdmin ? `<button onclick="simulateCreaRaggruppamento()"
          class="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors shadow-sm">
          🔀 Crea Raggruppamento</button>` : ''}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">${cards}</div>
    ${state.isAdmin ? `<p class="text-xs text-amber-600 mt-4 flex items-center gap-1.5">
      <span>⚠️</span> Lo spostamento di membri tra squadre non è modificabile dopo il salvataggio iniziale.</p>` : ''}
  </div>`;
}

function simulateCreaRaggruppamento() { showToast('Raggruppamento creato! Agenti distribuiti per capacità produttiva.', 'emerald'); }

// ================================================================
// CLASSIFICA LIVE
// ================================================================
function renderClassifica() {
  const el = document.getElementById('section-classifica');
  el.innerHTML = buildClassificaHTML();
}

function buildClassificaHTML() {
  const comp = state.competitions.find(c => c.id === state.activeCompetitionId);
  if (!comp) return '<p class="text-gray-400 p-8">Nessuna gara attiva.</p>';

  const tabs = [
    { id: 'principale', label: 'Gara Principale', icon: '🏆' },
    ...comp.sottogare.map(sg => ({ id: sg.id, label: sg.name, icon: '⚡' }))
  ];

  const tabHtml = tabs.map(t => `
    <button onclick="setClassiTab('${t.id}')"
            class="classi-tab-btn ${state.classiTab === t.id ? 'active' : ''}">
      ${t.icon} ${t.label}
    </button>`).join('');

  const leaderboard = buildLeaderboard(state.classiTab);
  const feed = state.isAdmin ? buildActivityFeed() : '';

  return `<div class="section-anim h-full flex flex-col">
    <!-- Header strip -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <h2 class="text-2xl font-extrabold text-gray-900">${comp.name}</h2>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
          <span class="w-2 h-2 bg-amber-500 rounded-full live-pulse"></span>LIVE
        </span>
        <span class="text-xs text-gray-400">${formatDate(comp.startDate)} – ${formatDate(comp.endDate)}</span>
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
        <div onclick="toggleShowAgents()" class="toggle-track ${state.showAgents ? 'on' : ''}"><div class="toggle-thumb"></div></div>
        Mostra agenti
      </label>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-4 gap-0 overflow-x-auto flex-shrink-0">${tabHtml}</div>

    <!-- Body: leaderboard [+ feed] -->
    <div class="flex gap-4 flex-1 min-h-0">
      <div class="flex-1 overflow-y-auto">${leaderboard}</div>
      ${state.isAdmin ? `<div class="w-64 flex-shrink-0 overflow-y-auto">${feed}</div>` : ''}
    </div>
  </div>`;
}

function setClassiTab(tab)   { state.classiTab = tab; renderClassifica(); }
function toggleShowAgents()  { state.showAgents = !state.showAgents; renderClassifica(); }

// ---- Rankings computation ----
function computeRankings(tab) {
  return TEAMS.map(team => {
    const agents = getAgentsByTeam(team.id);
    const agentPts = tab === 'principale'
      ? agents.map(a => ({ ...a, pts: state.scores[a.id] || 0 }))
      : agents.map(a => ({ ...a, pts: state.sgScores[tab]?.[a.id] || 0 }));
    const total = agentPts.reduce((s, a) => s + a.pts, 0);
    return { team, total, agents: agentPts };
  })
  .sort((a, b) => b.total - a.total)
  .map((item, i) => ({ ...item, rank: i + 1 }));
}

// ---- Leaderboard (card per team) ----
function buildLeaderboard(tab) {
  const rankings = computeRankings(tab);
  const maxPts   = rankings[0]?.total || 1;

  const rankLabel = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  const trendHtml = (teamId, rank) => {
    const prev = state.previousRankings[teamId];
    if (!prev || prev === rank) return '<span class="text-gray-300 text-xs font-bold">—</span>';
    if (prev > rank)            return '<span class="text-emerald-500 text-sm font-bold" title="Salito">▲</span>';
    return '<span class="text-rose-400 text-sm font-bold" title="Sceso">▼</span>';
  };

  const rows = rankings.map(({ team, total, agents, rank }) => {
    const pct  = Math.round((total / maxPts) * 100);
    const isMe = team.id === state.loggedInTeamId;

    const agentRows = state.showAgents
      ? agents.sort((a, b) => b.pts - a.pts).map(a => `
          <div class="flex items-center gap-3 px-5 py-2.5 bg-gray-50/70 border-t border-gray-100 hover:bg-gray-100/80 transition-colors" data-agent-id="${a.id}">
            <div class="w-5 h-5 ${TC.avatar[team.color] || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${a.initials[0]}</div>
            <span class="text-sm text-gray-600 flex-1">${a.name}</span>
            <span class="text-sm font-bold text-gray-800 mr-3" id="aps-${a.id}">${round2(a.pts)} pt</span>
            <button onclick="openScontrino('${a.id}')"
                    class="text-xs text-indigo-400 hover:text-indigo-600 transition-colors">🧾 Scontrino</button>
          </div>`).join('')
      : '';

    return `
      <div id="team-card-${team.id}" class="bg-white rounded-2xl border-l-4 ${TC.leftBorder[team.color]||'border-l-gray-300'} border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isMe ? 'ring-2 ring-offset-1 ring-indigo-300' : ''}">
        <div class="flex items-center gap-4 px-5 py-4">
          <!-- Rank -->
          <span class="text-2xl flex-shrink-0 w-8 text-center">${rankLabel(rank)}</span>
          <!-- Avatar -->
          <div class="w-10 h-10 bg-gradient-to-br ${TC.gradient[team.color]||'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">${team.initials}</div>
          <!-- Name -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-gray-900">${team.name}</span>
              <span class="text-base">${team.emoji}</span>
              ${isMe ? '<span class="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs font-semibold">Tu</span>' : ''}
            </div>
            <!-- Progress bar -->
            <div class="flex items-center gap-2 mt-1.5">
              <div class="flex-1 bg-gray-200 rounded-full h-1.5 max-w-40">
                <div class="pts-bar-fill ${TC.bar[team.color]||'bg-gray-400'} h-1.5 rounded-full" style="width:${pct}%"></div>
              </div>
              <span class="text-xs text-gray-400">${pct}%</span>
            </div>
          </div>
          <!-- Trend -->
          <div class="flex-shrink-0">${trendHtml(team.id, rank)}</div>
          <!-- Points -->
          <div class="text-right flex-shrink-0">
            <p class="text-2xl font-extrabold text-gray-900" id="tps-${team.id}">${round2(total)}</p>
            <p class="text-xs text-gray-400 font-medium">punti</p>
          </div>
        </div>
        ${agentRows}
      </div>`;
  }).join('');

  return `<div class="space-y-2.5">${rows}</div>`;
}

// ---- Activity feed ----
function buildActivityFeed() {
  const items = state.activityFeed.slice(0, 10).map((ev, i) => {
    const team  = getTeamById(getAgentById(ev.agentId)?.teamId);
    const agent = getAgentById(ev.agentId);
    const varStr = ev.vars?.kW > 0 ? ` · ${ev.vars.kW}kW` : '';
    const timeAgo = ev.timestamp ? Math.round((Date.now() - new Date(ev.timestamp)) / 1000) : 0;
    const timeStr = timeAgo < 60 ? `${timeAgo}s fa` : `${Math.floor(timeAgo/60)}m fa`;
    return `<div class="feed-item flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-0 text-xs" style="animation-delay:${i*30}ms">
      <div class="w-7 h-7 bg-gradient-to-br ${TC.gradient[team?.color]||'from-gray-400 to-gray-500'} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${agent?.initials||'?'}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-800 truncate">${agent?.name||'?'}</p>
        <p class="text-gray-400 truncate">${ev.assetLabel}${varStr}</p>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="font-bold text-emerald-600">+${round2(ev.pts)}pt</p>
        <p class="text-gray-300 text-xs">${timeStr}</p>
      </div>
    </div>`;
  }).join('');

  return `<div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-0">
    <div class="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
      <span class="w-2 h-2 bg-emerald-400 rounded-full live-pulse flex-shrink-0"></span>
      <p class="text-sm font-bold text-gray-800">Attività Recente</p>
    </div>
    <div class="px-3 py-1">
      ${items || `<div class="py-8 text-center">
        <p class="text-2xl mb-1">⏳</p>
        <p class="text-xs text-gray-400">In attesa di eventi…</p>
      </div>`}
    </div>
  </div>`;
}

// ---- Simulation event handler ----
function onScoreEvent(ev) {
  // Snapshot current rankings
  computeRankings(state.classiTab).forEach(r => { state.previousRankings[r.team.id] = r.rank; });

  // Update scores
  if (ev.scope === 'main') {
    state.scores[ev.agentId] = round2((state.scores[ev.agentId] || 0) + ev.pts);
  } else {
    if (!state.sgScores[ev.scope]) state.sgScores[ev.scope] = {};
    state.sgScores[ev.scope][ev.agentId] = round2((state.sgScores[ev.scope][ev.agentId] || 0) + ev.pts);
  }

  // Store contract in history
  if (!state.agentContracts[ev.agentId]) state.agentContracts[ev.agentId] = [];
  state.agentContracts[ev.agentId].push({
    id: `sim-${Date.now()}`,
    assetLabel: ev.assetLabel,
    contractType: ev.contractType,
    vars: ev.vars,
    pts: ev.pts,
    timestamp: ev.timestamp
  });

  // Activity feed (main events or matching tab)
  if (ev.scope === 'main' || ev.scope === state.classiTab) {
    state.activityFeed.unshift({ ...ev });
    if (state.activityFeed.length > 20) state.activityFeed.pop();
  }

  if (state.currentSection === 'classifica') {
    renderClassifica();
    // Flash the team card
    const agent = getAgentById(ev.agentId);
    requestAnimationFrame(() => {
      const teamId = agent?.teamId;
      if (teamId) {
        const card = document.getElementById(`team-card-${teamId}`);
        if (card) { card.classList.remove('flash-score'); void card.offsetWidth; card.classList.add('flash-score'); }
      }
    });
  }
  if (state.currentSection === 'scheda') renderScheda();
}

// ================================================================
// SCONTRINO MODAL
// ================================================================
function openScontrino(agentId) {
  const agent     = getAgentById(agentId);
  const team      = getTeamById(agent?.teamId);
  const contracts = (state.agentContracts[agentId] || []).slice().reverse();
  const total     = state.scores[agentId] || 0;

  const rows = contracts.slice(0, 40).map(c => {
    const varStr = c.vars?.kW > 0 ? `${c.vars.kW} kW`
                 : c.vars?.['m³'] > 0 ? `${c.vars['m³']} m³`
                 : c.vars?.Minuti > 0 ? `${c.vars.Minuti} min` : '—';
    return `<tr class="hover:bg-gray-50 transition-colors">
      <td class="px-5 py-3 text-xs text-gray-400">${formatDateTime(c.timestamp)}</td>
      <td class="px-5 py-3 text-sm font-medium text-gray-700">${c.assetLabel}</td>
      <td class="px-5 py-3"><span class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">${c.contractType}</span></td>
      <td class="px-5 py-3 text-xs text-gray-500 font-mono">${varStr}</td>
      <td class="px-5 py-3 text-right font-bold text-emerald-600 text-sm">+${round2(c.pts)}pt</td>
    </tr>`;
  }).join('');

  const empty = !contracts.length ? `<tr><td colspan="5" class="px-5 py-10 text-center text-gray-400">Nessun contratto registrato.</td></tr>` : '';

  document.getElementById('scontrino-title').textContent = agent?.name || agentId;
  document.getElementById('scontrino-team').innerHTML = team
    ? `<span class="px-2 py-0.5 text-xs font-semibold rounded-full ${TC.badge[team.color]||'bg-gray-100 text-gray-600'}">${team.name}</span>` : '';
  document.getElementById('scontrino-body').innerHTML = rows + empty;
  document.getElementById('scontrino-total').textContent = round2(total);

  showModal('modal-scontrino');
}

// ================================================================
// SCHEDA RIEPILOGATIVA
// ================================================================
function renderScheda() {
  const el = document.getElementById('section-scheda');
  el.innerHTML = state.schedaAdminMode ? buildAdminGrid() : buildSchedaDelegato();
}

function buildSchedaDelegato() {
  const team      = getTeamById(state.loggedInTeamId);
  const agents    = getAgentsByTeam(team.id);
  const total     = agents.reduce((s, a) => s + (state.scores[a.id] || 0), 0);
  const rankings  = computeRankings('principale');
  const myRank    = rankings.find(r => r.team.id === team.id)?.rank || '—';
  const maxTotal  = rankings[0]?.total || 1;

  return `<div class="section-anim max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">La Mia Squadra</h2>
        <p class="text-sm text-gray-400 mt-0.5">Vista personale · Delegato</p>
      </div>
      ${state.isAdmin ? `<button onclick="toggleSchedaAdmin()"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          👁 Vista Admin</button>` : ''}
    </div>
    ${buildTeamCard(team, agents, total, myRank, maxTotal, true)}
  </div>`;
}

function buildAdminGrid() {
  const rankings = computeRankings('principale');
  const maxTotal = rankings[0]?.total || 1;
  const cards = rankings.map(({ team, total, rank }) => {
    const agents = getAgentsByTeam(team.id);
    return buildTeamCard(team, agents, total, rank, maxTotal, false);
  }).join('');

  return `<div class="section-anim">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">Vista Admin — Tutte le Squadre</h2>
        <p class="text-sm text-gray-400 mt-0.5">Classifica completa con dettaglio agenti</p>
      </div>
      <button onclick="toggleSchedaAdmin()"
              class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors">← Vista Delegato</button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">${cards}</div>
  </div>`;
}

function buildTeamCard(team, agents, total, rank, maxTotal, large) {
  const rankIcon   = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const pct        = Math.round((total / maxTotal) * 100);

  // Asset breakdown
  const assetPts = {};
  agents.forEach(a => {
    (state.agentContracts[a.id] || []).forEach(c => {
      assetPts[c.assetLabel] = round2((assetPts[c.assetLabel] || 0) + c.pts);
    });
  });
  const topAssets = Object.entries(assetPts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxAsset  = topAssets[0]?.[1] || 1;

  const agentRows = agents
    .map(a => ({ a, pts: state.scores[a.id] || 0 }))
    .sort((x, y) => y.pts - x.pts)
    .map(({ a, pts }) => `
      <div class="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <div class="w-8 h-8 ${TC.avatar[team.color]||'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${a.initials}</div>
        <span class="text-sm text-gray-700 flex-1 font-medium">${a.name}</span>
        <button onclick="openScontrino('${a.id}')" class="text-xs text-indigo-400 hover:text-indigo-600 mr-2 transition-colors">🧾</button>
        <span class="text-sm font-bold text-gray-900">${round2(pts)} pt</span>
      </div>`).join('');

  const assetBars = topAssets.map(([label, pts]) => `
    <div class="mb-2">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs text-gray-600 font-medium truncate max-w-32">${label}</span>
        <span class="text-xs font-bold text-gray-700 ml-2">${round2(pts)}pt</span>
      </div>
      <div class="bg-gray-200 rounded-full h-1.5">
        <div class="pts-bar-fill ${TC.bar[team.color]||'bg-gray-400'} h-1.5 rounded-full" style="width:${Math.round((pts/maxAsset)*100)}%"></div>
      </div>
    </div>`).join('');

  return `<div class="bg-white rounded-2xl border ${TC.border[team.color]||'border-gray-200'} overflow-hidden shadow-sm">
    <!-- Hero -->
    <div class="bg-gradient-to-br ${TC.gradient[team.color]||'from-gray-400 to-gray-500'} px-5 py-5 text-white">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center font-bold text-base">${team.initials}</div>
          <div>
            <p class="font-bold text-base">${team.name} ${team.emoji}</p>
            <p class="text-white/70 text-xs">${agents.length} agenti</p>
          </div>
        </div>
        <span class="text-3xl">${rankIcon}</span>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <p class="text-4xl font-extrabold">${round2(total)}</p>
          <p class="text-white/70 text-xs font-medium">punti totali</p>
        </div>
        <div class="text-right">
          <div class="bg-white/20 rounded-full h-1.5 w-28 mb-1">
            <div class="bg-white h-1.5 rounded-full transition-all" style="width:${pct}%"></div>
          </div>
          <p class="text-white/70 text-xs">${pct}% del leader</p>
        </div>
      </div>
    </div>
    <!-- Asset bars -->
    ${topAssets.length ? `<div class="px-5 py-4 border-b border-gray-100">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Punteggi per Asset</p>
      ${assetBars}
    </div>` : ''}
    <!-- Agents -->
    <div class="px-5 py-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Agenti</p>
      ${agentRows}
    </div>
    ${state.isAdmin ? `<div class="px-5 py-3 bg-gray-50 border-t border-gray-100">
      <button onclick="alert('Export CSV in corso…')" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">📥 Esporta CSV</button>
    </div>` : ''}
  </div>`;
}

function toggleSchedaAdmin() { state.schedaAdminMode = !state.schedaAdminMode; renderScheda(); }

// ================================================================
// MODALS — Crea Gara
// ================================================================
function openModalCreaGara() {
  document.getElementById('modal-crea-gara-body').innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nome Gara *</label>
        <input id="cg-name" type="text" placeholder="es. Gara Q3 2026"
               class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Data inizio *</label>
          <input id="cg-start" type="date" class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Data fine *</label>
          <input id="cg-end" type="date" class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Numero squadre</label>
        <select id="cg-squadre" class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
          <option value="3">3 squadre</option><option value="4">4 squadre</option><option value="5" selected>5 squadre</option>
        </select>
      </div>
      <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <input id="cg-hide" type="checkbox" class="mt-0.5 rounded border-amber-300 text-amber-500 flex-shrink-0">
        <div class="flex-1">
          <label for="cg-hide" class="text-sm font-semibold text-gray-700 cursor-pointer">Nascondi punteggi negli ultimi giorni</label>
          <div class="flex items-center gap-2 mt-1.5">
            <input id="cg-hide-days" type="number" min="1" max="14" value="3"
                   class="w-16 border border-amber-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-400">
            <span class="text-sm text-gray-500">giorni prima della fine</span>
          </div>
        </div>
      </div>
    </div>`;
  showModal('modal-crea-gara');
}

function saveCreaGara() {
  const name  = document.getElementById('cg-name')?.value?.trim();
  const start = document.getElementById('cg-start')?.value;
  const end   = document.getElementById('cg-end')?.value;
  const n     = parseInt(document.getElementById('cg-squadre')?.value) || 5;
  const hide  = document.getElementById('cg-hide')?.checked;
  const days  = parseInt(document.getElementById('cg-hide-days')?.value) || 0;
  if (!name || !start || !end)  { showToast('Compila tutti i campi obbligatori.', 'rose'); return; }
  if (start >= end)             { showToast('La data fine deve essere successiva all\'inizio.', 'rose'); return; }
  state.competitions.unshift({ id:'gara-'+Date.now(), name, startDate:start, endDate:end,
    status:'bozza', hideScoreLastDays:hide?days:0, numSquadre:n, criteria:[], sottogare:[] });
  hideModal('modal-crea-gara');
  showToast(`Gara "${name}" creata come Bozza.`, 'emerald');
  renderConfiguratore();
}

// ================================================================
// MODALS — Aggiungi Criterio
// ================================================================
function openModalAddCriterio(garaId, sottogaId) {
  state._modalContext = { garaId, sottogaId };
  const assetOptions = Object.entries(ASSET_DEFINITIONS)
    .map(([id, d]) => `<option value="${id}">${d.icon} ${d.label}${d.categoria ? ' '+d.categoria : ''}</option>`).join('');
  const firstAsset = Object.keys(ASSET_DEFINITIONS)[0];
  const contractOptions = (CONTRACT_TYPES_BY_ASSET[firstAsset] || [])
    .map(t => `<option value="${t}">${t}</option>`).join('');

  document.getElementById('modal-add-criterio-body').innerHTML = `
    <div class="space-y-5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Asset *</label>
          <select id="crit-asset" onchange="onAssetChange()"
                  class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">
            ${assetOptions}
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Tipo Contratto *</label>
          <select id="crit-contract"
                  class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">
            ${contractOptions}
          </select>
        </div>
      </div>

      <!-- Formula Builder -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Formula Punteggio</label>
        <div class="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
          <!-- Base term -->
          <div class="flex items-center gap-3">
            <div class="w-24 flex-shrink-0">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Punti base</p>
            </div>
            <input id="fb-base" type="number" step="0.1" min="0" value="1"
                   oninput="updateFormulaPreview()"
                   class="w-24 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-all">
            <span class="text-sm text-gray-400 font-medium">punti fissi</span>
          </div>

          <!-- Variable terms -->
          <div id="fb-terms" class="space-y-2.5"></div>

          <!-- Add term button -->
          <button type="button" onclick="addFormulaVariable()"
                  class="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold py-1 transition-colors">
            <span class="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-base font-bold leading-none">+</span>
            Aggiungi componente variabile
          </button>

          <!-- Preview -->
          <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
            <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider flex-shrink-0">Formula:</span>
            <code id="fb-preview" class="text-sm font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-3.5 py-1.5 rounded-xl flex-1">1pt</code>
          </div>
        </div>
      </div>
    </div>`;
  showModal('modal-add-criterio');
  updateFormulaPreview();
}

function onAssetChange() {
  const assetId = document.getElementById('crit-asset')?.value;
  const contracts = CONTRACT_TYPES_BY_ASSET[assetId] || ['Switch'];
  document.getElementById('crit-contract').innerHTML =
    contracts.map(t => `<option value="${t}">${t}</option>`).join('');
}

function addFormulaVariable() {
  const varOptions = VARIABLES.map(v => `<option value="${v}">${v}</option>`).join('');
  const row = document.createElement('div');
  row.className = 'fb-var-row flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 px-3 py-2.5';
  row.innerHTML = `
    <span class="text-gray-300 font-semibold text-sm">+</span>
    <input type="number" step="0.01" min="0.01" value="0.5" oninput="updateFormulaPreview()"
           class="fb-var-coeff w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">
    <span class="text-gray-400 text-sm font-semibold">×</span>
    <select onchange="updateFormulaPreview()"
            class="fb-var-name flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">
      ${varOptions}
    </select>
    <button type="button" onclick="removeFormulaTerm(this)"
            class="w-6 h-6 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-lg font-light">×</button>`;
  document.getElementById('fb-terms').appendChild(row);
  updateFormulaPreview();
}

function removeFormulaTerm(btn) { btn.closest('.fb-var-row').remove(); updateFormulaPreview(); }

function getFormulaFromBuilder() {
  const terms = [];
  const base  = parseFloat(document.getElementById('fb-base')?.value) || 0;
  if (base !== 0) terms.push({ coeff: base, variable: null });
  document.querySelectorAll('.fb-var-row').forEach(row => {
    const coeff    = parseFloat(row.querySelector('.fb-var-coeff')?.value) || 0;
    const variable = row.querySelector('.fb-var-name')?.value;
    if (coeff && variable) terms.push({ coeff, variable });
  });
  return { terms: terms.length ? terms : [{ coeff: 0, variable: null }] };
}

function updateFormulaPreview() {
  const el = document.getElementById('fb-preview');
  if (el) el.textContent = formulaToString(getFormulaFromBuilder());
}

function saveCriterio() {
  const ctx      = state._modalContext;
  const assetId  = document.getElementById('crit-asset')?.value;
  const contract = document.getElementById('crit-contract')?.value;
  const formula  = getFormulaFromBuilder();
  if (!ctx || !assetId || !contract) { showToast('Seleziona asset e tipo contratto.', 'rose'); return; }
  const gara = state.competitions.find(g => g.id === ctx.garaId);
  if (!gara) return;
  const nc = { id:'c-'+Date.now(), assetId, contractType:contract, formula };
  if (ctx.sottogaId) {
    const sg = gara.sottogare.find(s => s.id === ctx.sottogaId);
    if (sg) sg.criteria.push(nc);
  } else {
    gara.criteria.push(nc);
  }
  hideModal('modal-add-criterio');
  showToast('Criterio aggiunto.', 'emerald');
  renderConfiguratore();
}

// ================================================================
// MODALS — Aggiungi Sottogara
// ================================================================
function openModalAddSottogara(garaId) {
  state._modalContext = { garaId };
  document.getElementById('modal-add-sottogara-body').innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nome Sottogara *</label>
        <input id="sg-name" type="text" placeholder="es. Sprint Pomeridiano"
               class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all">
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Finestra temporale</label>
        <input id="sg-duration" type="text" placeholder="es. 13:00 – 18:00 (quotidiano)"
               class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all">
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Data fine *</label>
        <input id="sg-enddate" type="date"
               class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all">
      </div>
      <p class="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5">
        💡 I criteri di punteggio potranno essere aggiunti dopo la creazione dalla scheda sottogara.
      </p>
    </div>`;
  showModal('modal-add-sottogara');
}

function saveSottogara() {
  const ctx      = state._modalContext;
  const name     = document.getElementById('sg-name')?.value?.trim();
  const duration = document.getElementById('sg-duration')?.value?.trim();
  const endDate  = document.getElementById('sg-enddate')?.value;
  if (!name || !endDate) { showToast('Nome e data fine sono obbligatori.', 'rose'); return; }
  const gara = state.competitions.find(g => g.id === ctx.garaId);
  if (!gara) return;
  gara.sottogare.push({ id:'sg-'+Date.now(), name, duration:duration||'Tutto il giorno',
    endDate, status:'bozza', criteria:[], punteggiExtra:[] });
  hideModal('modal-add-sottogara');
  showToast(`Sottogara "${name}" creata.`, 'emerald');
  renderConfiguratore();
}

// ================================================================
// MODAL HELPERS
// style.display is used intentionally (not Tailwind classes) to avoid
// the hidden/flex class conflict in Tailwind v3 generated stylesheet.
// ================================================================
function showModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function hideModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = 'none';
  document.body.style.overflow = '';
}

// ================================================================
// ROLE TOGGLE
// ================================================================
function toggleRole() {
  state.isAdmin = !state.isAdmin;
  renderNav();
  render();
  showToast(state.isAdmin ? '🔑 Vista STORE Admin attivata.' : '👤 Vista Delegato attivata.', state.isAdmin ? 'indigo' : 'emerald');
}

// ================================================================
// MOBILE SIDEBAR
// ================================================================
function toggleSidebar() {
  const sb      = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sb.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

// ================================================================
// TOAST
// ================================================================
function showToast(msg, color) {
  const cls = { emerald:'bg-emerald-600', indigo:'bg-indigo-600', rose:'bg-rose-500', amber:'bg-amber-500' };
  const t   = document.createElement('div');
  t.className = `fixed bottom-5 right-5 z-[9999] max-w-xs px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${cls[color]||'bg-gray-700'} feed-item`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 2800);
}

// ================================================================
// UTILS
// ================================================================
function round2(n) { return Math.round((n || 0) * 100) / 100; }
