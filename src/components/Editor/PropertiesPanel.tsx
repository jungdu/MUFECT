import React from 'react';
import { useVisualizerStore, DEFAULT_PROPERTIES } from '../../stores/visualizerStore';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';
import { Trash2 } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const { tracks, selectedTrackId, updateTrackProperties, removeTrack } = useVisualizerStore();

    // Find selected track
    const selectedTrack = tracks.find(t => t.id === selectedTrackId);

    if (!selectedTrack) {
        return (
            <div className="p-4 bg-surface rounded-lg border border-white/5 h-full flex items-center justify-center">
                <p className="text-secondary text-sm text-center">Select an effect on the timeline to edit properties.</p>
            </div>
        );
    }

    const props = selectedTrack.properties;

    const lastUpdateRef = React.useRef<{ [key: string]: number }>({});

    const handleChange = (key: keyof typeof props, value: any) => {
        const now = Date.now();
        const lastUpdate = lastUpdateRef.current[key] || 0;

        // We probably want to update immediately on the leading edge? 
        // Or trailing? Usually sliders need to feel responsive locally (which SliderControl handles visually)
        // but state updates can be throttled.
        // However, SliderControl's internal state might be sync with props.
        // If we block props update, the slider thumb might jump back.
        // Ideally, SliderControl should handle its own local state while dragging.
        // For this task, I will implement a basic throttle here.

        if (now - lastUpdate < 300) return;

        lastUpdateRef.current[key] = now;
        updateTrackProperties(selectedTrack.id, { [key]: value });
    };

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Appearance */}
            <div className="space-y-4">
                <ColorPicker
                    label="Color"
                    value={props.color}
                    onChange={(v) => handleChange('color', v)}
                    onReset={() => handleChange('color', DEFAULT_PROPERTIES.color)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Transform */}
            <div className="space-y-4">

                <SliderControl
                    label="Position X"
                    value={props.positionX} min={0} max={100} unit="%" step={0.1}
                    onChange={(v) => handleChange('positionX', v)}
                    onReset={() => handleChange('positionX', DEFAULT_PROPERTIES.positionX)}
                />
                <SliderControl
                    label="Position Y"
                    value={props.positionY} min={0} max={100} unit="%" step={0.1}
                    onChange={(v) => handleChange('positionY', v)}
                    onReset={() => handleChange('positionY', DEFAULT_PROPERTIES.positionY)}
                />

                <div className="grid grid-cols-2 gap-2">
                    <SliderControl
                        label="Width"
                        value={props.width} min={10} max={100} unit="%" step={0.1}
                        onChange={(v) => handleChange('width', v)}
                        onReset={() => handleChange('width', DEFAULT_PROPERTIES.width)}
                    />
                    <SliderControl
                        label="Height"
                        value={props.height} min={10} max={100} unit="%" step={0.1}
                        onChange={(v) => handleChange('height', v)}
                        onReset={() => handleChange('height', DEFAULT_PROPERTIES.height)}
                    />
                </div>
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Visuals */}
            <div className="space-y-4">
                {selectedTrack.type === 'bar' && (
                    <>
                        <SliderControl
                            label="Bar Count"
                            value={props.barCount} min={16} max={128} step={16}
                            onChange={(v) => handleChange('barCount', v)}
                            onReset={() => handleChange('barCount', DEFAULT_PROPERTIES.barCount)}
                        />

                        <SliderControl
                            label="Bar Gap"
                            value={props.barGap} min={0} max={10}
                            onChange={(v) => handleChange('barGap', v)}
                            onReset={() => handleChange('barGap', DEFAULT_PROPERTIES.barGap)}
                        />
                    </>
                )}

                {selectedTrack.type === 'circle' && (
                    <SliderControl
                        label="Center Radius"
                        value={props.centerRadius} min={0.1} max={0.9} step={0.05}
                        onChange={(v) => handleChange('centerRadius', v)}
                        onReset={() => handleChange('centerRadius', DEFAULT_PROPERTIES.centerRadius)}
                    />
                )}

                <SliderControl
                    label="Sensitivity"
                    value={props.sensitivity} min={0} max={2} step={0.1}
                    onChange={(v) => handleChange('sensitivity', v)}
                    onReset={() => handleChange('sensitivity', DEFAULT_PROPERTIES.sensitivity)}
                />
                <SliderControl
                    label="Smoothing"
                    value={props.smoothing} min={0.1} max={0.99} step={0.01}
                    onChange={(v) => handleChange('smoothing', v)}
                    onReset={() => handleChange('smoothing', DEFAULT_PROPERTIES.smoothing)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Audio Range */}
            <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">AUDIO RANGE</h3>
            <div className="space-y-4">
                <SliderControl
                    label="Min Frequency (Hz)"
                    value={props.minFrequency} min={0} max={5000} step={100}
                    onChange={(v) => handleChange('minFrequency', v)}
                    onReset={() => handleChange('minFrequency', DEFAULT_PROPERTIES.minFrequency)}
                />
                <SliderControl
                    label="Max Frequency (Hz)"
                    value={props.maxFrequency} min={1000} max={22000} step={500}
                    onChange={(v) => handleChange('maxFrequency', v)}
                    onReset={() => handleChange('maxFrequency', DEFAULT_PROPERTIES.maxFrequency)}
                />
                <SliderControl
                    label="Max Amplitude (0-255)"
                    value={props.maxAmplitude} min={64} max={255} step={1}
                    onChange={(v) => handleChange('maxAmplitude', v)}
                    onReset={() => handleChange('maxAmplitude', DEFAULT_PROPERTIES.maxAmplitude)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Actions */}
            <button
                onClick={() => removeTrack(selectedTrack.id)}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm font-medium"
            >
                <Trash2 size={16} />
                Delete Effect
            </button>
        </div>
    );
};
