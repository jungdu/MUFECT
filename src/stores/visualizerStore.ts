import { create } from 'zustand';

export type VisualizerType = 'bar' | 'circle' | 'line';

interface VisualizerState {
    effectType: VisualizerType;

    color: string;
    gradientEnabled: boolean;
    gradientStartColor: string;
    gradientEndColor: string;
    backgroundColor: string;

    scale: number;          // 0.5 ~ 2.0
    positionX: number;      // 0 ~ 100 (%)
    positionY: number;      // 0 ~ 100 (%)

    barCount: number;       // 16 ~ 128
    barWidth: number;       // 1 ~ 20 (px or relative)
    barGap: number;         // 0 ~ 10

    sensitivity: number;    // 0 ~ 1
    smoothing: number;      // 0 ~ 0.99

    // Audio Analysis & Range
    minFrequency: number;   // 20 ~ 20000
    maxFrequency: number;   // 20 ~ 20000
    minAmplitude: number;   // 0 ~ 255
    maxAmplitude: number;   // 0 ~ 255

    setEffectType: (type: VisualizerType) => void;
    setColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    setScale: (scale: number) => void;
    setPosition: (x: number, y: number) => void;
    setBarCount: (count: number) => void;
    setBarWidth: (width: number) => void;
    setBarGap: (gap: number) => void;
    setSensitivity: (value: number) => void;
    setSmoothing: (value: number) => void;
    // New Setters
    setMinFrequency: (value: number) => void;
    setMaxFrequency: (value: number) => void;
    setMinAmplitude: (value: number) => void;
    setMaxAmplitude: (value: number) => void;

    mirrored: boolean;
    setMirrored: (mirrored: boolean) => void;
}

export const VISUALIZER_DEFAULTS = {
    effectType: 'bar' as VisualizerType,
    color: '#FF1414', // requested 255, 20, 20
    gradientEnabled: false,
    gradientStartColor: '#3b82f6',
    gradientEndColor: '#8b5cf6',
    backgroundColor: '#000000', // requested black

    scale: 1.0,
    positionX: 50,
    positionY: 50,

    barCount: 64,
    barWidth: 6,
    barGap: 2,

    sensitivity: 0.8,
    smoothing: 0.8,

    minFrequency: 0,
    maxFrequency: 22000,
    minAmplitude: 0,
    maxAmplitude: 255,
    mirrored: true,
};

export const useVisualizerStore = create<VisualizerState>((set) => ({
    ...VISUALIZER_DEFAULTS,

    setEffectType: (type) => set({ effectType: type }),
    setColor: (color) => set({ color }),
    setBackgroundColor: (color) => set({ backgroundColor: color }),
    setScale: (scale) => set({ scale }),
    setPosition: (x, y) => set({ positionX: x, positionY: y }),
    setBarCount: (count) => set({ barCount: count }),
    setBarWidth: (width) => set({ barWidth: width }),
    setBarGap: (gap) => set({ barGap: gap }),
    setSensitivity: (value) => set({ sensitivity: value }),
    setSmoothing: (value) => set({ smoothing: value }),

    setMinFrequency: (value) => set({ minFrequency: value }),
    setMaxFrequency: (value) => set({ maxFrequency: value }),
    setMinAmplitude: (value) => set({ minAmplitude: value }),
    setMaxAmplitude: (value) => set({ maxAmplitude: value }),

    setMirrored: (mirrored) => set({ mirrored }),
}));
