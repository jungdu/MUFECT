import { getVisualizer } from '../../components/Preview/visualizers';
import type { VisualizerType } from '../../stores/visualizerStore';

// We pass the full store state or just the needed options
export class CanvasRenderer {
    private dataArray: Uint8Array | null = null;

    constructor() {
        //
    }

    render(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        analyser: AnalyserNode | null,
        options: any,
        shouldUpdateData: boolean = true
    ) {
        // 1. Clear Background
        ctx.fillStyle = options.backgroundColor || '#000000';
        ctx.fillRect(0, 0, width, height);

        // 2. Resolve Strategy
        const visualizer = getVisualizer(options.effectType as VisualizerType);

        // 3. Draw
        if (analyser) {
            // Initialize data array if needed
            if (!this.dataArray || this.dataArray.length !== analyser.frequencyBinCount) {
                this.dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            // Fetch new data only if playing (shouldUpdateData)
            if (shouldUpdateData) {
                analyser.smoothingTimeConstant = options.smoothing || 0.8;
                analyser.getByteFrequencyData(this.dataArray);
            }

            visualizer.draw({
                ctx,
                width,
                height,
                analyser,
                dataArray: this.dataArray,
                options
            });
        }
    }
}
