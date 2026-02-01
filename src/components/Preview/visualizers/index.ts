import { BarVisualizer } from './BarVisualizer';
import { CircleVisualizer } from './CircleVisualizer';
import { LineVisualizer } from './LineVisualizer';
import { ImageVisualizer } from './ImageVisualizer';
import type { IVisualizer } from './types';
import type { VisualizerType } from '../../../stores/visualizerStore';

import { BeatImageVisualizer } from './BeatImageVisualizer';

const visualizers: Record<VisualizerType, IVisualizer> = {
    bar: new BarVisualizer(),
    circle: new CircleVisualizer(),
    line: new LineVisualizer(),
    image: ImageVisualizer,
    'beat-image': BeatImageVisualizer,
};

export const getVisualizer = (type: VisualizerType): IVisualizer => {
    return visualizers[type] || visualizers.bar;
};

