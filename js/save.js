import { p } from "./state.js";
import { SAVE_KEY } from "./data.js";
import {
  factionToKey,
  keyToFaction,
  resolveLcByName,
  resolveKvByName
} from "./resolvers.js";
import {
  refillActionCharges,
  ensureActionChargesDefaults,
  startChargeTickIfPlaying,
  stopChargeTick
} from "./charges.js";
import {
  updateUI,
  writeLog,
  updatePlayerBanner,
  updateInitUI,
  hideFactionChoiceModal
} from "./ui.js";
import { syncFormFromPlayer } from "./character.js";

export function buildSavePayload() {
  const inGame = document.getElementById("play-screen").style.display !== "none";
  if (inGame) refillActionCharges();
  if (!inGame) {
    p.pcName = (document.getElementById("pc-name").value || "").trim();
    p.pcGender = (document.getElementById("pc-gender").value || "").trim();
    p.pcDaoHieu = (document.getElementById("pc-dao-hieu").value || "").trim();
    p.pcOrigin = document.getElementById("pc-origin").value || "dan";
  }
  return {
    v: 1,
    savedAt: Date.now(),
    mode: inGame ? "play" : "setup",
    p: {
      stage: p.stage,
      level: p.level,
      mana: p.mana,
      age: p.age,
      maxAge: p.maxAge,
      wisdom: p.wisdom,
      lcName: p.lc?.name || "",
      kvName: p.kv?.name || "",
      factionKey: factionToKey(p.faction),
      factionProbation: p.factionProbation,
      pendingFactionChoice: p.pendingFactionChoice,
      isDead: p.isDead,
      pcName: p.pcName,
      pcGender: p.pcGender,
      pcDaoHieu: p.pcDaoHieu,
      pcOrigin: p.pcOrigin,
      trainCharges: p.trainCharges,
      exploreCharges: p.exploreCharges,
      trainRefillAnchor: p.trainRefillAnchor,
      exploreRefillAnchor: p.exploreRefillAnchor
    },
    logHtml: inGame ? document.getElementById("log").innerHTML : "",
    form: {
      pcName: document.getElementById("pc-name").value,
      pcGender: document.getElementById("pc-gender").value,
      pcDaoHieu: document.getElementById("pc-dao-hieu").value,
      pcOrigin: document.getElementById("pc-origin").value
    }
  };
}

export function applyPlayerFromSave(sp) {
  p.stage = sp.stage ?? 0;
  p.level = sp.level ?? 1;
  p.mana = sp.mana ?? 0;
  p.age = sp.age ?? 18;
  p.maxAge = sp.maxAge ?? 0;
  p.wisdom = sp.wisdom ?? 0;
  p.lc = resolveLcByName(sp.lcName) || {};
  p.kv = resolveKvByName(sp.kvName) || {};
  p.faction = keyToFaction(sp.factionKey);
  p.factionProbation = sp.factionProbation ?? 0;
  p.pendingFactionChoice = !!sp.pendingFactionChoice;
  p.isDead = !!sp.isDead;
  p.pcName = sp.pcName || "";
  p.pcGender = sp.pcGender || "";
  p.pcDaoHieu = sp.pcDaoHieu || "";
  p.pcOrigin = sp.pcOrigin || "dan";
  p.trainCharges = sp.trainCharges;
  p.exploreCharges = sp.exploreCharges;
  p.trainRefillAnchor = sp.trainRefillAnchor;
  p.exploreRefillAnchor = sp.exploreRefillAnchor;
  ensureActionChargesDefaults();
}

export function saveGameToStorage(silent) {
  try {
    const payload = buildSavePayload();
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    refreshSaveHint();
    if (!silent) alert("Đã lưu tiến trình vào trình duyệt (localStorage).");
  } catch (e) {
    if (!silent) alert("Không lưu được: " + (e.message || e));
  }
}

export function loadGameFromStorage() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    alert("Chưa có dữ liệu lưu.");
    return;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    alert("File lưu bị hỏng.");
    return;
  }
  if (!data || data.v !== 1 || !data.p) {
    alert("Bản lưu không tương thích.");
    return;
  }

  applyPlayerFromSave(data.p);

  if (data.form) {
    document.getElementById("pc-name").value = data.form.pcName || p.pcName || "";
    document.getElementById("pc-gender").value = data.form.pcGender || p.pcGender || "Nam";
    document.getElementById("pc-dao-hieu").value = data.form.pcDaoHieu ?? p.pcDaoHieu ?? "";
    document.getElementById("pc-origin").value = data.form.pcOrigin || p.pcOrigin || "dan";
  } else {
    syncFormFromPlayer();
  }

  hideFactionChoiceModal();

  if (data.mode === "play") {
    document.getElementById("setup-screen").style.display = "none";
    document.getElementById("play-screen").style.display = "block";
    document.getElementById("log").innerHTML = data.logHtml || "";
    document.getElementById("lc-txt").innerText = p.lc.name || "--";
    document.getElementById("lc-txt").style.color = p.lc.color || "#cdcdcd";
    document.getElementById("wisdom-txt").innerText = p.wisdom;
    document.getElementById("kv-txt").innerText = `${p.kv.name || "?"} | ${p.faction.name}`;
    updatePlayerBanner();
    if (p.pendingFactionChoice) {
      document.getElementById("faction-modal").classList.add("show");
    }
    updateUI();
    writeLog("📜 <b>Đã tải lưu trữ.</b> Tiếp tục hành trình.", "highlight");
    startChargeTickIfPlaying();
  } else {
    document.getElementById("setup-screen").style.display = "block";
    document.getElementById("play-screen").style.display = "none";
    document.getElementById("log").innerHTML = "";
    updateInitUI();
    updatePlayerBanner();
    const hasTraits = !!(p.lc?.name && p.kv?.name);
    document.getElementById("start-btn").style.display = hasTraits ? "block" : "none";
    if (p.pendingFactionChoice) p.pendingFactionChoice = false;
    stopChargeTick();
  }

  refreshSaveHint();
}

export function deleteSaveConfirm() {
  if (!localStorage.getItem(SAVE_KEY)) {
    alert("Không có lưu trữ để xóa.");
    return;
  }
  if (!confirm("Xóa hẳn lưu trữ trên trình duyệt? Không thể hoàn tác.")) return;
  localStorage.removeItem(SAVE_KEY);
  refreshSaveHint();
  alert("Đã xóa lưu trữ.");
}

export function refreshSaveHint() {
  const hint = document.getElementById("save-hint");
  const btn = document.getElementById("btn-continue");
  const raw = localStorage.getItem(SAVE_KEY);
  if (!hint || !btn) return;
  if (!raw) {
    hint.textContent = "";
    btn.style.display = "none";
    return;
  }
  try {
    const d = JSON.parse(raw);
    const t = d.savedAt ? new Date(d.savedAt).toLocaleString("vi-VN") : "";
    const modeLabel = d.mode === "play" ? "đang chơi" : "màn khởi tạo";
    hint.textContent = `Có lưu trữ (${modeLabel})${t ? " · " + t : ""}`;
    btn.style.display = "block";
    const name = (d.p && d.p.pcName) || (d.form && d.form.pcName) || "";
    btn.textContent = name ? `Tiếp tục — ${name}` : "Tiếp tục";
  } catch {
    hint.textContent = "Có dữ liệu lưu nhưng không đọc được.";
    btn.style.display = "block";
  }
}

export function maybeAutoSave() {
  if (document.getElementById("play-screen").style.display === "none") return;
  saveGameToStorage(true);
}
