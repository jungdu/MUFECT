import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { useExportStore } from '../../stores/exportStore';
import { useVisualizerStore } from '../../stores/visualizerStore';

export class FFmpegExporter {
    private ffmpeg: FFmpeg;
    private renderer: CanvasRenderer;
    private shouldCancel: boolean = false;
    private active: boolean = false;

    constructor() {
        this.ffmpeg = new FFmpeg();
        this.renderer = new CanvasRenderer();
    }

    async load() {
        if (!this.ffmpeg.loaded) {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
        }
    }

    cancel() {
        if (this.active) {
            this.shouldCancel = true;
            const store = useExportStore.getState();
            store.setStatusMessage('Cancelling...');
        }
    }

    async exportVideo(
        audioBuffer: AudioBuffer,
        audioFile: File,
        width: number = 1920,
        height: number = 1080,
        fps: number = 60
    ) {
        const store = useExportStore.getState();
        const visualizerState = useVisualizerStore.getState();

        this.shouldCancel = false;
        this.active = true;

        let offlineCtx: OfflineAudioContext | null = null;
        let createdFiles: string[] = [];

        const cleanup = async () => {
            try {
                for (const file of createdFiles) {
                    try {
                        await this.ffmpeg.deleteFile(file);
                    } catch (e) { /* ignore */ }
                }
                try {
                    await this.ffmpeg.deleteFile('input.mp3');
                } catch (e) { /* ignore */ }
                try {
                    await this.ffmpeg.deleteFile('output.mp4');
                } catch (e) { /* ignore */ }
            } catch (e) {
                console.error('Cleanup error', e);
            }
            createdFiles = [];
        };

        try {
            store.setStatusMessage('Loading Core...');
            await this.load();

            if (this.shouldCancel) throw new Error('Export cancelled');

            store.setStatusMessage('Preparing Audio Analysis...');
            // 1. Setup Offline Context
            const duration = audioBuffer.duration;
            const totalFrames = Math.floor(duration * fps);

            // Using a distinct OfflineContext
            offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = offlineCtx.createAnalyser();
            analyser.fftSize = 2048;
            // distinct smoothing is handled by renderer or we default it here if needed, 
            // but renderer handles data update. 
            // If we want to ensure it's set before any potential usage:
            const smoothing = visualizerState.tracks.length > 0 ? visualizerState.tracks[0].properties.smoothing : 0.8;
            analyser.smoothingTimeConstant = smoothing;

            source.connect(analyser);
            analyser.connect(offlineCtx.destination);

            // 2. Prepare Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;

            // 3. Render Loop
            source.start(0);

            store.setStatusMessage('Rendering Frames...');

            let frameIndex = 0;
            const frameDuration = 1 / fps;

            const finalize = async () => {
                if (this.shouldCancel) {
                    await cleanup();
                    store.reset();
                    this.active = false;
                    return;
                }

                store.setStatusMessage('Encoding Video...');

                // Write Audio
                const audioData = await fetchFile(audioFile);
                await this.ffmpeg.writeFile('input.mp3', audioData);
                // createdFiles.push('input.mp3'); // We delete explicitly in cleanup

                // Run FFmpeg
                store.setStatusMessage('Running FFmpeg (this may take a while)...');

                // -framerate 30 -i frame%05d.png -i input.mp3 -c:v libx264 -pix_fmt yuv420p -c:a copy output.mp4
                await this.ffmpeg.exec([
                    '-framerate', fps.toString(),
                    '-i', 'frame%05d.jpg',
                    '-i', 'input.mp3',
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast', // Speed up encoding
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-shortest',
                    'output.mp4'
                ]);

                if (this.shouldCancel) {
                    await cleanup();
                    store.reset();
                    this.active = false;
                    return;
                }

                // Read result
                const data = await this.ffmpeg.readFile('output.mp4');
                const videoBlob = new Blob([data as any], { type: 'video/mp4' });
                const url = URL.createObjectURL(videoBlob);

                store.completeExport(url);
                store.setStatusMessage('Export Complete!');

                this.active = false;

                // Cleanup files after success too?
                await cleanup();
            };

            const processFrame = async () => {
                if (this.shouldCancel) {
                    await cleanup();
                    store.reset();
                    this.active = false;
                    return;
                }

                // Render Visualizer
                this.renderer.render(
                    ctx,
                    width,
                    height,
                    analyser,
                    visualizerState.tracks,
                    { backgroundColor: visualizerState.backgroundColor }
                );

                // Get Blob
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                if (blob) {
                    const data = await fetchFile(blob);
                    const filename = `frame${frameIndex.toString().padStart(5, '0')}.jpg`;
                    await this.ffmpeg.writeFile(filename, data);
                    createdFiles.push(filename);
                }

                frameIndex++;
                store.setProgress((frameIndex / totalFrames) * 80); // 80% for rendering

                // Schedule next or finish
                if (frameIndex < totalFrames) {
                    const nextTime = frameIndex * frameDuration;
                    if (nextTime < duration) {
                        // Check cancel before suspend
                        if (this.shouldCancel) {
                            await cleanup();
                            store.reset();
                            this.active = false;
                            return;
                        }

                        // We must suspend at the specific time.
                        // Note: suspend time is absolute time in the context
                        offlineCtx!.suspend(nextTime).then(processFrame);
                        offlineCtx!.resume();
                    } else {
                        // Done rendering
                        await finalize();
                    }
                } else {
                    await finalize();
                }
            };

            // Initial trigger
            offlineCtx.suspend(0).then(processFrame);
            offlineCtx.startRendering();

        } catch (error: any) {
            console.error(error);
            store.failExport(error.message);
            this.active = false;
            await cleanup();
        }
    }
}
