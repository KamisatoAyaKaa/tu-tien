import { 
  p,
  rollCount, 
  MAX_ROLLS, 
  incrementRollCount 
} from "./state.js";
import {
  LINH_CAN,
  KHI_VAN,
  FACTIONS,
  STAGES,
  ORIGIN_LABELS,
  REALM_TRAIN_GAIN_DIV_STAGE
} from "./data.js";
import {
  getRealmTrainDifficulty,
  getBreakthroughManaTarget,
  getKvBreakChanceDelta,
  getKvExploreGoodBonus
} from "./mechanics.js";
import {
  spendTrainCharge,
  spendExploreCharge,
  updateChargeDisplay,
  initActionChargesFull,
  startChargeTickIfPlaying
} from "./charges.js";
import {
  writeLog,
  updateUI,
  updateInitUI,
  updatePlayerBanner,
  getPlayerDisplayTitle,
  showFactionChoiceModal,
  hideFactionChoiceModal
} from "./ui.js";
import { readCharacterFromForm } from "./character.js";
import { maybeAutoSave } from "./save.js";

export function rollFate() {
  // 1. Kiểm tra giới hạn
  if (rollCount >= MAX_ROLLS) {
      alert("Thiên cơ đã tận! Ngươi không thể gieo quẻ thêm nữa.");
      return;
  }

  // 2. Logic gieo quẻ ngẫu nhiên
  p.lc = LINH_CAN[Math.floor(Math.random() * (LINH_CAN.length - 1))];
  p.kv = KHI_VAN[Math.floor(Math.random() * (KHI_VAN.length - 1))]; 
  p.wisdom = Math.floor(Math.random() * 60) + 20;
  
  // 3. Tăng biến đếm và cập nhật UI
  incrementRollCount();
  updateInitUI();
  
  writeLog(`Gieo quẻ lần thứ ${rollCount}. (Còn lại ${MAX_ROLLS - rollCount} lần)`);
}

export function godMode() {
  p.lc = LINH_CAN.find((l) => l.name === "Thiên linh căn");
  p.kv = KHI_VAN.find((k) => k.name === "Khí vận chi tử");
  p.wisdom = 100;
  p.faction = FACTIONS.NONE;
  p.factionProbation = 0;
  updateInitUI();
  updatePlayerBanner();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("trait-display").style.border = "2px solid #ff00ff";
  document.getElementById("start-btn").style.display = "block";
}

export function startGame() {
  if (!readCharacterFromForm()) return;
  if (!p.lc?.name || !p.kv?.name) {
    alert("Hãy Gieo Quẻ trước đã!");
    return;
  }
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("play-screen").style.display = "block";
  initActionChargesFull();
  p.maxAge = STAGES[0].age;
  if (p.pcOrigin === "vo") p.maxAge += 15;
  if (p.pcOrigin === "thu") p.wisdom += 2;
  document.getElementById("lc-txt").innerText = p.lc.name;
  document.getElementById("lc-txt").style.color = p.lc.color;
  document.getElementById("wisdom-txt").innerText = p.wisdom;
  document.getElementById("kv-txt").innerText = `${p.kv.name} | ${p.faction.name}`;
  updatePlayerBanner();
  const title = getPlayerDisplayTitle();
  writeLog(
    `Hành trình mở ra. <b>${title}</b> (${ORIGIN_LABELS[p.pcOrigin] || ""}), ${p.pcGender}, là một ${p.faction.name} mang ${p.lc.name}...`
  );
  updateUI();
  startChargeTickIfPlaying();
  maybeAutoSave();
}

export function train() {
  if (p.isDead) return;
  if (!spendTrainCharge()) {
    writeLog("Lượt <b>Tu Luyện</b> đã cạn. Mỗi <b>2 phút</b> (thời gian thực) hồi thêm 1 lượt.", "highlight");
    updateChargeDisplay();
    return;
  }
  const cur = STAGES[p.stage];
  const realmDif = getRealmTrainDifficulty();
  const gainRealmDiv = 1 + p.stage * REALM_TRAIN_GAIN_DIV_STAGE;
  const baseAgeCost = 0.5;
  let actualAgeCost = parseFloat(((baseAgeCost * realmDif) / (p.wisdom / 50)).toFixed(2));
  actualAgeCost = Math.max(0.1, Math.min(12, actualAgeCost));
  let gain =
    ((Math.random() * 5 + 5) / gainRealmDiv) *
    p.lc.multi *
    cur.speed *
    p.faction.trainMod;
  if (Math.random() < (p.wisdom / 800)) {
    gain *= 15;
    writeLog(`✨ <b>NGỘ ĐẠO!</b> Linh lực +${Math.floor(gain).toLocaleString()} (Tốn ${actualAgeCost} năm)`, "wisdom");
  } else {
    writeLog(`Tu luyện, linh lực +${Math.floor(gain).toLocaleString()} (Tốn ${actualAgeCost} năm)`);
  }
  p.mana += gain;
  p.age += actualAgeCost;
  updateUI();
  maybeAutoSave();
}

