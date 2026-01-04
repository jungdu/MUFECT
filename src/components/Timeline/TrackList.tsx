import React from 'react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { cn } from '../../utils/cn';

export const TrackList: React.FC = () => {
    const { tracks, selectedTrackId, selectTrack, removeTrack } = useVisualizerStore();

    return (
        <div className="flex flex-col gap-1 mt-2">
            {tracks.map((track) => (
                <div
                    key={track.id}
                    onClick={() => selectTrack(track.id)}
                    className={cn(
                        "relative h-8 rounded px-3 flex items-center justify-between text-xs font-medium cursor-pointer transition-colors border",
                        selectedTrackId === track.id
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/5 text-secondary hover:bg-white/10"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: track.properties.color }}
                        />
                        <span>{track.name}</span>
                    </div>

                    {selectedTrackId === track.id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTrack(track.id);
                            }}
                            className="text-white/50 hover:text-white hover:bg-white/10 p-1 rounded"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            {tracks.length === 0 && (
                <div className="text-xs text-secondary/40 italic p-2 text-center">
                    No active effects
                </div>
            )}
        </div>
    );
};
