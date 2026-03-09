'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '../../lib/firebase/auth';
import { subscribeToUserProfile, updateUserProfile } from '../../lib/firebase/firestore';
import { User } from 'firebase/auth';

type Step = 1 | 2 | 3 | 4 | 5 | 'result';

const VIBE_CONFIG = {
  harlem_soul: {
    label: 'Harlem Soul',
    desc: 'Urban, warm, jazz-era essence',
    icon: '🎷',
    bg: '/vibe-bgs/harlem_soul.png',
    color: 'rgba(217, 119, 6, 0.1)'
  },
  k_dreamer: {
    label: 'K-Dreamer',
    desc: 'Ethereal, pastel, soft flares',
    icon: '☁️',
    bg: '/vibe-bgs/k_dreamer.png',
    color: 'rgba(59, 130, 246, 0.1)'
  },
  orchid_noir: {
    label: 'Orchid Noir',
    desc: 'Dark, gothic, mysterious',
    icon: '🖤',
    bg: '/vibe-bgs/orchid_noir.png',
    color: 'rgba(168, 85, 247, 0.1)'
  },
  cosmic_bloom: {
    label: 'Cosmic Bloom',
    desc: 'Celestial, nebula, stars',
    icon: '🌌',
    bg: '/vibe-bgs/cosmic_bloom.png',
    color: 'rgba(236, 72, 153, 0.1)'
  }
};

