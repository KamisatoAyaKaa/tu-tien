import {
  rollFate,
  godMode,
  startGame,
  train,
  explore,
  handleBreakthrough,
  selectFactionByButton
} from "./actions.js";
import {
  saveGameToStorage,
  loadGameFromStorage,
  deleteSaveConfirm,
  refreshSaveHint
} from "./save.js";
import { updatePlayerBanner, updateInitUI } from "./ui.js";

window.rollFate = rollFate;
window.godMode = godMode;
window.startGame = startGame;
window.train = train;
window.explore = explore;
window.handleBreakthrough = handleBreakthrough;
window.selectFactionByButton = selectFactionByButton;
window.saveGameToStorage = saveGameToStorage;
window.loadGameFromStorage = loadGameFromStorage;
window.deleteSaveConfirm = deleteSaveConfirm;

["pc-name", "pc-gender", "pc-dao-hieu", "pc-origin"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", updatePlayerBanner);
  if (el && el.tagName === "SELECT") el.addEventListener("change", updatePlayerBanner);
});

updatePlayerBanner();
updateInitUI();
refreshSaveHint();
