"use client";

import { format, isToday } from 'date-fns';
import { OfficeEntry, LocationName, TimingChoice } from '@/lib/types';
import LocationCard from './LocationCard';
import { useAppStore } from '@/lib/store';

interface DayColumnProps {
    date: Date;
    entries: OfficeEntry[];
    onAddEntry: (entry: OfficeEntry) => void;
    onRemoveEntry: (name: string, date: string) => void;
    onUpdateTiming: (name: string, date: string, timing: TimingChoice) => void;
}

const LOCATIONS: LocationName[] = ['Antwerp', 'Diegem', 'Ghent', 'Client', 'Home'];

export default function DayColumn({ date, entries, onAddEntry, onRemoveEntry, onUpdateTiming }: DayColumnProps) {
    const currentUser = useAppStore(state => state.currentUser);
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = isToday(date);

    return (
        <div className={`flex flex-col h-full rounded-2xl p-2 ${today ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20' : ''}`}>
            <div className="text-center mb-4 pt-2">
                <h3 className={`text-lg font-bold ${today ? 'text-indigo-400' : 'text-zinc-200'}`}>
                    {format(date, 'EEEE')}
                </h3>
                <p className={`text-sm ${today ? 'text-indigo-300/70' : 'text-zinc-500'}`}>
                    {format(date, 'MMM d')}
                </p>
            </div>

            <div className="flex flex-col gap-4 flex-1">
                {LOCATIONS.map(location => (
                    <div key={location} className="flex-1 min-h-[160px]">
                        <LocationCard
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
                    </div>
                ))}
            </div>
        </div>
    );
}
