/**
 * components/MobileControls.tsx
 * Touch-based input controls for mobile/tablet gameplay
 * Supports portrait and landscape orientations
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

export interface MobileControlsConfig {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onStop: () => void;
  enabled: boolean;
  orientation: 'portrait' | 'landscape';
}

interface TouchState {
  isLeftPressed: boolean;
  isRightPressed: boolean;
  isJumpPressed: boolean;
}

export const MobileControls: React.FC<MobileControlsConfig> = ({
  onLeft,
  onRight,
  onJump,
  onStop,
  enabled,
  orientation
}) => {
  const [touchState, setTouchState] = useState<TouchState>({
    isLeftPressed: false,
    isRightPressed: false,
    isJumpPressed: false
  });

  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftButtonRef = useRef<HTMLDivElement>(null);
  const rightButtonRef = useRef<HTMLDivElement>(null);
  const jumpButtonRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileDevice || window.innerWidth <= 768);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  // Handle left button touch
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchState(prev => ({ ...prev, isLeftPressed: true }));
    onLeft();
  };

  const handleLeftTouchEnd = () => {
    setTouchState(prev => ({ ...prev, isLeftPressed: false }));
    onStop();
  };

  // Handle right button touch
  const handleRightTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchState(prev => ({ ...prev, isRightPressed: true }));
    onRight();
  };

  const handleRightTouchEnd = () => {
    setTouchState(prev => ({ ...prev, isRightPressed: false }));
    onStop();
  };

  // Handle jump button
  const handleJumpTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchState(prev => ({ ...prev, isJumpPressed: true }));
    onJump();
  };

  const handleJumpTouchEnd = () => {
    setTouchState(prev => ({ ...prev, isJumpPressed: false }));
  };

  // Handle keyboard fallback (for desktop testing)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTouchState(prev => ({ ...prev, isLeftPressed: true }));
        onLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTouchState(prev => ({ ...prev, isRightPressed: true }));
        onRight();
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        setTouchState(prev => ({ ...prev, isJumpPressed: true }));
        onJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setTouchState(prev => ({ ...prev, isLeftPressed: false }));
        onStop();
      } else if (e.key === 'ArrowRight') {
        setTouchState(prev => ({ ...prev, isRightPressed: false }));
        onStop();
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        setTouchState(prev => ({ ...prev, isJumpPressed: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, onLeft, onRight, onJump, onStop]);

  if (!enabled) return null;

  const isPortrait = orientation === 'portrait';

  return (
    <div
      ref={containerRef}
      className={`mobile-controls ${isPortrait ? 'portrait' : 'landscape'} ${
        !isMobile ? 'desktop-test-mode' : ''
      }`}
      style={{
        position: 'fixed',
        bottom: isPortrait ? '20px' : '10px',
        left: isPortrait ? '20px' : '10px',
        right: isPortrait ? '20px' : 'auto',
        zIndex: 100,
        display: 'flex',
        gap: isPortrait ? '10px' : '5px',
        justifyContent: isPortrait ? 'space-around' : 'flex-start',
        alignItems: 'center',
        padding: isPortrait ? '20px' : '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px'
      }}
    >
      {/* Left Movement Button */}
      <div
        ref={leftButtonRef}
        onTouchStart={handleLeftTouchStart}
        onTouchEnd={handleLeftTouchEnd}
        onMouseDown={handleLeftTouchStart as any}
        onMouseUp={handleLeftTouchEnd}
        className={`mobile-button ${touchState.isLeftPressed ? 'active' : ''}`}
        style={{
          width: isPortrait ? '60px' : '50px',
          height: isPortrait ? '60px' : '50px',
          backgroundColor: touchState.isLeftPressed ? '#4CAF50' : '#2196F3',
          border: '2px solid #1976D2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'all 0.1s ease',
          transform: touchState.isLeftPressed ? 'scale(0.95)' : 'scale(1)',
          boxShadow: touchState.isLeftPressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <ChevronLeft size={isPortrait ? 32 : 24} color="white" />
      </div>

      {/* Jump Button (Center) */}
      <div
        ref={jumpButtonRef}
        onTouchStart={handleJumpTouchStart}
        onTouchEnd={handleJumpTouchEnd}
        onMouseDown={handleJumpTouchStart as any}
        onMouseUp={handleJumpTouchEnd}
        className={`mobile-button jump ${touchState.isJumpPressed ? 'active' : ''}`}
        style={{
          width: isPortrait ? '80px' : '60px',
          height: isPortrait ? '80px' : '60px',
          backgroundColor: touchState.isJumpPressed ? '#FF9800' : '#FF6F00',
          border: '3px solid #E65100',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'all 0.1s ease',
          transform: touchState.isJumpPressed ? 'scale(0.9)' : 'scale(1)',
          boxShadow: touchState.isJumpPressed
            ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
            : '0 4px 8px rgba(0,0,0,0.2)',
          fontSize: isPortrait ? '14px' : '12px',
          fontWeight: 'bold'
        }}
      >
        <ArrowUp size={isPortrait ? 36 : 28} color="white" />
      </div>

      {/* Right Movement Button */}
      <div
        ref={rightButtonRef}
        onTouchStart={handleRightTouchStart}
        onTouchEnd={handleRightTouchEnd}
        onMouseDown={handleRightTouchStart as any}
        onMouseUp={handleRightTouchEnd}
        className={`mobile-button ${touchState.isRightPressed ? 'active' : ''}`}
        style={{
          width: isPortrait ? '60px' : '50px',
          height: isPortrait ? '60px' : '50px',
          backgroundColor: touchState.isRightPressed ? '#4CAF50' : '#2196F3',
          border: '2px solid #1976D2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'all 0.1s ease',
          transform: touchState.isRightPressed ? 'scale(0.95)' : 'scale(1)',
          boxShadow: touchState.isRightPressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <ChevronRight size={isPortrait ? 32 : 24} color="white" />
      </div>

      {/* Mobile Test Mode Indicator */}
      {!isMobile && (
        <div
          style={{
            fontSize: '10px',
            color: '#FFD700',
            marginLeft: '10px',
            padding: '4px 8px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          Desktop Test Mode
        </div>
      )}
    </div>
  );
};

export default MobileControls;
