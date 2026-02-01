import type { IVisualizer, DrawContext } from './types';

export class LineVisualizer implements IVisualizer {
    draw({ ctx, width, height, dataArray, options }: DrawContext) {
        const {
            color,
            mirrored = false, // Check mirrored prop
            sensitivity
        } = options;

        // ...

        // Actually let's just center a fixed width line
        if (options.flip) {
            ctx.scale(-1, 1);
        }
        const drawingWidth = width * 0.9; // Use 90% of box width
        const startX = -drawingWidth / 2;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        // We'll just draw 128 points
        const points = 128;
        const step = Math.floor(dataArray.length / points);
        const pointWidth = drawingWidth / points;

        for (let i = 0; i < points; i++) {
            const value = dataArray[i * step] || 0;
            const percent = value / 255;

            let y = 0;

            if (mirrored) {
                // Centered waveform
                y = -percent * (height * 0.5) * sensitivity;
                // Since it's usually 0-255 frequency data, it goes UP from center.
                // If we want a true waveform we need time domain data, but assuming frequency:
                // Maybe we want +/-? For now, keep previous behavior if mirrored (Center based)
            } else {
                // Bottom based (Standard)
                // Bottom is height/2.
                // Go up by value.
                y = (height / 2) - (percent * height * sensitivity);
            }
            // Fallback to previous logic if not differentiating? 
            // User asked "LineWave... reference point... below".
            // So:
            y = (height / 2) - (percent * height * sensitivity);

            const x = startX + i * pointWidth;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
        ctx.restore();
    }
}
