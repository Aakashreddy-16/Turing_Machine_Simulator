/* ============================================================
   TURING MACHINE SIMULATOR — Core Engine & Visualization
   Theory of Computation — SEM 4
   ============================================================ */

'use strict';

// ============================================================
// PRESET PROGRAMS
// ============================================================
const PRESETS = {

  // ── Palindrome Checker (even-length strings of 0s and 1s) ──
  palindrome: {
    name: 'Palindrome Checker',
    description: 'Accepts even-length palindromes over {0,1}',
    input: '0110',
    initialState: 'q0',
    acceptState: 'qA',
    rejectState: 'qR',
    blank: 'B',
    transitions: [
      // Mark first 0, search end for 0
      { from: 'q0', read: '0', write: 'X', move: 'R', to: 'q1' },
      { from: 'q0', read: '1', write: 'Y', move: 'R', to: 'q3' },
      { from: 'q0', read: 'X', write: 'X', move: 'R', to: 'q0' },
      { from: 'q0', read: 'Y', write: 'Y', move: 'R', to: 'q0' },
      { from: 'q0', read: 'B', write: 'B', move: 'R', to: 'qA' }, // empty → accept

      // Saw 0 at left, skip right to find right end
      { from: 'q1', read: '0', write: '0', move: 'R', to: 'q1' },
      { from: 'q1', read: '1', write: '1', move: 'R', to: 'q1' },
      { from: 'q1', read: 'X', write: 'X', move: 'R', to: 'q1' },
      { from: 'q1', read: 'Y', write: 'Y', move: 'R', to: 'q1' },
      { from: 'q1', read: 'B', write: 'B', move: 'L', to: 'q2' }, // reached end, go left

      // At rightmost, must find 0
      { from: 'q2', read: '0', write: 'X', move: 'L', to: 'q5' },
      { from: 'q2', read: '1', write: '1', move: 'L', to: 'qR' },
      { from: 'q2', read: 'X', write: 'X', move: 'L', to: 'q2' },
      { from: 'q2', read: 'Y', write: 'Y', move: 'L', to: 'q2' },

      // Saw 1 at left, skip right to find right end
      { from: 'q3', read: '0', write: '0', move: 'R', to: 'q3' },
      { from: 'q3', read: '1', write: '1', move: 'R', to: 'q3' },
      { from: 'q3', read: 'X', write: 'X', move: 'R', to: 'q3' },
      { from: 'q3', read: 'Y', write: 'Y', move: 'R', to: 'q3' },
      { from: 'q3', read: 'B', write: 'B', move: 'L', to: 'q4' },

      // At rightmost, must find 1
      { from: 'q4', read: '1', write: 'Y', move: 'L', to: 'q5' },
      { from: 'q4', read: '0', write: '0', move: 'L', to: 'qR' },
      { from: 'q4', read: 'X', write: 'X', move: 'L', to: 'q4' },
      { from: 'q4', read: 'Y', write: 'Y', move: 'L', to: 'q4' },

      // Go back left to restart
      { from: 'q5', read: '0', write: '0', move: 'L', to: 'q5' },
      { from: 'q5', read: '1', write: '1', move: 'L', to: 'q5' },
      { from: 'q5', read: 'X', write: 'X', move: 'R', to: 'q0' },
      { from: 'q5', read: 'Y', write: 'Y', move: 'R', to: 'q0' },
      { from: 'q5', read: 'B', write: 'B', move: 'R', to: 'q0' },
    ]
  },

  // ── Binary Increment ──
  'binary-inc': {
    name: 'Binary Increment',
    description: 'Adds 1 to a binary number (right to left)',
    input: '1011',
    initialState: 'q0',
    acceptState: 'qA',
    rejectState: 'qR',
    blank: 'B',
    transitions: [
      // Scan to rightmost bit
      { from: 'q0', read: '0', write: '0', move: 'R', to: 'q0' },
      { from: 'q0', read: '1', write: '1', move: 'R', to: 'q0' },
      { from: 'q0', read: 'B', write: 'B', move: 'L', to: 'q1' }, // at right end
      // Increment from right
      { from: 'q1', read: '0', write: '1', move: 'L', to: 'qA' }, // 0→1 done
      { from: 'q1', read: '1', write: '0', move: 'L', to: 'q1' }, // 1→0 carry
      { from: 'q1', read: 'B', write: '1', move: 'R', to: 'qA' }, // overflow
    ]
  },

  // ── Unary Addition ──
  'unary-add': {
    name: 'Unary Addition',
    description: 'Computes 1^m + 1^n = 1^(m+n). Input: 1s separated by +',
    input: '111+11',
    initialState: 'q0',
    acceptState: 'qA',
    rejectState: 'qR',
    blank: 'B',
    transitions: [
      // Skip over 1s on left side
      { from: 'q0', read: '1', write: '1', move: 'R', to: 'q0' },
      // Find the +
      { from: 'q0', read: '+', write: '1', move: 'R', to: 'q1' }, // replace + with 1
      // Skip over 1s on right side
      { from: 'q1', read: '1', write: '1', move: 'R', to: 'q1' },
      // Hit blank: go back to erase last 1
      { from: 'q1', read: 'B', write: 'B', move: 'L', to: 'q2' },
      // Erase last 1 (was phantom)
      { from: 'q2', read: '1', write: 'B', move: 'R', to: 'qA' },
    ]
  },

  // ── Even Zeros Acceptor ──
  'even-zeros': {
    name: 'Even Zeros Acceptor',
    description: 'Accepts strings over {0,1} with an even number of 0s',
    input: '100100',
    initialState: 'q0',
    acceptState: 'qA',
    rejectState: 'qR',
    blank: 'B',
    transitions: [
      // q0 = even zeros seen so far (start)
      { from: 'q0', read: '0', write: '0', move: 'R', to: 'q1' },
      { from: 'q0', read: '1', write: '1', move: 'R', to: 'q0' },
      { from: 'q0', read: 'B', write: 'B', move: 'R', to: 'qA' }, // accept
      // q1 = odd zeros seen
      { from: 'q1', read: '0', write: '0', move: 'R', to: 'q0' },
      { from: 'q1', read: '1', write: '1', move: 'R', to: 'q1' },
      { from: 'q1', read: 'B', write: 'B', move: 'R', to: 'qR' }, // reject
    ]
  }
};

