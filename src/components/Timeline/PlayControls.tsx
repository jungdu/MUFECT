import React from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';


export const PlayControls: React.FC = () => {
    const { isPlaying, setIsPlaying, file } = useAudioStore();


    if (!file) return null;

    return (
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <button className="text-secondary hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <SkipBack size={18} />
                </button>
                <button
                    className="bg-white text-black hover:bg-white/90 rounded-full p-2 transition-transform active:scale-95"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>
                <button className="text-secondary hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <SkipForward size={18} />
                </button>
            </div>
        </div>
    );
};