export function explore() {
  if (p.isDead) return;
  if (p.pendingFactionChoice) {
    writeLog("Hãy chọn phe từ kì ngộ trước khi tiếp tục lịch lãm.", "highlight");
    return;
  }
  if (!spendExploreCharge()) {
    writeLog("Lượt <b>Tìm Kỳ Ngộ</b> đã cạn. Mỗi <b>2 phút</b> (thời gian thực) hồi thêm 1 lượt.", "highlight");
    updateChargeDisplay();
    return;
  }
  const percentLost = Math.random() * (0.05 - 0.01) + 0.01;
  let ageLost = p.maxAge * percentLost;
  p.age += ageLost;
  const npcRoll = Math.random();
  const earlyGame = p.stage === 0 && p.level <= 4;
  const joinChance = earlyGame ? 0.35 : 0.12;
  if (p.faction === FACTIONS.NONE && Math.random() < joinChance) {
    handleFactionEvents({ forceJoin: true });
  } else if (npcRoll > 0.85) {
    handleFactionEvents();
  } else if (npcRoll > 0.6) {
    handleNPC(STAGES[p.stage].mana, p.lc.multi / 5);
  } else {
    writeLog(`Lịch lãm ${ageLost.toFixed(1)} năm, chỉ thấy gió bụi mịt mù.`);
  }
  updateUI();
  maybeAutoSave();
}

export function handleFactionEvents(opts = {}) {
  const forceJoin = !!opts.forceJoin;
  if (p.faction === FACTIONS.NONE) {
    if (!forceJoin && Math.random() < 0.4) {
      writeLog("Kì ngộ thoáng qua... nhưng cơ duyên chưa chín.", "");
      return;
    }
    showFactionChoiceModal();
    return;
  }
  if (p.faction === FACTIONS.CHINH) {
    const betrayChance = p.factionProbation > 0 ? 0.22 : 0.1;
    if (Math.random() < betrayChance) {
      p.faction = FACTIONS.MA;
      p.factionProbation = 0;
      p.mana = 0;
      p.wisdom += 10;
      writeLog(
        `💢 <b>PHẢN BỘI:</b> Đồng môn hãm hại, trưởng bối quay lưng! Ngươi bị ép rơi xuống vực sâu... <b>NGƯƠI ĐÃ HÓA MA!</b>`,
        "danger"
      );
      document.getElementById("game-container").style.boxShadow = "0 0 40px #e74c3c";
      return;
    }
    if (p.factionProbation > 0) {
      p.factionProbation--;
      if (p.factionProbation === 0) {
        writeLog(`⭐ <b>CHÍNH THỨC:</b> Trải qua khảo hạch, ngươi chính thức trở thành đệ tử Chính Đạo.`, "success");
      } else {
        writeLog("Trong sơn môn sóng ngầm cuộn trào... ngươi phải cẩn trọng.", "");
      }
      return;
    }
  }
  writeLog("Lịch lãm chốn thâm sơn, tâm cảnh có chút biến hóa.");
}

