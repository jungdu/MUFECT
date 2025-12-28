import { BarVisualizer } from './BarVisualizer';
import { CircleVisualizer } from './CircleVisualizer';
import { LineVisualizer } from './LineVisualizer';
import type { IVisualizer } from './types';
import type { VisualizerType } from '../../../stores/visualizerStore';

const visualizers: Record<VisualizerType, IVisualizer> = {
    bar: new BarVisualizer(),
    circle: new CircleVisualizer(),
    line: new LineVisualizer(),
};

export const getVisualizer = (type: VisualizerType): IVisualizer => {
    return visualizers[type] || visualizers.bar;
};
