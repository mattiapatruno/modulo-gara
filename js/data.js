/* ============================================================
   DATA.JS — Demo data, utilities, formula engine
   ============================================================ */

// ---- Asset definitions ----
const ASSET_DEFINITIONS = {
  'gas-res':      { label: 'Gas',            categoria: 'Residenziale', icon: '🔥', colorClass: 'orange' },
  'gas-bus':      { label: 'Gas',            categoria: 'Business',     icon: '🔥', colorClass: 'orange' },
  'luce-res':     { label: 'Luce',           categoria: 'Residenziale', icon: '💡', colorClass: 'yellow' },
  'luce-bus':     { label: 'Luce',           categoria: 'Business',     icon: '💡', colorClass: 'yellow' },
  'dual':         { label: 'Dual (Luce+Gas)',categoria: 'Residenziale', icon: '⚡', colorClass: 'purple' },
  'tel-res':      { label: 'Telefonia',      categoria: 'Residenziale', icon: '📱', colorClass: 'blue'   },
  'tel-bus':      { label: 'Telefonia',      categoria: 'Business',     icon: '📱', colorClass: 'blue'   },
  'fotovoltaico': { label: 'Fotovoltaico',   categoria: null,           icon: '☀️', colorClass: 'amber'  },
  'termico':      { label: 'Termico',        categoria: null,           icon: '🌡️', colorClass: 'red'    }
};

const CONTRACT_TYPES_BY_ASSET = {
  'gas-res':      ['Switch', 'Subentro', 'Nuovo'],
  'gas-bus':      ['Switch', 'Subentro', 'Nuovo'],
  'luce-res':     ['Switch', 'Subentro'],
  'luce-bus':     ['Switch', 'Subentro'],
  'dual':         ['Switch', 'Nuovo'],
  'tel-res':      ['Switch', 'Nuovo', 'Upgrade'],
  'tel-bus':      ['Switch', 'Nuovo', 'Upgrade'],
  'fotovoltaico': ['Nuovo'],
  'termico':      ['Nuovo', 'Upgrade']
};

const VARIABLES = ['kW', 'kWh', 'm³', 'Minuti', 'Unità'];

// ---- Teams ----
const TEAMS = [
  { id: 'team-emerald', name: 'Team Emerald', color: 'emerald', emoji: '🌿', initials: 'TE' },
  { id: 'team-indigo',  name: 'Team Indigo',  color: 'indigo',  emoji: '💎', initials: 'TI' },
  { id: 'team-amber',   name: 'Team Amber',   color: 'amber',   emoji: '⭐', initials: 'TA' },
  { id: 'team-sky',     name: 'Team Sky',     color: 'sky',     emoji: '☁️', initials: 'TS' },
  { id: 'team-rose',    name: 'Team Rose',    color: 'rose',    emoji: '🌸', initials: 'TR' }
];

// ---- Agents (2 per team) ----
const AGENTS = [
  { id: 'a1',  name: 'Luca Ferretti',   teamId: 'team-emerald', initials: 'LF', role: 'Agente' },
  { id: 'a2',  name: 'Sara Conti',      teamId: 'team-emerald', initials: 'SC', role: 'Agente' },
  { id: 'a3',  name: 'Marco Ricci',     teamId: 'team-indigo',  initials: 'MR', role: 'Agente' },
  { id: 'a4',  name: 'Elena Neri',      teamId: 'team-indigo',  initials: 'EN', role: 'Agente' },
  { id: 'a5',  name: 'Giorgio Bianchi', teamId: 'team-amber',   initials: 'GB', role: 'Agente' },
  { id: 'a6',  name: 'Chiara Vitale',   teamId: 'team-amber',   initials: 'CV', role: 'Agente' },
  { id: 'a7',  name: 'Andrea Russo',    teamId: 'team-sky',     initials: 'AR', role: 'Agente' },
  { id: 'a8',  name: 'Marta Leone',     teamId: 'team-sky',     initials: 'ML', role: 'Agente' },
  { id: 'a9',  name: 'Davide Esposito', teamId: 'team-rose',    initials: 'DE', role: 'Agente' },
  { id: 'a10', name: 'Francesca Greco', teamId: 'team-rose',    initials: 'FG', role: 'Agente' }
];

