'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '../../lib/firebase/auth';
import { subscribeToUserProfile, updateUserProfile } from '../../lib/firebase/firestore';
import { User } from 'firebase/auth';

type Step = 1 | 2 | 3 | 4 | 5 | 'result';

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Questionnaire State
  const [useCase, setUseCase] = useState<string>('');
  const [vibePreset, setVibePreset] = useState<string>('orchid_noir');
  const [favoriteColor, setFavoriteColor] = useState<string>('purple');
  const [priority, setPriority] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        router.push('/');
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserProfile(user.uid, (p) => {
        setProfile(p);
        setLoading(false);
        if (p?.onboardingComplete) {
          router.push('/gallery');
        }
      });
      return unsubscribe;
    }
  }, [user, router]);

  const handleComplete = async () => {
    if (!user) return;
    await updateUserProfile(user.uid, {
      vibePreset,
      favoriteColor,
      onboardingComplete: true,
      onboardingResponses: { useCase, priority, frequency, vibePreset, favoriteColor }
    });
    router.push('/gallery');
  };

  const getSuggestedTier = () => {
    if (priority === 'professional' || frequency === 'daily') return 'Studio';
    if (useCase === 'social_media' || priority === 'video') return 'Pro';
    return 'Starter';
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <main className="container page-center">
      <div className="glass-card animate-bloom" style={{ maxWidth: '600px', width: '100%', padding: 'var(--space-2xl)' }}>
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Welcome, <span className="text-accent">{user?.displayName?.split(' ')[0]}</span></h1>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Help us tailor your creative journey. What is your primary use for The Living Muse?</p>
            
            <div style={optionsGrid}>
              {[
                { id: 'personal', label: 'Personal Expression', icon: '📝' },
                { id: 'social_media', label: 'Social Media Content', icon: '🎬' },
                { id: 'business', label: 'Professional/Business', icon: '💼' },
                { id: 'exploration', label: 'Just Exploring', icon: '✨' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`card ${useCase === opt.id ? 'active-card' : ''}`}
                  onClick={() => { setUseCase(opt.id); setStep(2); }}
                  style={cardOptionStyle}
                >
                  <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                  <p style={{ fontWeight: '600', marginTop: '8px' }}>{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>Find your Vibe</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>This defines the personality of your AI Muse.</p>
            <div style={optionsGrid}>
              {[
                { id: 'harlem_soul', label: 'Harlem Soul', desc: 'Urban, warm, jazz-era essence', icon: '🎷' },
                { id: 'k_dreamer', label: 'K-Dreamer', desc: 'Ethereal, pastel, soft flares', icon: '☁️' },
                { id: 'orchid_noir', label: 'Orchid Noir', desc: 'Dark, gothic, mysterious', icon: '🖤' },
                { id: 'cosmic_bloom', label: 'Cosmic Bloom', desc: 'Celestial, nebula, stars', icon: '🌌' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`card ${vibePreset === opt.id ? 'active-card' : ''}`}
                  onClick={() => { setVibePreset(opt.id); setStep(3); }}
                  style={{ ...cardOptionStyle, padding: '16px' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <p style={{ fontWeight: '600', marginTop: '8px', fontSize: '0.9rem' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setStep(1)}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>Your Signature Palette</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Colors that resonate with your poetry.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {[
                { id: 'purple', color: '#a855f7', label: 'Orchid' },
                { id: 'blue', color: '#3b82f6', label: 'Azure' },
                { id: 'gold', color: '#eab308', label: 'Amber' },
                { id: 'rose', color: '#ec4899', label: 'Rose' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setFavoriteColor(opt.id); setStep(4); }}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: opt.color, border: favoriteColor === opt.id ? '4px solid white' : 'none',
                    boxShadow: favoriteColor === opt.id ? '0 0 15px rgba(0,0,0,0.3)' : 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setStep(2)}>Back</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>What do you want to create most?</h2>
            <div style={optionsStack}>
              {[
                { id: 'basic', label: 'Poems & Avatars', desc: 'Focus on visual poetry and stunning portraits.', icon: '🌸' },
                { id: 'video', label: 'Video Performances', desc: 'Bring your verses to life with high-fidelity video.', icon: '🎭' },
                { id: 'professional', label: 'Professional Exports', desc: 'Unwatermarked 4K assets for commercial use.', icon: '💎' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`card ${priority === opt.id ? 'active-card' : ''}`}
                  onClick={() => { setPriority(opt.id); setStep(5); }}
                  style={stackOptionStyle}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: '600' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setStep(3)}>Back</button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>How often will you be blooming?</h2>
            <div style={optionsGrid}>
              {[
                { id: 'occasional', label: 'Occasionally', desc: '3-10 creations/mo', icon: '🌱' },
                { id: 'regular', label: 'Regularly', desc: '30-50 creations/mo', icon: '🌿' },
                { id: 'daily', label: 'Power User', desc: 'Daily creation', icon: '🌳' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`card ${frequency === opt.id ? 'active-card' : ''}`}
                  onClick={() => { setFrequency(opt.id); setStep('result'); }}
                  style={cardOptionStyle}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <p style={{ fontWeight: '600', marginTop: '8px' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setStep(4)}>Back</button>
          </div>
        )}

        {step === 'result' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>💎</div>
            <h2 className="heading-lg">Your Suggested Match</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Based on your creative goals, we recommend the:</p>
            
            <div className="card" style={suggestedCardStyle}>
              <h3 className="heading-md" style={{ color: 'var(--orchid-700)' }}>{getSuggestedTier()} Tier</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                {getSuggestedTier() === 'Starter' && 'Perfect for exploring your creative voice with essential tools.'}
                {getSuggestedTier() === 'Pro' && 'The sweet spot for social media creators and video enthusiasts.'}
                {getSuggestedTier() === 'Studio' && 'Unlimited creative freedom with 4K exports and professional features.'}
              </p>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary btn-lg" onClick={handleComplete}>
                ✨ Start Creating
              </button>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>You can compare all tiers and upgrade anytime.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .active-card {
          border-color: var(--orchid-500) !important;
          background: var(--orchid-50) !important;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
        }
      `}</style>
    </main>
  );
}

const optionsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const optionsStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const cardOptionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px',
  cursor: 'pointer',
  background: 'white',
  border: '1px solid var(--border-subtle)',
};

const stackOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px 24px',
  cursor: 'pointer',
  background: 'white',
  border: '1px solid var(--border-subtle)',
};

const suggestedCardStyle: React.CSSProperties = {
  background: 'var(--orchid-100)',
  border: '2px solid var(--orchid-300)',
  padding: '24px',
};
