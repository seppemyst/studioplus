import type { Metadata } from "next";
import "./globals.css";
import { DynamicBackground } from "@/components/DynamicBackground";

export const metadata: Metadata = {
  title: "Studio+ Office Locations",
  description: "EY Studio Weekly Office Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#050505] text-white">
        <DynamicBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}


