import { format, startOfWeek, addDays, getISOWeek, getYear } from "date-fns";

export function getWeekId(date: Date = new Date()) {
    const weekNumber = getISOWeek(date);
    const year = getYear(date);
    return `${year}-${String(weekNumber).padStart(2, '0')}`;
}

export function getDaysOfWeek(date: Date = new Date()) {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 5 }).map((_, i) => addDays(start, i));
}

export function formatWeekRange(date: Date) {
    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const friday = addDays(monday, 4);
    return `${format(monday, "MMM d")} - ${format(friday, "MMM d, yyyy")}`;
}
