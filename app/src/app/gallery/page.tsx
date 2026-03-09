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
      const result = await callSearchLivingPages({ query: searchQuery.trim() });
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
    <main className="container page" style={{ paddingTop: 'var(--space-2xl)' }}>
      {/* Section Title */}
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="heading-lg">Your <span className="text-accent">Gallery</span></h1>
        <p className="text-muted">Your Living Pages, blooming for eternity.</p>
      </header>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={searchBarContainerStyle}>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '600px' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Search by mood, theme, or soul..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <div className="spinner-sm" /> : '🔍 Search'}
          </button>
          {searchResults && (
            <button className="btn btn-secondary" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        <div style={filterBarStyle}>
          {['all', 'harlem_soul', 'k_dreamer', 'orchid_noir', 'cosmic_bloom'].map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter(f); setSearchResults(null); }}
              style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {f === 'all' ? '✨ All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {displayPages.length === 0 ? (
        <div className="glass-card page-center" style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🌺</div>
          <h2 className="heading-md">{searchResults ? "No verses found matching your soul's search" : "Your gallery is currently empty"}</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>{searchResults ? "Try a different search or clear filters" : "Create your first Living Page to get started"}</p>
          {!searchResults && <button onClick={() => router.push('/create')} className="btn btn-primary btn-lg">✨ Create Your Muse</button>}
        </div>
      ) : (
        <div style={gridStyle}>
          {displayPages.map((page, index) => (
            <Link
              key={page.id}
              href={`/gallery/${page.id}`}
              className="card animate-fade-in-up"
              style={{ ...cardStyle, animationDelay: `${index * 0.08}s`, textDecoration: 'none' }}
            >
              <div style={cardAvatarStyle}>
                {page.avatarURL ? (
                  <img src={page.avatarURL} alt={page.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={avatarPlaceholderStyle}>🌸</div>
                )}
                {page.isPublic && <div className="badge-pro" style={publicBadgeStyle}>Public</div>}
              </div>
              <div style={{ padding: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--orchid-900)' }}>{page.title || 'Untitled Verse'}</h3>
                <p className="poem-text" style={{ fontSize: '0.9rem', lineHeight: '1.4', fontStyle: 'italic', color: 'var(--orchid-700)', marginBottom: '12px' }}>
                  {page.poemPreview || (page.textContent?.substring(0, 60) + '...') || 'A verse awaits...'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge-pro" style={{ background: 'var(--orchid-100)', color: 'var(--orchid-700)' }}>{page.sentiment || 'reflective'}</span>
                  <span className="badge-pro" style={{ background: 'var(--gold-100)', color: 'var(--gold-700)', fontSize: '0.7rem' }}>{page.vibePreset?.replace('_', ' ')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

const searchBarContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'var(--space-xl)',
  gap: 'var(--space-lg)',
  marginBottom: 'var(--space-2xl)',
  border: '1px solid var(--border-subtle)',
};

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
};

const cardStyle: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const cardAvatarStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  background: 'var(--orchid-100)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1px solid var(--border-subtle)',
  position: 'relative',
};

const publicBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'var(--success-500)',
  color: 'white',
  fontSize: '0.65rem',
  padding: '2px 8px',
};

const avatarPlaceholderStyle: React.CSSProperties = {
  fontSize: '3rem',
  opacity: 0.5,
};
