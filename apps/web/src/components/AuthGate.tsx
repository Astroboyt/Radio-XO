'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Custom Scramble Animation Logic
  const [displayText, setDisplayText] = useState('Make a Sound');
  const targetText = 'Make a Sound';
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  React.useEffect(() => {
    if (session) return;
    let frame = 0;
    const duration = 40;
    const interval = 40;
    
    const scramble = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < targetText.length; i++) {
        const char = targetText[i];
        if (char === ' ') { output += ' '; complete++; continue; }
        const revealAt = (duration / targetText.length) * i;
        if (frame >= revealAt) { output += char; complete++; }
        else { output += chars[Math.floor(Math.random() * chars.length)]; }
      }
      setDisplayText(output);
      if (complete < targetText.length && frame < duration + 10) {
        frame++;
        setTimeout(scramble, interval);
      }
    };
    setTimeout(scramble, 100);
  }, [session]);

  // Check session on mount
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email for the confirmation link!');
    setLoading(false);
  };

  if (session) {
    return <>{children}</>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card premium-glass">
        <h1>{displayText}</h1>
        <p>Login to your archive</p>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <div className="auth-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Entering...' : 'Login'}
            </button>
            <button type="button" onClick={handleSignUp} disabled={loading} className="secondary-btn">
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .auth-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          color: var(--text-primary);
        }
        .auth-card {
          padding: var(--spacing-08);
          border-radius: 4px;
          width: 100%;
          max-width: 440px;
          text-align: center;
          background: var(--layer-01);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-premium);
        }
        .auth-container .auth-card h1 { 
          font-size: 24px !important; 
          margin-bottom: var(--spacing-03); 
          font-family: var(--font-heading);
          font-weight: 400 !important;
          letter-spacing: 0.05em;
          min-height: 36px;
        }
        p { 
          color: var(--text-secondary); 
          margin-bottom: var(--spacing-07); 
          font-size: 16px;
        }
        form { display: flex; flex-direction: column; gap: var(--spacing-05); }
        input {
          padding: var(--spacing-05);
          background: var(--layer-02);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          font-family: var(--font-main);
          transition: border-color 0.2s;
        }
        input:focus {
          border-color: var(--interactive-03);
        }
        .auth-actions { display: flex; gap: var(--spacing-04); margin-top: var(--spacing-04); }
        button {
          flex: 1;
          padding: var(--spacing-05);
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 14px;
        }
        .primary-btn { 
          background: var(--interactive-03); 
          color: var(--text-on-color); 
          border: none; 
        }
        .primary-btn:hover { background: #be95ff; }
        .secondary-btn { 
          background: transparent; 
          color: var(--text-primary); 
          border: 1px solid var(--border-strong); 
        }
        .secondary-btn:hover { background: var(--layer-02); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
