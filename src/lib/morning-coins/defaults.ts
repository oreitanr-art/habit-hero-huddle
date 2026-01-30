import { Store } from "./types";

export const DEFAULT_TASKS = [
  { id: "t1", title: "התעוררתי בחיוך", coins: 2, icon: "😊" },
  { id: "t2", title: "הייתי בשירותים", coins: 2, icon: "🚽" },
  { id: "t3", title: "שטפתי פנים", coins: 2, icon: "💧" },
  { id: "t4", title: "צחצחתי שיניים", coins: 4, icon: "🦷" },
  { id: "t5", title: "הסתרקתי", coins: 2, icon: "💇" },
  { id: "t6", title: "התלבשתי", coins: 4, icon: "👕" },
  { id: "t7", title: "נעלתי נעליים", coins: 2, icon: "👟" },
  { id: "t8", title: "סידרתי את המיטה", coins: 4, icon: "🛏️" },
  { id: "t9", title: "הכנסתי אוכל ומים לתיק", coins: 4, icon: "🎒" },
  { id: "t10", title: "אכלתי ארוחת בוקר", coins: 4, icon: "🍳" },
];

export const DEFAULT_REWARDS = [
  { id: "r1", title: "לבחור סרט משפחתי בערב", cost: 25, icon: "🎬" },
  { id: "r2", title: "קינוח מיוחד", cost: 30, icon: "🍰" },
  { id: "r3", title: "משחק עם אבא 20 דק׳", cost: 35, icon: "🎮" },
  { id: "r4", title: "לבחור ארוחת ערב", cost: 40, icon: "🍕" },
  { id: "r5", title: "זמן איכות 45 דק׳ בבית", cost: 60, icon: "🧩" },
  { id: "r6", title: "דייט אבא קצר", cost: 70, icon: "🍦" },
  { id: "r7", title: "צעצוע קטן", cost: 90, icon: "🧸" },
  { id: "r8", title: "קניון + משהו קטן", cost: 140, icon: "🛍️" },
  { id: "r9", title: "פעילות חיצונית", cost: 160, icon: "🎳" },
  { id: "r10", title: "בוקר חופשי במקום גן", cost: 220, icon: "🏖️", requiresPerfectWeek: true },
];

export const DEFAULT_STORE: Store = {
  tasks: DEFAULT_TASKS,
  rewards: DEFAULT_REWARDS,
  settings: {
    pin: "1234",
    bonuses: { 
      allDoneDailyBonus: 5, 
      threeDayStreakBonus: 10, 
      perfectWeekBonus: 25 
    },
    penalties: { 
      zeroTasks: -10, 
      oneToFour: -5 
    },
  },
  walletCoins: 0,
  weeklyCoinsByWeekKey: {},
  dailyByDate: {},
  streak: { current: 0 },
};
