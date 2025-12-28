import React, { useCallback } from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { Upload } from 'lucide-react';


export const AudioUploader: React.FC = () => {
    const setFile = useAudioStore((state) => state.setFile);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3'))) {
            setFile(file);
        }
    }, [setFile]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
        }
    }, [setFile]);

    return (
        <div
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-secondary/50 rounded-xl hover:border-primary/50 transition-colors bg-surface/30 cursor-pointer h-full min-h-[300px]"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('audio-upload')?.click()}
        >
            <div className="bg-primary/20 p-4 rounded-full mb-4 text-primary">
                <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Upload Audio File</h3>
            <p className="text-secondary text-sm mb-4">Drag & drop or click to browse (MP3, WAV, OGG)</p>
            <input
                type="file"
                id="audio-upload"
                accept="audio/*,.mp3,.wav,.ogg"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
};
