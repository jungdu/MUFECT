import { useState } from 'react';
import { PanelLeftClose } from 'lucide-react';
import { useAudioStore } from './stores/audioStore';
import { useVisualizerStore } from './stores/visualizerStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AudioUploader } from './components/AudioUploader/AudioUploader';
import { Timeline } from './components/Timeline/Timeline';
import { PreviewCanvas } from './components/Preview/PreviewCanvas';
import { EffectSelector } from './components/Editor/EffectSelector';
import { ImagePanel } from './components/Editor/ImagePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { ResetButton } from './components/Export/ResetButton';
import { ExportButton } from './components/Export/ExportButton';
import { Sidebar } from './components/Layout/Sidebar';

function App() {
  const { file } = useAudioStore();
  const selectedTrackId = useVisualizerStore((state) => state.selectedTrackId);
  const selectTrack = useVisualizerStore((state) => state.selectTrack);
  const [activeTab, setActiveTab] = useState('audio-effect');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useKeyboardShortcuts();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    selectTrack(null);
    setIsPanelOpen(true);
  };

  // Dynamic Left Panel Content
  let LeftPanel: React.FC = () => null;
  let panelTitle = '';

  if (activeTab === 'audio-effect') {
    LeftPanel = selectedTrackId ? PropertiesPanel : EffectSelector;
    panelTitle = selectedTrackId ? 'Effect Properties' : 'Add Effect';
  } else if (activeTab === 'image') {
    LeftPanel = selectedTrackId ? PropertiesPanel : ImagePanel;
    panelTitle = selectedTrackId ? 'Image Properties' : 'Add Image';
  } else {
    // For unimplemented tabs, show empty state
    LeftPanel = () => (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <p className="text-secondary mb-2">Coming Soon</p>
        <p className="text-xs text-secondary/50">This feature is not yet available.</p>
      </div>
    );
    // Capitalize first letter for title
    panelTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  }

  return (
    <div className="h-screen bg-background text-white flex font-sans overflow-hidden">
      {/* Left Navigation Rail */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Dynamic Side Panel (Effect Selector or Properties) */}
      {isPanelOpen && (
        <div className="w-[320px] h-full border-r border-white/5 bg-surface/30 backdrop-blur-sm flex flex-col transition-all duration-300">
          <div className="h-10 flex items-center justify-between px-4 shrink-0">
            <h2 className="font-semibold text-xs tracking-wide text-white/50 uppercase">
              {panelTitle}
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-white/30 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-md"
              title="Close Panel"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LeftPanel />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-12 flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-4">
            <ResetButton />
            <ExportButton />
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 p-6 pt-2 flex flex-col gap-6 overflow-hidden">
          {/* Preview Canvas Area */}
          <div className="flex-1 min-h-0 bg-black/50 overflow-hidden shadow-2xl border border-white/5 relative flex flex-col">
            <PreviewCanvas />

            {/* Overlay Uploader if no file */}
            {!file && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center p-12">
                <AudioUploader />
              </div>
            )}
          </div>

          {/* Timeline Area - Fixed height or resizable? Fixed for now to match previous */}
          <div className="h-auto shrink-0">
            <Timeline />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
