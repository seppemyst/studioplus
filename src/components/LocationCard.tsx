"use client";

import { useAppStore } from '@/lib/store';
import { OfficeEntry, LocationName, TimingChoice } from '@/lib/types';
import { getInitials, stringToColor } from './ProfileSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock } from 'lucide-react';

interface LocationCardProps {
    location: LocationName;
    dateStr: string;
    entries: OfficeEntry[];
    onAdd: () => void;
    onRemove: (name: string) => void;
    onUpdateTiming: (name: string, timing: TimingChoice) => void;
}

const TIMINGS: TimingChoice[] = ['Full Day', 'Morning', 'Afternoon'];

export default function LocationCard({ location, dateStr, entries, onAdd, onRemove, onUpdateTiming }: LocationCardProps) {
    const currentUser = useAppStore(state => state.currentUser);

    const hasCurrentUser = entries.some(e => e.name === currentUser);
    const locationHasTiming = ['Antwerp', 'Diegem', 'Ghent'].includes(location);

    return (
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-200">{location}</h3>
                <div className="text-xs font-medium text-zinc-500 bg-black/20 px-2 py-1 rounded-md">
                    {entries.length}
                </div>
            </div>

            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
                <AnimatePresence>
                    {entries.map(entry => {
                        const isMe = entry.name === currentUser;
                        return (
                            <motion.div
                                key={entry.name}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={`relative group flex flex-col p-2 rounded-xl border ${isMe ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10"
                                            style={{ backgroundColor: stringToColor(entry.name) }}
                                        >
                                            {getInitials(entry.name)}
                                        </div>
                                        <span className={`text-sm font-medium ${isMe ? 'text-indigo-200' : 'text-zinc-300'}`}>
                                            {entry.name}
                                        </span>
                                    </div>
                                    {isMe && (
                                        <button
                                            onClick={() => onRemove(entry.name)}
                                            className="text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-red-400/10 transition-colors"
                                            title="Remove"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {locationHasTiming && isMe && (
                                    <div className="mt-2 pl-11 pr-1">
                                        <div className="relative">
                                            <select
                                                value={entry.timing}
                                                onChange={(e) => onUpdateTiming(entry.name, e.target.value as TimingChoice)}
                                                className="appearance-none w-full bg-black/30 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-indigo-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                {TIMINGS.map(t => (
                                                    <option key={t} value={t} className="bg-zinc-900 text-zinc-200">{t}</option>
                                                ))}
                                            </select>
                                            <Clock className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                                {locationHasTiming && !isMe && entry.timing !== 'Full Day' && (
                                    <div className="mt-1 pl-11 text-xs text-zinc-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> {entry.timing}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {!hasCurrentUser && currentUser && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onAdd}
                        className="mt-auto flex items-center justify-center w-full py-2.5 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm font-medium group"
                    >
                        <Plus className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" /> Add me here
                    </motion.button>
                )}
            </div>
        </div>
    );
}
