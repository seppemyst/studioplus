"use client";

import { format, isToday } from 'date-fns';
import { OfficeEntry, LocationName, TimingChoice } from '@/lib/types';
import LocationCard from './LocationCard';
import { useAppStore } from '@/lib/store';

interface DayRowProps {
    date: Date;
    entries: OfficeEntry[];
    onAddEntry: (entry: OfficeEntry) => void;
    onRemoveEntry: (name: string, date: string) => void;
    onUpdateTiming: (name: string, date: string, timing: TimingChoice) => void;
}

const LOCATIONS: LocationName[] = ['Antwerp', 'Diegem', 'Ghent', 'Client', 'Home'];

export default function DayRow({ date, entries, onAddEntry, onRemoveEntry, onUpdateTiming }: DayRowProps) {
    const currentUser = useAppStore(state => state.currentUser);
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = isToday(date);

    return (
        <div className={`flex flex-col rounded-3xl p-4 md:p-6 mb-6 ${today ? 'bg-indigo-500/10 ring-2 ring-indigo-500/30' : 'bg-zinc-900/40 border border-white/5'} shadow-xl backdrop-blur-md`}>
            <div className="mb-4 md:mb-6 border-b border-white/10 pb-4">
                <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${today ? 'text-indigo-400' : 'text-white'}`}>
                    {format(date, 'EEEE')}
                </h3>
                <p className={`text-sm md:text-base font-medium mt-1 ${today ? 'text-indigo-300' : 'text-zinc-500'}`}>
                    {format(date, 'MMMM d, yyyy')} {today && <span className="ml-2 inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs uppercase font-bold tracking-wider">Today</span>}
                </p>
            </div>

            {/* Grid: 1 col on mobile, 5 cols on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
                {LOCATIONS.map(location => (
                    <LocationCard
                        key={location}
                        location={location}
                        dateStr={dateStr}
                        entries={entries.filter(e => e.location === location)}
                        onAdd={() => {
                            if (currentUser) {
                                onAddEntry({
                                    name: currentUser,
                                    location,
                                    date: dateStr,
                                    timing: 'Full Day'
                                });
                            }
                        }}
                        onRemove={(name) => onRemoveEntry(name, dateStr)}
                        onUpdateTiming={(name, timing) => onUpdateTiming(name, dateStr, timing)}
                    />
                ))}
            </div>
        </div>
    );
}
