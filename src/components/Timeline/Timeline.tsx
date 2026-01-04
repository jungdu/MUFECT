import React from 'react';
import { Waveform } from './Waveform';
import { PlayControls } from './PlayControls';
import { TrackList } from './TrackList';

export const Timeline: React.FC = () => {
    return (
        <div className="flex flex-col bg-surface rounded-lg border border-white/5 h-64">
            <div className="flex items-center justify-center h-14 border-b border-white/5 px-4 shrink-0">
                <PlayControls />
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col">
                <Waveform />
                <TrackList />
            </div>
        </div>
    );
};
