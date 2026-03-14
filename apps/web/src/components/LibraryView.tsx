'use client';

import React, { useEffect } from 'react';
import { useSoundStore } from '@make-a-sound/state';
import { Play, MapPin, Calendar, MoreHorizontal } from 'lucide-react';
import { supabase, handleSupabaseCall } from '../lib/supabase';
import { Sound } from '@make-a-sound/types';

export default function LibraryView() {
  const { sounds, setSounds } = useSoundStore();
  
  // Custom Scramble Animation Logic
  const [displayText, setDisplayText] = React.useState('Make a Sound');
  const targetText = 'Make a Sound';
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  
  useEffect(() => {
    let frame = 0;
    const duration = 40; // Total frames
    const interval = 40; // ms per frame
    
    const scramble = () => {
      let output = '';
      let complete = 0;
      
      for (let i = 0; i < targetText.length; i++) {
        const char = targetText[i];
        if (char === ' ') {
          output += ' ';
          complete++;
          continue;
        }
        
        // Progression based on frame index
        const revealAt = (duration / targetText.length) * i;
        if (frame >= revealAt) {
          output += char;
          complete++;
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(output);
      
      if (complete < targetText.length && frame < duration + 10) {
        frame++;
        setTimeout(scramble, interval);
      }
    };
    
    setTimeout(scramble, 100); // Initial delay
  }, []);

  useEffect(() => {
    const fetchSounds = async () => {
      const data = await handleSupabaseCall<Sound[]>(
        async () => {
          const res = await supabase
            .from('sounds')
            .select('*')
            .order('created_at', { ascending: false });
          return res as { data: Sound[] | null; error: any };
        },
        'Fetch Sounds'
      );
      
      if (data) {
        setSounds(data);
      }
    };

    fetchSounds();
  }, [setSounds]);

  return (
    <div className="library-container">
      <header className="library-header">
        <h1>{displayText}</h1>
        <p>A collection of life's meaningful frequencies.</p>
      </header>

      <div className="sounds-grid">
        {sounds.length === 0 ? (
          <div className="empty-state">
            <p>No sounds captured yet. Use the mobile app to record your first sound.</p>
          </div>
        ) : (
          sounds.map((sound) => (
            <div key={sound.id} className="sound-card premium-glass">
              <div className="sound-info">
                <h3>{sound.title || 'Untitled Sound'}</h3>
                <div className="metadata">
                  <span><Calendar size={14} /> {new Date(sound.captured_at).toLocaleDateString()}</span>
                  <span><MapPin size={14} /> {sound.location_label || 'Unknown Location'}</span>
                </div>
              </div>
              <button className="play-btn">
                <Play fill="currentColor" />
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .library-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-08) var(--spacing-06);
        }
        .library-header {
          margin-bottom: var(--spacing-08);
          border-bottom: 2px solid var(--interactive-03);
          padding-bottom: var(--spacing-06);
        }
        .library-container .library-header h1 {
          font-size: 24px !important;
          margin: 0 0 var(--spacing-03) 0;
          font-weight: 400 !important; /* Regular */
          font-family: var(--font-heading);
          letter-spacing: 0.02em;
          min-height: 36px; /* Prevent layout jitter during scramble */
        }
        .library-header p {
          color: var(--text-placeholder);
          font-size: 14px;
          max-width: 600px;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .sounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: var(--spacing-06);
        }
        .sound-card {
          padding: var(--spacing-07);
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--layer-01);
          border-left: 4px solid var(--border-subtle);
        }
        .sound-card:hover {
          transform: translateX(4px);
          border-left-color: var(--interactive-03);
        }
        .sound-info h3 {
          margin: 0 0 var(--spacing-04) 0;
          font-size: 24px;
          font-weight: 600;
        }
        .metadata {
          display: flex;
          gap: var(--spacing-06);
          color: var(--text-secondary);
          font-size: 14px;
          font-family: var(--font-main);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .metadata span {
          display: flex;
          align-items: center;
          gap: var(--spacing-02);
        }
        .play-btn {
          width: 64px;
          height: 64px;
          border-radius: 4px;
          background: var(--interactive-03);
          color: var(--text-on-color);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .play-btn:hover {
          background: #be95ff;
          transform: scale(1.05);
        }
        .empty-state {
          grid-column: 1 / -1;
          padding: var(--spacing-08);
          text-align: center;
          border: 1px dashed var(--border-strong);
          color: var(--text-placeholder);
        }
      `}</style>
    </div>
  );
}
