import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { useExportStore } from '../../stores/exportStore';
import { useVisualizerStore } from '../../stores/visualizerStore';

export class WebCodecsExporter {
    private renderer: CanvasRenderer;
    private shouldCancel: boolean = false;
    private active: boolean = false;

    constructor() {
        this.renderer = new CanvasRenderer();
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
        let videoEncoder: VideoEncoder | null = null;
        let audioEncoder: AudioEncoder | null = null;
        let muxer: Muxer<ArrayBufferTarget> | null = null;

        try {
            store.setStatusMessage('Initializing Encoders...');

            // 1. Setup Muxer
            muxer = new Muxer({
                target: new ArrayBufferTarget(),
                video: {
                    codec: 'avc',
                    width,
                    height,
                },
                audio: {
                    codec: 'aac',
                    sampleRate: audioBuffer.sampleRate,
                    numberOfChannels: audioBuffer.numberOfChannels,
                },
                fastStart: 'in-memory',
            });

            // 2. Setup Video Encoder
            videoEncoder = new VideoEncoder({
                output: (chunk, meta) => muxer!.addVideoChunk(chunk, meta),
                error: (e) => console.error('VideoEncoder error', e),
            });

            const videoConfig: VideoEncoderConfig = {
                codec: 'avc1.42001f', // Baseline Profile Level 3.1 (Compatible) or avc1.64001f (High)
                width,
                height,
                bitrate: 10_000_000, // 10 Mbps
                framerate: fps,
            };

            // Validate config
            const support = await VideoEncoder.isConfigSupported(videoConfig);
            if (!support.supported) {
                // Fallback or error
                console.warn('Config not supported, trying generic avc1.4d002a');
                videoConfig.codec = 'avc1.4d002a'; // Main Profile
            }

            videoEncoder.configure(videoConfig);

            // 3. Setup Audio Encoder
            audioEncoder = new AudioEncoder({
                output: (chunk, meta) => muxer!.addAudioChunk(chunk, meta),
                error: (e) => console.error('AudioEncoder error', e),
            });

            audioEncoder.configure({
                codec: 'mp4a.40.2', // AAC LC
                sampleRate: audioBuffer.sampleRate,
                numberOfChannels: audioBuffer.numberOfChannels,
                bitrate: 128_000,
            });

            // 4. Setup Audio Processing / Rendering
            const duration = audioBuffer.duration;
            const totalFrames = Math.floor(duration * fps);

            // Setup Offline Context for analysis
            offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = offlineCtx.createAnalyser();
            analyser.fftSize = 2048;
            const smoothing = visualizerState.tracks.length > 0 ? visualizerState.tracks[0].properties.smoothing : 0.8;
            analyser.smoothingTimeConstant = smoothing;

            source.connect(analyser);
            analyser.connect(offlineCtx.destination);

            // Prepare Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: false })!; // optimizing for speed

            // Start Analysis
            source.start(0);

            store.setStatusMessage('Rendering & Encoding...');

            let frameIndex = 0;
            const frameDuration = 1 / fps;
            const microsecondPerFrame = 1_000_000 / fps;

            // Audio Encoding Helper
            // We need to feed raw audio data to AudioEncoder. 
            // The OfflineAudioContext does give us rendered audio, but only at the END.
            // However, we want to stream it? 
            // Actually, for MP4 export, we can render the whole audio first (it's fast) and then chop it?
            // OR we can just use the AudioBuffer we already have!
            // We just need to create AudioData objects from the AudioBuffer.

            const encodeAudio = async () => {
                store.setStatusMessage('Encoding Audio...');
                // Convert AudioBuffer to AudioData
                // AudioData requires interleaved or planar data.
                // We will create AudioData chunks.

                const numberOfChannels = audioBuffer.numberOfChannels;
                const sampleRate = audioBuffer.sampleRate;
                const samplesPerChunk = sampleRate; // 1 second chunks

                let offset = 0;
                while (offset < audioBuffer.length) {
                    if (this.shouldCancel) return;

                    const left = audioBuffer.length - offset;
                    const len = Math.min(left, samplesPerChunk);

                    // Create timestamps
                    const timestamp = (offset / sampleRate) * 1_000_000;

                    // Interleave only if needed? AudioData accepts different formats.
                    // But AudioData init dict takes a buffer.
                    // Copy channel data to a new Float32Array
                    // Format 'f32-planar' means we can pass concatenated channels? No.
                    // 'f32-planar': The buffer contains the data for the first channel, followed by the second...

                    const data = new Float32Array(len * numberOfChannels);
                    for (let ch = 0; ch < numberOfChannels; ch++) {
                        const channelData = audioBuffer.getChannelData(ch);
                        // copy subarray
                        data.set(channelData.subarray(offset, offset + len), ch * len);
                    }

                    const audioData = new AudioData({
                        format: 'f32-planar',
                        sampleRate,
                        numberOfFrames: len,
                        numberOfChannels,
                        timestamp,
                        data
                    });

                    audioEncoder!.encode(audioData);
                    audioData.close();

                    offset += len;

                    // Yield to event loop slightly
                    await new Promise(r => setTimeout(r, 0));
                }

                await audioEncoder!.flush();
            };

            // Start Audio Encoding in background (or await it first, it's safer to await or do parallel)
            // Let's do it parallel? Rendering consumes GPU/CPU, Audio consumes CPU.
            // Better to do it after or before? Video is the bottleneck. Let's do audio first to get it out of the way.
            await encodeAudio();
            if (this.shouldCancel) {
                store.reset();
                this.active = false;
                return;
            }

            // Video Render Loop
            const processFrame = async () => {
                if (this.shouldCancel) {
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

                // Create VideoFrame from Canvas
                const frame = new VideoFrame(canvas, {
                    timestamp: frameIndex * microsecondPerFrame,
                    duration: microsecondPerFrame
                });

                // Encode
                // keyFrame every 2 seconds (2 * 60 = 120 frames)
                const keyFrame = frameIndex % 120 === 0;
                videoEncoder!.encode(frame, { keyFrame });
                frame.close();

                frameIndex++;
                store.setProgress((frameIndex / totalFrames) * 100);

                // Schedule next
                if (frameIndex < totalFrames) {
                    const nextTime = frameIndex * frameDuration;
                    if (nextTime < duration) {
                        try {
                            // Suspend/Resume OfflineContext to get frequency data at that point?
                            // OfflineAudioContext runs in faster-than-realtime. 
                            // If we just `suspend` -> `resume`, it jumps forward.
                            // We need to step it carefully.

                            // Suspend at the EXACT next time.
                            // However, we are already at 0.
                            // offlineCtx.suspend(nextTime).then(processFrame);
                            // offlineCtx.resume();
                            // WAIT: On Safari/WebCodecs, offlineCtx behaves same as standard.

                            // Important: We loop recursively.
                            // We are inside a callback from suspend most likely.
                            // But here we are calling it manually first? No.

                            // We need to chain suspends.
                            // But we can't schedule next suspend inside suspend? Actually we can.

                            // Optimization: Check for backlog of encoded frames to avoid OOM?
                            if (videoEncoder!.encodeQueueSize > 5) {
                                // Wait for encoder to catch up
                                await new Promise(r => {
                                    const check = () => {
                                        if (videoEncoder!.encodeQueueSize > 2) setTimeout(check, 5);
                                        else r(null);
                                    };
                                    check();
                                });
                            }

                            // Continue rendering
                            offlineCtx!.suspend(nextTime).then(processFrame);
                            offlineCtx!.resume();

                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        // Done
                        await finalize();
                    }
                } else {
                    await finalize();
                }
            };

            const finalize = async () => {
                store.setStatusMessage('Finalizing...');
                await videoEncoder!.flush();

                // Finalize Muxer
                muxer!.finalize();

                const buffer = muxer!.target.buffer;
                const blob = new Blob([buffer], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);

                store.completeExport(url);
                store.setStatusMessage('Export Complete!');
                this.active = false;
            };

            // Start Loop
            offlineCtx.suspend(0).then(processFrame);
            offlineCtx.startRendering();

        } catch (error: any) {
            console.error(error);
            store.failExport(error.message);
            this.active = false;
        }
    }
}
