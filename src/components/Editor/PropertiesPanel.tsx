import React from 'react';
import { useVisualizerStore, DEFAULT_PROPERTIES } from '../../stores/visualizerStore';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';
import { Trash2, ArrowLeftRight, ArrowUpDown, Upload } from 'lucide-react';
import { useRef } from 'react';

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
        // Skip throttling for checkboxes or non-slider inputs if needed, but 300ms is fine for sliders.
        // For checkbox "maintainAspectRatio", we want immediate update.
        if (key === 'maintainAspectRatio') {
            updateTrackProperties(selectedTrack.id, { [key]: value });
            return;
        }

        const lastUpdate = lastUpdateRef.current[key] || 0;

        if (now - lastUpdate < 30) { // Reduced throttle for smoother slider linking
            return;
        }

        lastUpdateRef.current[key] = now;

        const updates: Partial<typeof props> = { [key]: value };

        // Aspect Ratio Logic
        if ((selectedTrack.type === 'image' || selectedTrack.type === 'beat-image') && props.maintainAspectRatio && (key === 'width' || key === 'height')) {
            const canvas = document.querySelector('canvas');
            if (canvas && props.imageRatio) {
                const cw = canvas.width;
                const ch = canvas.height;
                const canvasRatio = cw / ch;
                const imgRatio = props.imageRatio;

                // w_px / h_px = imgRatio
                // (w% * cw) / (h% * ch) = imgRatio
                // w% = h% * (ch/cw) * imgRatio = h% * (1/canvasRatio) * imgRatio
                // h% = w% * (cw/ch) / imgRatio = w% * canvasRatio / imgRatio

                if (key === 'width') {
                    // Update Height
                    // h = w * canvasRatio / imgRatio
                    const newHeight = (value as number) * canvasRatio / imgRatio;
                    updates.height = Math.round(newHeight * 100) / 100; // Round to 2 decimals
                } else {
                    // Update Width
                    // w = h * (1/canvasRatio) * imgRatio
                    const newWidth = (value as number) / canvasRatio * imgRatio;
                    updates.width = Math.round(newWidth * 100) / 100;
                }
            }
        }

        updateTrackProperties(selectedTrack.id, updates);
    };

    const handleImageUpload = (file: File, targetProp: 'lowImageUrl' | 'highImageUrl') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                const img = new Image();
                img.onload = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    // Update URL AND Ratio
                    // Logic: If this is the FIRST image uploaded (or we want to enforce it), update ratio.
                    // Usually we update ratio to match the new image.
                    updateTrackProperties(selectedTrack.id, {
                        [targetProp]: result,
                        imageRatio: ratio
                    });
                };
                img.src = result;
            }
        };
        reader.readAsDataURL(file);
    };

    const lowImageInputRef = useRef<HTMLInputElement>(null);
    const highImageInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Appearance */}
            {selectedTrack.type !== 'image' && selectedTrack.type !== 'beat-image' && (
                <>
                    <div className="space-y-4">
                        <ColorPicker
                            label="Color"
                            value={props.color}
                            onChange={(v) => handleChange('color', v)}
                            onReset={() => handleChange('color', DEFAULT_PROPERTIES.color)}
                        />
                    </div>
                    <div className="h-px bg-white/5 my-4" />
                </>
            )}

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

                {selectedTrack.type === 'image' && (
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={props.maintainAspectRatio ?? true}
                                onChange={(e) => handleChange('maintainAspectRatio', e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-primary accent-primary"
                            />
                            <label className="text-xs text-secondary">Maintain Aspect Ratio</label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    const canvas = document.querySelector('canvas');
                                    if (!canvas) return;
                                    const canvasRatio = canvas.width / canvas.height;
                                    const imgRatio = props.imageRatio || 1;

                                    const updates: any = { width: 100, positionX: 50 };
                                    if (props.maintainAspectRatio) {
                                        // h = w * canvasRatio / imgRatio
                                        updates.height = Math.round((100 * canvasRatio / imgRatio) * 100) / 100;
                                    }
                                    updateTrackProperties(selectedTrack.id, updates);
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                                title="Fit to Width"
                            >
                                <ArrowLeftRight size={14} />
                                <span>Fit Width</span>
                            </button>
                            <button
                                onClick={() => {
                                    const canvas = document.querySelector('canvas');
                                    if (!canvas) return;
                                    const canvasRatio = canvas.width / canvas.height;
                                    const imgRatio = props.imageRatio || 1;

                                    const updates: any = { height: 100, positionY: 50 };
                                    if (props.maintainAspectRatio) {
                                        // w = h / canvasRatio * imgRatio
                                        updates.width = Math.round((100 / canvasRatio * imgRatio) * 100) / 100;
                                    }
                                    updateTrackProperties(selectedTrack.id, updates);
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                                title="Fit to Height"
                            >
                                <ArrowUpDown size={14} />
                                <span>Fit Height</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-px bg-white/5 my-4" />

            <div className="h-px bg-white/5 my-4" />

            {/* Beat Image Specifics */}
            {selectedTrack.type === 'beat-image' && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">BEAT IMAGES</h3>

                        {/* Low Intensity Image */}
                        <div className="space-y-2">
                            <label className="text-xs text-secondary block">Low Intensity (Quiet)</label>
                            <div
                                onClick={() => lowImageInputRef.current?.click()}
                                className="w-full h-24 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors overflow-hidden group relative"
                            >
                                {props.lowImageUrl ? (
                                    <img src={props.lowImageUrl} alt="Low" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-secondary/50 group-hover:text-secondary">
                                        <Upload size={16} className="mb-1" />
                                        <span className="text-[10px]">Upload Low Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={lowImageInputRef}
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'lowImageUrl')}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* High Intensity Image */}
                        <div className="space-y-2">
                            <label className="text-xs text-secondary block">High Intensity (Loud)</label>
                            <div
                                onClick={() => highImageInputRef.current?.click()}
                                className="w-full h-24 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors overflow-hidden group relative"
                            >
                                {props.highImageUrl ? (
                                    <img src={props.highImageUrl} alt="High" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-secondary/50 group-hover:text-secondary">
                                        <Upload size={16} className="mb-1" />
                                        <span className="text-[10px]">Upload High Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={highImageInputRef}
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'highImageUrl')}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Sizing Tools */}
                        <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={props.maintainAspectRatio ?? true}
                                    onChange={(e) => handleChange('maintainAspectRatio', e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-primary accent-primary"
                                />
                                <label className="text-xs text-secondary">Maintain Aspect Ratio</label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        const canvas = document.querySelector('canvas');
                                        if (!canvas) return;
                                        const canvasRatio = canvas.width / canvas.height;
                                        const imgRatio = props.imageRatio || 1;

                                        const updates: any = { width: 100, positionX: 50 };
                                        if (props.maintainAspectRatio) {
                                            updates.height = Math.round((100 * canvasRatio / imgRatio) * 100) / 100;
                                        }
                                        updateTrackProperties(selectedTrack.id, updates);
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                                    title="Fit to Width"
                                >
                                    <ArrowLeftRight size={14} />
                                    <span>Fit Width</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const canvas = document.querySelector('canvas');
                                        if (!canvas) return;
                                        const canvasRatio = canvas.width / canvas.height;
                                        const imgRatio = props.imageRatio || 1;

                                        const updates: any = { height: 100, positionY: 50 };
                                        if (props.maintainAspectRatio) {
                                            updates.width = Math.round((100 / canvasRatio * imgRatio) * 100) / 100;
                                        }
                                        updateTrackProperties(selectedTrack.id, updates);
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                                    title="Fit to Height"
                                >
                                    <ArrowUpDown size={14} />
                                    <span>Fit Height</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-white/5 my-4" />
                </>
            )}

            {/* Common Options */}
            {selectedTrack.type !== 'image' && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            checked={props.flip ?? false}
                            onChange={(e) => handleChange('flip', e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-primary accent-primary"
                        />
                        <label className="text-xs text-secondary">Horizontal Flip (Mirror L/R)</label>
                    </div>
                </>
            )}

            {/* Visuals */}
            {selectedTrack.type !== 'image' && (
                <>
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
                        {selectedTrack.type !== 'beat-image' && (
                            <>
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
                            </>
                        )}
                        <SliderControl
                            label="Min Amplitude (0-255)"
                            value={props.minAmplitude} min={0} max={255} step={1}
                            onChange={(v) => handleChange('minAmplitude', v)}
                            onReset={() => handleChange('minAmplitude', DEFAULT_PROPERTIES.minAmplitude || 0)}
                        />
                        <SliderControl
                            label="Max Amplitude (0-255)"
                            value={props.maxAmplitude} min={64} max={255} step={1}
                            onChange={(v) => handleChange('maxAmplitude', v)}
                            onReset={() => handleChange('maxAmplitude', DEFAULT_PROPERTIES.maxAmplitude)}
                        />
                    </div>
                    <div className="h-px bg-white/5 my-4" />
                </>
            )}

            {/* Layer Management */}
            <div className="space-y-2">
                <h3 className="text-xs text-secondary font-mono tracking-wider mb-2">LAYER ORDER</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => useVisualizerStore.getState().reorderTrack(selectedTrack.id, 'front')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                    >
                        Bring to Front
                    </button>
                    <button
                        onClick={() => useVisualizerStore.getState().reorderTrack(selectedTrack.id, 'back')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                    >
                        Send to Back
                    </button>
                    <button
                        onClick={() => useVisualizerStore.getState().reorderTrack(selectedTrack.id, 'forward')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                    >
                        Move Forward
                    </button>
                    <button
                        onClick={() => useVisualizerStore.getState().reorderTrack(selectedTrack.id, 'backward')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                    >
                        Move Backward
                    </button>
                </div>
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Actions */}
            <button
                onClick={() => removeTrack(selectedTrack.id)}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm font-medium"
            >
                <Trash2 size={16} />
                Delete {selectedTrack.type === 'image' ? 'Image' : 'Effect'}
            </button>
        </div>
    );
};

