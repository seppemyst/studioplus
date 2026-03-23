export type LocationName = 'Antwerp' | 'Diegem' | 'Ghent' | 'Client' | 'Home';
export type TimingChoice = 'Full Day' | 'Morning' | 'Afternoon';

export interface OfficeEntry {
    id?: string;
    name: string;
    location: LocationName;
    date: string; // YYYY-MM-DD
    timing: TimingChoice;
}