// ============================================================
// TURING MACHINE STATE
// ============================================================
let TM = {
  transitions: [],        // Array of {from, read, write, move, to}
  tape: {},               // Sparse map: position → symbol
  head: 0,                // Current head position
  state: 'q0',            // Current state
  initialState: 'q0',
  acceptState: 'qA',
  rejectState: 'qR',
  blank: 'B',
  steps: 0,
  halted: false,
  result: null,           // 'accepted' | 'rejected'
  writtenCells: new Set(),// Positions that were written (for animation)
  playInterval: null,
  speed: 500,
  activePresetKey: 'palindrome',
  log: [],
  activeTransitionIdx: -1,
};

// ============================================================
// UTILITY
// ============================================================
function readCell(pos) {
  return TM.tape[pos] !== undefined ? TM.tape[pos] : TM.blank;
}
function writeCell(pos, sym) {
  if (sym === TM.blank) {
    delete TM.tape[pos];
  } else {
    TM.tape[pos] = sym;
  }
  TM.writtenCells.add(pos);
}

// ============================================================
// LOAD PRESET
// ============================================================
function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;

  TM.activePresetKey = key;

  // Update active button
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('preset-' + key);
  if (btn) btn.classList.add('active');

  // Set config
  TM.transitions = preset.transitions;
  TM.initialState = preset.initialState;
  TM.acceptState = preset.acceptState;
  TM.rejectState = preset.rejectState;
  TM.blank = preset.blank;

  // Update UI fields
  document.getElementById('tape-input').value = preset.input;
  document.getElementById('initial-state').value = preset.initialState;
  document.getElementById('accept-state').value = preset.acceptState;
  document.getElementById('reject-state').value = preset.rejectState;
  document.getElementById('blank-symbol').value = preset.blank;

  // Build transition table
  buildTransitionTable();

  // Reset and draw
  resetMachine();

  // Update stats: number of unique states and transitions
  const allStates = new Set(preset.transitions.flatMap(t => [t.from, t.to]));
  document.getElementById('stat-states').textContent = allStates.size;
  document.getElementById('stat-transitions').textContent = preset.transitions.length;

  // Draw state diagram
  drawStateDiagram();
}

