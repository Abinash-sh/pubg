import React, { useRef, useState, useCallback } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number) => void;
  onSprintLockChange?: (locked: boolean) => void;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({ onMove, onSprintLockChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const radius = 55; // Maximum joystick drag radius in px

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    setActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(radius, dist);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Normalize -1 to +1
    const normX = knobX / radius;
    const normY = knobY / radius;
    onMove(normX, normY);

    // If dragged hard forward, trigger sprint
    if (normY < -0.85 && onSprintLockChange) {
      onSprintLockChange(true);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-32 h-32 rounded-full bg-black/40 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center touch-none select-none shadow-2xl"
    >
      {/* Outer directional tick guides */}
      <div className="absolute top-1.5 w-1 h-2 bg-white/40 rounded-full" />
      <div className="absolute bottom-1.5 w-1 h-2 bg-white/40 rounded-full" />
      <div className="absolute left-1.5 h-1 w-2 bg-white/40 rounded-full" />
      <div className="absolute right-1.5 h-1 w-2 bg-white/40 rounded-full" />

      {/* Center stick knob */}
      <div
        className={`w-14 h-14 rounded-full border-2 transition-transform duration-75 flex items-center justify-center shadow-lg ${
          active
            ? 'bg-amber-500/80 border-amber-300 scale-110 shadow-amber-500/50'
            : 'bg-white/25 border-white/40'
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/70" />
      </div>
    </div>
  );
};
