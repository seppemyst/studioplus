export const USERS_DATA = [
    { name: "Alexandra", color: "#FF5F1F" },
    { name: "Anne-Sophie", color: "#39FF14" },
    { name: "Brent", color: "#BC13FE" },
    { name: "Bruno", color: "#00FFFF" },
    { name: "David", color: "#FF10F0" },
    { name: "Eline", color: "#FFDF00" },
    { name: "Ellen", color: "#00FF7F" },
    { name: "Emir", color: "#FF3366" },
    { name: "Ghizlane", color: "#FF007F" },
    { name: "Hanne", color: "#7F00FF" },
    { name: "Kevin", color: "#007FFF" },
    { name: "Laura", color: "#FFBF00" },
    { name: "Margaux", color: "#8B00FF" },
    { name: "Margot", color: "#00CED1" },
    { name: "Marie", color: "#FF69B4" },
    { name: "Mathilde", color: "#ADFF2F" },
    { name: "Mathieu", color: "#FF4500" },
    { name: "Michael", color: "#1E90FF" },
    { name: "Nicoletta", color: "#DA70D6" },
    { name: "Sara", color: "#F08080" },
    { name: "Robbe", color: "#32CD32" },
    { name: "Seb", color: "#FF8C00" },
    { name: "Seppe", color: "#9400D3" },
    { name: "Simon", color: "#00FA9A" },
    { name: "Sofia", color: "#FF1493" },
    { name: "Sofie", color: "#00BFFF" }
].sort((a, b) => a.name.localeCompare(b.name));

export const USERS = USERS_DATA.map(u => u.name);

export const PALETTE = [
    "#FF5F1F", "#39FF14", "#BC13FE", "#00FFFF", "#FF10F0",
    "#FFDF00", "#00FF7F", "#FF3366", "#FF007F", "#7F00FF",
    "#007FFF", "#FFBF00", "#8B00FF", "#00CED1", "#FF69B4",
    "#ADFF2F", "#FF4500", "#1E90FF", "#DA70D6", "#F08080",
    "#32CD32", "#FF8C00", "#9400D3", "#00FA9A", "#FF1493",
    "#00BFFF", "#E11D48", "#10B981", "#6366F1", "#EC4899"
];

export function generateUserColor(name: string): string {
    if (!name) return "#6366F1";
    const hash = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return PALETTE[hash % PALETTE.length];
}

export function getUserColor(name: string, customUsers?: { name: string; color: string }[]): string {
    if (customUsers) {
        const foundCustom = customUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (foundCustom) return foundCustom.color;
    }
    const found = USERS_DATA.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (found) return found.color;
    return generateUserColor(name);
}


export const LOCATIONS = [
    { id: 'antwerp', name: 'Antwerp', color: 'bg-[#FF5F1F] text-white', accent: '#FF5F1F' }, // Vibrant Orange
    { id: 'diegem', name: 'Diegem', color: 'bg-[#39FF14] text-black', accent: '#39FF14' }, // Neon Green
    { id: 'ghent', name: 'Ghent', color: 'bg-[#BC13FE] text-white', accent: '#BC13FE' }, // Neon Purple
    { id: 'client', name: 'Client', color: 'bg-[#00FFFF] text-black', accent: '#00FFFF' }, // Cyan
    { id: 'home', name: 'Home', color: 'bg-[#FF10F0] text-white', accent: '#FF10F0' }, // Hot Pink
] as const;


export type LocationId = typeof LOCATIONS[number]['id'];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type Day = typeof DAYS[number];

export const TIMES = ['Full Day', 'Morning', 'Afternoon'] as const;
export type Time = typeof TIMES[number];

export function getInitials(name: string) {
    if (name.includes('-')) {
        return name.split('-').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
}
