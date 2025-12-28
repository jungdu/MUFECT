import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onReset?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, onReset }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-xs text-secondary font-medium">{label}</span>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="text-secondary/50 hover:text-white transition-colors p-0.5"
                        title="Reset"
                    >
                        <RotateCcw size={10} />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-secondary uppercase">{value}</span>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                />
            </div>
        </div>
    );
};