// ============================================================
// RESET / INITIALIZE TAPE
// ============================================================
function resetMachine() {
  stopPlay();

  const inputStr = document.getElementById('tape-input').value.trim();
  TM.tape = {};
  TM.writtenCells = new Set();

  // Write input onto tape starting at position 0
  for (let i = 0; i < inputStr.length; i++) {
    TM.tape[i] = inputStr[i];
  }

  TM.head = 0;
  TM.state = TM.initialState;
  TM.steps = 0;
  TM.halted = false;
  TM.result = null;
  TM.log = [];
  TM.activeTransitionIdx = -1;

  updateStatusBadge('idle');
  updateStatePill();
  renderTape();
  updateStats();
  renderLog();
  updateID();
  hideResult();
  clearActiveTableRow();

  document.getElementById('btn-play').querySelector('#play-icon').textContent = '▶';
  document.getElementById('btn-play').querySelector('#play-text').textContent = 'Play';
}

// ============================================================
// STEP
// ============================================================
function stepMachine() {
  if (TM.halted) return;

  const sym = readCell(TM.head);
  const trans = findTransition(TM.state, sym);

  if (!trans) {
    // No transition found → implicit reject
    TM.halted = true;
    TM.result = 'rejected';
    addLog(TM.steps, TM.state, sym, null, null, null, 'rejected');
    finalize('rejected');
    return;
  }

  // Log before applying
  addLog(TM.steps, TM.state, sym, trans.write, trans.move, trans.to);

  // Apply transition
  writeCell(TM.head, trans.write);
  TM.head += (trans.move === 'R') ? 1 : -1;
  TM.state = trans.to;
  TM.steps++;

  // Highlight the active table row
  TM.activeTransitionIdx = TM.transitions.indexOf(trans);
  highlightTableRow(TM.activeTransitionIdx);

  // Check halting
  if (TM.state === TM.acceptState) {
    TM.halted = true;
    TM.result = 'accepted';
    addLog(TM.steps, TM.state, null, null, null, null, 'accepted');
    finalize('accepted');
  } else if (TM.state === TM.rejectState) {
    TM.halted = true;
    TM.result = 'rejected';
    addLog(TM.steps, TM.state, null, null, null, null, 'rejected');
    finalize('rejected');
  }

  // Update visuals
  updateStatePill();
  renderTape();
  updateStats();
  updateID();
  drawStateDiagram();
}

function findTransition(state, sym) {
  return TM.transitions.find(t => t.from === state && t.read === sym) || null;
}

// ============================================================
// PLAY / PAUSE
// ============================================================
function togglePlay() {
  if (TM.halted) {
    resetMachine();
    return;
  }
  if (TM.playInterval) {
    stopPlay();
  } else {
    startPlay();
  }
}
function startPlay() {
  document.getElementById('btn-play').querySelector('#play-icon').textContent = '⏸';
  document.getElementById('btn-play').querySelector('#play-text').textContent = 'Pause';
  updateStatusBadge('running');
  TM.playInterval = setInterval(() => {
    stepMachine();
    if (TM.halted) stopPlay();
  }, TM.speed);
}
function stopPlay() {
  if (TM.playInterval) {
    clearInterval(TM.playInterval);
    TM.playInterval = null;
  }
  document.getElementById('btn-play').querySelector('#play-icon').textContent = '▶';
  document.getElementById('btn-play').querySelector('#play-text').textContent = 'Play';
  if (!TM.halted) updateStatusBadge('idle');
}

// ============================================================
// SPEED
// ============================================================
function updateSpeed(val) {
  TM.speed = parseInt(val);
  document.getElementById('speed-label').textContent = val + 'ms';
  if (TM.playInterval) {
    stopPlay(); startPlay();
  }
}

// ============================================================
// FINALIZE
// ============================================================
function finalize(result) {
  stopPlay();
  updateStatusBadge(result);
  showResult(result);
  drawStateDiagram();
}

