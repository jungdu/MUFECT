import React, { useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { Upload } from 'lucide-react';

export const ImagePanel: React.FC = () => {
    const { addTrack } = useVisualizerStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                const img = new Image();
                img.onload = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    addTrack('image', {
                        imageUrl: result,
                        maintainAspectRatio: true,
                        imageRatio: ratio,
                        width: 30, // Default width
                        height: 30, // Initial height

                        positionX: 50,
                        positionY: 50
                    }, file.name);
                };
                img.src = result;
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-1">Images</h2>
                <p className="text-xs text-secondary/60">Upload images to add them to your scene.</p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 px-4 py-12 border border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all group w-full"
            >
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-primary/10 transition-colors">
                    <Upload size={24} className="text-secondary group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                    <span className="text-sm font-medium text-white block">Click to Upload</span>
                    <span className="text-[10px] text-secondary/50">Supports PNG, JPG, GIF</span>
                </div>
            </button>
        </div>
    );
};
