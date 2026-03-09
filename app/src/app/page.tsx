'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithGoogle } from '../lib/firebase/auth';
import { subscribeToUserProfile } from '../lib/firebase/firestore';
import styles from './page.module.css';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = subscribeToUserProfile(user.uid, (profile) => {
        if (!profile || !profile.onboardingComplete) {
          router.push('/onboarding');
        } else {
          router.push('/gallery');
        }
      });
      return unsubscribeProfile;
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  // Authenticated → routing is handled by useEffect
  if (user) return null;

  return (
    <main className={styles.landing}>
      {/* Hero Background */}
      <div className={styles.heroGlow} />

      {/* Hero Section */}
      <section className={styles.hero} style={{ textAlign: 'center', paddingTop: 'var(--space-2xl)' }}>
        <div className={styles.orchidIcon} style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🌸</div>
        <h1 className="heading-xl">
          The Living <span className="text-accent">Muse</span>
        </h1>
        <p className={styles.tagline} style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--orchid-800)' }}>
          Your story deserves to bloom.
        </p>

        <p className={styles.subtitle} style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', lineHeight: '1.6' }}>
          An AI-powered sanctuary for multimedia poetry.
          Transform your essence into stylized avatars, adaptive verses, and living video performances.
        </p>

        <div className={styles.cta} style={{ marginTop: 'var(--space-xl)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSignIn}
          >
            ✨ Begin Your Journey
          </button>
        </div>

        {/* Feature Pills */}
        <div className={styles.features} style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: 'var(--space-2xl)', flexWrap: 'wrap' }}>
          {['🎨 Photo → Avatar', '📝 AI Poetry', '🎭 Video Performance', '🎙️ Audio Synthesis'].map(f => (
            <span key={f} className="badge-pro" style={{ padding: '6px 16px', background: 'var(--orchid-100)', color: 'var(--orchid-700)', fontSize: '0.8rem' }}>
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* 4-Tier Preview Section */}
      <section className="container" style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
        <h2 className="heading-lg" style={{ marginBottom: 'var(--space-xl)' }}>Select Your <span className="text-gold">Creative Tier</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[
            { name: 'Free', price: '$0', credits: '15 CR', target: 'Experimenters' },
            { name: 'Starter', price: '$9.99', credits: '75 CR', target: 'Poets & Artists' },
            { name: 'Pro', price: '$29.99', credits: '300 CR', target: 'Social Creators' },
            { name: 'Studio', price: '$79.99', credits: '1,000 CR', target: 'Professional Studios' }
          ].map(tier => (
            <div key={tier.name} className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <h3 className="heading-md">{tier.name}</h3>
              <p className="text-gold" style={{ fontSize: '2rem', fontWeight: 'bold', margin: '12px 0' }}>{tier.price}</p>
              <p style={{ fontWeight: '600', color: 'var(--orchid-600)' }}>{tier.credits} / mo</p>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '8px' }}>For {tier.target}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
}
