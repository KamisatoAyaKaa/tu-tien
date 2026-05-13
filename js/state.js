import {
  FACTIONS,
  MAX_TRAIN_CHARGES,
  MAX_EXPLORE_CHARGES
} from "./data.js";

export function createInitialP() {
  return {
    stage: 0,
    level: 1,
    mana: 0,
    age: 18,
    maxAge: 0,
    wisdom: 0,
    lc: {},
    kv: {},
    faction: FACTIONS.NONE,
    factionProbation: 0,
    pendingFactionChoice: false,
    isDead: false,
    pcName: "",
    pcGender: "",
    pcDaoHieu: "",
    pcOrigin: "dan",
    trainCharges: MAX_TRAIN_CHARGES,
    exploreCharges: MAX_EXPLORE_CHARGES,
    trainRefillAnchor: Date.now(),
    exploreRefillAnchor: Date.now()
  };
}

export let p = createInitialP();

export let rollCount = 0;
export const MAX_ROLLS = 5;

// Hàm để tăng số lần roll (vì biến export let không thể gán trực tiếp từ file khác)
export function incrementRollCount() {
    rollCount++;
}