const PALETTE_CONFIG = [
  { id: 'purple', color: '#a855f7', label: 'Orchid', desc: 'Mystical & Royal' },
  { id: 'blue', color: '#3b82f6', label: 'Azure', desc: 'Serene & Deep' },
  { id: 'gold', color: '#eab308', label: 'Amber', desc: 'Warm & Radiant' },
  { id: 'rose', color: '#ec4899', label: 'Rose', desc: 'Tender & Vivid' }
];

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
    <main className="container page-center" style={{ minHeight: '100vh', padding: 'var(--space-xl)' }}>
      <div className="glass-card animate-bloom" style={{ 
        maxWidth: '800px', 
        width: '100%', 
        padding: 'var(--space-2xl)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(8px)'
      }}>
        {/* Progress Bar */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: `${typeof step === 'number' ? (step / 5) * 100 : 100}%`, 
          height: '4px', 
          background: 'linear-gradient(90deg, var(--orchid-500), var(--azure-500))',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />

        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>Welcome, <span className="text-accent">{user?.displayName?.split(' ')[0]}</span></h1>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)', fontSize: '1.1rem' }}>Your creative journey begins here. What inspires you to manifest?</p>
            
            <div style={optionsGrid}>
              {[
                { id: 'personal', label: 'Personal Expression', icon: '📝', desc: 'Capturing private moments of beauty.' },
                { id: 'social_media', label: 'Social Media', icon: '🎬', desc: 'Creating viral cinematic poetry.' },
                { id: 'business', label: 'Professional', icon: '💼', desc: 'High-art exports for commercial projects.' },
                { id: 'exploration', label: 'Just Exploring', icon: '✨', desc: 'Watching the AI soul bloom.' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`glass-option ${useCase === opt.id ? 'active' : ''}`}
                  onClick={() => { setUseCase(opt.id); setStep(2); }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{opt.icon}</span>
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>Select Your Muse's Vibe</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>This core "Vibe" will shape the aesthetic soul of every manifestation.</p>
            <div style={optionsGrid}>
              {Object.entries(VIBE_CONFIG).map(([id, opt]) => (
                <button 
                  key={id} 
                  className={`vibe-card ${vibePreset === id ? 'active' : ''}`}
                  onClick={() => { setVibePreset(id); setStep(3); }}
                  style={{ '--vibe-color': opt.color } as any}
                >
                  <div className="vibe-bg" style={{ backgroundImage: `url(${opt.bg})` }} />
                  <div className="vibe-content">
                    <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                    <h3 style={{ fontWeight: '700', fontSize: '1.2rem', marginTop: '12px' }}>{opt.label}</h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '32px' }} onClick={() => setStep(1)}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>Your Signature Palette</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Choose the primary hue that will pulse through your verses and visuals.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
              {PALETTE_CONFIG.map(opt => (
                <button 
                  key={opt.id}
                  className={`palette-option ${favoriteColor === opt.id ? 'active' : ''}`}
                  onClick={() => { setFavoriteColor(opt.id); setStep(4); }}
                >
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${opt.color}, white)`,
                    marginBottom: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }} />
                  <p style={{ fontWeight: '700' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '32px' }} onClick={() => setStep(2)}>Back</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>manifestation Priority</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>What modality do you wish to master most?</p>
            <div style={optionsStack}>
              {[
                { id: 'basic', label: 'Poetic Verses', desc: 'Deep, emotionally resonant literature (1CR).', icon: '📝' },
                { id: 'video', label: 'Cinematic Video', desc: 'LTX-2 high-fidelity lip-sync performances (20-80CR).', icon: '🎬' },
                { id: 'professional', label: 'Fine-Art Exports', desc: '4K unwatermarked video & Print-ready PDFs (2-10CR).', icon: '💎' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`glass-stack-option ${priority === opt.id ? 'active' : ''}`}
                  onClick={() => { setPriority(opt.id); setStep(5); }}
                >
                  <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '32px' }} onClick={() => setStep(3)}>Back</button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>Blooming Frequency</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>How many manifestations do you plan to create each month?</p>
            <div style={optionsGrid}>
              {[
                { id: 'occasional', label: 'Gardener', desc: '3-10 creations', icon: '🌱', sub: 'Essential Tools' },
                { id: 'regular', label: 'Botanist', desc: '30-50 creations', icon: '🌿', sub: 'Creator Tools' },
                { id: 'daily', label: 'Prophet', desc: 'Unlimited vision', icon: '🌳', sub: 'Studio Tools' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`glass-option ${frequency === opt.id ? 'active' : ''}`}
                  onClick={() => { setFrequency(opt.id); setStep('result'); }}
                >
                  <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontWeight: '700' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{opt.desc}</p>
                    <p style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '32px' }} onClick={() => setStep(4)}>Back</button>
          </div>
        )}

        {step === 'result' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div className="badge-glow" style={{ marginBottom: 'var(--space-lg)' }}>
              <span style={{ fontSize: '4rem' }}>✨</span>
            </div>
            <h2 className="heading-lg">Your Soul's Blueprint</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)', fontSize: '1.1rem' }}>To manifest your vision at its highest fidelity, we suggest:</p>
            
            <div className="glass-card economy-card" style={{ padding: '32px', border: '2px solid var(--orchid-300)', background: 'rgba(168, 85, 247, 0.05)' }}>
              <h3 className="heading-md" style={{ color: 'var(--orchid-700)', letterSpacing: '2px' }}>{getSuggestedTier().toUpperCase()} TIER</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px', textAlign: 'left' }}>
                <div className="economy-item">
                  <p className="label">Monthly Credits</p>
                  <p className="value">{getSuggestedTier() === 'Starter' ? '75' : getSuggestedTier() === 'Pro' ? '300' : '1000'}</p>
                </div>
                <div className="economy-item">
                  <p className="label">Modality</p>
                  <p className="value">{getSuggestedTier() === 'Starter' ? 'Basic' : 'Cinematic'}</p>
                </div>
              </div>
              <p style={{ marginTop: '24px', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
                "Every manifestation costs credits. 1 credit for a poem, 40-80 for a cinematic sequence. Your {getSuggestedTier()} allocation ensures your voice never stops blooming."
              </p>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button className="btn btn-primary btn-lg" onClick={handleComplete} style={{ height: '60px', fontSize: '1.2rem', fontWeight: '700' }}>
                MANIFEST MY MUSE
              </button>
              <button className="btn btn-secondary" onClick={() => setStep(5)}>Adjust Goals</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-option, .glass-stack-option, .vibe-card, .palette-option {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-lg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .glass-option:hover, .glass-stack-option:hover, .vibe-card:hover, .palette-option:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 20px rgba(168, 85, 247, 0.1);
        }

        .active {
          border-color: var(--orchid-500) !important;
          background: rgba(168, 85, 247, 0.08) !important;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2) !important;
          transform: scale(1.02);
        }

        .glass-option { padding: 32px; display: flex; flex-direction: column; align-items: center; }
        .glass-stack-option { padding: 20px 32px; display: flex; align-items: center; gap: 24px; width: 100%; }
        
        .vibe-card {
          position: relative;
          height: 200px;
          overflow: hidden;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .vibe-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s;
          opacity: 0.35;
        }

        .vibe-card:hover .vibe-bg { transform: scale(1.1); }
        .vibe-card.active .vibe-bg { opacity: 0.8; }
        
        .vibe-content {
          position: relative;
          z-index: 2;
          padding: 24px;
          color: #1e293b;
        }

        .vibe-card.active .vibe-content { color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

        .palette-option { padding: 24px; display: flex; flex-direction: column; align-items: center; }

        .economy-item .label { font-size: 0.7rem; text-transform: uppercase; color: var(--orchid-600); font-weight: 700; }
        .economy-item .value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

        .badge-glow {
          display: inline-flex;
          padding: 20px;
          background: radial-gradient(circle, var(--orchid-200) 0%, transparent 70%);
          animation: pulse 3s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </main>
  );
}

const optionsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
};

const optionsStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
