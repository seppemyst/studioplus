"use client";

import { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayRow from './DayRow';
import { OfficeEntry } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function WeeklyOverview() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState<OfficeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

    const dates = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));

    useEffect(() => {
        async function fetchWeekData() {
            setIsLoading(true);
            const startStr = format(dates[0], 'yyyy-MM-dd');
            const endStr = format(dates[4], 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .gte('date', startStr)
                .lte('date', endStr);

            if (!error && data) {
                setEntries(data as OfficeEntry[]);
            } else {
                console.error("Error fetching data: ", error);
            }
            setIsLoading(false);
        }
        fetchWeekData();
    }, [startOfCurrentWeek.getTime()]);

    const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const viewedWeekStart = format(dates[0], 'yyyy-MM-dd');
    const isCurrentWeek = currentWeekStart === viewedWeekStart;

    // Optimistic UI updates
    const handleAddEntry = async (entry: OfficeEntry) => {
        // Conflict prevention: remove existing entry for same person on same day
        setEntries(prev => {
            const filtered = prev.filter(e => !(e.name === entry.name && e.date === entry.date));
            return [...filtered, entry];
        });

        // We do delete then insert to guarantee no duplicates
        const { error: delError } = await supabase
            .from('locations')
            .delete()
            .match({ name: entry.name, date: entry.date });

        if (!delError) {
            const { error: insError } = await supabase
                .from('locations')
                .insert([entry]);
            if (insError) console.error("Error inserting:", insError);
        }
    };

    const handleRemoveEntry = async (name: string, date: string) => {
        setEntries(prev => prev.filter(e => !(e.name === name && e.date === date)));
        const { error } = await supabase
            .from('locations')
            .delete()
            .match({ name, date });
        if (error) console.error("Error deleting:", error);
    };

    const handleUpdateTiming = async (name: string, date: string, timing: string) => {
        setEntries(prev => prev.map(e => e.name === name && e.date === date ? { ...e, timing: timing as any } : e));
        const { error } = await supabase
            .from('locations')
            .update({ timing })
            .match({ name, date });
        if (error) console.error("Error updating timing:", error);
    };

    return (
        <div className="flex flex-col flex-1 pb-10">
            <div className="flex items-center justify-between mb-6 md:mb-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-3 md:p-4 shadow-2xl">
                <button
                    onClick={handlePreviousWeek}
                    className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all transform hover:scale-105"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="flex flex-col items-center justify-center px-2">
                    <h2 className="text-sm sm:text-base md:text-xl font-bold text-white tracking-tight whitespace-nowrap">
                        {format(dates[0], 'MMM d')} - {format(dates[4], 'MMM d, yyyy')}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs md:text-sm text-zinc-400 font-medium">Week {format(currentDate, 'w')}</p>
                        {!isCurrentWeek ? (
                            <button
                                onClick={handleToday}
                                className="text-[10px] md:text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-indigo-200 px-2 py-0.5 rounded transition-colors font-bold uppercase tracking-wider"
                            >
                                Back to current week
                            </button>
                        ) : (
                            <span className="text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                Current Week
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleNextWeek}
                    className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all transform hover:scale-105"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 w-full"
                >
                    {dates.map((date) => (
                        <DayRow
                            key={date.toISOString()}
                            date={date}
                            entries={entries.filter(e => e.date === format(date, 'yyyy-MM-dd'))}
                            onAddEntry={handleAddEntry}
                            onRemoveEntry={handleRemoveEntry}
                            onUpdateTiming={handleUpdateTiming}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
