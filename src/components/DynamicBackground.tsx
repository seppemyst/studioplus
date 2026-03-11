"use client";

import { motion } from "framer-motion";

export function DynamicBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
            {/* Primary blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF5F1F]/10 blur-[120px] animate-blob" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#BC13FE]/10 blur-[120px] animate-blob" style={{ animationDelay: "2s" }} />
            <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#FFE600]/5 blur-[120px] animate-blob" style={{ animationDelay: "4s" }} />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
    );
}
