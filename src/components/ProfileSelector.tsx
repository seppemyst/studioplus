"use client";

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

import { USERS, getInitials } from '@/lib/constants';

import { getUserColor } from '@/lib/constants';

export default function ProfileSelector() {
    const setCurrentUser = useAppStore((state) => state.setCurrentUser);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
                <p className="text-zinc-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
                    Select your profile to view and update your weekly office schedule.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8 max-w-6xl mx-auto"
            >
                {USERS.map((name) => (
                    <motion.button
                        key={name}
                        variants={item}
                        whileHover={{ scale: 1.1, translateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentUser(name)}
                        className="flex flex-col items-center group focus:outline-none"
                    >
                        <div
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300 ring-2 ring-white/10 group-hover:ring-white/50"
                            style={{ backgroundColor: getUserColor(name) }}
                        >
                            {getInitials(name)}
                        </div>
                        <span className="mt-3 text-sm md:text-base font-semibold text-zinc-400 group-hover:text-white transition-colors">
                            {name}
                        </span>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}
