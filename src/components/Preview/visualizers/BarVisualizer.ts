import type { IVisualizer, DrawContext } from './types';

export class BarVisualizer implements IVisualizer {
    draw({ ctx, width, height, analyser, dataArray, options }: DrawContext) {
        const {
            color,

            barCount, barGap,
            sensitivity,
            minFrequency, maxFrequency,
            minAmplitude, maxAmplitude
        } = options;

        // Data fetching is now handled by CanvasRenderer

        // Context is already translated to the center of the bounding box by CanvasRenderer.
        // width and height are the bounding box dimensions.

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


        // Calculate Calculate bar width based on total width and count
        const totalGap = Math.max(0, (barCount - 1) * barGap);
        // Ensure barWidth is at least 1px or handle gracefully
        const availableWidth = width - totalGap;
        const barWidth = Math.max(0, availableWidth / barCount);

        // We want to center the bars? 
        // Logic: (0,0) is currently center of bbox (from Renderer setup).
        // bbox width = width.
        // We want bars to span from -width/2 to width/2.

        // Start X should be left edge of content.
        // Total Actual content width = (barWidth * barCount) + totalGap.
        // Which is roughly 'width' (allowing for float precision).

        const totalContentWidth = (barWidth * barCount) + totalGap;

        // Translate to left edge
        ctx.translate(-totalContentWidth / 2, 0);

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
            // Use height of the bounding box
            // If mirrored, height is max total height. If not, height is max.
            const maxH = options.mirrored ? height : height;
            // Removed 0.5 factor to allow filling the area. Sensitivity controls the headroom.
            const h = Math.max(4, percent * maxH * sensitivity);

            const x = i * (barWidth + barGap);

            if (options.mirrored) {
                // "Voice Memo" style mirrored bars
                // Center is 0.
                ctx.fillRect(x, -h * 0.5, barWidth, h);
            } else {
                // Unidirectional bars (growing upwards from BOTTOM)
                // Bottom of bounding box is height/2.
                // We draw upwards, so y = (height/2) - h.
                ctx.fillRect(x, (height / 2) - h, barWidth, h);
            }
        }

        ctx.restore();
    }
}
