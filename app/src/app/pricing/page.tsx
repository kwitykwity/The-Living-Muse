'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '../../lib/firebase/auth';
import { subscribeToUserProfile, callCreateStripeCheckout } from '../../lib/firebase/firestore';

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u: User | null) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      return subscribeToUserProfile(user.uid, (p: any) => setProfile(p));
    }
  }, [user]);

  const tiers = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      credits: 15,
      desc: 'The spark of a verse.',
      features: ['Poem Generation (1CR)', 'Standard Avatars (5CR)', 'Community Discovery'],
      cta: 'Current Essence',
      current: profile?.subscriptionTier === 'free' || !profile?.subscriptionTier,
      color: 'linear-gradient(135deg, var(--neutral-400), var(--neutral-600))',
      accent: 'var(--neutral-500)',
      priceId: ''
    },
    {
      name: 'Starter',
      id: 'starter',
      price: '$9.99',
      credits: 75,
      desc: 'A soul beginning to bloom.',
      features: ['Priority Generation', 'Premium Voices (3CR)', '720p Video (40CR)', 'Fine-Art PDF (2CR)'],
      cta: 'Begin Metamorphosis',
      current: profile?.subscriptionTier === 'starter',
      color: 'linear-gradient(135deg, var(--orchid-400), var(--orchid-600))',
      accent: 'var(--orchid-500)',
      priceId: 'price_starter_test'
    },
    {
      name: 'Pro',
      id: 'pro',
      price: '$29.99',
      credits: 300,
      desc: 'The master of cinematic vision.',
      features: ['All Starter Features', 'Cinematic LTX-2 (80CR)', 'Commercial License', '4K Video Exports'],
      cta: 'Master the Vision',
      current: profile?.subscriptionTier === 'pro',
      color: 'linear-gradient(135deg, var(--orchid-600), var(--azure-600))',
      accent: 'var(--azure-500)',
      popular: true,
      priceId: 'price_pro_test'
    },
    {
      name: 'Studio',
      id: 'studio',
      price: '$79.99',
      credits: 1000,
      desc: 'Infinite creative manifestation.',
      features: ['Ultimate Priority', 'Advanced Lyria 3 Audio', 'White-label Exports', 'R&D Early Access'],
      cta: 'Enter the Studio',
      current: profile?.subscriptionTier === 'studio',
      color: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
      accent: 'var(--gold-500)',
      priceId: 'price_studio_test'
    }
  ];

  const packs = [
    { name: 'Seed', credits: 50, price: '$4.99', priceId: 'price_pack_50_test' },
    { name: 'Bloom', credits: 150, price: '$11.99', priceId: 'price_pack_150_test' },
    { name: 'Prophet', credits: 500, price: '$29.99', priceId: 'price_pack_500_test' },
    { name: 'Infinity', credits: 1500, price: '$69.99', priceId: 'price_pack_1500_test' }
  ];

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      alert('Please sign in to continue.');
      return;
    }
    setLoading(priceId);
    try {
      const result = await callCreateStripeCheckout({
        priceId,
        mode,
        successUrl: window.location.origin + '/gallery?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + '/pricing',
      });
      const { url } = result.data as any;
      if (url) window.location.href = url;
    } catch (err: any) {
      console.error(err);
      alert('Checkout failed: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="container page" style={{ minHeight: '100vh', paddingTop: 'var(--space-2xl)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
        <h1 className="heading-lg" style={{ letterSpacing: '2px' }}>Choose Your <span className="text-accent">Metamorphosis</span></h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', marginTop: '8px' }}>Fuel your manifestations with the credits required to bloom.</p>
      </header>

      {/* Subscription Tiers */}
      <div style={tierGridStyle}>
        {tiers.map((t, idx) => (
          <div key={t.name} className={`premium-tier-card ${t.popular ? 'popular' : ''} animate-fade-in-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
            {t.popular && <div className="popular-tag">Master's Choice</div>}
            <div className="tier-header" style={{ background: t.color }}>
              <h2 className="tier-name">{t.name}</h2>
              <div className="tier-price">
                <span className="currency">$</span>
                <span className="amount">{t.price.replace('$', '')}</span>
                <span className="period">/mo</span>
              </div>
            </div>
            
            <div className="tier-body">
              <p className="tier-desc">{t.desc}</p>
              <div className="credits-badge" style={{ color: t.accent, background: `${t.accent}15` }}>
                {t.credits} Manifestation Credits
              </div>
              
              <ul className="feature-list">
                {t.features.map(f => (
                  <li key={f} className="feature-item">
                    <span className="check" style={{ color: t.accent }}>✦</span> {f}
                  </li>
                ))}
              </ul>

              <button 
                className={`btn tier-btn ${t.popular ? 'btn-primary' : 'btn-secondary'}`} 
                disabled={t.current || (loading === t.priceId)}
                onClick={() => handleCheckout(t.priceId, 'subscription')}
                style={{ '--btn-accent': t.accent } as any}
              >
                {t.current ? 'Your Current Essence' : (loading === t.priceId ? 'Connecting...' : t.cta)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Packs */}
      <section style={{ marginTop: 'var(--space-4xl)', textAlign: 'center', paddingBottom: 'var(--space-3xl)' }}>
        <div className="glass-card pack-container" style={{ padding: '48px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 className="heading-md" style={{ marginBottom: 'var(--space-xl)' }}>Need a Quick <span className="text-gold">Bloom?</span></h2>
          <p className="text-muted" style={{ marginBottom: '40px' }}>Instant credits for that one cinematic masterpiece.</p>
          <div style={packGridStyle}>
            {packs.map(p => (
              <div key={p.name} className="pack-card">
                <h3 className="pack-name">{p.name} Pack</h3>
                <p className="pack-credits">{p.credits} CR</p>
                <button 
                  className="btn btn-secondary pack-btn" 
                  disabled={loading === p.priceId}
                  onClick={() => handleCheckout(p.priceId, 'payment')}
                >
                  {loading === p.priceId ? '...' : p.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .premium-tier-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .premium-tier-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
          border-color: var(--orchid-300);
        }

        .premium-tier-card.popular {
          border: 2px solid var(--orchid-400);
          transform: translateY(-8px) scale(1.02);
        }

        .popular-tag {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(90deg, var(--orchid-600), var(--azure-600));
          color: white;
          padding: 6px 20px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          z-index: 10;
          white-space: nowrap;
        }

        .tier-header {
          padding: 40px 24px;
          text-align: center;
          color: white;
        }

        .tier-name { font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        
        .tier-price { display: flex; align-items: baseline; justify-content: center; }
        .currency { font-size: 1.5rem; font-weight: 600; vertical-align: super; margin-right: 2px; }
        .amount { font-size: 3.5rem; font-weight: 800; }
        .period { font-size: 1rem; opacity: 0.8; margin-left: 4px; }

        .tier-body { padding: 32px; flex: 1; display: flex; flex-direction: column; text-align: center; }

        .tier-desc { color: var(--neutral-500); font-style: italic; margin-bottom: 24px; font-size: 0.95rem; }

        .credits-badge {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 32px;
          display: inline-block;
        }

        .feature-list { list-style: none; padding: 0; margin: 0 0 40px 0; text-align: left; }
        .feature-item { font-size: 0.95rem; margin-bottom: 16px; color: var(--neutral-700); display: flex; align-items: flex-start; gap: 12px; }
        .check { font-weight: bold; }

        .tier-btn { 
          width: 100%; 
          height: 56px; 
          border-radius: var(--radius-lg); 
          font-weight: 700; 
          margin-top: auto;
          transition: all 0.3s;
        }

        .tier-btn:not(:disabled):hover {
          box-shadow: 0 10px 20px -5px var(--btn-accent);
          transform: scale(1.02);
        }

        .pack-card {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
          border-radius: var(--radius-xl);
          transition: all 0.3s;
        }

        .pack-card:hover { background: white; transform: translateY(-4px); border-color: var(--gold-300); }

        .pack-name { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--neutral-500); }
        .pack-credits { font-size: 2rem; font-weight: 800; color: var(--gold-600); margin: 8px 0 16px; }
        .pack-btn { width: 100%; border-radius: var(--radius-full); }

        @media (max-width: 768px) {
          .premium-tier-card.popular { transform: none; }
        }
      `}</style>
    </main>
  );
}

const tierGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '32px',
  alignItems: 'stretch',
};

const packGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '24px',
};
