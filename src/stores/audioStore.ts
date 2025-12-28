import { create } from 'zustand';

interface AudioState {
    file: File | null;
    fileName: string;
    duration: number;

    isPlaying: boolean;
    currentTime: number;

    // We keep audio context refs outside of state mostly, or in a ref, 
    // but for simple sync we can store instances here if valid.
    // Note: Storing non-serializable data in zustand is fine.
    audioBuffer: AudioBuffer | null;
    audioContext: AudioContext | null; // For analysis
    analyser: AnalyserNode | null;

    setFile: (file: File) => void;
    setAudioData: (buffer: AudioBuffer | null, context: AudioContext, analyser: AnalyserNode) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setCurrentTime: (time: number) => void;
    reset: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
    file: null,
    fileName: '',
    duration: 0,

    isPlaying: false,
    currentTime: 0,

    audioBuffer: null,
    audioContext: null,
    analyser: null,

    setFile: (file) => set({ file, fileName: file.name }),
    setAudioData: (buffer, context, analyser) => set({ audioBuffer: buffer, audioContext: context, analyser, duration: buffer?.duration || 0 }),
    setDuration: (duration) => set({ duration }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (time) => set({ currentTime: time }),
    reset: () => set({
        file: null, fileName: '', duration: 0,
        isPlaying: false, currentTime: 0,
        audioBuffer: null, audioContext: null, analyser: null
    }),
}));
