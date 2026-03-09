'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from '../../lib/firebase/auth';
import { subscribeLivingPages, callSearchLivingPages } from '../../lib/firebase/firestore';

export default function GalleryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<DocumentData[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DocumentData[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.push('/');
    });
    return unsubscribe;
  }, [router]);

  // Subscribe to living pages (real-time)
  useEffect(() => {
    if (!user || searchResults) return;
    const filterConfig = filter !== 'all' ? { vibePreset: filter } : undefined;
    const unsub = subscribeLivingPages(user.uid, (p) => setPages(p), filterConfig);
    return unsub;
  }, [user, filter, searchResults]);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const result = await callSearchLivingPages({ query: searchQuery.trim(), scope: 'personal' });
      const data = result.data as any;
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }

  const displayPages = searchResults || pages;

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (!user) return null;

  return (
    <main className="container page" style={{ paddingTop: 'var(--space-2xl)', minHeight: '100vh' }}>
      {/* Section Title */}
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', position: 'relative' }}>
        <h1 className="heading-lg" style={{ letterSpacing: '2px', fontWeight: '800' }}>Your <span className="text-accent">Living Room</span></h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', marginTop: '8px' }}>Where your soul's manifestations bloom for eternity.</p>
        <div style={{ 
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '200px', height: '100px', background: 'var(--orchid-200)', 
          filter: 'blur(80px)', opacity: 0.3, zIndex: -1 
        }} />
      </header>

      {/* Search & Filter Bar */}
      <div className="glass-card premium-search-bar" style={{ padding: '32px', marginBottom: 'var(--space-3xl)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              className="input premium-input" 
              placeholder="Search by mood, theme, or soul..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '100%', height: '56px', borderRadius: 'var(--radius-full)', paddingLeft: '24px', fontSize: '1.1rem' }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              {searchQuery && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                  style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
                >✕</button>
              )}
              <button 
                className="btn btn-primary" 
                onClick={handleSearch} 
                disabled={isSearching}
                style={{ height: '40px', borderRadius: 'var(--radius-full)', padding: '0 24px' }}
              >
                {isSearching ? <div className="spinner-sm" /> : '🔍 Search'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...filterBarStyle, marginTop: '24px' }}>
          {['all', 'harlem_soul', 'k_dreamer', 'orchid_noir', 'cosmic_bloom'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setSearchResults(null); }}
            >
              {f === 'all' ? '✨ All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {displayPages.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: 'var(--space-3xl)', border: '1px dashed var(--orchid-300)' }}>
          <div style={{ fontSize: '5rem', marginBottom: 'var(--space-md)', animation: 'float 6s ease-in-out infinite' }}>🌺</div>
          <h2 className="heading-md" style={{ fontWeight: '700' }}>{searchResults ? "No verses found matching your soul's search" : "Your gallery is currently empty"}</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-xl)', fontSize: '1.1rem' }}>{searchResults ? "Try a different search or clear filters" : "Manifest your first verse to begin your collection"}</p>
          {!searchResults && <button onClick={() => router.push('/create')} className="btn btn-primary btn-lg shine-effect">✨ Manifest Your Muse</button>}
        </div>
      ) : (
        <div style={gridStyle}>
          {displayPages.map((page, index) => (
            <Link
              key={page.id}
              href={`/gallery/${page.id}`}
              className="living-tile animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="tile-media">
                {page.avatarURL ? (
                  <img src={page.avatarURL} alt={page.title} loading="lazy" />
                ) : (
                  <div className="tile-placeholder">🌸</div>
                )}
                {page.isPublic && <div className="tile-badge public-badge">Public</div>}
                <div className="tile-overlay" />
              </div>
              <div className="tile-content">
                <div className="tile-meta">
                  <span className="tile-sentiment">{page.sentiment || 'reflective'}</span>
                  <span className="tile-vibe">{page.vibePreset?.replace('_', ' ')}</span>
                </div>
                <h3 className="tile-title">{page.title || 'Untitled Verse'}</h3>
                <p className="tile-preview">
                  {page.poemPreview || (page.textContent?.substring(0, 100) + '...') || 'A silent verse awaiting your call...'}
                </p>
                <div className="tile-footer">
                  <span className="tile-date">{new Date(page.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  <span className="tile-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .filter-btn {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.2s;
          cursor: pointer;
        }

        .filter-btn:hover { background: rgba(255, 255, 255, 0.9); transform: translateY(-1px); }
        .filter-btn.active { background: var(--orchid-500); color: white; border-color: var(--orchid-500); }

        .living-tile {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          color: inherit;
        }

        .living-tile:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 20px 40px rgba(168, 85, 247, 0.15);
          border-color: var(--orchid-300);
        }

        .tile-media {
          width: 100%;
          aspect-ratio: 1;
          position: relative;
          background: var(--orchid-50);
          overflow: hidden;
        }

        .tile-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s;
        }

        .living-tile:hover .tile-media img { transform: scale(1.1); }

        .tile-placeholder {
          font-size: 4rem;
          opacity: 0.3;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .tile-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          z-index: 2;
        }

        .public-badge { background: var(--success-500); color: white; }

        .tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        .tile-content { padding: 24px; display: flex; flex-direction: column; flex: 1; }

        .tile-meta { display: flex; gap: 8px; margin-bottom: 12px; }

        .tile-sentiment, .tile-vibe {
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .tile-sentiment { background: var(--orchid-100); color: var(--orchid-700); }
        .tile-vibe { background: var(--gold-100); color: var(--gold-700); }

        .tile-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--orchid-900);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .tile-preview {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--neutral-600);
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .tile-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .tile-date { font-size: 0.8rem; color: var(--neutral-400); }
        .tile-arrow { opacity: 0; transform: translateX(-10px); transition: all 0.3s; color: var(--orchid-500); font-weight: bold; }

        .living-tile:hover .tile-arrow { opacity: 1; transform: translateX(0); }

        .premium-input {
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all 0.3s;
        }

        .premium-input:focus {
          border-color: var(--orchid-500);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.1);
        }

        .shine-effect {
          position: relative;
          overflow: hidden;
        }

        .shine-effect::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -60%;
          width: 20%;
          height: 200%;
          background: rgba(255,255,255,0.3);
          transform: rotate(30deg);
          animation: shine 4s infinite;
        }

        @keyframes shine {
          0% { left: -60%; }
          20% { left: 120%; }
          100% { left: 120%; }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </main>
  );
}

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '32px',
};
