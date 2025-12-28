import React from 'react';
import { useVisualizerStore, VISUALIZER_DEFAULTS } from '../../stores/visualizerStore';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';

export const PropertiesPanel: React.FC = () => {
    const state = useVisualizerStore();

    return (
        <div className="p-4 bg-surface rounded-lg border border-white/5 space-y-6 h-full overflow-y-auto">
            <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">PROPERTIES</h3>

            {/* Appearance */}
            <div className="space-y-4">
                <ColorPicker
                    label="Color"
                    value={state.color}
                    onChange={state.setColor}
                    onReset={() => state.setColor(VISUALIZER_DEFAULTS.color)}
                />
                <ColorPicker
                    label="Background"
                    value={state.backgroundColor}
                    onChange={state.setBackgroundColor}
                    onReset={() => state.setBackgroundColor(VISUALIZER_DEFAULTS.backgroundColor)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Transform */}
            <div className="space-y-4">
                <SliderControl
                    label="Size"
                    value={state.scale} min={0.5} max={2.0} step={0.1} unit="x"
                    onChange={state.setScale}
                    onReset={() => state.setScale(VISUALIZER_DEFAULTS.scale)}
                />
                <SliderControl
                    label="Position X"
                    value={state.positionX} min={0} max={100} unit="%"
                    onChange={(v) => state.setPosition(v, state.positionY)}
                    onReset={() => state.setPosition(VISUALIZER_DEFAULTS.positionX, state.positionY)}
                />
                <SliderControl
                    label="Position Y"
                    value={state.positionY} min={0} max={100} unit="%"
                    onChange={(v) => state.setPosition(state.positionX, v)}
                    onReset={() => state.setPosition(state.positionX, VISUALIZER_DEFAULTS.positionY)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Visuals */}
            <div className="space-y-4">
                {state.effectType === 'bar' && (
                    <>
                        <SliderControl
                            label="Bar Count"
                            value={state.barCount} min={16} max={128} step={16}
                            onChange={state.setBarCount}
                            onReset={() => state.setBarCount(VISUALIZER_DEFAULTS.barCount)}
                        />
                        <SliderControl
                            label="Bar Width"
                            value={state.barWidth} min={1} max={20}
                            onChange={state.setBarWidth}
                            onReset={() => state.setBarWidth(VISUALIZER_DEFAULTS.barWidth)}
                        />
                        <SliderControl
                            label="Bar Gap"
                            value={state.barGap} min={0} max={10}
                            onChange={state.setBarGap}
                            onReset={() => state.setBarGap(VISUALIZER_DEFAULTS.barGap)}
                        />
                    </>
                )}

                <SliderControl
                    label="Sensitivity"
                    value={state.sensitivity} min={0} max={2} step={0.1}
                    onChange={state.setSensitivity}
                    onReset={() => state.setSensitivity(VISUALIZER_DEFAULTS.sensitivity)}
                />
                <SliderControl
                    label="Smoothing"
                    value={state.smoothing} min={0.1} max={0.99} step={0.01}
                    onChange={state.setSmoothing}
                    onReset={() => state.setSmoothing(VISUALIZER_DEFAULTS.smoothing)}
                />
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Audio Range */}
            <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">AUDIO RANGE</h3>
            <div className="space-y-4">
                <SliderControl
                    label="Min Frequency (Hz)"
                    value={state.minFrequency} min={0} max={5000} step={100}
                    onChange={state.setMinFrequency}
                    onReset={() => state.setMinFrequency(VISUALIZER_DEFAULTS.minFrequency)}
                />
                <SliderControl
                    label="Max Frequency (Hz)"
                    value={state.maxFrequency} min={1000} max={22000} step={500}
                    onChange={state.setMaxFrequency}
                    onReset={() => state.setMaxFrequency(VISUALIZER_DEFAULTS.maxFrequency)}
                />
                <SliderControl
                    label="Min Amplitude (0-255)"
                    value={state.minAmplitude} min={0} max={128} step={1}
                    onChange={state.setMinAmplitude}
                    onReset={() => state.setMinAmplitude(VISUALIZER_DEFAULTS.minAmplitude)}
                />
                <SliderControl
                    label="Max Amplitude (0-255)"
                    value={state.maxAmplitude} min={64} max={255} step={1}
                    onChange={state.setMaxAmplitude}
                    onReset={() => state.setMaxAmplitude(VISUALIZER_DEFAULTS.maxAmplitude)}
                />
            </div>
        </div>
    );
};
