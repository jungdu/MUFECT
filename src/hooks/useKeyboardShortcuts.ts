import { useEffect } from 'react';
import { useAudioStore } from '../stores/audioStore';

export const useKeyboardShortcuts = () => {
    const { file, isPlaying, setIsPlaying } = useAudioStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Play/Pause with Space
            if (e.code === 'Space' && file) {
                // Ignore if focus is on an input or textarea
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }

                e.preventDefault();
                setIsPlaying(!isPlaying);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file, isPlaying, setIsPlaying]);
};