// ============================================================
// TAPE RENDERING
// ============================================================
function renderTape() {
  const track = document.getElementById('tape-track');
  track.innerHTML = '';

  // Calculate window of cells to show
  const VISIBLE = 15; // cells visible
  const half = Math.floor(VISIBLE / 2);

  for (let i = TM.head - half; i <= TM.head + half; i++) {
    const sym = readCell(i);
    const isBlank = sym === TM.blank;
    const isHead = i === TM.head;
    const wasWritten = TM.writtenCells.has(i) && !isHead;

    const cell = document.createElement('div');
    cell.className = 'tape-cell' +
      (isHead ? ' head' : '') +
      (isBlank ? ' blank' : '') +
      (wasWritten ? ' written' : '');

    cell.textContent = sym;

    // Position index
    const idx = document.createElement('div');
    idx.className = 'tape-cell-index';
    idx.textContent = i;
    cell.appendChild(idx);

    track.appendChild(cell);
  }
}

// ============================================================
// STATE PILL
// ============================================================
function updateStatePill() {
  const pill = document.getElementById('display-state');
  pill.textContent = TM.state;
  pill.className = 'state-pill';
  if (TM.state === TM.acceptState) pill.classList.add('accepting');
  else if (TM.state === TM.rejectState) pill.classList.add('rejecting');
}

// ============================================================
// LOG
// ============================================================
function addLog(step, state, read, write, dir, nextState, outcome) {
  TM.log.push({ step, state, read, write, dir, nextState, outcome });

  const container = document.getElementById('log-container');
  // Remove empty placeholder
  const empty = container.querySelector('.log-empty');
  if (empty) empty.remove();

  const entry = document.createElement('div');
  entry.className = 'log-entry' + (outcome ? ' ' + outcome : '');

  const stepEl = document.createElement('div');
  stepEl.className = 'log-step';
  stepEl.textContent = step;

  const content = document.createElement('div');
  content.className = 'log-content';

  if (outcome === 'accepted') {
    content.innerHTML = `<span class="log-state" style="color:var(--success)">✓ ACCEPTED</span> in state <span class="log-state">${state}</span>`;
  } else if (outcome === 'rejected') {
    content.innerHTML = `<span class="log-state" style="color:var(--danger)">✗ REJECTED</span> in state <span class="log-state">${state}</span>`;
  } else {
    content.innerHTML =
      `<span class="log-state">${state}</span>` +
      ` read:<span class="log-sym">${read}</span>` +
      ` → write:<span class="log-sym">${write}</span>` +
      ` move:<span class="log-dir">${dir}</span>` +
      ` → <span class="log-state">${nextState}</span>`;
  }

  entry.appendChild(stepEl);
  entry.appendChild(content);
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function renderLog() {
  const container = document.getElementById('log-container');
  container.innerHTML = '<div class="log-empty">Run the machine to see computation steps...</div>';
}

function clearLog() {
  TM.log = [];
  renderLog();
}

// ============================================================
// STATS
// ============================================================
function updateStats() {
  document.getElementById('stat-steps').textContent = TM.steps;
  document.getElementById('stat-head').textContent = TM.head;
}

// ============================================================
// INSTANTANEOUS DESCRIPTION
// ============================================================
function updateID() {
  const display = document.getElementById('id-display');

  // Build tape string around head
  const minPos = Math.min(0, TM.head - 3, ...Object.keys(TM.tape).map(Number));
  const maxPos = Math.max(Object.keys(TM.tape).length > 0 ? Math.max(...Object.keys(TM.tape).map(Number)) : 0, TM.head + 3);

  let left = '', right = '';
  for (let i = minPos; i < TM.head; i++) left += readCell(i);
  for (let i = TM.head + 1; i <= maxPos; i++) right += readCell(i);
  const headSym = readCell(TM.head);

  display.innerHTML =
    `<span class="id-left">${left}</span>` +
    `<span class="id-state">${TM.state}</span>` +
    `<span class="id-head">${headSym}</span>` +
    `<span class="id-right">${right}</span>`;
}

// ============================================================
// RESULT BANNER
// ============================================================
function showResult(result) {
  const banner = document.getElementById('result-banner');
  const icon = document.getElementById('result-icon');
  const text = document.getElementById('result-text');

  banner.style.display = 'flex';
  banner.className = 'result-banner ' + result;

  if (result === 'accepted') {
    icon.textContent = '✓';
    text.textContent = '✔ INPUT ACCEPTED';
  } else {
    icon.textContent = '✗';
    text.textContent = '✖ INPUT REJECTED';
  }
}
function hideResult() {
  document.getElementById('result-banner').style.display = 'none';
}

// ============================================================
// STATUS BADGE
// ============================================================
function updateStatusBadge(status) {
  const badge = document.getElementById('status-badge');
  badge.className = 'badge badge-live';

  if (status === 'running') {
    badge.textContent = '● RUNNING';
    badge.classList.add('running');
  } else if (status === 'accepted') {
    badge.textContent = '● ACCEPTED';
    badge.classList.add('accepted');
  } else if (status === 'rejected') {
    badge.textContent = '● REJECTED';
    badge.classList.add('rejected');
  } else {
    badge.textContent = '● IDLE';
  }
}

// ============================================================
// TRANSITION TABLE
// ============================================================
function buildTransitionTable() {
  const tbody = document.getElementById('transition-body');
  tbody.innerHTML = '';
  TM.transitions.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.id = 'trow-' + i;
    tr.innerHTML =
      `<td class="td-state">${t.from}</td>` +
      `<td>${t.read}</td>` +
      `<td class="td-write">${t.write}</td>` +
      `<td class="td-dir">${t.move}</td>` +
      `<td class="td-next">${t.to}</td>`;
    tbody.appendChild(tr);
  });
}

