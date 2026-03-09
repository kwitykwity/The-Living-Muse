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
      features: ['Poem Generation', 'Standard Avatars', 'Community Gallery'],
      cta: 'Current Plan',
      current: profile?.subscriptionTier === 'free' || !profile?.subscriptionTier,
      color: 'var(--neutral-500)',
      priceId: ''
    },
    {
      name: 'Starter',
      id: 'starter',
      price: '$9.99',
      credits: 75,
      features: ['Priority Generation', 'Premium Voices', '720p Video (1/mo)', 'No Watermarks'],
      cta: 'Upgrade to Starter',
      current: profile?.subscriptionTier === 'starter',
      color: 'var(--orchid-500)',
      priceId: 'price_starter_test' // Replace with real ID in env or passed from backend
    },
    {
      name: 'Pro',
      id: 'pro',
      price: '$29.99',
      credits: 300,
      features: ['All Starter Features', '1080p Video Credits', 'Commercial Rights', 'Early Access'],
      cta: 'Unlock Pro',
      current: profile?.subscriptionTier === 'pro',
      color: 'var(--orchid-700)',
      popular: true,
      priceId: 'price_pro_test'
    },
    {
      name: 'Studio',
      id: 'studio',
      price: '$79.99',
      credits: 1000,
      features: ['Unlimited 4K Performance', 'Dedicated Muse Engine', 'White-label Exports', 'API Access'],
      cta: 'The Studio Experience',
      current: profile?.subscriptionTier === 'studio',
      color: 'var(--gold-500)',
      priceId: 'price_studio_test'
    }
  ];

  const packs = [
    { name: 'Starter Pack', credits: 50, price: '$4.99', priceId: 'price_pack_50_test' },
    { name: 'Creator Pack', credits: 150, price: '$11.99', priceId: 'price_pack_150_test' },
    { name: 'Power Pack', credits: 500, price: '$29.99', priceId: 'price_pack_500_test' },
    { name: 'Studio Pack', credits: 1500, price: '$69.99', priceId: 'price_pack_1500_test' }
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
    <main className="container page">
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="heading-lg">Choose Your <span className="text-accent">Metamorphosis</span></h1>
        <p className="text-muted">Fuel your creativity with the credits you need.</p>
      </header>

      {/* Subscription Tiers */}
      <div style={tierGridStyle}>
        {tiers.map(t => (
          <div key={t.name} className={`card ${t.popular ? 'popular-card' : ''}`} style={tierCardStyle}>
            {t.popular && <div style={popularBadgeStyle}>Most Popular</div>}
            <h2 className="heading-md" style={{ color: t.color }}>{t.name}</h2>
            <div style={{ margin: 'var(--space-md) 0' }}>
              <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{t.price}</span>
              <span className="text-muted">/mo</span>
            </div>
            <div style={creditsBadgeStyle}>{t.credits} Credits / Month</div>
            
            <ul style={featureListStyle}>
              {t.features.map(f => (
                <li key={f} style={featureItemStyle}>✨ {f}</li>
              ))}
            </ul>

            <button 
              className={`btn ${t.popular ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ width: '100%', marginTop: 'auto' }}
              disabled={t.current || (loading === t.priceId)}
              onClick={() => handleCheckout(t.priceId, 'subscription')}
            >
              {t.current ? 'Current Plan' : (loading === t.priceId ? 'Redirecting...' : t.cta)}
            </button>
          </div>
        ))}
      </div>

      {/* Credit Packs */}
      <section style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
        <h2 className="heading-md" style={{ marginBottom: 'var(--space-xl)' }}>Need a Quick Bloom? <span className="text-gold">Credit Packs</span></h2>
        <div style={packGridStyle}>
          {packs.map(p => (
            <div key={p.name} className="card" style={packCardStyle}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{p.name}</h3>
              <p className="text-accent" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '8px 0' }}>{p.credits} CR</p>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }}
                disabled={loading === p.priceId}
                onClick={() => handleCheckout(p.priceId, 'payment')}
              >
                {loading === p.priceId ? '...' : p.price}
              </button>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .popular-card {
          border-color: var(--orchid-500) !important;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.15) !important;
          transform: translateY(-8px);
        }
      `}</style>
    </main>
  );
}

const tierGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
};

const tierCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--space-xl)',
  position: 'relative',
};

const popularBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--orchid-600)',
  color: 'white',
  padding: '4px 16px',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const creditsBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 16px',
  background: 'var(--orchid-50)',
  color: 'var(--orchid-700)',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.9rem',
  fontWeight: '700',
  marginBottom: 'var(--space-xl)',
};

const featureListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 var(--space-xl) 0',
  textAlign: 'left',
};

const featureItemStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  marginBottom: '12px',
  color: 'var(--neutral-700)',
};

const packGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
};

const packCardStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'center',
};
