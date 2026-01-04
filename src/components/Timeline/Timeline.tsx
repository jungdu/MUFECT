import React from 'react';
import { Waveform } from './Waveform';
import { PlayControls } from './PlayControls';

export const Timeline: React.FC = () => {
    return (
        <div className="flex flex-col bg-surface rounded-lg border border-white/5 h-48">
            <div className="flex items-center justify-center h-14 border-b border-white/5 px-4">
                <PlayControls />
            </div>
            <div className="flex-1 p-4 overflow-hidden flex flex-col justify-center">
                <Waveform />
            </div>
        </div>
    );
};
