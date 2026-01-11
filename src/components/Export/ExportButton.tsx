import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { WebCodecsExporter } from '../../core/export/WebCodecsExporter';
import { ExportModal } from './ExportModal';

const exporter = new WebCodecsExporter();

export const ExportButton: React.FC = () => {
    const { file } = useAudioStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={!file}
                className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors min-w-[100px] justify-center"
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
