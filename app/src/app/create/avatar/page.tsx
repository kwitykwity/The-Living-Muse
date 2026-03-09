'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '../../../lib/firebase/auth';
import { subscribeToUserProfile, callCreateMuseFromPhoto } from '../../../lib/firebase/firestore';
import { uploadPhoto, generateMuseId } from '../../../lib/firebase/storage';
import { User } from 'firebase/auth';

const VIBE_PRESETS = [
  { id: 'harlem_soul', label: 'Harlem Soul', icon: '🎷' },
  { id: 'k_dreamer', label: 'K-Dreamer', icon: '☁️' },
  { id: 'orchid_noir', label: 'Orchid Noir', icon: '🖤' },
  { id: 'cosmic_bloom', label: 'Cosmic Bloom', icon: '🌌' }
];

export default function CreateAvatar() {
  const [user, setUser] = useState<User | null>(null);
  const [vibe, setVibe] = useState('orchid_noir');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleCreate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const museId = generateMuseId();
      const storagePath = await uploadPhoto(file, museId, (p) => setProgress(p.percent));
      
      const result = await callCreateMuseFromPhoto({
        photoStoragePath: storagePath,
        vibe,
        styleType: 'orchid_surrealism', // Base style, vibe overrides prompts
      });
      const data = result.data as any;
      setAvatarURL(data.avatarURL);
    } catch (err: any) {
      setError(err.message || 'Failed to create avatar. Check your credits (5 CR).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page">
      <div className="glass-card animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
        <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Stylized <span className="text-accent">Avatar</span></h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Transform your photo into a Muse of orchid and gold (5 CR).</p>

        <div style={vibeGrid}>
          {VIBE_PRESETS.map(v => (
            <button 
              key={v.id} 
              className={`card ${vibe === v.id ? 'active-vibe' : ''}`}
              onClick={() => setVibe(v.id)}
              style={vibeButtonStyle}
            >
              <span style={{ fontSize: '1.2rem' }}>{v.icon}</span>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{v.label}</span>
            </button>
          ))}
        </div>

        <div style={{ ...uploadZoneStyle, marginTop: 'var(--space-xl)' }} onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📸</span>
              <p style={{ fontWeight: '600', marginTop: '12px' }}>Click to upload a photo</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        {loading && (
          <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto var(--space-md)' }} />
            <p className="text-muted">{progress < 100 ? `Uploading... ${progress}%` : 'Creating your Muse...'}</p>
          </div>
        )}

        {error && <div className="card" style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', margin: 'var(--space-md) 0' }}>⚠️ {error}</div>}

        {avatarURL && !loading && (
          <div className="animate-bloom" style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <div className="avatar-frame" style={{ maxWidth: '300px', margin: '0 auto var(--space-xl)' }}>
              <img src={avatarURL} alt="Generated Avatar" />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setAvatarURL(null); setFile(null); setPreview(null); }}>🔄 New Photo</button>
              <button className="btn btn-primary" onClick={() => router.push('/gallery')}>💜 Save to Gallery</button>
            </div>
          </div>
        )}

        {!loading && !avatarURL && preview && (
          <button className="btn btn-primary btn-lg" onClick={handleCreate} style={{ width: '100%', marginTop: 'var(--space-xl)' }}>
            ✨ Create Avatar
          </button>
        )}
      </div>
      <style jsx>{`
        .active-vibe {
          border-color: var(--orchid-500) !important;
          background: var(--orchid-50) !important;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
        }
      `}</style>
    </main>
  );
}

const vibeGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: 'var(--space-md)',
};

const vibeButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  background: 'white',
  border: '1px solid var(--border-subtle)',
};

const uploadZoneStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  maxHeight: '400px',
  background: 'var(--orchid-50)',
  border: '2px dashed var(--border-accent)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'hidden',
};
