import React from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';


export const PlayControls: React.FC = () => {
    const { isPlaying, setIsPlaying, currentTime, duration, file } = useAudioStore();

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (!file) return null;

    return (
        <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-mono text-secondary w-20">
                {formatTime(currentTime)}
            </div>

            <div className="flex items-center gap-4">
                <button className="text-secondary hover:text-white transition-colors">
                    <SkipBack size={20} />
                </button>
                <button
                    className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 transition-transform active:scale-95"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button className="text-secondary hover:text-white transition-colors">
                    <SkipForward size={20} />
                </button>
            </div>

            <div className="text-sm font-mono text-secondary w-20 text-right">
                {formatTime(duration)}
            </div>
        </div>
    );
};
