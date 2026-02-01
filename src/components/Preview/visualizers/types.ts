export interface DrawContext {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    analyser: AnalyserNode | null;
    dataArray: any;
    options: any; // visualizerStore state
}

export interface IVisualizer {
    draw(context: DrawContext): void;
}
