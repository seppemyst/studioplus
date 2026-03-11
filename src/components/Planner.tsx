"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    LogOut,
    Clock,
    Check,
    User as UserIcon,
    Home as HomeIcon,
    MapPin,
    Building2,
    Briefcase
} from "lucide-react";
import {
    USERS,
    LOCATIONS,
    DAYS,
    TIMES,
    getInitials,
    Day,
    LocationId,
    Time,
    getUserColor
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
    getWeekId,
    getDaysOfWeek,
    formatWeekRange
} from "@/lib/date-utils";
import {
    Attendance,
    updateAttendance,
    removeAttendance
} from "@/app/actions";
import { addWeeks, subWeeks, format } from "date-fns";

interface PlannerProps {
    initialSchedule: Attendance[];
}

export default function Planner({ initialSchedule }: PlannerProps) {
    const router = useRouter();
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isPending, startTransition] = useTransition();

    // Optimistic state for the schedule
    const [optimisticSchedule, addOptimisticAttendance] = useOptimistic(
        initialSchedule,
        (state, newAttendance: Attendance | { type: 'remove', user: string, day: Day }) => {
            if ('type' in newAttendance && newAttendance.type === 'remove') {
                return state.filter(a => !(a.user === newAttendance.user && a.day === newAttendance.day));
            }
            const typedAttendance = newAttendance as Attendance;
            const filtered = state.filter(a => !(a.user === typedAttendance.user && a.day === typedAttendance.day));
            return [...filtered, typedAttendance];
        }
    );

    const weekId = getWeekId(currentDate);
    const weekDays = getDaysOfWeek(currentDate);

    useEffect(() => {
        const saved = localStorage.getItem("studioplus_user");
        if (!saved) {
            router.push("/");
        } else {
            setActiveUser(saved);
        }
    }, [router]);


    // Re-fetch data when weekId changes by updating the URL
    useEffect(() => {
        const currentWeekId = getWeekId(currentDate);
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("week") !== currentWeekId) {
            startTransition(() => {
                router.push(`/planner?week=${currentWeekId}`, { scroll: false });
            });
        }
    }, [currentDate, router]);

    const handleSwitchProfile = () => {
        localStorage.removeItem("studioplus_user");
        router.push("/");
    };


    const handlePrevWeek = () => {
        setCurrentDate(prev => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        setCurrentDate(prev => addWeeks(prev, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };


    const handleToggleAttendance = async (day: Day, location: LocationId) => {
        if (!activeUser) return;

        const existing = optimisticSchedule.find(a => a.user === activeUser && a.day === day);

        if (existing && existing.location === location) {
            // Remove attendance
            addOptimisticAttendance({ type: 'remove', user: activeUser, day });
            await removeAttendance(weekId, activeUser, day);
        } else {
            // Add or Move attendance
            const newEntry: Attendance = { user: activeUser, day, location, time: "Full Day" };
            addOptimisticAttendance(newEntry);
            await updateAttendance(weekId, activeUser, day, location, "Full Day");
        }
    };

    const handleUpdateTime = async (day: Day, location: LocationId, time: Time) => {
        if (!activeUser) return;

        // Only certain locations allow time selection
        if (['antwerp', 'diegem', 'ghent'].includes(location)) {
            const newEntry: Attendance = { user: activeUser, day, location, time };
            addOptimisticAttendance(newEntry);
            await updateAttendance(weekId, activeUser, day, location, time);
        }
    };

    // State for the profile dropdown
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // State for the location selector modal
    const [isSelectorOpen, setIsSelectorOpen] = useState<{ day: Day } | null>(null);

    const isToday = (date: Date) => {
        const today = new Date();
        return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    };

    const handleSelectLocation = async (day: Day, location: LocationId) => {
        await handleToggleAttendance(day, location);
        setIsSelectorOpen(null);
    };

    if (!activeUser) return null;

    return (
        <div className="min-h-screen text-white font-sans selection:bg-ey-yellow selection:text-ey-black overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 ey-shadow">
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <Image
                        src="/assets/logo.webp"
                        alt="Studio+"
                        width={120}
                        height={60}
                        className="h-8 sm:h-10 w-auto drop-shadow-[0_0_10px_rgba(255,230,0,0.2)]"
                        priority
                    />

                    {/* Mobile User Toggle */}
                    <div className="relative sm:hidden">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95"
                            style={{ borderColor: `${getUserColor(activeUser)}44` }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                                style={{ backgroundColor: getUserColor(activeUser) }}
                            >
                                {getInitials(activeUser)}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                {activeUser.split(' ')[0]}
                            </span>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-48 glass border border-white/10 p-2 rounded-2xl ey-shadow z-50"
                                    >
                                        <button
                                            onClick={handleSwitchProfile}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-xs font-black uppercase tracking-widest">Switch Profile</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 flex-1 sm:flex-none">
                        <button
                            onClick={handlePrevWeek}
                            className="p-1 sm:p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white shrink-0"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] min-w-[140px] sm:min-w-[200px] text-center text-white/90 whitespace-nowrap">
                            {formatWeekRange(currentDate)}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-1 sm:p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white shrink-0"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={handleToday}
                            className="ml-1 sm:ml-2 px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-ey-yellow hover:text-black transition-all border border-white/10 rounded-md shrink-0"
                        >
                            Today
                        </button>
                    </div>

                    {/* Desktop User Toggle - Outside overflow */}
                    <div className="hidden sm:block relative">
                        <div className="flex items-center gap-4">
                            <div className="h-6 w-[1px] bg-white/10" />
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 bg-white/5 border border-white/10 pl-1.5 pr-4 py-1 rounded-full transition-all hover:bg-white/10 hover:border-white/20"
                                style={{ borderColor: `${getUserColor(activeUser)}44` }}
                            >
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                                    style={{ backgroundColor: getUserColor(activeUser) }}
                                >
                                    {getInitials(activeUser)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                    {activeUser}
                                </span>
                            </button>
                        </div>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-48 glass border border-white/10 p-2 rounded-2xl ey-shadow z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleSwitchProfile}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Switch Profile</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </header>

            {/* Main Grid: 5 Columns (Days) */}
            <main className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-[1600px] mx-auto items-stretch">
                    {DAYS.map((day, i) => {
                        const date = weekDays[i];
                        const active = isToday(date);
                        const dayAttendances = optimisticSchedule.filter(a => a.day === day);

                        return (
                            <div key={day} className="flex flex-col gap-3">
                                {/* Day Header */}
                                <div className={cn(
                                    "p-4 rounded-2xl glass border transition-all duration-500 flex flex-col items-center gap-1",
                                    active ? "border-ey-yellow bg-ey-yellow/5" : "border-white/5"
                                )}>
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-[0.2em]",
                                        active ? "text-ey-yellow" : "text-white/40"
                                    )}>
                                        {day}
                                    </span>
                                    <span className={cn(
                                        "text-2xl font-black tabular-nums",
                                        active ? "text-white" : "text-white/20"
                                    )}>
                                        {format(date, "d")}
                                    </span>
                                </div>

                                {/* Content Area: Grouped by Location Blocks */}
                                <div className={cn(
                                    "flex-1 min-h-[400px] sm:min-h-[600px] glass border border-white/5 rounded-3xl p-3 sm:p-4 flex flex-col gap-4 transition-all duration-500",
                                    active && "bg-white/[0.02]"
                                )}>
                                    {LOCATIONS.map((location) => {
                                        const attendees = dayAttendances.filter(a => a.location === location.id);
                                        const isActiveUserHere = attendees.some(a => a.user === activeUser);

                                        return (
                                            <div
                                                key={location.id}
                                                className={cn(
                                                    "rounded-2xl border transition-all duration-300 relative group overflow-hidden",
                                                    isActiveUserHere
                                                        ? "bg-white/[0.08] border-white/20"
                                                        : attendees.length > 0 ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                                                            : "bg-transparent border-dashed border-white/5 hover:border-white/10"
                                                )}
                                                onClick={() => !isActiveUserHere && handleToggleAttendance(day, location.id)}
                                            >
                                                {/* Location Tag/Header */}
                                                <div className={cn(
                                                    "px-3 py-2 flex items-center justify-between border-b transition-all",
                                                    isActiveUserHere ? "border-white/10" : "border-transparent"
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            location.id === 'antwerp' ? "bg-[#FF5F1F]" :
                                                                location.id === 'diegem' ? "bg-[#39FF14]" :
                                                                    location.id === 'ghent' ? "bg-[#BC13FE]" :
                                                                        location.id === 'client' ? "bg-[#00FFFF]" :
                                                                            "bg-[#FF10F0]"
                                                        )} />
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-[0.15em]",
                                                            attendees.length > 0 ? "text-white/90" : "text-white/20"
                                                        )}>
                                                            {location.name}
                                                        </span>
                                                    </div>

                                                    {/* Headcount or Add Prompt */}
                                                    {attendees.length > 0 ? (
                                                        <span className="text-[8px] font-black text-white/30 tabular-nums">
                                                            {attendees.length}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[7px] font-black uppercase tracking-widest hidden group-hover:block text-ey-yellow">Join</span>
                                                            <Plus size={10} className="text-white/40 group-hover:text-ey-yellow group-hover:scale-125 transition-all" strokeWidth={3} />
                                                        </div>
                                                    )}

                                                    {/* Add icon indication for non-empty but clickable blocks */}
                                                    {!isActiveUserHere && attendees.length > 0 && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[7px] font-black uppercase tracking-widest text-ey-yellow">Move</span>
                                                            <Plus size={10} className="text-ey-yellow" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>


                                                {/* Users List for this Location */}
                                                <div className="p-2 sm:p-3 flex flex-col gap-1.5">
                                                    <AnimatePresence mode="popLayout">
                                                        {attendees.sort((a, b) => {
                                                            if (a.user === activeUser) return -1;
                                                            if (b.user === activeUser) return 1;
                                                            return a.user.localeCompare(b.user);
                                                        }).map((attendance) => (
                                                            <motion.div
                                                                key={attendance.user}
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className={cn(
                                                                    "flex items-center justify-between p-1.5 rounded-lg transition-all",
                                                                    attendance.user === activeUser ? "bg-white/5" : ""
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-5 h-5 rounded-md flex items-center justify-center text-[7px] font-black text-white shrink-0"
                                                                        style={{ backgroundColor: getUserColor(attendance.user) }}
                                                                    >
                                                                        {getInitials(attendance.user)}
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-[10px] font-black uppercase tracking-wider truncate max-w-[80px]",
                                                                        attendance.user === activeUser ? "text-white" : "text-white/60"
                                                                    )}>
                                                                        {attendance.user === activeUser ? "You" : attendance.user.split(' ')[0]}
                                                                    </span>
                                                                </div>

                                                                {/* Time indication / Toggle */}
                                                                <div className="flex items-center gap-2">
                                                                    {attendance.time !== "Full Day" && (
                                                                        <span className="text-[7px] font-black uppercase text-white/40 bg-white/5 px-1 py-0.5 rounded leading-none shrink-0">
                                                                            {attendance.time === "Morning" ? "AM" : "PM"}
                                                                        </span>
                                                                    )}

                                                                    {attendance.user === activeUser && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleAttendance(day, location.id);
                                                                            }}
                                                                            className="p-1 hover:bg-white/10 rounded transition-all text-white/20 hover:text-white"
                                                                        >
                                                                            <Check size={10} className="text-ey-yellow" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>

                                                    {/* Time Selector for Active User when here */}
                                                    {isActiveUserHere && ['antwerp', 'diegem', 'ghent'].includes(location.id) && (
                                                        <div className="flex gap-1 mt-1 border-t border-white/5 pt-2">
                                                            {TIMES.map(t => {
                                                                const current = attendees.find(a => a.user === activeUser)?.time;
                                                                return (
                                                                    <button
                                                                        key={t}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateTime(day, location.id, t);
                                                                        }}
                                                                        className={cn(
                                                                            "px-1.5 py-0.5 rounded text-[6px] font-black uppercase transition-all",
                                                                            current === t ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
                                                                        )}
                                                                    >
                                                                        {t === "Full Day" ? "Full" : t === "Morning" ? "AM" : "PM"}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
