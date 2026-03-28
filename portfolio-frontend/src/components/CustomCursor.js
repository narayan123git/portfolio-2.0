'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref to track the actual DOM element for smoothing
  const cursorRef = useRef(null);

  useEffect(() => {
    // Hide default cursor globally when this component mounts
    document.body.style.cursor = 'none';

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
      document.body.style.cursor = 'auto'; // Restore normal cursor on unmount
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      {/* 
        The "Terminal Block" cursor. 
        It's a solid block that expands slightly when hovering over links.
      */}
      <div 
        className={`w-4 h-6 bg-green-500 transition-all duration-300 ${
          isHovering 
            ? 'scale-150 rotate-90 rounded-sm' 
            : 'scale-100 rotate-0 rounded-none animate-pulse'
        }`}
        style={{
          // Center the block on the actual point
          transform: 'translate(-50%, -50%)', 
        }}
      />
    </div>
  );
}