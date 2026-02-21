import React, { useState, useEffect } from 'react';

/**
 * Sparkler Custom Cursor
 * A premium trailing spark effect that follows the mouse.
 * Features:
 * - Trailing "ember" dots with physics-like lag
 * - Molten orange glow
 * - Scaling on interactive elements
 */
const Sparkler = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Update trail
      setTrail((prev) => {
        const newTrail = [{ x: e.clientX, y: e.clientY }, ...prev.slice(0, 8)];
        return newTrail;
      });

      // Check for pointers
      const target = e.target;
      const isClickable = window.getComputedStyle(target).cursor === 'pointer' || 
                         target.tagName === 'A' || 
                         target.tagName === 'BUTTON' ||
                         target.closest('button') ||
                         target.closest('a');
      setIsPointer(isClickable);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sparkler-container no-print" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {/* Main Spark */}
      <div 
        className="spark-main"
        style={{
          position: 'absolute',
          width: isPointer ? '24px' : '10px',
          height: isPointer ? '24px' : '10px',
          background: isPointer ? 'rgba(249, 115, 22, 0.15)' : '#f97316',
          borderRadius: '50%',
          transform: `translate(${position.x - (isPointer ? 12 : 5)}px, ${position.y - (isPointer ? 12 : 5)}px)`,
          transition: 'width 0.3s, height 0.3s, background 0.3s',
          border: isPointer ? '1.5px solid rgba(249, 115, 22, 0.5)' : 'none',
          boxShadow: isPointer ? '0 0 20px rgba(249, 115, 22, 0.3)' : '0 0 10px rgba(249, 115, 22, 0.6)',
        }}
      />

      {/* Trailing Embers */}
      {trail.map((p, i) => (
        <div 
          key={i}
          className="spark-ember"
          style={{
            position: 'absolute',
            width: `${4 - i * 0.4}px`,
            height: `${4 - i * 0.4}px`,
            background: `rgba(249, 115, 22, ${0.6 - i * 0.07})`,
            borderRadius: '50%',
            transform: `translate(${p.x - 2}px, ${p.y - 2}px)`,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Secondary Glow (Cool Cyan) */}
      <div 
        style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 70%)',
          transform: `translate(${position.x - 30}px, ${position.y - 30}px)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default Sparkler;
