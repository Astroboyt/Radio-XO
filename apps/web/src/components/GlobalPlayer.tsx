'use client';

import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useSoundStore } from '@make-a-sound/state';

export const GlobalPlayer = () => {
  const player = useRef<Tone.Player | null>(null);

  useEffect(() => {
    player.current = new Tone.Player().toDestination();
    return () => {
      player.current?.dispose();
    };
  }, []);

  // Future logic for playing sounds from R2 signed URLs
  
  return (
    <div className="global-player premium-glass">
      <div className="player-content">
        <p className="status">Select a sound to play</p>
      </div>
      <style jsx>{`
        .global-player {
          position: fixed;
          bottom: var(--spacing-06);
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 900px;
          height: 88px;
          border-radius: 8px;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 var(--spacing-07);
          background: var(--glass);
          backdrop-filter: blur(24px);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-premium);
        }
        .status {
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
