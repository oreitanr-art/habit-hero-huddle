// Date utilities for Israel week (Sunday-Thursday school days, Friday summary)

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return toISODate(new Date());
}

// Shop opens Friday 12:00 Israel time, closes Saturday 22:00 Israel time
export function isShopDay(): boolean {
  // Get current time in Israel timezone
  const israelTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
  const now = new Date(israelTime);
  
  const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
  const hours = now.getHours();
  
  // Friday from 12:00 onwards
  if (day === 5 && hours >= 12) {
    return true;
  }
  
  // Saturday until 22:00
  if (day === 6 && hours < 22) {
    return true;
  }
  
  return false;
}

// WeekKey = ISO date of Sunday for the current week (Israel-style week start)
export function getWeekKey(d: Date): string {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun ... 5=Fri ... 6=Sat
  const diffToSunday = day;
  date.setDate(date.getDate() - diffToSunday);
  return toISODate(date);
}

export function isFriday(d: Date): boolean {
  return d.getDay() === 5;
}

export function isSaturday(d: Date): boolean {
  return d.getDay() === 6;
}

// School days are Sunday (0) through Thursday (4)
export function isSchoolWeekday(d: Date): boolean {
  const day = d.getDay();
  return day >= 0 && day <= 4;
}

// Get all school days (Sun-Thu) for a given week key
export function getSchoolDaysForWeek(weekKey: string): string[] {
  const sunday = new Date(weekKey);
  const days: string[] = [];
  for (let i = 0; i <= 4; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    days.push(toISODate(date));
  }
  return days;
}

// Get Hebrew day name
export function getHebrewDayName(d: Date): string {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return days[d.getDay()];
}

// Format date for display
export function formatDateHebrew(dateStr: string): string {
  const date = new Date(dateStr);
  return `יום ${getHebrewDayName(date)}, ${date.getDate()}/${date.getMonth() + 1}`;
}
