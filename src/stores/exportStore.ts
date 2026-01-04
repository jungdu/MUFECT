import { create } from 'zustand';

interface ExportState {
    resolution: '360p' | '480p' | '720p' | '1080p';
    frameRate: 30 | 60;

    isExporting: boolean;
    progress: number;       // 0 ~ 100
    statusMessage: string;

    // result
    outputUrl: string | null;
    error: string | null;

    setResolution: (res: '360p' | '480p' | '720p' | '1080p') => void;
    setFrameRate: (fps: 30 | 60) => void;
    startExport: () => void;
    setProgress: (progress: number) => void;
    setStatusMessage: (msg: string) => void;
    completeExport: (url: string) => void;
    failExport: (error: string) => void;
    reset: () => void;
}

export const useExportStore = create<ExportState>((set) => ({
    resolution: '720p',
    frameRate: 30,

    isExporting: false,
    progress: 0,
    statusMessage: '',

    outputUrl: null,
    error: null,

    setResolution: (res) => set({ resolution: res }),
    setFrameRate: (fps) => set({ frameRate: fps }),
    startExport: () => set({ isExporting: true, progress: 0, error: null, outputUrl: null, statusMessage: 'Initializing...' }),
    setProgress: (progress) => set({ progress }),
    setStatusMessage: (msg) => set({ statusMessage: msg }),
    completeExport: (url) => set({ isExporting: false, progress: 100, outputUrl: url, statusMessage: 'Done!' }),
    failExport: (error) => set({ isExporting: false, error, statusMessage: 'Failed' }),
    reset: () => set({ isExporting: false, progress: 0, outputUrl: null, error: null, statusMessage: '' }),
}));
