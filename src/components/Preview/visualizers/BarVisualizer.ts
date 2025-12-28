import type { IVisualizer, DrawContext } from './types';

export class BarVisualizer implements IVisualizer {
    draw({ ctx, width, height, analyser, dataArray, options }: DrawContext) {
        const {
            color,
            scale, positionX, positionY,
            barCount, barWidth, barGap,
            sensitivity, smoothing,
            minFrequency, maxFrequency,
            minAmplitude, maxAmplitude
        } = options;

        // Data fetching is now handled by CanvasRenderer

        const centerX = width * (positionX / 100);
        const centerY = height * (positionY / 100);

        // Calculate frequency range indices
        const sampleRate = analyser.context.sampleRate;
        const binCount = analyser.frequencyBinCount; // 1024 typically
        const maxNyquist = sampleRate / 2;

        let startBin = Math.floor((minFrequency / maxNyquist) * binCount);
        let endBin = Math.floor((maxFrequency / maxNyquist) * binCount);

        // Safety checks
        startBin = Math.max(0, startBin);
        endBin = Math.min(binCount - 1, endBin);
        if (endBin <= startBin) endBin = startBin + 1;

        const totalBins = endBin - startBin;
        // Step size across the selected frequency range
        // If we have fewer bins than bars, we might need to interpolate, but simplest is stride
        const step = Math.max(1, totalBins / barCount);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // We want to center the bars
        const totalWidth = barCount * (barWidth + barGap) - barGap;
        ctx.translate(-totalWidth / 2, 0);

        ctx.fillStyle = color;

        for (let i = 0; i < barCount; i++) {
            // Find corresponding bin index
            const binIndex = Math.floor(startBin + (i * step));
            let value = dataArray[binIndex] || 0;

            // Apply Amplitude Scaling
            // Normalize value between minAmplitude and maxAmplitude
            if (value < minAmplitude) value = minAmplitude;
            if (value > maxAmplitude) value = maxAmplitude;

            const range = maxAmplitude - minAmplitude;
            const normalized = (range === 0) ? 0 : (value - minAmplitude) / range;

            // Apply sensitivity on top of the normalized range? 
            // The sensitivity effectively acts as a volume booster for the final height
            const percent = normalized;
            const h = Math.max(4, percent * 200 * sensitivity);

            const x = i * (barWidth + barGap);

            if (options.mirrored) {
                // "Voice Memo" style mirrored bars
                ctx.fillRect(x, -h * 0.5, barWidth, h);
            } else {
                // Unidirectional bars (growing upwards)
                ctx.fillRect(x, -h, barWidth, h);
            }
        }

        ctx.restore();
    }
}
