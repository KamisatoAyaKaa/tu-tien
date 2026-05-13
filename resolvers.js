import { LINH_CAN, KHI_VAN, FACTIONS } from "./data.js";

export function factionToKey(f) {
  if (f === FACTIONS.CHINH) return "CHINH";
  if (f === FACTIONS.MA) return "MA";
  return "NONE";
}

export function keyToFaction(key) {
  if (key === "CHINH") return FACTIONS.CHINH;
  if (key === "MA") return FACTIONS.MA;
  return FACTIONS.NONE;
}

export function resolveLcByName(name) {
  return LINH_CAN.find((l) => l.name === name) || {};
}

export function resolveKvByName(name) {
  const found = KHI_VAN.find((k) => k.name === name);
  if (found) return found;
  if (name) return KHI_VAN.find((k) => k.name === "Bình Phàm") || KHI_VAN[0];
  return {};
}
