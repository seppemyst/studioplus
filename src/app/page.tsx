"use client";

import { useAppStore } from '@/lib/store';
import ProfileSelector from '@/components/ProfileSelector';
import WeeklyOverview from '@/components/WeeklyOverview';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col pt-8 pb-12 px-4 relative">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="profile-selector"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-1 flex flex-col"
          >
            <ProfileSelector />
          </motion.div>
        ) : (
          <motion.div
            key="weekly-overview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full flex-1 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 bg-zinc-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl flex-wrap gap-4">
              <div className="flex items-center flex-wrap gap-4 sm:gap-6">
                <img src="/logo.png" alt="Studio+" className="h-8 md:h-10 object-contain ml-2" />
                <div className="hidden sm:block w-px h-10 bg-white/10"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-indigo-500/50" style={{
                    background: `hsl(${Math.abs(currentUser.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 60%)`
                  }}>
                    {currentUser.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Welcome, {currentUser}</h2>
                    <p className="text-sm text-zinc-400">Plan your weekly office presence</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
              >
                Switch Profile
              </button>
            </div>

            <WeeklyOverview />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
