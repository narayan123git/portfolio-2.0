'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [supportsFinePointer, setSupportsFinePointer] = useState(false);
  
  // Ref to track the actual DOM element for smoothing
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: fine)');
    setSupportsFinePointer(mediaQuery.matches);

    const onChange = (event) => setSupportsFinePointer(event.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    if (!supportsFinePointer) return;

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Check if we are hovering over a clickable element
      const target = e.target;
      const isClickable = target.closest('a') || target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea');
      setIsHovering(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [supportsFinePointer]);

  if (!supportsFinePointer) return null;

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-75 ease-out`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div 
        className={`transition-all duration-200 border border-cyan-300/80 bg-cyan-300/15 backdrop-blur-[1px] shadow-[0_0_10px_rgba(34,211,238,0.4)] ${
          isHovering 
            ? 'w-5 h-5 rounded-full scale-110' 
            : 'w-3 h-3 rounded-full scale-100'
        }`}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}