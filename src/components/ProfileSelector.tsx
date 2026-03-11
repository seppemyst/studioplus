"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { USERS, getInitials, getUserColor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function ProfileSelector() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSelectProfile = (user: string) => {
        localStorage.setItem('studioplus_user', user);
        router.push('/planner');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl text-center mb-16 flex flex-col items-center"
            >
                <Image
                    src="/assets/logo.webp"
                    alt="Studio+ Logo"
                    width={300}
                    height={150}
                    className="mb-6 drop-shadow-[0_0_20px_rgba(255,230,0,0.3)] h-auto w-auto max-w-[200px] sm:max-w-[300px]"
                    priority
                />
                <p className="text-ey-grey uppercase tracking-[0.4em] text-[10px] font-black opacity-60">
                    Project Identity
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-8 w-full max-w-5xl"
            >
                {USERS.map((user, index) => (
                    <motion.button
                        key={user}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.02 * index }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectProfile(user)}
                        className="flex flex-col items-center group"
                    >
                        <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border flex items-center justify-center text-white font-black text-2xl sm:text-3xl mb-3 transition-all duration-300 ey-shadow shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:border-white/40"
                            style={{ backgroundColor: `${getUserColor(user)}22`, borderColor: `${getUserColor(user)}44` }}
                        >
                            <span style={{ color: getUserColor(user) }}>{getInitials(user)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors truncate w-full text-center px-1">
                            {user}
                        </span>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}
