import React from 'react';
import { useVisualizerStore, DEFAULT_PROPERTIES } from '../../stores/visualizerStore';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';

export const PropertiesPanel: React.FC = () => {
    const { tracks, selectedTrackId, updateTrackProperties, setBackgroundColor, backgroundColor } = useVisualizerStore();

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

    const handleChange = (key: keyof typeof props, value: any) => {
        updateTrackProperties(selectedTrack.id, { [key]: value });
    };

    return (
        <div className="p-4 bg-surface rounded-lg border border-white/5 space-y-6 h-full overflow-y-auto">
            <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">PROPERTIES: {selectedTrack.name}</h3>

            {/* Appearance */}
            <div className="space-y-4">
                <ColorPicker
                    label="Color"
                    value={props.color}
                    onChange={(v) => handleChange('color', v)}
                    onReset={() => handleChange('color', DEFAULT_PROPERTIES.color)}
                />
                <ColorPicker
                    label="Background"
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                    onReset={() => setBackgroundColor(DEFAULT_PROPERTIES.backgroundColor)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Transform */}
            <div className="space-y-4">
                <SliderControl
                    label="Size"
                    value={props.scale} min={0.5} max={2.0} step={0.1} unit="x"
                    onChange={(v) => handleChange('scale', v)}
                    onReset={() => handleChange('scale', DEFAULT_PROPERTIES.scale)}
                />
                <SliderControl
                    label="Position X"
                    value={props.positionX} min={0} max={100} unit="%"
                    onChange={(v) => handleChange('positionX', v)}
                    onReset={() => handleChange('positionX', DEFAULT_PROPERTIES.positionX)}
                />
                <SliderControl
                    label="Position Y"
                    value={props.positionY} min={0} max={100} unit="%"
                    onChange={(v) => handleChange('positionY', v)}
                    onReset={() => handleChange('positionY', DEFAULT_PROPERTIES.positionY)}
                />
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
                            label="Bar Width"
                            value={props.barWidth} min={1} max={20}
                            onChange={(v) => handleChange('barWidth', v)}
                            onReset={() => handleChange('barWidth', DEFAULT_PROPERTIES.barWidth)}
                        />
                        <SliderControl
                            label="Bar Gap"
                            value={props.barGap} min={0} max={10}
                            onChange={(v) => handleChange('barGap', v)}
                            onReset={() => handleChange('barGap', DEFAULT_PROPERTIES.barGap)}
                        />
                    </>
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
                    label="Min Amplitude (0-255)"
                    value={props.minAmplitude} min={0} max={128} step={1}
                    onChange={(v) => handleChange('minAmplitude', v)}
                    onReset={() => handleChange('minAmplitude', DEFAULT_PROPERTIES.minAmplitude)}
                />
                <SliderControl
                    label="Max Amplitude (0-255)"
                    value={props.maxAmplitude} min={64} max={255} step={1}
                    onChange={(v) => handleChange('maxAmplitude', v)}
                    onReset={() => handleChange('maxAmplitude', DEFAULT_PROPERTIES.maxAmplitude)}
                />
            </div>
        </div>
    );
};
