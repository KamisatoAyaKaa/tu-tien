import { p } from "./state.js";
import { updatePlayerBanner } from "./ui.js";

export function readCharacterFromForm() {
  const nameRaw = (document.getElementById("pc-name").value || "").trim();
  if (!nameRaw) {
    alert("Hãy nhập tên đạo hữu (2–16 ký tự).");
    return false;
  }
  if (nameRaw.length < 2 || nameRaw.length > 16) {
    alert("Tên hiển thị cần từ 2 đến 16 ký tự.");
    return false;
  }

  const daoRaw = (document.getElementById("pc-dao-hieu").value || "").trim();
  if (daoRaw.length > 24) {
    alert("Đạo hiệu quá dài (tối đa 24 ký tự).");
    return false;
  }

  p.pcName = nameRaw;
  p.pcGender = (document.getElementById("pc-gender").value || "").trim();
  p.pcDaoHieu = daoRaw;
  p.pcOrigin = document.getElementById("pc-origin").value || "dan";
  updatePlayerBanner();
  return true;
}

export function syncFormFromPlayer() {
  document.getElementById("pc-name").value = p.pcName || "";
  document.getElementById("pc-gender").value = p.pcGender || "Nam";
  document.getElementById("pc-dao-hieu").value = p.pcDaoHieu || "";
  document.getElementById("pc-origin").value = p.pcOrigin || "dan";
}
