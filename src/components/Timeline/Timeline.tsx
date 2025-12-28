import React from 'react';
import { Waveform } from './Waveform';
import { PlayControls } from './PlayControls';

export const Timeline: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 bg-surface p-4 rounded-lg border border-white/5">
            <div className="text-xs text-secondary font-mono tracking-wider mb-1">TIMELINE</div>
            <Waveform />
            <PlayControls />
        </div>
    );
};
