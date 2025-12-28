import type { IVisualizer, DrawContext } from './types';

export class LineVisualizer implements IVisualizer {
    draw({ ctx, width, height, dataArray, options }: DrawContext) {
        const {
            color,
            scale, positionX, positionY,
            sensitivity
        } = options;

        // Data fetching is now handled by CanvasRenderer

        // Or we could use TimeDomainData for a true waveform line?
        // User requirement says "Line Wave", let's do TimeDomain for "Wave" look
        // or Frequency for "Spectrum" look. 
        // Usually "Wave" implies TimeDomain, but let's stick to Frequency for consistency 
        // unless specified. Wait, "Audio Visualizer" implies spectrums usually.
        // Let's use Frequency but draw a line connecting tops.

        const centerX = width * (positionX / 100);
        const centerY = height * (positionY / 100);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);


        // Actually let's just center a fixed width line
        const drawingWidth = 600;
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
            const y = -percent * 200 * sensitivity;

            const x = startX + i * pointWidth;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                // Smooth curve?
                // ctx.quadraticCurveTo(...) 
                // Simple line to
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
        ctx.restore();
    }
}
