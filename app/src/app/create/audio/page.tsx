'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '../../../lib/firebase/auth';
import { callSynthesizePoemAudio, subscribeLivingPages } from '../../../lib/firebase/firestore';

export default function CreateAudio() {
  const [user, setUser] = useState<User | null>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [selectedPoemId, setSelectedPoemId] = useState<string>('');
  const [voiceTier, setVoiceTier] = useState<'standard' | 'premium'>('standard');
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged((u) => {
      setUser(u);
      if (!u) router.push('/');
    });
    return unsubscribeAuth;
  }, [router]);

  useEffect(() => {
    if (user) {
      // For simplicity, we list the user's recent living_pages/poems
      return subscribeLivingPages(user.uid, (pages) => {
        setPoems(pages);
        if (pages.length > 0 && !selectedPoemId) setSelectedPoemId(pages[0].id);
      });
    }
  }, [user]);

  async function handleSynthesize() {
    if (!selectedPoemId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await callSynthesizePoemAudio({
        poemId: selectedPoemId,
        tier: voiceTier,
      });
      const data = result.data as any;
      setAudioURL(data.audioURL);
    } catch (err: any) {
      setError(err.message || 'Synthesis failed. Check your credits (3 - 10 CR).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page">
      <div className="glass-card animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
        <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Voice <span className="text-accent">Synthesis</span></h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Select a poem and a voice tier to hear your Muse perform (3 - 10 CR).</p>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label style={labelStyle}>Select a Poem</label>
          {poems.length > 0 ? (
            <select 
              value={selectedPoemId} 
              onChange={(e) => setSelectedPoemId(e.target.value)}
              style={selectStyle}
            >
              {poems.map(p => (
                <option key={p.id} value={p.id}>{p.id} - {p.createdAt?.toDate().toLocaleDateString()}</option>
              ))}
            </select>
          ) : (
            <div className="card" style={{ padding: '16px', background: 'var(--orchid-50)', color: 'var(--orchid-700)' }}>
              No poems found. <button className="btn btn-secondary btn-sm" onClick={() => router.push('/create/poem')}>Go Create One</button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label style={labelStyle}>Voice Quality</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button 
              className={`card ${voiceTier === 'standard' ? 'active-tier' : ''}`}
              onClick={() => setVoiceTier('standard')}
              style={tierCardStyle}
            >
              <p style={{ fontWeight: '700' }}>Standard</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Clear & Emotionally Adaptive</p>
              <div style={{ marginTop: '12px', fontWeight: 'bold' }}>3 CR</div>
            </button>
            <button 
              className={`card ${voiceTier === 'premium' ? 'active-tier' : ''}`}
              onClick={() => setVoiceTier('premium')}
              style={tierCardStyle}
            >
              <p style={{ fontWeight: '700' }}>Premium</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Ultra-Realistic & Breathy</p>
              <div style={{ marginTop: '12px', fontWeight: 'bold' }}>10 CR</div>
            </button>
          </div>
        </div>

        {error && <div className="card" style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', margin: 'var(--space-md) 0' }}>⚠️ {error}</div>}

        <div style={{ textAlign: 'center' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              {audioURL ? (
                <div className="card animate-bloom" style={{ padding: 'var(--space-xl)', background: 'white' }}>
                  <audio controls src={audioURL} style={{ width: '100%' }} />
                </div>
              ) : (
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handleSynthesize} 
                  disabled={!selectedPoemId}
                  style={{ width: '100%' }}
                >
                  🎙️ Synthesize Audio
                </button>
              )}
            </>
          )}
        </div>

        {audioURL && !loading && (
          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setAudioURL(null)}>🔄 Regenerate</button>
            <button className="btn btn-primary" onClick={() => router.push('/gallery')}>💜 Save to Gallery</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .active-tier {
          border-color: var(--orchid-500) !important;
          background: var(--orchid-50) !important;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
        }
      `}</style>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '0.9rem',
  color: 'var(--neutral-700)',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-subtle)',
  background: 'white',
  fontFamily: 'var(--font-sans)',
};

const tierCardStyle: React.CSSProperties = {
  padding: '20px',
  cursor: 'pointer',
  background: 'white',
  textAlign: 'center',
};
