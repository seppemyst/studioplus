"use client";

import { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayColumn from './DayColumn';
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
            <div className="flex items-center justify-between mb-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
                <button
                    onClick={handlePreviousWeek}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all transform hover:scale-105"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {format(dates[0], 'MMMM d')} - {format(dates[4], 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-zinc-400 font-medium">Week {format(currentDate, 'w')}</p>
                </div>
                <button
                    onClick={handleNextWeek}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all transform hover:scale-105"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 flex-1 min-h-[600px]"
                >
                    {dates.map((date) => (
                        <DayColumn
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
