'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '../../lib/firebase/auth';
import { subscribeToUserProfile } from '../../lib/firebase/firestore';

export default function CreateHub() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      return subscribeToUserProfile(user.uid, (p) => setProfile(p));
    }
  }, [user]);

  const creations = [
    {
      id: 'poem',
      title: 'Generate Poem',
      desc: 'Discover original verses inspired by your vibe.',
      cost: 1,
      icon: '📝',
      color: 'var(--orchid-500)',
      href: '/create/poem',
      gated: false
    },
    {
      id: 'avatar',
      title: 'Stylized Avatar',
      desc: 'Transform your photo into a Muse of orchid and gold.',
      cost: 5,
      icon: '🎨',
      color: 'var(--gold-500)',
      href: '/create/avatar',
      gated: false
    },
    {
      id: 'audio',
      title: 'Voice Synthesis',
      desc: 'Hear your poem performed by ethereal voices.',
      cost: '3 - 10',
      icon: '🎙️',
      color: 'var(--rose-500)',
      href: '/create/audio',
      gated: false
    },
    {
      id: 'video',
      title: 'Living Video',
      desc: 'A full cinematic performance with lip-sync and music.',
      cost: '20 - 80',
      icon: '🎭',
      color: 'var(--orchid-700)',
      href: '/create/video',
      gated: true, // Pro+ only
      tierRequired: 'Pro'
    }
  ];

  const userTier = profile?.subscriptionTier || 'free';
  const isEligible = (tierReq?: string) => {
    if (!tierReq) return true;
    const tiers = ['free', 'starter', 'pro', 'studio'];
    return tiers.indexOf(userTier) >= tiers.indexOf(tierReq.toLowerCase());
  };

  return (
    <main className="container page" style={{ paddingTop: 'var(--space-2xl)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="heading-lg">Create <span className="text-accent">Something New</span></h1>
        <p className="text-muted">What will you bloom today?</p>
      </header>

      <div style={gridStyle}>
        {creations.map(c => {
          const locked = c.gated && !isEligible(c.tierRequired);
          
          return (
            <div key={c.id} className="card" style={cardStyle}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>{c.icon}</div>
              <h2 className="heading-md" style={{ marginBottom: '8px' }}>{c.title}</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)', minHeight: '3rem' }}>{c.desc}</p>
              
              <div style={footerStyle}>
                <div style={costBadgeStyle}>
                  <span style={{ fontWeight: '700' }}>{c.cost}</span>
                  <span style={{ fontSize: '0.7rem', marginLeft: '2px', opacity: 0.7 }}>CR</span>
                </div>
                
                {locked ? (
                  <Link href="/pricing" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                    🔒 Unlock {c.tierRequired}+
                  </Link>
                ) : (
                  <Link href={c.href} className="btn btn-primary">
                    ✨ Create
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '24px',
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: 'var(--space-xl)',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
  paddingTop: 'var(--space-md)',
  borderTop: '1px solid var(--border-subtle)',
};

const costBadgeStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: 'var(--orchid-50)',
  color: 'var(--orchid-700)',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.85rem',
  border: '1px solid var(--orchid-100)',
};
