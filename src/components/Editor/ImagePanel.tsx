import React, { useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { Image as ImageIcon, Upload } from 'lucide-react';

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
        <div className="p-4 bg-surface rounded-lg border border-white/5">
            <h3 className="text-secondary text-sm font-medium mb-4 flex items-center gap-2">
                <ImageIcon size={16} />
                Image Panel
            </h3>

            <div className="flex flex-col gap-4">
                <p className="text-xs text-secondary/70">
                    Upload images to add them to the scene. Images are rendered as layers.
                </p>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded border border-primary/20 transition-colors w-full"
                >
                    <Upload size={18} />
                    <span className="text-sm font-medium">Upload Image</span>
                </button>
            </div>
        </div>
    );
};
