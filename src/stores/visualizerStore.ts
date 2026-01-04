import { create } from 'zustand';

export type VisualizerType = 'bar' | 'circle' | 'line';

export interface VisualizerProperties {
    color: string;
    gradientEnabled: boolean;
    gradientStartColor: string;
    gradientEndColor: string;
    backgroundColor: string; // Global or per track? Assuming global for now per request "Black bg default", or maybe track specific? Let's keep bg global or per track. Let's make bg global for the canvas, but track props for the effect. Wait, user said "Basic value is just black background".
    // Actually, usually BG is global. Let's keep BG in the store root or assume it's black. 
    // The previous store had backgroundColor. I will keep it in the store but maybe not per track.


    positionX: number;
    positionY: number;
    width: number;
    height: number;

    barCount: number;
    barGap: number;

    sensitivity: number;
    smoothing: number;

    minFrequency: number;
    maxFrequency: number;
    minAmplitude: number;
    maxAmplitude: number;

    centerRadius: number;

    mirrored: boolean;
}

export const DEFAULT_PROPERTIES: VisualizerProperties = {
    color: '#FF1414',
    gradientEnabled: false,
    gradientStartColor: '#3b82f6',
    gradientEndColor: '#8b5cf6',
    backgroundColor: '#000000',

    positionX: 50,
    positionY: 50,
    width: 40,
    height: 40,

    barCount: 64,
    barGap: 2,
    centerRadius: 0.5,

    sensitivity: 0.8,
    smoothing: 0.8,

    minFrequency: 0,
    maxFrequency: 22000,
    minAmplitude: 0,
    maxAmplitude: 255,

    mirrored: true,
};

export interface VisualizerTrackItem {
    id: string;
    type: VisualizerType;
    name: string;
    properties: VisualizerProperties;
}

interface VisualizerState {
    tracks: VisualizerTrackItem[];
    selectedTrackId: string | null;

    // Global settings
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;

    // Actions
    addTrack: (type: VisualizerType, initialProps?: Partial<VisualizerProperties>) => void;
    removeTrack: (id: string) => void;
    selectTrack: (id: string | null) => void;
    updateTrackProperties: (id: string, props: Partial<VisualizerProperties>) => void;

    // Helper to get selected track (optional, or just use find in UI)
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
    tracks: [],
    selectedTrackId: null,
    backgroundColor: '#000000',

    setBackgroundColor: (color) => set({ backgroundColor: color }),

    addTrack: (type, initialProps) => set((state) => {
        const id = crypto.randomUUID();
        const newTrack: VisualizerTrackItem = {
            id,
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Wave`,
            properties: {
                ...DEFAULT_PROPERTIES,
                backgroundColor: state.backgroundColor,
                ...initialProps
            }
        };
        return {
            tracks: [...state.tracks, newTrack],
            selectedTrackId: id
        };
    }),

    removeTrack: (id) => set((state) => ({
        tracks: state.tracks.filter(t => t.id !== id),
        selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId
    })),

    selectTrack: (id) => set({ selectedTrackId: id }),

    updateTrackProperties: (id, props) => set((state) => ({
        tracks: state.tracks.map(t => t.id === id ? { ...t, properties: { ...t.properties, ...props } } : t)
    })),
}));