export function selectFactionByButton(choice) {
  if (!p.pendingFactionChoice) return;
  if (choice === "CHINH") {
    p.faction = FACTIONS.CHINH;
    p.factionProbation = 6;
    writeLog(
      `✨ <b>KÌ NGỘ ĐẦU GAME:</b> Ngươi lạc vào sơn môn, được trưởng lão thu nhận làm đệ tử ngoại môn. <b>Gia nhập Chính Đạo (đang nhập môn)</b>!`,
      "success"
    );
  } else if (choice === "MA") {
    p.faction = FACTIONS.MA;
    p.factionProbation = 0;
    writeLog(
      `🔥 <b>KÌ NGỘ ĐẦU GAME:</b> Ngươi nhặt được Ma công tuyệt thế, huyết khí sôi trào. <b>Bước chân vào Ma Đạo</b>!`,
      "danger"
    );
    document.getElementById("game-container").style.boxShadow = "0 0 40px #e74c3c";
  } else {
    p.faction = FACTIONS.NONE;
    p.factionProbation = 0;
    writeLog("Ngươi từ chối gia nhập phe phái, tiếp tục làm một Tản Tu tự do.", "");
  }
  p.pendingFactionChoice = false;
  hideFactionChoiceModal();
  updateUI();
  maybeAutoSave();
}

export function handleNPC(curStageMana, lcScale) {
  let goodChance = 0.5 + (p.faction.npcLuck || 0) + getKvExploreGoodBonus();
  goodChance = Math.min(0.95, Math.max(0.05, goodChance));
  const isGood = Math.random() < goodChance;
  if (isGood) {
    const goodNPCs = [
      {
        name: "Thần Y",
        msg: "'Tặng ngươi Thọ Diên Đan!'",
        effect: () => {
          p.age = Math.max(18, p.age - 20);
          writeLog("Trẻ lại 20 năm!");
        }
      },
      {
        name: "Đại Năng",
        msg: "'Truyền ngươi Tiên khí!'",
        effect: () => {
          p.mana += curStageMana * 5;
          writeLog("Nhận lượng lớn tu vi.");
        }
      },
      {
        name: "Lão Nhân",
        msg: "'Tặng ngươi bí tịch.'",
        effect: () => {
          p.wisdom += 5;
          writeLog("Ngộ tính +5.");
        }
      }
    ];
    const npc = goodNPCs[Math.floor(Math.random() * goodNPCs.length)];
    writeLog(`[${p.faction.name}] Gặp <b>${npc.name}</b>: ${npc.msg}`, "success");
    npc.effect();
  } else {
    const badNPCs = [
      {
        name: "Ma Quân",
        msg: "'Nộp thọ nguyên đây!'",
        effect: () => {
          const d = parseFloat(((p.maxAge - p.age) * 0.1).toFixed(1));
          p.age += d;
          writeLog(`Mất ${d} tuổi!`);
        }
      },
      {
        name: "Tà Tu",
        msg: "'Phế tu vi ngươi!'",
        effect: () => {
          if (p.level > 1) p.level--;
          p.mana = 0;
          writeLog("Rớt tầng!");
        }
      },
      {
        name: "Đạo Tặc",
        msg: "'Cướp sạch!'",
        effect: () => {
          p.mana = 0;
          writeLog("Mất trắng linh lực.");
        }
      }
    ];
    const npc = badNPCs[Math.floor(Math.random() * badNPCs.length)];
    if (p.wisdom > Math.random() * 180) {
      writeLog(`Nhờ thông tuệ, ngươi né được ${npc.name}!`, "wisdom");
    } else {
      writeLog(`Gặp <b>${npc.name}</b>: ${npc.msg}`, "danger");
      npc.effect();
    }
  }
}

export function handleBreakthrough() {
  if (p.isDead) return;
  const manaTarget = getBreakthroughManaTarget();
  if (p.mana < manaTarget) {
    writeLog("Linh lực chưa đủ để đột phá!", "danger");
    updateUI();
    return;
  }
  const isMajor = p.level === 10;
  let chance =
    (isMajor ? 0.3 : 0.8) +
    (p.wisdom / 1000) +
    (p.faction.breakMod || 0) +
    getKvBreakChanceDelta(isMajor);
  chance = Math.min(0.98, Math.max(0.02, chance));
  if (Math.random() < chance) {
    if (isMajor) {
      p.stage++;
      p.level = 1;
      p.maxAge = STAGES[p.stage].age;
      writeLog(`⭐ ĐỘT PHÁ: ${STAGES[p.stage].name}!`, "godly");
    } else {
      p.level++;
      writeLog(`Lên tầng ${p.level}.`);
    }
    p.mana = p.mana * (p.wisdom / 250);
  } else {
    p.mana *= 0.5;
    p.age += 3;
    writeLog("THẤT BẠI!", "danger");
  }
  updateUI();
  maybeAutoSave();
}
