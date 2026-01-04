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

export const ImageVisualizer = {
    draw: ({ ctx, width, height, options }: DrawContext) => {
        if (!options.imageUrl) return;

        let img = imageCache.get(options.imageUrl);

        if (!img) {
            img = new Image();
            img.src = options.imageUrl;
            img.onload = () => {
                // Trigger re-render? The loop runs continuously so it should just appear next frame
            };
            imageCache.set(options.imageUrl, img);
        }

        if (img.complete && img.naturalWidth > 0) {
            ctx.save();

            // The canvas is already translated to the center of the bounding box by the renderer.
            // But usually drawImage draws from top-left.
            // Since we are at center (x+w/2, y+h/2), if we want to fill the box:
            // drawImage(img, -w/2, -h/2, w, h);

            // However, verify Renderer implementation:
            // ctx.translate(x + w / 2, y + h / 2);
            // So (0, 0) is the center.

            // Maintain aspect ratio or stretch?
            // User requirement: "Preview Canvas에 추가됨". Usually user wants to see the whole image.
            // Properties have width/height.
            // Let's stretch to fill the bounding box as defined by width/height properties.

            ctx.drawImage(img, -width / 2, -height / 2, width, height);

            ctx.restore();
        }
    }
};
