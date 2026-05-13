import { p } from "./state.js";
import {
  CHARGE_REFILL_MS,
  MAX_TRAIN_CHARGES,
  MAX_EXPLORE_CHARGES
} from "./data.js";

export function refillTrainCharges() {
  if (p.trainCharges >= MAX_TRAIN_CHARGES) return;
  const now = Date.now();
  const elapsed = now - p.trainRefillAnchor;
  const gained = Math.floor(elapsed / CHARGE_REFILL_MS);
  if (gained <= 0) return;
  const room = MAX_TRAIN_CHARGES - p.trainCharges;
  const add = Math.min(gained, room);
  p.trainCharges += add;
  p.trainRefillAnchor += add * CHARGE_REFILL_MS;
  if (p.trainCharges >= MAX_TRAIN_CHARGES) {
    p.trainCharges = MAX_TRAIN_CHARGES;
    p.trainRefillAnchor = now;
  }
}

export function refillExploreCharges() {
  if (p.exploreCharges >= MAX_EXPLORE_CHARGES) return;
  const now = Date.now();
  const elapsed = now - p.exploreRefillAnchor;
  const gained = Math.floor(elapsed / CHARGE_REFILL_MS);
  if (gained <= 0) return;
  const room = MAX_EXPLORE_CHARGES - p.exploreCharges;
  const add = Math.min(gained, room);
  p.exploreCharges += add;
  p.exploreRefillAnchor += add * CHARGE_REFILL_MS;
  if (p.exploreCharges >= MAX_EXPLORE_CHARGES) {
    p.exploreCharges = MAX_EXPLORE_CHARGES;
    p.exploreRefillAnchor = now;
  }
}

export function refillActionCharges() {
  refillTrainCharges();
  refillExploreCharges();
}

export function spendTrainCharge() {
  refillTrainCharges();
  if (p.trainCharges <= 0) return false;
  const wasFull = p.trainCharges >= MAX_TRAIN_CHARGES;
  p.trainCharges--;
  if (wasFull && p.trainCharges < MAX_TRAIN_CHARGES) p.trainRefillAnchor = Date.now();
  return true;
}

export function spendExploreCharge() {
  refillExploreCharges();
  if (p.exploreCharges <= 0) return false;
  const wasFull = p.exploreCharges >= MAX_EXPLORE_CHARGES;
  p.exploreCharges--;
  if (wasFull && p.exploreCharges < MAX_EXPLORE_CHARGES) p.exploreRefillAnchor = Date.now();
  return true;
}

export function initActionChargesFull() {
  p.trainCharges = MAX_TRAIN_CHARGES;
  p.exploreCharges = MAX_EXPLORE_CHARGES;
  p.trainRefillAnchor = Date.now();
  p.exploreRefillAnchor = Date.now();
}

export function ensureActionChargesDefaults() {
  if (typeof p.trainCharges !== "number" || p.trainCharges < 0) p.trainCharges = MAX_TRAIN_CHARGES;
  if (typeof p.exploreCharges !== "number" || p.exploreCharges < 0) p.exploreCharges = MAX_EXPLORE_CHARGES;
  if (typeof p.trainRefillAnchor !== "number") p.trainRefillAnchor = Date.now();
  if (typeof p.exploreRefillAnchor !== "number") p.exploreRefillAnchor = Date.now();
  p.trainCharges = Math.min(MAX_TRAIN_CHARGES, p.trainCharges);
  p.exploreCharges = Math.min(MAX_EXPLORE_CHARGES, p.exploreCharges);
}

export function msUntilNextTrainCharge() {
  refillTrainCharges();
  if (p.trainCharges >= MAX_TRAIN_CHARGES) return null;
  return Math.max(0, p.trainRefillAnchor + CHARGE_REFILL_MS - Date.now());
}

export function msUntilNextExploreCharge() {
  refillExploreCharges();
  if (p.exploreCharges >= MAX_EXPLORE_CHARGES) return null;
  return Math.max(0, p.exploreRefillAnchor + CHARGE_REFILL_MS - Date.now());
}

export function formatCountdownMs(ms) {
  if (ms == null) return "";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

let chargeTickTimer = null;

export function stopChargeTick() {
  if (chargeTickTimer) {
    clearInterval(chargeTickTimer);
    chargeTickTimer = null;
  }
}

export function startChargeTickIfPlaying() {
  if (chargeTickTimer) clearInterval(chargeTickTimer);
  chargeTickTimer = setInterval(() => {
    if (document.getElementById("play-screen").style.display === "none") return;
    updateChargeDisplay();
  }, 1000);
}

export function updateChargeDisplay() {
  refillActionCharges();
  const trainBtn = document.getElementById("btn-train");
  const exploreBtn = document.getElementById("btn-explore");
  const line = document.getElementById("charge-summary-line");
  if (!trainBtn || !exploreBtn) return;

  const tNext = msUntilNextTrainCharge();
  const eNext = msUntilNextExploreCharge();
  const tHint = p.trainCharges >= MAX_TRAIN_CHARGES ? "đầy" : `tiếp: ${formatCountdownMs(tNext)}`;
  const eHint = p.exploreCharges >= MAX_EXPLORE_CHARGES ? "đầy" : `tiếp: ${formatCountdownMs(eNext)}`;

  trainBtn.disabled = p.trainCharges <= 0 || p.isDead;
  exploreBtn.disabled = p.exploreCharges <= 0 || p.isDead;
  trainBtn.style.opacity = trainBtn.disabled ? "0.45" : "1";
  exploreBtn.style.opacity = exploreBtn.disabled ? "0.45" : "1";

  trainBtn.textContent = `Tu Luyện (${p.trainCharges}/${MAX_TRAIN_CHARGES})`;
  exploreBtn.textContent = `Tìm Kỳ Ngộ (${p.exploreCharges}/${MAX_EXPLORE_CHARGES})`;

  if (line) {
    line.textContent = `Tu: ${p.trainCharges}/${MAX_TRAIN_CHARGES} (${tHint}) · Kỳ ngộ: ${p.exploreCharges}/${MAX_EXPLORE_CHARGES} (${eHint})`;
  }
}
