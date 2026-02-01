import type { VisualizerTrackItem } from '../../../stores/visualizerStore';

interface DrawContext {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    analyser: AnalyserNode | null;
    dataArray: Uint8Array | null;
    options: VisualizerTrackItem['properties'];
}

const imageCache = new Map<string, HTMLImageElement>();

function getImage(url: string | undefined): HTMLImageElement | null {
    if (!url) return null;
    let img = imageCache.get(url);
    if (!img) {
        img = new Image();
        img.src = url;
        imageCache.set(url, img);
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
}

export const BeatImageVisualizer = {
    draw: ({ ctx, width, height, analyser, dataArray, options }: DrawContext) => {
        const { lowImageUrl, highImageUrl, sensitivity = 1, minAmplitude = 0, maxAmplitude = 255 } = options;

        const lowImg = getImage(lowImageUrl);
        const highImg = getImage(highImageUrl);

        if (!lowImg && !highImg) {
            // Draw Placeholder
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(-width / 2, -height / 2, width, height);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(-width / 2, -height / 2, width, height);

            ctx.fillStyle = 'white';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Beat Image', 0, 0);
            ctx.restore();
            return;
        }

        // Calculate Amplitude
        let average = 0;
        if (analyser && dataArray) {
            let sum = 0;
            // Focus on "Beat" frequencies (Bass/Low Mids)
            // By default, full spectrum average is too low because high freqs are empty.
            // Let's analyze the first 30% of the bins (approx Bass + Mids) where most energy is.
            const captureRate = 0.3;
            const endBin = Math.floor(dataArray.length * captureRate);

            for (let i = 0; i < endBin; i++) {
                sum += dataArray[i];
            }
            average = endBin > 0 ? sum / endBin : 0;
        }

        // Normalize Amplitude
        // value between minAmplitude and maxAmplitude
        let value = average;
        if (value < minAmplitude) value = minAmplitude;
        if (value > maxAmplitude) value = maxAmplitude;

        const range = maxAmplitude - minAmplitude;
        let normalized = (range === 0) ? 0 : (value - minAmplitude) / range;

        // Apply Dynamic Boost
        // Users want it "more dynamic" (hit harder).
        // 1. Sensitivity Multiplier
        // 2. Non-linear curve (Square root boosts lower values to make them visible, 
        //    Power of 2 makes it punchier but harder to reach max. 
        //    User said "High Image appears less than expected", so we want to BOOST presence.
        //    Math.pow(normalized, 0.7) lifts mid-tones.
        normalized = normalized * sensitivity;

        // Clamp 0-1
        normalized = Math.min(1, Math.max(0, normalized));

        // Ease-out cubic for punchy release? Or simple value? 
        // Let's keep it simple but boosted.
        // If normalized is 0.5, we want it 0.7 maybe?
        // Let's leave linear after multiplier, but the "Bass Focus" above should significantly raise the average.

        ctx.save();

        // Draw Low Image (Base) - Always visible (or maybe fades out as High fades in? User said "toggles or blends")
        // "sound quiet -> Low, sound loud -> High"
        // Common technique: Draw Low fully, Draw High with opacity on top.

        // Helper to draw image cover/contain logic is needed?
        // ImageVisualizer uses stretched fill: ctx.drawImage(img, -width / 2, -height / 2, width, height);
        // Let's stick to that for consistency with "Image Layer", assuming user sets width/height/pos in properties.

        if (lowImg) {
            ctx.globalAlpha = 1;
            ctx.drawImage(lowImg, -width / 2, -height / 2, width, height);
        }

        if (highImg) {
            ctx.globalAlpha = normalized;
            ctx.drawImage(highImg, -width / 2, -height / 2, width, height);
        }

        ctx.restore();
    }
};
