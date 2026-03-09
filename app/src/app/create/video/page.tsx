'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '../../../lib/firebase/auth';
import { callGenerateVideo, subscribeLivingPages, subscribeToUserProfile } from '../../../lib/firebase/firestore';

export default function CreateVideo() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('720p');
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
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
      subscribeToUserProfile(user.uid, (p) => {
        setProfile(p);
        if (p && !['pro', 'studio'].includes(p.subscriptionTier?.toLowerCase())) {
          router.push('/pricing'); // Gated
        }
      });
      return subscribeLivingPages(user.uid, (data) => {
        setPages(data);
        if (data.length > 0 && !selectedPageId) setSelectedPageId(data[0].id);
      });
    }
  }, [user, router]);

  async function handleGenerate() {
    if (!selectedPageId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await callGenerateVideo({
        livingPageId: selectedPageId,
        qualityTier: quality,
      });
      const data = result.data as any;
      setVideoURL(data.videoURL);
    } catch (err: any) {
      setError(err.message || 'Video generation failed. Check your credits (20 - 80 CR).');
    } finally {
      setLoading(false);
    }
  }

  if (profile && !['pro', 'studio'].includes(profile.subscriptionTier?.toLowerCase())) {
     return <div className="loading-center"><p>Redirecting to Upgrades...</p></div>;
  }

  return (
    <main className="container page">
      <div className="glass-card animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
        <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Living <span className="text-accent">Performance</span></h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Transform your creation into a cinematic performance (20 - 80 CR).</p>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label style={labelStyle}>Select a Living Page</label>
          <select 
            value={selectedPageId} 
            onChange={(e) => setSelectedPageId(e.target.value)}
            style={selectStyle}
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.createdAt?.toDate().toLocaleDateString()}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label style={labelStyle}>Cinematic Quality</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: '720p', label: '720p', cost: 20, desc: 'HD Quality' },
              { id: '1080p', label: '1080p', cost: 40, desc: 'Full HD' },
              { id: '4k', label: '4k', cost: 80, desc: 'Ultra HD' }
            ].map(q => (
              <button 
                key={q.id} 
                className={`card ${quality === q.id ? 'active-tier' : ''}`}
                onClick={() => setQuality(q.id as any)}
                style={tierCardStyle}
              >
                <p style={{ fontWeight: '700' }}>{q.label}</p>
                <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{q.desc}</p>
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>{q.cost} CR</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="card" style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', margin: 'var(--space-md) 0' }}>⚠️ {error}</div>}

        <div style={{ textAlign: 'center' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto var(--space-md)' }} />
              <p className="text-muted">Directing your Muse... This may take a minute.</p>
            </div>
          ) : (
            <>
              {videoURL ? (
                <div className="card animate-bloom" style={{ padding: 'var(--space-xl)', background: 'black' }}>
                  <video controls src={videoURL} style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                </div>
              ) : (
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handleGenerate} 
                  disabled={!selectedPageId}
                  style={{ width: '100%' }}
                >
                  🎭 Generate Performance
                </button>
              )}
            </>
          )}
        </div>

        {videoURL && !loading && (
          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setVideoURL(null)}>🔄 Regenerate</button>
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
  padding: '16px',
  cursor: 'pointer',
  background: 'white',
  textAlign: 'center',
};
