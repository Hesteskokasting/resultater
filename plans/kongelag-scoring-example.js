import { S, SC, saveState } from './kongelag-state.js';
import { toast } from './kongelag-utils.js';

// ═══ RING RULES ═══
function getRingOptions(score) {
  if (score < 5)   return { allowed: [0],       auto: 0 };
  if (score <= 9)  return { allowed: [0, 1],    auto: null };
  if (score <= 12) return { allowed: [0, 1, 2], auto: null };
  if (score <= 14) return { allowed: [1, 2],    auto: null };
  if (score <= 16) return { allowed: [2, 3],    auto: null };
  if (score <= 19) return { allowed: [3],       auto: 3 };
  return           { allowed: [4],              auto: 4 };
}

function applyRingRules(score) {
  const { allowed, auto } = getRingOptions(score);
  document.querySelectorAll('.r-btn').forEach(b => {
    b.disabled = !allowed.includes(parseInt(b.dataset.v));
  });
  if (auto !== null) {
    selRings(auto);
  } else if (SC.rings !== null && allowed.includes(SC.rings)) {
    selRings(SC.rings);
  } else {
    SC.rings = null;
    document.getElementById('regBtn').disabled = true;
  }
}

// ═══ SCORING POPUP ═══
function openPop(lane, pid) {
  const p = S.participants.find(x => x.id === pid);
  const already = S.scores.find(s => s.pid === pid && s.round === S.round && s.heat === S.heat);
  if (already) { toast(`${p.name} er allerede ført — trykk ✏ for å redigere`); return; }

  SC.lane = lane; SC.pid = pid; SC.score = ''; SC.rings = null; SC.editId = null;
  SC.origScore = null; SC.origRings = null; SC.pendingReplace = false; SC.fromTov = false;
  document.getElementById('pop-lane').textContent = `Bane ${lane} · Runde ${S.round}`;
  document.getElementById('pop-name').textContent = p.name;
  document.getElementById('pop-edit-badge').style.display = 'none';
  document.getElementById('regBtn').textContent = 'Registrer og fullfør ✓';
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('btn-back-score').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
  updateScoreDisp();
  document.getElementById('pop').classList.add('open');
}

function editPop(lane, pid, round, heat, fromTov) {
  round = (round !== undefined) ? round : S.round;
  heat  = (heat  !== undefined) ? heat  : S.heat;
  const p = S.participants.find(x => x.id === pid);
  const existing = S.scores.find(s => s.pid === pid && s.round === round && s.heat === heat);
  if (!existing) { openPop(lane, pid); return; }

  SC.lane = lane; SC.pid = pid; SC.editId = existing.id; SC.fromTov = !!fromTov;
  SC.score = existing.score > 0 ? String(existing.score) : '';
  SC.rings = existing.rings;
  SC.origScore = existing.score; SC.origRings = existing.rings; SC.pendingReplace = true;

  document.getElementById('pop-lane').textContent = `Bane ${lane} · Runde ${round}`;
  document.getElementById('pop-name').textContent = p.name;
  document.getElementById('pop-edit-badge').style.display = '';
  document.getElementById('regBtn').textContent = 'Lagre endringer ✓';
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('btn-back-score').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
  updateScoreDisp();
  document.getElementById('pop').classList.add('open');
}

function closePop() { document.getElementById('pop').classList.remove('open'); }
function handleOverlayClick(e) { if (e.target.id === 'pop') closePop(); }

function np(d) {
  if (SC.pendingReplace) { SC.score = ''; SC.pendingReplace = false; }
  if (SC.score.length >= 4) return;
  const next = SC.score + d;
  if (parseInt(next) > 20) return;
  SC.score = next;
  updateScoreDisp();
}
function npDel() {
  if (SC.pendingReplace) { SC.pendingReplace = false; SC.score = ''; }
  else { SC.score = SC.score.slice(0,-1); }
  updateScoreDisp();
}
function updateScoreDisp() {
  const el = document.getElementById('score-disp');
  const fromEl = document.getElementById('score-from');
  el.textContent = SC.score || '0';
  el.className = 'score-num' + (!SC.score ? ' ph' : '');
  if (SC.editId && SC.origScore !== null) {
    const cur = parseInt(SC.score || '0');
    fromEl.style.display = '';
    fromEl.textContent = (SC.pendingReplace || cur === SC.origScore)
      ? `var: ${SC.origScore}`
      : `${SC.origScore} → ${cur}`;
  } else {
    fromEl.style.display = 'none';
  }
}

function goRings() {
  document.getElementById('st-score').style.display = 'none';
  document.getElementById('st-rings').style.display = '';
  document.getElementById('btn-back-score').style.display = '';
  document.getElementById('step1').className = 'step done';
  document.getElementById('step2').className = 'step active';
  const newScore = parseInt(SC.score || '0');
  document.getElementById('score-confirm').textContent = newScore;
  const fromConfirm = document.getElementById('score-from-confirm');
  if (SC.editId && SC.origScore !== null && newScore !== SC.origScore) {
    fromConfirm.textContent = `${SC.origScore} → ${newScore}`;
    fromConfirm.style.display = '';
  } else {
    fromConfirm.style.display = 'none';
  }
  const ringsFrom = document.getElementById('rings-from');
  if (SC.editId && SC.origRings !== null) {
    ringsFrom.textContent = `var: ${SC.origRings} ringer`;
    ringsFrom.style.display = '';
  } else {
    ringsFrom.style.display = 'none';
  }
  document.querySelectorAll('.r-btn').forEach(b => b.classList.remove('sel'));
  document.getElementById('regBtn').disabled = true;
  applyRingRules(newScore);
}
function backScore() {
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('btn-back-score').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
}

function selRings(v) {
  SC.rings = v;
  document.querySelectorAll('.r-btn').forEach(b => {
    b.classList.toggle('sel', parseInt(b.dataset.v) === v);
  });
  const ringsFrom = document.getElementById('rings-from');
  if (SC.editId && SC.origRings !== null) {
    ringsFrom.textContent = v !== SC.origRings
      ? `${SC.origRings} → ${v} ringer`
      : `var: ${SC.origRings} ringer (uendret)`;
    ringsFrom.style.display = '';
  }
  document.getElementById('regBtn').disabled = false;
}

function registerScore() {
  if (SC.rings === null) return;
  const score = Math.min(20, parseInt(SC.score || '0'));
  const p = S.participants.find(x => x.id === SC.pid);
  if (SC.editId) {
    const idx = S.scores.findIndex(s => s.id === SC.editId);
    if (idx !== -1) S.scores[idx] = { ...S.scores[idx], score, rings: SC.rings };
    saveState(); closePop();
    const scorePart = score !== SC.origScore ? `${SC.origScore}→${score} poeng` : `${score} poeng`;
    const ringsPart = SC.rings !== SC.origRings ? `${SC.origRings}→${SC.rings} ringer` : `${SC.rings} ringer`;
    toast(`${p.name}: ${scorePart}, ${ringsPart} ✏`);
  } else {
    S.scores.push({ id: 'sc' + Date.now(), pid: SC.pid, lane: SC.lane, heat: S.heat, round: S.round, score, rings: SC.rings });
    saveState(); closePop();
    toast(`${p.name}: ${score} poeng, ${SC.rings} ringer ✓`);
  }
  document.dispatchEvent(new CustomEvent('score-registered', { detail: { fromTov: SC.fromTov } }));
}

export { getRingOptions, openPop, editPop, closePop, handleOverlayClick,
         np, npDel, goRings, backScore, selRings, registerScore };