function highlightTableRow(idx) {
  clearActiveTableRow();
  const row = document.getElementById('trow-' + idx);
  if (row) {
    row.classList.add('active-row');
    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
function clearActiveTableRow() {
  document.querySelectorAll('.transition-table tr.active-row')
    .forEach(r => r.classList.remove('active-row'));
}

// ============================================================
// STATE DIAGRAM (Canvas)
// ============================================================
function drawStateDiagram() {
  const canvas = document.getElementById('state-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const preset = PRESETS[TM.activePresetKey];

  // Collect unique states in order of appearance
  const stateOrder = [];
  const seen = new Set();
  for (const t of TM.transitions) {
    if (!seen.has(t.from)) { stateOrder.push(t.from); seen.add(t.from); }
    if (!seen.has(t.to))   { stateOrder.push(t.to);   seen.add(t.to); }
  }
  // Add accept/reject last
  for (const s of [TM.acceptState, TM.rejectState]) {
    if (!seen.has(s)) { stateOrder.push(s); seen.add(s); }
  }

  const N = stateOrder.length;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.35;
  const nodeR = 28;

  // Assign positions in circle
  const pos = {};
  stateOrder.forEach((s, i) => {
    const angle = (2 * Math.PI * i / N) - Math.PI / 2;
    pos[s] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  // Group transitions by (from,to) pair
  const edgeMap = {};
  TM.transitions.forEach(t => {
    const key = t.from + '→' + t.to;
    if (!edgeMap[key]) edgeMap[key] = [];
    edgeMap[key].push(t);
  });

  // Draw edges
  ctx.save();
  for (const [key, ts] of Object.entries(edgeMap)) {
    const [fromS, toS] = key.split('→');
    const p1 = pos[fromS], p2 = pos[toS];
    if (!p1 || !p2) continue;

    const labelStr = ts.map(t => `${t.read}/${t.write},${t.move}`).join('\n');
    const isSelf = fromS === toS;
    const isActive = TM.state === toS && !TM.halted;

    const edgeColor = isActive
      ? 'rgba(0, 229, 200, 0.9)'
      : 'rgba(99, 140, 255, 0.5)';

    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.fillStyle = edgeColor;
    ctx.font = '9px JetBrains Mono, monospace';

    if (isSelf) {
      // Self-loop arc
      drawSelfLoop(ctx, p1, nodeR, labelStr, edgeColor);
    } else {
      drawArrow(ctx, p1, p2, nodeR, labelStr, edgeColor);
    }
  }
  ctx.restore();

  // Draw nodes
  stateOrder.forEach(s => {
    const p = pos[s];
    const isCurrentState = s === TM.state;
    const isAccept = s === TM.acceptState;
    const isReject = s === TM.rejectState;
    const isInitial = s === TM.initialState;

    // Glow for current state
    if (isCurrentState) {
      ctx.save();
      ctx.shadowColor = isAccept ? '#3dffa0' : isReject ? '#ff5c7d' : '#638cff';
      ctx.shadowBlur = 20;
    }

    // Double circle for accept state
    if (isAccept) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeR + 5, 0, Math.PI * 2);
      ctx.strokeStyle = TM.result === 'accepted' ? '#3dffa0' : 'rgba(61,255,160,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Node fill
    const gradient = ctx.createRadialGradient(p.x - 4, p.y - 4, 2, p.x, p.y, nodeR);
    if (isCurrentState) {
      if (isAccept) {
        gradient.addColorStop(0, 'rgba(61,255,160,0.6)');
        gradient.addColorStop(1, 'rgba(61,255,160,0.15)');
      } else if (isReject) {
        gradient.addColorStop(0, 'rgba(255,92,125,0.6)');
        gradient.addColorStop(1, 'rgba(255,92,125,0.15)');
      } else {
        gradient.addColorStop(0, 'rgba(99,140,255,0.6)');
        gradient.addColorStop(1, 'rgba(99,140,255,0.15)');
      }
    } else {
      gradient.addColorStop(0, 'rgba(20, 30, 60, 0.95)');
      gradient.addColorStop(1, 'rgba(10, 18, 40, 0.95)');
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
    ctx.strokeStyle = isCurrentState
      ? (isAccept ? '#3dffa0' : isReject ? '#ff5c7d' : '#638cff')
      : 'rgba(99,140,255,0.35)';
    ctx.lineWidth = isCurrentState ? 2.5 : 1.5;
    ctx.stroke();

    if (isCurrentState) ctx.restore();

    // Initial state arrow
    if (isInitial) {
      ctx.beginPath();
      ctx.moveTo(p.x - nodeR - 24, p.y);
      ctx.lineTo(p.x - nodeR - 2, p.y);
      ctx.strokeStyle = 'rgba(99,140,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawArrowHead(ctx, p.x - nodeR - 2, p.y, 0, 'rgba(99,140,255,0.7)');
    }

    // Label
    ctx.fillStyle = isCurrentState
      ? (isAccept ? '#3dffa0' : isReject ? '#ff5c7d' : '#e8eeff')
      : 'rgba(230,235,255,0.75)';
    ctx.font = `${isCurrentState ? 'bold' : ''} 11px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, p.x, p.y);
  });
}

function drawArrow(ctx, p1, p2, nodeR, label, color) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist, ny = dy / dist;

  const startX = p1.x + nx * nodeR;
  const startY = p1.y + ny * nodeR;
  const endX   = p2.x - nx * (nodeR + 6);
  const endY   = p2.y - ny * (nodeR + 6);

  // Slight curve
  const midX = (startX + endX) / 2 - ny * 20;
  const midY = (startY + endY) / 2 + nx * 20;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(endY - midY, endX - midX);
  drawArrowHead(ctx, endX, endY, angle, color);

  // Label
  const lx = midX;
  const ly = midY;
  ctx.fillStyle = 'rgba(255,184,77,0.9)';
  ctx.font = '8.5px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = label.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, lx, ly + (i - (lines.length - 1) / 2) * 11);
  });
}

function drawSelfLoop(ctx, p, nodeR, label, color) {
  const cx = p.x;
  const cy = p.y - nodeR - 20;
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 1.8);
  ctx.stroke();

  // Label
  ctx.fillStyle = 'rgba(255,184,77,0.9)';
  ctx.font = '8.5px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = label.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, cy - 22 + (i * 10));
  });
}

function drawArrowHead(ctx, x, y, angle, color) {
  const size = 7;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size, size / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadPreset('palindrome');

  // Allow tape input enter key to reset
  document.getElementById('tape-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') resetMachine();
  });

  // Canvas resize observer
  const resizeCanvas = () => {
    const container = document.querySelector('.diagram-container');
    if (!container) return;
    const w = container.clientWidth;
    const canvas = document.getElementById('state-canvas');
    canvas.width = w;
    drawStateDiagram();
  };
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);
});
