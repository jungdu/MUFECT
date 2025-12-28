export class AudioAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;

    private gainNode: GainNode | null = null;

    // Buffers
    private audioBuffer: AudioBuffer | null = null;

    constructor() {
        // We don't initialize AudioContext immediately to avoid auto-play policy issues
        // It will be initialized on file load or user interaction
    }

    async loadFile(file: File): Promise<AudioBuffer> {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const arrayBuffer = await file.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        return this.audioBuffer;
    }

    init() {
        if (!this.audioContext) return;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048; // Default
        this.analyser.smoothingTimeConstant = 0.8;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
    }

    // Note: We might use wavesurfer for playback, so this manual player 
    // might be secondary or used for the analysis/export only.
    // However, for the visualizer to be in sync, it's often best to tap into the same stream.
    // If we use Wavesurfer, we can get the backend media element or audio context from it.

    getAnalyser() {
        return this.analyser;
    }

    getAudioContext() {
        return this.audioContext;
    }
}

export const audioAnalyzer = new AudioAnalyzer(); // Singleton or mostly singleton usage
