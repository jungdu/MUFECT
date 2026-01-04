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

    // Interaction State
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragMode, setDragMode] = React.useState<'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null>(null);
    const [dragTargetId, setDragTargetId] = React.useState<string | null>(null);
    const [startPos, setStartPos] = React.useState<{ x: number, y: number } | null>(null);
    const [startProps, setStartProps] = React.useState<{ x: number, y: number, w: number, h: number } | null>(null);

    const getCanvasCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, width: 0, height: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            width: rect.width,
            height: rect.height
        };
    };

    const getTrackRect = (track: any, width: number, height: number) => {
        const w = width * (track.properties.width / 100);
        const h = height * (track.properties.height / 100);
        const x = (width * (track.properties.positionX / 100)) - (w / 2);
        const y = (height * (track.properties.positionY / 100)) - (h / 2);
        return { x, y, w, h };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y, width, height } = getCanvasCoords(e);
        const tracks = useVisualizerStore.getState().tracks;
        const selectedId = useVisualizerStore.getState().selectedTrackId;
        const selectTrack = useVisualizerStore.getState().selectTrack;

        // 1. Check Resize Handles of Selected Track first
        if (selectedId) {
            const track = tracks.find(t => t.id === selectedId);
            if (track) {
                const rect = getTrackRect(track, width, height);
                const handleSize = 8;
                // Corners
                if (Math.abs(x - rect.x) < handleSize && Math.abs(y - rect.y) < handleSize) {
                    setIsDragging(true); setDragMode('resize-nw'); setDragTargetId(selectedId);
                    setStartPos({ x, y });
                    setStartProps({ x: track.properties.positionX, y: track.properties.positionY, w: track.properties.width, h: track.properties.height });
                    return;
                }
                if (Math.abs(x - (rect.x + rect.w)) < handleSize && Math.abs(y - rect.y) < handleSize) {
                    setIsDragging(true); setDragMode('resize-ne'); setDragTargetId(selectedId);
                    setStartPos({ x, y });
                    setStartProps({ x: track.properties.positionX, y: track.properties.positionY, w: track.properties.width, h: track.properties.height });
                    return;
                }
                if (Math.abs(x - rect.x) < handleSize && Math.abs(y - (rect.y + rect.h)) < handleSize) {
                    setIsDragging(true); setDragMode('resize-sw'); setDragTargetId(selectedId);
                    setStartPos({ x, y });
                    setStartProps({ x: track.properties.positionX, y: track.properties.positionY, w: track.properties.width, h: track.properties.height });
                    return;
                }
                if (Math.abs(x - (rect.x + rect.w)) < handleSize && Math.abs(y - (rect.y + rect.h)) < handleSize) {
                    setIsDragging(true); setDragMode('resize-se'); setDragTargetId(selectedId);
                    setStartPos({ x, y });
                    setStartProps({ x: track.properties.positionX, y: track.properties.positionY, w: track.properties.width, h: track.properties.height });
                    return;
                }
            }
        }

        // 2. Check Hit Test (Reverse order)
        for (let i = tracks.length - 1; i >= 0; i--) {
            const track = tracks[i];
            const rect = getTrackRect(track, width, height);

            if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
                selectTrack(track.id);
                setIsDragging(true);
                setDragMode('move');
                setDragTargetId(track.id);
                setStartPos({ x, y });
                setStartProps({ x: track.properties.positionX, y: track.properties.positionY, w: track.properties.width, h: track.properties.height });
                return;
            }
        }

        // Deselect if clicked empty
        selectTrack(null);
    };

    // ... (imports remain)

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y, width, height } = getCanvasCoords(e);
        const canvas = canvasRef.current;

        // Cursor Update Logic (When not dragging)
        if (!isDragging && canvas) {
            const tracks = useVisualizerStore.getState().tracks;
            const selectedId = useVisualizerStore.getState().selectedTrackId;
            let cursor = 'default';

            if (selectedId) {
                const track = tracks.find(t => t.id === selectedId);
                if (track) {
                    const rect = getTrackRect(track, width, height);
                    const handleSize = 8;
                    // Check handles
                    if (Math.abs(x - rect.x) < handleSize && Math.abs(y - rect.y) < handleSize) cursor = 'nw-resize';
                    else if (Math.abs(x - (rect.x + rect.w)) < handleSize && Math.abs(y - rect.y) < handleSize) cursor = 'ne-resize';
                    else if (Math.abs(x - rect.x) < handleSize && Math.abs(y - (rect.y + rect.h)) < handleSize) cursor = 'sw-resize';
                    else if (Math.abs(x - (rect.x + rect.w)) < handleSize && Math.abs(y - (rect.y + rect.h)) < handleSize) cursor = 'se-resize';
                    // Check move
                    else if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) cursor = 'move';
                }
            }

            // Check other tracks if no specific cursor yet
            if (cursor === 'default') {
                for (let i = tracks.length - 1; i >= 0; i--) {
                    const track = tracks[i];
                    const rect = getTrackRect(track, width, height);
                    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
                        cursor = 'move';
                        break;
                    }
                }
            }

            canvas.style.cursor = cursor;
        }

        if (!isDragging || !dragTargetId || !startPos || !startProps) return;

        const dx = x - startPos.x;
        const dy = y - startPos.y;

        // Convert delta to percentages
        const dxPerc = (dx / width) * 100;
        const dyPerc = (dy / height) * 100;

        const update = useVisualizerStore.getState().updateTrackProperties;

        const round1 = (num: number) => Math.round(num * 100) / 100;

        if (dragMode === 'move') {
            update(dragTargetId, {
                positionX: round1(startProps.x + dxPerc),
                positionY: round1(startProps.y + dyPerc)
            });
        } else if (dragMode?.startsWith('resize')) {
            // Explicit Edge-based resizing for robustness
            const startLeft = startProps.x - startProps.w / 2;
            const startRight = startProps.x + startProps.w / 2;
            const startTop = startProps.y - startProps.h / 2;
            const startBottom = startProps.y + startProps.h / 2;

            let newLeft = startLeft;
            let newRight = startRight;
            let newTop = startTop;
            let newBottom = startBottom;

            // Apply Mouse Delta (in %)
            if (dragMode === 'resize-nw') {
                newLeft += dxPerc;
                newTop += dyPerc;
            } else if (dragMode === 'resize-ne') {
                newRight += dxPerc;
                newTop += dyPerc;
            } else if (dragMode === 'resize-sw') {
                newLeft += dxPerc;
                newBottom += dyPerc;
            } else if (dragMode === 'resize-se') {
                newRight += dxPerc;
                newBottom += dyPerc;
            }

            // Apply Constraints (Min Width/Height 5%)
            // We only constrain the Moving Edge relative to the Fixed Edge
            if (dragMode.includes('w')) { // West moving
                newLeft = Math.min(newLeft, newRight - 5);
            } else { // East moving
                newRight = Math.max(newRight, newLeft + 5);
            }

            if (dragMode.includes('n')) { // North moving
                newTop = Math.min(newTop, newBottom - 5);
            } else { // South moving
                newBottom = Math.max(newBottom, newTop + 5);
            }

            // Recalculate Props
            const newW = newRight - newLeft;
            const newH = newBottom - newTop;
            const newX = newLeft + newW / 2;
            const newY = newTop + newH / 2;

            update(dragTargetId, {
                width: round1(newW),
                height: round1(newH),
                positionX: round1(newX),
                positionY: round1(newY)
            });
        }
    };



    const handleMouseUp = () => {
        setIsDragging(false);
        setDragMode(null);
        setDragTargetId(null);
    };

    // Overlay Render
    const renderOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const visualizerState = useVisualizerStore.getState();
        const selectedId = visualizerState.selectedTrackId;
        if (!selectedId) return;

        const track = visualizerState.tracks.find(t => t.id === selectedId);
        if (!track) return;

        const rect = getTrackRect(track, width, height);

        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

        // Handles
        ctx.fillStyle = '#ffffff';
        ctx.setLineDash([]);
        const handleSize = 8;
        const half = handleSize / 2;

        // NW
        ctx.fillRect(rect.x - half, rect.y - half, handleSize, handleSize);
        // NE
        ctx.fillRect(rect.x + rect.w - half, rect.y - half, handleSize, handleSize);
        // SW
        ctx.fillRect(rect.x - half, rect.y + rect.h - half, handleSize, handleSize);
        // SE
        ctx.fillRect(rect.x + rect.w - half, rect.y + rect.h - half, handleSize, handleSize);

        ctx.restore();
    };

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

                // Draw Overlay
                renderOverlay(ctx, canvas.width, canvas.height);
            }

            animationFrameRef.current = requestAnimationFrame(renderLoop);
        };

        animationFrameRef.current = requestAnimationFrame(renderLoop);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] bg-black rounded-lg overflow-hidden shadow-2xl relative">
            <canvas
                ref={canvasRef}
                className="block" // Removed cursor-crosshair
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Overlay if no audio */}
            {!useAudioStore.getState().file && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-secondary/50 font-mono">Upload audio to start visualization</p>
                </div>
            )}
        </div>
    );
};
