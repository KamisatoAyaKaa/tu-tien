import { p, rollCount, MAX_ROLLS } from "./state.js";
import { STAGES, RANDOM_QUOTES, ORIGIN_LABELS } from "./data.js";
import { getBreakthroughManaTarget } from "./mechanics.js";
import { updateChargeDisplay } from "./charges.js";

export function writeLog(msg, className = "") {
  const log = document.getElementById("log");
  if (!log) return; // An toàn: Tránh lỗi nếu UI chưa load kịp
  const pTag = document.createElement("p");
  pTag.className = className;
  pTag.innerHTML = `[${p.age.toFixed(0)} tuổi] ${msg}`;
  log.prepend(pTag);
}

export function getPlayerDisplayTitle() {
  const dao = (p.pcDaoHieu || "").trim();
  const name = (p.pcName || "").trim() || "Vô danh";
  if (dao) return `${dao} · ${name}`;
  return name;
}

export function updatePlayerBanner() {
  const banner = document.getElementById("player-banner");
  const playLine = document.getElementById("pc-play-line");
  const setupEl = document.getElementById("setup-screen");
  
  if (!banner) return; // An toàn: Tránh lỗi DOM
  const setupVisible = setupEl && setupEl.style.display !== "none";

  let name = (p.pcName || "").trim();
  let gender = (p.pcGender || "").trim();
  let dao = (p.pcDaoHieu || "").trim();
  let originKey = p.pcOrigin || "dan";

  if (setupVisible) {
    name = (document.getElementById("pc-name")?.value || "").trim();
    gender = (document.getElementById("pc-gender")?.value || "").trim();
    dao = (document.getElementById("pc-dao-hieu")?.value || "").trim();
    originKey = document.getElementById("pc-origin")?.value || "dan";
  }

  if (!name) {
    banner.textContent = "Hãy nhập tên đạo hữu ở trên, rồi gieo quẻ và bắt đầu luân hồi.";
    if (playLine) playLine.textContent = "--";
    return;
  }

  const displayName = dao ? `${dao} · ${name}` : name;
  const bits = [displayName];
  if (gender) bits.push(gender);
  if (ORIGIN_LABELS[originKey]) bits.push(ORIGIN_LABELS[originKey]);

  const line = bits.join(" · ");
  banner.textContent = line;
  if (playLine) playLine.textContent = line;
}

export function updateInitUI() {
  document.getElementById("init-lc").innerText = "Linh Căn: " + (p.lc?.name ?? "???");
  document.getElementById("init-lc").style.color = p.lc?.color ?? "#cdcdcd";
  document.getElementById("init-wisdom").innerText = "Ngộ Tính: " + (p.wisdom ?? "???");
  document.getElementById("init-kv").innerText = "Khí Vận: " + (p.kv?.name ?? "???");

  // VÁ LỖI NÚT GIEO QUẺ: Hỗ trợ tìm qua ID hoặc thuộc tính
  const rollBtn = document.getElementById("btn-roll-fate") || document.querySelector("button[onclick='rollFate()']");
  
  if (rollBtn) {
    const remains = MAX_ROLLS - rollCount;
    rollBtn.innerText = `Gieo Quẻ (Còn ${remains} lần)`;
    
    if (remains <= 0) {
      rollBtn.style.opacity = "0.6";
      rollBtn.style.cursor = "not-allowed";
      rollBtn.innerText = "Thiên Cơ Đã Tận";
      rollBtn.disabled = true; // Khóa hẳn nút để tránh spam click
    }
  }
}

export function updateUI() {
  // Tránh update UI thừa thãi nếu đã quy tiên
  if (p.isDead) return;

  const cur = STAGES[p.stage];

  if (Math.random() < 0.2) {
    const subHeader = document.querySelector(".header p");
    if (subHeader) subHeader.innerText = RANDOM_QUOTES[Math.floor(Math.random() * RANDOM_QUOTES.length)];
  }

  document.getElementById("rank-txt").innerText = `${cur.name} Tầng ${p.level}`;
  const manaTarget = getBreakthroughManaTarget();
  document.getElementById("mana-txt").innerText = Math.floor(p.mana).toLocaleString();
  document.getElementById("max-mana-txt").innerText = manaTarget.toLocaleString();
  document.getElementById("age-txt").innerText = p.age.toFixed(1);
  document.getElementById("max-age-txt").innerText = p.maxAge;

  const rankTxt = document.getElementById("rank-txt");
  const factionTxt = document.getElementById("kv-txt");

  // SỬA LỖI MẤT NÚT ĐỘT PHÁ Ở ĐÂY: 
  // Dùng Optional Chaining (?.) để code không bị crash khi p.faction chưa tồn tại
  rankTxt.style.color = p.faction?.color || "#cdcdcd";
  factionTxt.innerText = `${p.kv?.name || "???"} | ${p.faction?.name || "Tản Tu"}`;
  
  updatePlayerBanner();

  const btn = document.getElementById("break-btn");
  if (btn) {
    if (p.mana >= manaTarget) {
      btn.style.display = "block";
      if (p.stage === STAGES.length - 1 && p.level === 10) {
        btn.innerText = "✨ PHI THĂNG TIÊN GIỚI ✨";
      } else if (p.level === 10) {
        btn.innerText = `⭐ ĐỘT PHÁ ${STAGES[p.stage + 1].name} ⭐`;
      } else {
        btn.innerText = `Phá Cảnh Tầng ${p.level + 1}`;
      }
    } else {
      btn.style.display = "none";
    }
  }

  if (p.age >= p.maxAge && !p.isDead) {
    p.isDead = true;
    writeLog("Đèn cạn dầu tắt... Trăm năm tu hành hóa thành cát bụi.", "danger");
    setTimeout(() => { if (confirm("THÂN TỬ ĐẠO TIÊU. Luân hồi chuyển kiếp?")) location.reload(); }, 500);
  }

  updateChargeDisplay();
}

export function showFactionChoiceModal() {
  p.pendingFactionChoice = true;
  writeLog("✨ Kì ngộ mở ra trước mắt. Hãy chọn phe bằng các nút hiển thị.", "highlight");
  const modal = document.getElementById("faction-modal");
  if (modal) modal.classList.add("show");
}

export function hideFactionChoiceModal() {
  const modal = document.getElementById("faction-modal");
  if (modal) modal.classList.remove("show");
}
