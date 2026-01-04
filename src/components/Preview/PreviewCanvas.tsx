import React, { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { useAudioStore } from '../../stores/audioStore';
import { CanvasRenderer } from '../../core/renderer/CanvasRenderer';

const renderer = new CanvasRenderer();

export const PreviewCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>(0);

    // Subscribe to stores
    // We access store state directly in loop to avoid re-renders of this component
    // dragging sliders would cause too many re-renders if we put them in dependancy array of useEffect
    // So we use refs or getState inside the loop.

    useEffect(() => {
        // Trigger re-render if needed or just let loop handle it?
        // Loop handles drawing.
    }, []);

    useEffect(() => {
        const renderLoop = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // Resize if needed
            if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
                const audioState = useAudioStore.getState();
                const visualizerState = useVisualizerStore.getState();

                // Logic to persist canvas on pause:
                // If playing: Render normally (clears + draws new frame).
                // If paused (!isPlaying + analyser exists): Skip render effectively "freezing" the last frame.
                // If stopped/no file (!analyser): Render normally (clears screen).

                const shouldUpdateData = audioState.isPlaying || audioState.currentTime === 0;

                renderer.render(
                    ctx,
                    canvas.width,
                    canvas.height,
                    audioState.analyser,
                    visualizerState.tracks,
                    { backgroundColor: visualizerState.backgroundColor },
                    shouldUpdateData
                );
            }

            animationFrameRef.current = requestAnimationFrame(renderLoop);
        };

        animationFrameRef.current = requestAnimationFrame(renderLoop);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []); // Run once, connect loop

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] bg-black rounded-lg overflow-hidden shadow-2xl relative">
            <canvas ref={canvasRef} className="block" />

            {/* Overlay if no audio */}
            {!useAudioStore.getState().file && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-secondary/50 font-mono">Upload audio to start visualization</p>
                </div>
            )}
        </div>
    );
};
