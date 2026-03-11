"use server";

import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { Day, LocationId, Time } from "@/lib/constants";

export type Attendance = {
    user: string;
    location: LocationId;
    day: Day;
    time: Time;
};

export async function getWeeklySchedule(weekId: string): Promise<Attendance[]> {
    try {
        const data = await redis.get<Attendance[]>(`studioplus:schedule:${weekId}`);
        return data || [];
    } catch (error) {
        console.error("Failed to fetch schedule:", error);
        return [];
    }
}

export async function updateAttendance(
    weekId: string,
    user: string,
    day: Day,
    location: LocationId,
    time: Time = "Full Day"
) {
    try {
        const key = `studioplus:schedule:${weekId}`;
        const currentSchedule = (await redis.get<Attendance[]>(key)) || [];

        // Remove existing entry for this user on this day
        const updatedSchedule = currentSchedule.filter(
            (a) => !(a.user === user && a.day === day)
        );

        // Add new entry
        updatedSchedule.push({ user, day, location, time });

        await redis.set(key, updatedSchedule);
        revalidatePath("/planner");
        return { success: true };
    } catch (error) {
        console.error("Failed to update attendance:", error);
        return { success: false, error: "Database error" };
    }
}

export async function removeAttendance(weekId: string, user: string, day: Day) {
    try {
        const key = `studioplus:schedule:${weekId}`;
        const currentSchedule = (await redis.get<Attendance[]>(key)) || [];

        const updatedSchedule = currentSchedule.filter(
            (a) => !(a.user === user && a.day === day)
        );

        await redis.set(key, updatedSchedule);
        revalidatePath("/planner");
        return { success: true };
    } catch (error) {
        console.error("Failed to remove attendance:", error);
        return { success: false, error: "Database error" };
    }
}
