export const USERS_DATA = [
    { name: "Alexandra", color: "#FF5F1F" },
    { name: "Anne-Sophie", color: "#39FF14" },
    { name: "Brent", color: "#BC13FE" },
    { name: "Bruno", color: "#00FFFF" },
    { name: "David", color: "#FF10F0" },
    { name: "Eline", color: "#FFDF00" },
    { name: "Ellen", color: "#00FF7F" },
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
    { name: "Nurya", color: "#DA70D6" },
    { name: "Robbe", color: "#32CD32" },
    { name: "Seb", color: "#FF8C00" },
    { name: "Seppe", color: "#9400D3" },
    { name: "Simon", color: "#00FA9A" },
    { name: "Sofia", color: "#FF1493" },
    { name: "Sofie", color: "#00BFFF" }
].sort((a, b) => a.name.localeCompare(b.name));

export const USERS = USERS_DATA.map(u => u.name);

export function getUserColor(name: string) {
    return USERS_DATA.find(u => u.name === name)?.color || "#FFFFFF";
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
