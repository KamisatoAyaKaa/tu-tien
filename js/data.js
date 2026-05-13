/** Dữ liệu tĩnh & hằng số cân bằng — chỉnh game tại đây */

export const RANDOM_QUOTES = [
  "Cảm nhận linh khí xung quanh thật dồi dào...",
  "Con đường tu tiên thật lắm gian nan.",
  "Hình như ta vừa cảm nhận được một luồng ý niệm của đại năng đi ngang qua.",
  "Hôm nay tâm tình bất định, khó lòng nhập định.",
  "Thế gian vạn vật, tất cả đều là hư ảo.",
  "Ta phải nhanh chóng đột phá, thời gian không còn nhiều nữa..."
];

export const LINH_CAN = [
  { name: "Phế linh căn", multi: 0.8, color: "#7f8c8d" },
  { name: "Tam linh căn", multi: 1.0, color: "#3498db" },
  { name: "Song linh căn", multi: 1.5, color: "#2ecc71" },
  { name: "Đơn linh căn", multi: 2.5, color: "#f1c40f" },
  { name: "Thiên linh căn", multi: 5.0, color: "#e67e22" }
];

export const KHI_VAN = [
  {
    name: "Bình Phàm",
    breakMinorMod: 0,
    breakMajorMod: 0,
    exploreGoodBonus: 0
  },
  {
    name: "Cực Hung",
    breakMinorMod: -0.1,
    breakMajorMod: -0.2,
    exploreGoodBonus: 0
  },
  {
    name: "Thiên Kiêu",
    breakMinorMod: 0.1,
    breakMajorMod: 0.05,
    exploreGoodBonus: 0
  },
  {
    name: "Khí vận chi tử",
    breakMinorMod: 0.2,
    breakMajorMod: 0.2,
    exploreGoodBonus: 0.2
  }
];

export const FACTIONS = {
  NONE: { name: "Tản Tu", breakMod: 0, trainMod: 1.0, npcLuck: 0, color: "#cdcdcd" },
  CHINH: { name: "Chính Đạo", breakMod: 0.1, trainMod: 1.0, npcLuck: 0.2, color: "#3498db" },
  MA: { name: "Ma Đạo", breakMod: -0.15, trainMod: 1.6, npcLuck: -0.2, color: "#e74c3c" }
};

export const STAGES = [
  { name: "Luyện Khí", mana: 100, age: 100, speed: 1 },
  { name: "Trúc Cơ", mana: 3000, age: 250, speed: 15 },
  { name: "Kim Đan", mana: 40000, age: 500, speed: 100 },
  { name: "Nguyên Anh", mana: 300000, age: 1000, speed: 600 },
  { name: "Hóa Thần", mana: 2500000, age: 3000, speed: 4500 },
  { name: "Luyện Hư", mana: 15000000, age: 8000, speed: 30000 },
  { name: "Hợp Thể", mana: 100000000, age: 20000, speed: 200000 },
  { name: "Đại Thừa", mana: 800000000, age: 100000, speed: 1500000 },
  { name: "Độ Kiếp", mana: 5000000000, age: 500000, speed: 10000000 }
];

export const BREAK_MANA_PER_LEVEL_MUL = 1.14;
export const BREAK_MAJOR_CUR_MUL = 2.35;
export const BREAK_MAJOR_NEXT_FRAC = 0.16;
export const BREAK_ASCENSION_MUL = 4.2;

export const REALM_TRAIN_AGE_PER_STAGE = 0.26;
export const REALM_TRAIN_AGE_PER_LEVEL = 0.045;
export const REALM_TRAIN_GAIN_DIV_STAGE = 0.11;

export const CHARGE_REFILL_MS = 2 * 60 * 1000;
export const MAX_TRAIN_CHARGES = 20;
export const MAX_EXPLORE_CHARGES = 20;

export const ORIGIN_LABELS = { dan: "Thôn dân", thu: "Thư hương", vo: "Võ lâm hậu nhân" };

export const SAVE_KEY = "tu_tien_lo_save_v1";
