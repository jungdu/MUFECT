import { create } from 'zustand';

export type VisualizerType = 'bar' | 'circle' | 'line' | 'image';

export interface VisualizerProperties {
    color: string;
    gradientEnabled: boolean;
    gradientStartColor: string;
    gradientEndColor: string;
    backgroundColor: string;

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

    // Image Props
    imageUrl?: string;
    maintainAspectRatio?: boolean;
    imageRatio?: number; // width / height
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

    maintainAspectRatio: true,
    imageRatio: 1,
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
    addTrack: (type: VisualizerType, initialProps?: Partial<VisualizerProperties>, name?: string) => void;
    removeTrack: (id: string) => void;
    selectTrack: (id: string | null) => void;
    updateTrackProperties: (id: string, props: Partial<VisualizerProperties>) => void;
    reorderTrack: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
    reset: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
    tracks: [],
    selectedTrackId: null,
    backgroundColor: '#000000',

    setBackgroundColor: (color) => set({ backgroundColor: color }),

    addTrack: (type, initialProps, name) => set((state) => {
        const id = crypto.randomUUID();
        const newTrack: VisualizerTrackItem = {
            id,
            type,
            name: name || (type === 'image' ? 'Image Layer' : `${type.charAt(0).toUpperCase() + type.slice(1)} Wave`),
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

    reorderTrack: (id, direction) => set((state) => {
        const index = state.tracks.findIndex(t => t.id === id);
        if (index === -1) return state;

        const newTracks = [...state.tracks];
        const track = newTracks[index];

        // Improve: Handle edges properly
        if (direction === 'front') {
            newTracks.splice(index, 1);
            newTracks.push(track);
        } else if (direction === 'back') {
            newTracks.splice(index, 1);
            newTracks.unshift(track);
        } else if (direction === 'forward') {
            if (index < newTracks.length - 1) {
                newTracks[index] = newTracks[index + 1];
                newTracks[index + 1] = track;
            }
        } else if (direction === 'backward') {
            if (index > 0) {
                newTracks[index] = newTracks[index - 1];
                newTracks[index - 1] = track;
            }
        }

        return { tracks: newTracks };
    }),

    reset: () => set({
        tracks: [],
        selectedTrackId: null,
        backgroundColor: '#000000',
    }),
}));

