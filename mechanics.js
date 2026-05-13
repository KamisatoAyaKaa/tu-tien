import { p } from "./state.js";
import {
  STAGES,
  BREAK_MANA_PER_LEVEL_MUL,
  BREAK_MAJOR_CUR_MUL,
  BREAK_MAJOR_NEXT_FRAC,
  BREAK_ASCENSION_MUL,
  REALM_TRAIN_AGE_PER_STAGE,
  REALM_TRAIN_AGE_PER_LEVEL
} from "./data.js";

export function getBreakthroughManaTarget() {
  const cur = STAGES[p.stage];
  if (p.level < 10) {
    return Math.max(1, Math.floor(cur.mana * Math.pow(BREAK_MANA_PER_LEVEL_MUL, p.level - 1)));
  }
  if (p.stage >= STAGES.length - 1) {
    return Math.max(1, Math.floor(cur.mana * BREAK_ASCENSION_MUL));
  }
  const next = STAGES[p.stage + 1];
  return Math.max(
    Math.floor(cur.mana * BREAK_MAJOR_CUR_MUL),
    Math.floor(next.mana * BREAK_MAJOR_NEXT_FRAC)
  );
}

export function getRealmTrainDifficulty() {
  return 1 + p.stage * REALM_TRAIN_AGE_PER_STAGE + Math.max(0, p.level - 1) * REALM_TRAIN_AGE_PER_LEVEL;
}

export function getKvBreakChanceDelta(isMajor) {
  const kv = p.kv || {};
  if (isMajor) return kv.breakMajorMod ?? 0;
  return kv.breakMinorMod ?? 0;
}

export function getKvExploreGoodBonus() {
  return (p.kv && p.kv.exploreGoodBonus) || 0;
}
