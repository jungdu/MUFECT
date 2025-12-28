import type { IVisualizer, DrawContext } from './types';

export class CircleVisualizer implements IVisualizer {
    draw({ ctx, width, height, analyser, dataArray, options }: DrawContext) {
        const {
            color,
            scale, positionX, positionY,
            sensitivity, smoothing
        } = options;

        // Data fetching is now handled by CanvasRenderer

        const centerX = width * (positionX / 100);
        const centerY = height * (positionY / 100);
        const radius = 100 * scale;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Draw base circle
        // ctx.beginPath();
        // ctx.arc(0, 0, radius, 0, Math.PI * 2);
        // ctx.strokeStyle = color;
        // ctx.stroke();

        const bars = 60;

        // We will mirror the data: 30 bars left, 30 bars right meeting at top/bottom.
        // Or simpler: Iterate full data, map to 2 points on circle?
        // Let's do: Bass at Top (12 o'clock) to Treble at Bottom (6 o'clock) mirrored?
        // Standard: Bass at Bottom (180deg), expanding up to Top (0deg).

        // Effective bars per side
        const halfBars = Math.floor(bars / 2);

        ctx.fillStyle = color;

        // Limit frequency range to avoid empty high-freqs
        // Usually top 20-30% of bins are empty in 1024 bin analysis for music
        const usableBins = Math.floor(dataArray.length * 0.7);
        const step = usableBins / halfBars;
        const angleStep = (Math.PI * 2) / bars;

        // Rotate starting point so 0 is at Bottom (Canvas 0 is Right (3 oclock). rotate 90 (6 oclock))
        // Actually, canvas 0 angle is 3 o'clock.
        // We want Bass at 6 o'clock.
        // We want Bass at 3 o'clock (Right side) per user request for -90 deg rotation
        // Original was +90 (6 o'clock). -90 from that is 0 (3 o'clock).
        ctx.save();
        ctx.rotate(0);

        // Iterate <= halfBars to ensure we reach the exact top (180 deg / PI)
        for (let i = 0; i <= halfBars; i++) {
            // Get data
            const dataIndex = Math.floor(i * step);
            const value = dataArray[dataIndex] || 0;
            const percent = value / 255;

            // Adjust height
            const barHeight = Math.max(6, percent * 100 * sensitivity); // min 6px

            // Mirror 2 bars per data point
            // Angle 1: +i
            // Angle 2: -i (or total - i)

            // We are starting at 6 o'clock (due to rotation).
            // We want to go Up-Left and Up-Right.
            // +angle goes Clockwise (Left -> Top).
            // -angle goes Counter-Clockwise (Right -> Top).

            const angleOffset = i * angleStep;

            // Draw Right Side (Clockwise?)
            // If we are at 6. +angle moves to 9 (Left).
            // Wait, standard canvas coords:
            // 0=3oclock. +90=6oclock.
            // From 6oclock: +angle moves to 9oclock. -angle moves to 3oclock.

            // Bar 1 (Left side)
            ctx.save();
            ctx.rotate(angleOffset);
            ctx.fillRect(-2, -radius - barHeight, 4, barHeight);
            ctx.restore();

            // Bar 2 (Right Side)
            ctx.save();
            ctx.rotate(-angleOffset);
            ctx.fillRect(-2, -radius - barHeight, 4, barHeight);
            ctx.restore();
        }
        ctx.restore(); // Undo initial 90deg rotation

        ctx.restore();
    }
}
