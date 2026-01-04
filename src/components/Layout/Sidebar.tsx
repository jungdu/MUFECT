import React from 'react';
import {
    Music,
    Image as ImageIcon,
    Captions,
    Type,
    AudioWaveform,
    Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center gap-1 p-2 w-full rounded-lg transition-colors group",
            isActive ? "bg-white/10 text-white" : "text-secondary hover:text-white hover:bg-white/5"
        )}
    >
        <div className="p-1">{icon}</div>
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <aside className="w-[72px] h-full bg-surface/50 backdrop-blur-md border-r border-white/5 flex flex-col items-center py-4 gap-2 z-40">
            <div className="mb-2">
                <img src="/logo.svg" alt="MUFECT" className="w-8 h-8 rounded-lg" />
            </div>

            <div className="flex-1 w-full px-2 space-y-1 overflow-y-auto no-scrollbar">
                <SidebarItem
                    icon={<AudioWaveform size={20} />}
                    label="Audio Effect"
                    isActive={activeTab === 'audio-effect'}
                    onClick={() => onTabChange('audio-effect')}
                />
                <SidebarItem
                    icon={<ImageIcon size={20} />}
                    label="Image"
                    isActive={activeTab === 'image'}
                    onClick={() => onTabChange('image')}
                />
                <SidebarItem
                    icon={<Music size={20} />}
                    label="Audio"
                    isActive={activeTab === 'audio'}
                    onClick={() => onTabChange('audio')}
                />
                <SidebarItem
                    icon={<Captions size={20} />}
                    label="Subtitles"
                    isActive={activeTab === 'subtitles'}
                    onClick={() => onTabChange('subtitles')}
                />
                <SidebarItem
                    icon={<Type size={20} />}
                    label="Text"
                    isActive={activeTab === 'text'}
                    onClick={() => onTabChange('text')}
                />
            </div>

            <div className="w-full px-2 mt-auto">
                <SidebarItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    isActive={activeTab === 'settings'}
                    onClick={() => onTabChange('settings')}
                />
            </div>
        </aside>
    );
};
