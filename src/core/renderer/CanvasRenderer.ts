import { getVisualizer } from '../../components/Preview/visualizers';
// import type { VisualizerType } from '../../stores/visualizerStore';

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
        tracks: any[], // VisualizerTrackItem[] - using any to avoid type circular dep for now or import it
        globalOptions: { backgroundColor: string },
        shouldUpdateData: boolean = true
    ) {
        // 1. Clear Background
        ctx.fillStyle = globalOptions.backgroundColor || '#000000';
        ctx.fillRect(0, 0, width, height);

        if (analyser) {
            // 2. Initialize data array if needed (shared for all tracks)
            if (!this.dataArray || this.dataArray.length !== analyser.frequencyBinCount) {
                this.dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            // 3. Fetch new data only if playing (shouldUpdateData) (Once per frame)
            if (shouldUpdateData) {
                // Use a default smoothing or max from tracks? 
                // Creating a simplified approach: use fixed smoothing for data fetch or average?
                // Visualizers might need different smoothing, but AnalyserNode has one property.
                // We'll set it to a reasonable default or the value from the first track.
                // Side effect: if tracks have different smoothing, they will fight. 
                // User requirement: each effect has properties.
                // Tech constraint: One AnalyserNode.
                // Improvement: We can use separate analysers or just accept the limitation.
                // For now: Use the first track's smoothing or default.
                const smoothing = tracks.length > 0 ? tracks[0].properties.smoothing : 0.8;
                analyser.smoothingTimeConstant = smoothing || 0.8;
                analyser.getByteFrequencyData(this.dataArray as any);
            }

            // 4. Draw each track
            tracks.forEach(track => {
                const visualizer = getVisualizer(track.type);
                if (visualizer) {
                    visualizer.draw({
                        ctx,
                        width,
                        height,
                        analyser,
                        dataArray: this.dataArray,
                        options: track.properties
                    });
                }
            });
        }
    }
}