// ---- Competitions ----
const COMPETITIONS = [
  {
    id: 'gara-q2-2026',
    name: 'Gara Q2 2026',
    startDate: '2026-04-01',
    endDate:   '2026-06-30',
    status:    'attiva',
    hideScoreLastDays: 0,
    numSquadre: 5,
    criteria: [
      { id:'c1', assetId:'gas-res',      contractType:'Switch',  formula:{ terms:[{ coeff:1, variable:null }] } },
      { id:'c2', assetId:'dual',         contractType:'Switch',  formula:{ terms:[{ coeff:2, variable:null }] } },
      { id:'c3', assetId:'luce-bus',     contractType:'Switch',  formula:{ terms:[{ coeff:2, variable:null },{ coeff:0.1, variable:'kW' }] } },
      { id:'c4', assetId:'gas-bus',      contractType:'Switch',  formula:{ terms:[{ coeff:2, variable:null },{ coeff:0.1, variable:'kW' }] } },
      { id:'c5', assetId:'tel-res',      contractType:'Switch',  formula:{ terms:[{ coeff:2, variable:null }] } },
      { id:'c6', assetId:'tel-bus',      contractType:'Switch',  formula:{ terms:[{ coeff:2, variable:null }] } },
      { id:'c7', assetId:'fotovoltaico', contractType:'Nuovo',   formula:{ terms:[{ coeff:10, variable:'kW' }] } },
      { id:'c8', assetId:'termico',      contractType:'Nuovo',   formula:{ terms:[{ coeff:1,  variable:null },{ coeff:0.3, variable:'kW' }] } }
    ],
    sottogare: [
      {
        id: 'sg1',
        name: 'Sprint Mattutino',
        duration: '7:00 – 12:00 (quotidiano)',
        endDate: '2026-06-30',
        status: 'attiva',
        criteria: [
          { id:'sc1', assetId:'gas-res', contractType:'Switch', formula:{ terms:[{ coeff:3, variable:null }] } },
          { id:'sc2', assetId:'dual',    contractType:'Switch', formula:{ terms:[{ coeff:4, variable:null }] } }
        ],
        punteggiExtra: [
          { id:'pe1', label:'Obiettivo Smart mensile',         points: 5  },
          { id:'pe2', label:'Vittoria settimanale squadra',    points: 10 }
        ]
      },
      {
        id: 'sg2',
        name: 'Challenge Fotovoltaico',
        duration: 'Tutto il giorno',
        endDate: '2026-04-30',
        status: 'attiva',
        criteria: [
          { id:'sc3', assetId:'fotovoltaico', contractType:'Nuovo', formula:{ terms:[{ coeff:12, variable:'kW' }] } },
          { id:'sc4', assetId:'termico',      contractType:'Nuovo', formula:{ terms:[{ coeff:1, variable:null },{ coeff:0.5, variable:'kW' }] } }
        ],
        punteggiExtra: [
          { id:'pe3', label:'Riduzione ticket assistenza', points: 3 }
        ]
      }
    ]
  },
  {
    id: 'gara-q1-2026',
    name: 'Gara Q1 2026',
    startDate: '2026-01-01',
    endDate:   '2026-03-31',
    status:    'terminata',
    hideScoreLastDays: 0,
    numSquadre: 5,
    criteria: [
      { id:'q1c1', assetId:'gas-res', contractType:'Switch', formula:{ terms:[{ coeff:1, variable:null }] } },
      { id:'q1c2', assetId:'dual',    contractType:'Switch', formula:{ terms:[{ coeff:2, variable:null }] } },
      { id:'q1c3', assetId:'luce-res',contractType:'Switch', formula:{ terms:[{ coeff:1.5, variable:null }] } }
    ],
    sottogare: []
  },
  {
    id: 'gara-estate-2026',
    name: 'Gara Estate 2026',
    startDate: '2026-07-01',
    endDate:   '2026-09-30',
    status:    'bozza',
    hideScoreLastDays: 3,
    numSquadre: 4,
    criteria: [],
    sottogare: []
  }
];

// ---- Seed scores ----
const INITIAL_SCORES = {
  main: { a1:45, a2:38, a3:42, a4:35, a5:40, a6:28, a7:33, a8:20, a9:25, a10:18 },
  sg1:  { a1:12, a2:8,  a3:15, a4:6,  a5:10, a6:5,  a7:9,  a8:4,  a9:3,  a10:2  },
  sg2:  { a1:84, a2:0,  a3:60, a4:0,  a5:40, a6:0,  a7:24, a8:0,  a9:0,  a10:0  }
};

