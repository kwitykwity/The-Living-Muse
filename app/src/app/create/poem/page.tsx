'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '../../../lib/firebase/auth';
import { subscribeToUserProfile, callGeneratePoem, callStartConversationalSession } from '../../../lib/firebase/firestore';
import ChatModule from '@/components/creative/ChatModule';
import { User } from 'firebase/auth';

const VIBE_PRESETS = [
  { id: 'harlem_soul', label: 'Harlem Soul', icon: '🎷' },
  { id: 'k_dreamer', label: 'K-Dreamer', icon: '☁️' },
  { id: 'orchid_noir', label: 'Orchid Noir', icon: '🖤' },
  { id: 'cosmic_bloom', label: 'Cosmic Bloom', icon: '🌌' }
];

export default function CreatePoem() {
  const [user, setUser] = useState<User | null>(null);
  const [vibe, setVibe] = useState('orchid_noir');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [poem, setPoem] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [poemId, setPoemId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      if (!u) router.push('/');
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
        if (profile?.vibePreset) setVibe(profile.vibePreset);
      });
      return unsubscribe;
    }
  }, [user]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await callGeneratePoem({ 
        vibe, 
        prompt: prompt.trim() || undefined 
      });
      const data = result.data as any;
      setPoem(data.textContent);
      setSentiment(data.sentiment);
      setPoemId(data.poemId);

      // Start conversational session automatically
      const sessionResult = await callStartConversationalSession({});
      const sessionData = sessionResult.data as any;
      setSessionId(sessionData.sessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate poem. Do you have enough credits?');
    } finally {
      setLoading(false);
    }
  }

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'joyful': return 'rgba(250, 204, 21, 0.1)';
      case 'melancholic': return 'rgba(59, 130, 246, 0.1)';
      case 'fierce': return 'rgba(239, 68, 68, 0.1)';
      case 'mysterious': return 'rgba(107, 114, 128, 0.1)';
      default: return 'white';
    }
  };

  return (
    <main className="container page">
      <div className="glass-card animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
        <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Discover Your <span className="text-accent">Poem</span></h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Select a vibe and let the Muse breathe life into words (1 CR).</p>

        <div style={vibeGrid}>
          {VIBE_PRESETS.map(v => (
            <button 
              key={v.id} 
              className={`card ${vibe === v.id ? 'active-vibe' : ''}`}
              onClick={() => setVibe(v.id)}
              style={vibeButtonStyle}
            >
              <span style={{ fontSize: '1.5rem' }}>{v.icon}</span>
              <span style={{ fontWeight: '600' }}>{v.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-xl)' }}>
          <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Optional Semantic Direction (e.g. "a walk in the rain", "the hope of spring")</label>
          <input 
            type="text" 
            className="input" 
            placeholder="What's on your soul today?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.5)' }}
          />
        </div>

        {error && <div className="card" style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', margin: 'var(--space-md) 0' }}>⚠️ {error}</div>}

        <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : !poem ? (
            <button className="btn btn-primary btn-lg" onClick={handleGenerate}>
              ✨ Invoke the Muse
            </button>
          ) : null}
        </div>

        {poem && !loading && (
          <div style={{ marginTop: 'var(--space-2xl)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="poem-display">
              <div className="card animate-bloom" style={{ padding: 'var(--space-xl)', background: getSentimentColor(), border: '1px solid var(--border-subtle)', height: 'fit-content' }}>
                <p className="poem-text" style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-main)' }}>{poem}</p>
              </div>
              
              <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => { setPoem(null); setPoemId(null); setSessionId(null); }}>🔄 New Verse</button>
                <button className="btn btn-primary" onClick={() => router.push('/gallery')}>💜 Save & Close</button>
              </div>
            </div>

            <div className="chat-refinement" style={{ height: '500px' }}>
              {sessionId && poemId && (
                <ChatModule 
                  sessionId={sessionId} 
                  poemId={poemId} 
                  onPoemUpdate={(newPoem) => setPoem(newPoem)} 
                />
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .active-vibe {
          border-color: var(--orchid-500) !important;
          background: var(--orchid-50) !important;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
        }
        .poem-display {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </main>
  );
}

const vibeGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const vibeButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 20px',
  cursor: 'pointer',
  background: 'white',
  border: '1px solid var(--border-subtle)',
};
