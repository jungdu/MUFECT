import { useEffect } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { useVisualizerStore } from '../stores/visualizerStore';

export const useKeyboardShortcuts = () => {
    const { file, isPlaying, setIsPlaying } = useAudioStore();
    const { selectedTrackId, removeTrack } = useVisualizerStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            // Play/Pause with Space
            if (e.code === 'Space' && file) {
                if (isInputFocused) return;
                e.preventDefault();
                setIsPlaying(!isPlaying);
            }

            // Delete selected track with Backspace or Delete
            if ((e.code === 'Backspace' || e.code === 'Delete') && selectedTrackId) {
                if (isInputFocused) return;
                // create-react-app or vite might hot reload, let's keep default behavior for inputs just in case,
                // but for body focus we delete the track
                removeTrack(selectedTrackId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file, isPlaying, setIsPlaying, selectedTrackId, removeTrack]);
};