// ---- Formula engine ----
function evaluateFormula(formula, variables) {
  if (!formula || !formula.terms || formula.terms.length === 0) return 0;
  const result = formula.terms.reduce((sum, t) => {
    const val = t.variable ? (variables[t.variable] ?? 0) : 1;
    return sum + t.coeff * val;
  }, 0);
  return Math.round(result * 100) / 100;
}

function formulaToString(formula) {
  if (!formula || !formula.terms || formula.terms.length === 0) return '0pt';
  return formula.terms
    .map(t => t.variable ? `${t.coeff} × ${t.variable}` : `${t.coeff}pt`)
    .join(' + ');
}

// ---- Variable generation for simulation ----
function generateVarsForAsset(assetId) {
  const v = { kW: 0, kWh: 0, 'm³': 0, Minuti: 0, Unità: 1 };
  if      (assetId === 'fotovoltaico')                   v.kW = r(1, 9);
  else if (assetId === 'termico')                        v.kW = r(1, 5);
  else if (assetId === 'luce-bus' || assetId === 'gas-bus') v.kW = r(3, 10);
  return v;
  function r(min, max) { return Math.round((min + Math.random() * (max - min)) * 10) / 10; }
}

// ---- Lookup helpers ----
function getAssetLabel(assetId) {
  const def = ASSET_DEFINITIONS[assetId];
  if (!def) return assetId;
  return def.categoria ? `${def.icon} ${def.label} ${def.categoria}` : `${def.icon} ${def.label}`;
}

function getAssetLabelShort(assetId) {
  const def = ASSET_DEFINITIONS[assetId];
  if (!def) return assetId;
  return def.categoria ? `${def.label} ${def.categoria}` : def.label;
}

function getTeamById(id)  { return TEAMS.find(t => t.id === id); }
function getAgentById(id) { return AGENTS.find(a => a.id === id); }
function getAgentsByTeam(teamId) { return AGENTS.filter(a => a.teamId === teamId); }

// ---- Date helpers ----
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
}

function formatDateTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }) + ' ' +
         date.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit' });
}

// ---- Generate seed contract history ----
function generateInitialContracts() {
  const contracts = {};
  AGENTS.forEach(a => { contracts[a.id] = []; });

  const comp = COMPETITIONS.find(c => c.id === 'gara-q2-2026');
  const baseTime = new Date('2026-04-08T17:00:00');

  AGENTS.forEach(agent => {
    let targetPts = INITIAL_SCORES.main[agent.id] || 0;
    let offsetMs  = 8 * 3600 * 1000; // 8h ago

    while (targetPts > 0 && offsetMs > 60000) {
      const crit = comp.criteria[Math.floor(Math.random() * comp.criteria.length)];
      const vars = generateVarsForAsset(crit.assetId);
      const pts  = evaluateFormula(crit.formula, vars);
      if (pts <= 0) { offsetMs -= 600000; continue; }

      const ts = new Date(baseTime.getTime() - offsetMs);
      contracts[agent.id].push({
        id:           `h-${agent.id}-${offsetMs}`,
        criterioId:   crit.id,
        assetLabel:   getAssetLabelShort(crit.assetId),
        contractType: crit.contractType,
        vars,
        pts,
        timestamp:    ts
      });

      targetPts -= pts;
      offsetMs  -= Math.floor(Math.random() * 2400000) + 300000; // 5min–45min apart
    }

    // Sort oldest → newest
    contracts[agent.id].sort((a, b) => a.timestamp - b.timestamp);
  });

  return contracts;
}

// ---- Initial state factory ----
function getInitialState() {
  return {
    currentSection:     'classifica',
    competitions:       JSON.parse(JSON.stringify(COMPETITIONS)),
    activeCompetitionId:'gara-q2-2026',
    scores:             JSON.parse(JSON.stringify(INITIAL_SCORES.main)),
    sgScores: {
      sg1: JSON.parse(JSON.stringify(INITIAL_SCORES.sg1)),
      sg2: JSON.parse(JSON.stringify(INITIAL_SCORES.sg2))
    },
    previousRankings:   {},
    activityFeed:       [],
    agentContracts:     generateInitialContracts(),
    selectedGaraId:     null,
    selectedGaraSubtab: 'criteri',
    classiTab:          'principale',
    showAgents:         false,
    schedaAdminMode:    false,
    loggedInTeamId:     'team-emerald',
    isAdmin:            false,
    // For formula builder state (transient, not persisted)
    _modalContext: null
  };
}
