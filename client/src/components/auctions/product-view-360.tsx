
import { useState, useRef, useEffect } from 'react';

interface ProductView360Props {
  images: string[];
  className?: string;
}

export function ProductView360({ images, className = '' }: ProductView360Props) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const delta = e.pageX - startX.current;
    const frameStep = Math.floor(delta / 20);
    
    let newFrame = currentFrame + frameStep;
    if (newFrame >= images.length) newFrame = 0;
    if (newFrame < 0) newFrame = images.length - 1;
    
    setCurrentFrame(newFrame);
    startX.current = e.pageX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img 
        src={images[currentFrame]} 
        alt="Product 360 view"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
