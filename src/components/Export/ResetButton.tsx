import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { useVisualizerStore } from '../../stores/visualizerStore';

export const ResetButton: React.FC = () => {
    const { reset: resetAudio, file } = useAudioStore();
    const { reset: resetVisualizer, tracks } = useVisualizerStore();

    const hasContent = file || tracks.length > 0;

    const handleReset = () => {
        if (!hasContent) return;

        if (window.confirm("Are you sure you want to reset the project? This will clear all audio and visualizers.")) {
            resetAudio();
            resetVisualizer();
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={!hasContent}
            className="text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors"
            title="Reset Project"
        >
            <RotateCcw size={16} />
            Reset
        </button>
    );
};
