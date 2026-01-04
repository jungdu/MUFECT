import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { cn } from '../../utils/cn';
import { RotateCcw } from 'lucide-react';

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    onReset?: () => void;
    className?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
    label, value, min, max, step = 1, unit, onChange, onReset, className
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between text-xs text-secondary font-medium">
                <div className="flex items-center gap-2">
                    <span>{label}</span>
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
                <span>{Number(value).toFixed(1)}{unit}</span>
            </div>

            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[value]}
                max={max}
                min={min}
                step={step}
                onValueChange={(vals) => onChange(vals[0])}
            >
                <Slider.Track className="bg-surface relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-primary rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                    className="block w-4 h-4 bg-white border border-primary/20 shadow-[0_2px_10px] shadow-black/20 rounded-full hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    aria-label={label}
                />
            </Slider.Root>
        </div>
    );
};
