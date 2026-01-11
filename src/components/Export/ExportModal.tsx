import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Download, Loader2, Film, AlertCircle } from 'lucide-react';
import { useExportStore } from '../../stores/exportStore';
import { WebCodecsExporter } from '../../core/export/WebCodecsExporter';
import { useAudioStore } from '../../stores/audioStore';

interface ExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exporter: WebCodecsExporter;
}

export const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange, exporter }) => {
    const { isExporting, progress, statusMessage, outputUrl, startExport, reset, error, resolution, setResolution } = useExportStore();
    const { file, audioBuffer, duration } = useAudioStore();


    // Initial reset when opening
    useEffect(() => {
        if (open) {
            reset();
            // Try to capture a preview frame? 
            // Since we can't easily access the main canvas here without complex refs or passing it down,
            // we will just show a static visualizer icon or generic preview for now.
            // Or if we really want, we could try to instantiate a small renderer, but that's heavy.
        } else {
            if (isExporting) {
                exporter.cancel();
            }
        }
    }, [open]);

    const handleStart = async () => {
        if (!audioBuffer || !file) return;

        const dims = {
            '1080p': { w: 1920, h: 1080 },
            '720p': { w: 1280, h: 720 },
            '480p': { w: 854, h: 480 },
            '360p': { w: 640, h: 360 },
        };
        const { w, h } = dims[resolution];

        startExport();
        try {
            await exporter.exportVideo(audioBuffer, file, w, h, 60);
        } catch (e) {
            // handled
        }
    };

    const handleCancel = () => {
        exporter.cancel();
    };

    const handleClose = () => {
        if (isExporting) {
            if (confirm("Export is in progress. Are you sure you want to cancel?")) {
                handleCancel();
                onOpenChange(false);
            }
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => !val && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-white/10 p-6 rounded-xl shadow-2xl z-50 w-full max-w-md animate-in zoom-in-95 duration-200 focus:outline-none">

                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-bold">Export Video</Dialog.Title>
                        <button onClick={handleClose} className="text-secondary hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Preview Area */}
                        <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden group">
                            {outputUrl ? (
                                <video
                                    src={outputUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                    autoPlay
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                        <h4 className="font-semibold truncate">{file?.name || 'No Audio'}</h4>
                                        <p className="text-xs text-secondary">{duration.toFixed(1)}s • {resolution} • 60fps</p>
                                    </div>

                                    <div className="mb-4 flex flex-col items-center gap-2">
                                        {isExporting ? (
                                            <>
                                                <Loader2 className="animate-spin text-primary" size={40} />
                                                <span className="text-secondary text-xs">Rendering...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Film className="text-white/10" size={40} />
                                                <span className="text-secondary/50 text-xs">Render to view video</span>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm text-secondary mb-2 block">Resolution</label>
                                <select
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value as any)}
                                    disabled={isExporting}
                                    className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                >
                                    <option value="1080p">1080p (1920x1080) - May be Slow</option>
                                    <option value="720p">720p (1280x720)</option>
                                    <option value="480p">480p (854x480)</option>
                                    <option value="360p">360p (640x360)</option>
                                </select>
                                <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    Higher resolutions may take longer to render.
                                </p>
                            </div>
                            {/* Frame rate could be added here later */}
                        </div>

                        {/* Progress Bar */}
                        {isExporting && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-secondary">
                                    <span>{statusMessage}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            {outputUrl ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-white/10 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={outputUrl}
                                        download="visualizer.mp4"
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2"
                                    >
                                        Download Video <Download size={16} />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleClose}
                                        disabled={isExporting} // If exporting, cancel button is primary
                                        className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    {isExporting ? (
                                        <button
                                            onClick={handleCancel}
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors shadow-lg shadow-red-500/20"
                                        >
                                            Stop Export
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStart}
                                            disabled={!file}
                                            className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-md text-sm font-semibold transition-colors shadow-lg shadow-white/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Start Render
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
