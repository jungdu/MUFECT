import type { IVisualizer, DrawContext } from './types';

export class CircleVisualizer implements IVisualizer {
    draw({ ctx, width, height, dataArray, options, analyser }: DrawContext) {
        if (!analyser) return;
        const {
            color,
            barCount,
            centerRadius = 0.5, // Default if not present
            sensitivity
        } = options;

        // Data fetching is now handled by CanvasRenderer

        // Context is translated to center of bounding box. (0,0) is center.
        // width and height are the bounding box dimensions.

        // Calculate dimensions
        // Use the smaller dimension to fit circle in box
        const minDim = Math.min(width, height);
        const maxRadius = (minDim / 2); // Radius of the bounding box circle (50%)

        // Inner Radius (Void space) determined by centerRadius prop (0 to 1)
        // We ensure a small minimum so it doesn't collapse to a point (unless expected)
        // User wants to control empty space.
        const innerRadius = maxRadius * centerRadius;

        // Available space for the bars to grow
        const availableSpace = maxRadius - innerRadius;

        ctx.save();

        // Used bars properties
        const bars = barCount || 60; // Use prop or default

        // Effective bars per side (Mirrored)
        const halfBars = Math.floor(bars / 2);

        ctx.fillStyle = color;

        // Limit frequency range
        const usableBins = Math.floor(dataArray.length * 0.7);
        const step = usableBins / halfBars;
        const angleStep = (Math.PI * 2) / bars;

        // Rotate for orientation
        ctx.save();
        ctx.rotate(0);

        for (let i = 0; i <= halfBars; i++) {
            const dataIndex = Math.floor(i * step);
            const value = dataArray[dataIndex] || 0;
            const percent = value / 255;

            // Bar Height
            // Should scale to fill available space based on percent and sensitivity
            const barHeight = Math.max(2, percent * availableSpace * sensitivity);

            // Draw Bars
            // Position: Start from innerRadius and draw OUTWARDS


            const angleOffset = i * angleStep;

            // Bar 1 (Left/CW)
            ctx.save();
            ctx.rotate(angleOffset);
            ctx.fillRect(-2, -innerRadius - barHeight, 4, barHeight);
            ctx.restore();

            // Bar 2 (Right/CCW)
            ctx.save();
            ctx.rotate(-angleOffset);
            ctx.fillRect(-2, -innerRadius - barHeight, 4, barHeight);
            ctx.restore();
        }
        ctx.restore(); // Undo rotation

        ctx.restore();
    }
}
