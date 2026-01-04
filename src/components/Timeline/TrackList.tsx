import React from 'react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { cn } from '../../utils/cn';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableTrackItemProps {
    track: any;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({ track, isSelected, onSelect, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onSelect(track.id)}
            className={cn(
                "h-8 rounded px-2 flex items-center justify-between text-xs font-medium cursor-pointer transition-colors border select-none",
                isSelected
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-white/5 border-white/5 text-secondary hover:bg-white/10",
                isDragging && "opacity-50"
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <GripVertical size={12} className="text-white/20" />
                <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: track.properties.color }}
                />
                <span className="truncate">{track.name}</span>
            </div>

            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(track.id);
                    }}
                    className="text-white/50 hover:text-white hover:bg-white/10 p-1 rounded flex-shrink-0"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export const TrackList: React.FC = () => {
    const { tracks, selectedTrackId, selectTrack, removeTrack, moveTrack } = useVisualizerStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tracks.findIndex((t) => t.id === active.id);
            const newIndex = tracks.findIndex((t) => t.id === over.id);
            moveTrack(oldIndex, newIndex);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={tracks}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-1 mt-2">
                    {tracks.map((track) => (
                        <SortableTrackItem
                            key={track.id}
                            track={track}
                            isSelected={selectedTrackId === track.id}
                            onSelect={selectTrack}
                            onRemove={removeTrack}
                        />
                    ))}
                    {tracks.length === 0 && (
                        <div className="text-xs text-secondary/40 italic p-2 text-center">
                            No active effects
                        </div>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    );
};
