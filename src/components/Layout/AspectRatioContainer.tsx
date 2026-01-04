import React, { useEffect, useRef, useState } from 'react';

interface AspectRatioContainerProps {
    ratio?: number; // default 16/9
    children: React.ReactNode;
    className?: string; // For the inner container
}

export const AspectRatioContainer: React.FC<AspectRatioContainerProps> = ({
    ratio = 16 / 9,
    children,
    className = ""
}) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = outerRef.current;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: containerW, height: containerH } = entry.contentRect;

                let w = containerW;
                let h = w / ratio;

                if (h > containerH) {
                    h = containerH;
                    w = h * ratio;
                }

                setDimensions({ width: w, height: h });
            }
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [ratio]);

    return (
        <div ref={outerRef} className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <div
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    // Avoid layout shift during initial render if 0
                    opacity: dimensions.width ? 1 : 0
                }}
                className={`relative transition-[width,height] duration-75 ${className}`}
            >
                {children}
            </div>
        </div>
    );
};
