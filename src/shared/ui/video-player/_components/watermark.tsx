import { useEffect, useRef, useState } from 'react';

interface WatermarkProps {
    text: string;
    isPlaying: boolean;
}

export const Watermark = ({ text, isPlaying }: WatermarkProps) => {
    const [position, setPosition] = useState<{
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    }>({ top: '10px', left: '10px' });

    const [style, setStyle] = useState<React.CSSProperties>({
        width: '12.65%',
        height: '5.55%',
        fontSize: '24px',
    });

    const shadowHostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateWatermarkStyle = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            setStyle({
                width: `${(243 / 1920) * 100}% + 50px`,
                height: `${(60 / 1080) * 100}%`,
                fontSize: `${Math.min(screenWidth, screenHeight) * 0.03}px`,
                lineHeight: `${Math.min(screenWidth, screenHeight) * 0.015 * 1.2}px`,
            });
        };

        updateWatermarkStyle();
        window.addEventListener('resize', updateWatermarkStyle);

        return () => window.removeEventListener('resize', updateWatermarkStyle);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        const updatePosition = () => {
            const positions = [
                { top: '10px', left: '10px' },
                { top: '10px', right: '10px' },
                { bottom: '10px', left: '10px' },
                { bottom: '10px', right: '10px' },
            ];

            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            setPosition(randomPosition);
        };

        if (isPlaying) {
            updatePosition();
            interval = setInterval(updatePosition, 10 * 1000); // Change position every 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    useEffect(() => {
        if (!shadowHostRef.current?.shadowRoot) {
            const shadowRoot = shadowHostRef.current?.attachShadow({ mode: 'open' });
            if (shadowRoot) {
                const container = document.createElement('div');
                container.setAttribute('id', 'watermark-container');
                shadowRoot.appendChild(container);
            }
        }

        const updateWatermark = () => {
            const container = shadowHostRef.current?.shadowRoot?.getElementById('watermark-container');
            if (container) {
                container.innerHTML = `
          <div
            style="
              position: absolute;
              top: ${position.top || 'unset'};
              bottom: ${position.bottom || 'unset'};
              left: ${position.left || 'unset'};
              right: ${position.right || 'unset'};
              z-index: 10;
              background: rgba(145, 158, 171, 0.32);
              padding: 10px;
              border-radius: 8px;
              user-select: none;
              width: ${style.width};
              height: ${style.height};
              font-size: ${style.fontSize};
              line-height: ${style.lineHeight};
              display: flex;
              justify-content: center;
              align-items: center;
            "
          >
            <span
              style="
                color: white;
                font-family: Roboto, sans-serif;
                font-weight: bold;
                text-transform: uppercase;
                text-align: center;
              "
            >
              ${text}
            </span>
          </div>
        `;
            }
        };

        updateWatermark();
    }, [position, style, text]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!document.fullscreenElement;
            const container = shadowHostRef.current?.shadowRoot?.getElementById('watermark-container');

            if (isFullscreen && container && document.fullscreenElement) {
                document.fullscreenElement.appendChild(container);
            } else if (container && shadowHostRef.current?.shadowRoot) {
                shadowHostRef.current.shadowRoot.appendChild(container);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={shadowHostRef}
            className="absolute pointer-events-none top-0 left-0 w-full h-full z-[1]"
        />
    );
};
