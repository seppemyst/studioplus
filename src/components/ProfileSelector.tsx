"use client";

import { useState, useEffect } from 'react';
import { useAppStore, UserItem } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials, getUserColor, generateUserColor } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { Minus, Plus, Settings2, Check, Trash2, X } from 'lucide-react';

export default function ProfileSelector() {
    const users = useAppStore((state) => state.users);
    const setUsers = useAppStore((state) => state.setUsers);
    const addUser = useAppStore((state) => state.addUser);
    const removeUser = useAppStore((state) => state.removeUser);
    const setCurrentUser = useAppStore((state) => state.setCurrentUser);

    const [isManaging, setIsManaging] = useState(false);
    const [userToRemove, setUserToRemove] = useState<UserItem | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [addError, setAddError] = useState("");

    // Sync from Supabase on mount
    useEffect(() => {
        async function loadCloudUsers() {
            try {
                const { data, error } = await supabase
                    .from('locations')
                    .select('location')
                    .eq('name', '__USERS_CONFIG__')
                    .eq('date', '1970-01-01')
                    .maybeSingle();

                if (!error && data && data.location) {
                    const parsed = JSON.parse(data.location) as UserItem[];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setUsers(parsed);
                    }
                }
            } catch (e) {
                console.error("Failed to load users from cloud:", e);
            }
        }
        loadCloudUsers();
    }, [setUsers]);

    // Background sync to Supabase
    const syncToCloud = async (updatedUsers: UserItem[]) => {
        try {
            await supabase
                .from('locations')
                .delete()
                .eq('name', '__USERS_CONFIG__')
                .eq('date', '1970-01-01');

            await supabase
                .from('locations')
                .insert([
                    {
                        name: '__USERS_CONFIG__',
                        location: JSON.stringify(updatedUsers),
                        date: '1970-01-01',
                        timing: 'Full Day',
                    }
                ]);
        } catch (e) {
            console.error("Failed to sync users to cloud:", e);
        }
    };

    const confirmRemoveUser = async () => {
        if (!userToRemove) return;
        const name = userToRemove.name;
        const nextUsers = users.filter((u) => u.name.toLowerCase() !== name.toLowerCase());
        removeUser(name);
        setUserToRemove(null);
        await syncToCloud(nextUsers);
    };

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newUserName.trim();
        if (!trimmed) {
            setAddError("Please enter a name.");
            return;
        }
        if (users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
            setAddError("A member with this name already exists.");
            return;
        }

        const newUser: UserItem = {
            name: trimmed,
            color: generateUserColor(trimmed),
        };

        const nextUsers = [...users, newUser].sort((a, b) => a.name.localeCompare(b.name));
        addUser(newUser);
        setIsAddModalOpen(false);
        setNewUserName("");
        setAddError("");
        await syncToCloud(nextUsers);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.04 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-12 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                <img src="/logo.png" alt="Studio+" className="h-12 md:h-16 mb-8 drop-shadow-lg object-contain" />
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
                    Who is checking in?
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl font-medium mb-6 max-w-2xl mx-auto">
                    Select your profile to view and update your weekly office schedule.
                </p>

                {/* Manage Mode Toggle Button */}
                <button
                    onClick={() => setIsManaging(!isManaging)}
                    className={`mb-10 px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 border flex items-center gap-2 ${
                        isManaging
                            ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                >
                    {isManaging ? (
                        <>
                            <Check size={16} />
                            <span>Done Managing</span>
                        </>
                    ) : (
                        <>
                            <Settings2 size={16} />
                            <span>Manage</span>
                        </>
                    )}
                </button>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8 max-w-6xl mx-auto items-start"
            >
                {users.map((user) => (
                    <motion.div
                        key={user.name}
                        variants={item}
                        className="flex flex-col items-center relative group"
                    >
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: isManaging ? 1.05 : 1.1, translateY: isManaging ? 0 : -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (isManaging) {
                                        setUserToRemove(user);
                                    } else {
                                        setCurrentUser(user.name);
                                    }
                                }}
                                className="flex flex-col items-center focus:outline-none"
                            >
                                <div
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300 ring-2 ring-white/10 group-hover:ring-white/50"
                                    style={{ backgroundColor: user.color || getUserColor(user.name, users) }}
                                >
                                    {getInitials(user.name)}
                                </div>
                            </motion.button>

                            {/* Small Red Circle with Minus */}
                            <AnimatePresence>
                                {isManaging && (
                                    <motion.button
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUserToRemove(user);
                                        }}
                                        className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-90 text-white flex items-center justify-center shadow-lg ring-2 ring-zinc-900 z-10 transition-all cursor-pointer"
                                        title={`Remove ${user.name}`}
                                        aria-label={`Remove ${user.name}`}
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <span className="mt-3 text-sm md:text-base font-semibold text-zinc-400 group-hover:text-white transition-colors truncate max-w-[100px]">
                            {user.name}
                        </span>
                    </motion.div>
                ))}

                {/* Plain Grey '+' User Circle */}
                <motion.div
                    variants={item}
                    className="flex flex-col items-center group"
                >
                    <motion.button
                        whileHover={{ scale: 1.1, translateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setIsAddModalOpen(true);
                            setNewUserName("");
                            setAddError("");
                        }}
                        className="flex flex-col items-center focus:outline-none group cursor-pointer"
                        title="Add team member"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-zinc-800/90 hover:bg-zinc-700/90 border-2 border-dashed border-zinc-600 group-hover:border-zinc-400 text-zinc-400 group-hover:text-white shadow-lg group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300">
                            <Plus size={28} strokeWidth={2.5} />
                        </div>
                    </motion.button>
                    <span className="mt-3 text-sm md:text-base font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Add
                    </span>
                </motion.div>
            </motion.div>

            {/* Confirmation Dialog Modal */}
            <AnimatePresence>
                {userToRemove && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
                        >
                            <div
                                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-2 ring-white/10"
                                style={{ backgroundColor: userToRemove.color || getUserColor(userToRemove.name, users) }}
                            >
                                {getInitials(userToRemove.name)}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Remove {userToRemove.name}?
                            </h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Are you sure you want to remove <span className="text-white font-medium">{userToRemove.name}</span> from the team? They will no longer appear on the planner.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setUserToRemove(null)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveUser}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/25 flex items-center gap-1.5"
                                >
                                    <Trash2 size={15} />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-left"
                        >
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setNewUserName("");
                                    setAddError("");
                                }}
                                className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">
                                Add Team Member
                            </h3>
                            <p className="text-zinc-400 text-xs mb-5">
                                Enter the name to add to the Studio+ office planner.
                            </p>

                            {/* Live Preview */}
                            <div className="flex items-center gap-3 p-3 bg-zinc-800/60 rounded-xl border border-white/5 mb-5">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md transition-colors shrink-0"
                                    style={{ backgroundColor: generateUserColor(newUserName.trim() || "New") }}
                                >
                                    {getInitials(newUserName.trim() || "New")}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-white truncate">
                                        {newUserName.trim() || "New Member"}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        Auto-assigned profile color
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleAddUserSubmit}>
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newUserName}
                                        onChange={(e) => {
                                            setNewUserName(e.target.value);
                                            if (addError) setAddError("");
                                        }}
                                        placeholder="e.g. Robin"
                                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                    {addError && (
                                        <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                            {addError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setNewUserName("");
                                            setAddError("");
                                        }}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
                                    >
                                        <Plus size={16} />
                                        <span>Add Member</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

