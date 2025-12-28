import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { FFmpegExporter } from '../../core/export/FFmpegExporter';
import { ExportModal } from './ExportModal';

const exporter = new FFmpegExporter();

export const ExportButton: React.FC = () => {
    const { file } = useAudioStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={!file}
                className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors min-w-[120px] justify-center"
            >
                Export Video <Download size={16} />
            </button>

            <ExportModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                exporter={exporter}
            />
        </>
    );
};
