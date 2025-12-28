import React from 'react';
import { useAudioStore } from './stores/audioStore';
import { AudioUploader } from './components/AudioUploader/AudioUploader';
import { Timeline } from './components/Timeline/Timeline';
import { PreviewCanvas } from './components/Preview/PreviewCanvas';
import { EffectSelector } from './components/Editor/EffectSelector';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { ExportButton } from './components/Export/ExportButton';

function App() {
  const file = useAudioStore((state) => state.file);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white">
            AV
          </div>
          <h1 className="font-bold text-lg tracking-tight">Audio Visualizer <span className="text-secondary font-normal">Video Generator</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-64px)] overflow-hidden">

        {/* Left Sidebar - Effects */}
        <div className="col-span-2 flex flex-col gap-6">
          <EffectSelector />
          {/* Could add presets here */}
        </div>

        {/* Center - Preview & Timeline */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 h-full">
          <div className="w-full aspect-square bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-white/5 relative mx-auto">
            <PreviewCanvas />

            {/* Overlay Uploader if no file */}
            {!file && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center p-12">
                <AudioUploader />
              </div>
            )}
          </div>

          <div className="h-auto shrink-0">
            <Timeline />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="col-span-3 h-full overflow-hidden">
          <PropertiesPanel />
        </div>

      </main>
    </div>
  );
}

export default App;
