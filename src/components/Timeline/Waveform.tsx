import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioStore } from '../../stores/audioStore';
import { useVisualizerStore } from '../../stores/visualizerStore';

export const Waveform: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const { file, isPlaying, setIsPlaying, setDuration, setCurrentTime, setAudioData } = useAudioStore();
    const { color } = useVisualizerStore();

    useEffect(() => {
        if (!containerRef.current || !file) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#64748b',
            progressColor: color,
            cursorColor: '#ffffff',
            barWidth: 2,
            barGap: 2,
            height: 64,
            normalize: true,
            url: URL.createObjectURL(file), // Helper to load file
        });

        wavesurferRef.current = ws;

        ws.on('ready', async () => {
            setDuration(ws.getDuration());

            // Setup Analyser
            const mediaElement = ws.getMediaElement();
            if (mediaElement) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const ac = new AudioContext();

                // Fix for "The AudioContext was not allowed to start"
                const resumeCtx = () => {
                    if (ac.state === 'suspended') ac.resume();
                };
                document.addEventListener('click', resumeCtx, { once: true });

                const source = ac.createMediaElementSource(mediaElement);
                const analyser = ac.createAnalyser();
                analyser.fftSize = 2048;

                source.connect(analyser);
                analyser.connect(ac.destination);

                // Decode AudioBuffer for Export Use
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const decodedBuffer = await ac.decodeAudioData(arrayBuffer);
                    setAudioData(decodedBuffer, ac, analyser);
                } catch (err) {
                    console.error('Failed to decode audio data', err);
                    // Still set context/analyser so visualization works
                    setAudioData(null, ac, analyser);
                }

                (window as any).__AUDIO_ANALYSER__ = analyser;
            }
        });

        ws.on('audioprocess', (time) => {
            setCurrentTime(time);
        });

        ws.on('interaction', () => {
            const time = ws.getCurrentTime();
            setCurrentTime(time);

            // If the user clicks to seek, we might need to sync play state
            // but wavesurfer handles seek natively
        });

        ws.on('finish', () => {
            setIsPlaying(false);
        });

        return () => {
            ws.destroy();
        };
    }, [file]);

    // Sync play state
    useEffect(() => {
        if (!wavesurferRef.current) return;

        if (isPlaying) {
            wavesurferRef.current.play();
        } else {
            wavesurferRef.current.pause();
        }
    }, [isPlaying]);

    // Sync color
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setOptions({ progressColor: color });
        }
    }, [color]);

    return (
        <div className="w-full">
            <div ref={containerRef} />
        </div>
    );
};
