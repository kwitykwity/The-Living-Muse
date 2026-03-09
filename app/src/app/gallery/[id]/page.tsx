'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getLivingPage, 
  callTogglePageVisibility, 
  callCreateVideoExport, 
  callCreatePDFExport,
  callCreateCollection,
  callAddPageToCollection,
  subscribeCollections
} from '../../../lib/firebase/firestore';
import { onAuthStateChanged } from '../../../lib/firebase/auth';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';

export default function LivingPageDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  
  // Collection States
  const [collections, setCollections] = useState<DocumentData[]>([]);
  const [showColModal, setShowColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      if (!u && !loading && page && !page.isPublic) {
        router.push('/');
      }
    });
    return unsubscribe;
  }, [router, loading, page]);

  useEffect(() => {
    async function loadPage() {
      if (!id) return;
      try {
        const data = await getLivingPage(id as string);
        setPage(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [id]);

  // Subscribe to collections
  useEffect(() => {
    if (!user) return;
    return subscribeCollections(user.uid, (cols) => setCollections(cols));
  }, [user]);

  async function handleTogglePublic() {
    if (!page) return;
    const newStatus = !page.isPublic;
    try {
      await callTogglePageVisibility({ pageId: page.id, isPublic: newStatus });
      setPage({ ...page, isPublic: newStatus });
    } catch (err) {
      console.error('Failed to toggle visibility', err);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copied to soul!');
      setTimeout(() => setShareMessage(null), 3000);
    } catch (err) {
      console.error('Share failed', err);
    }
  }

  async function handleExport(type: 'video' | 'pdf') {
    if (!page) return;
    setExporting(true);
    try {
      if (type === 'video') {
        await callCreateVideoExport({ pageId: page.id });
        alert('Cinematic export queued! We will notify you when it blooms.');
      } else {
        const result = await callCreatePDFExport({ pageId: page.id });
        const data = result.data as any;
        if (data.downloadURL) window.open(data.downloadURL, '_blank');
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Do you have enough credits?');
    } finally {
      setExporting(false);
    }
  }

  async function handleAddToCollection(colId: string) {
    if (!page) return;
    try {
      await callAddPageToCollection({ collectionId: colId, pageId: page.id });
      alert('Added to collection!');
      setShowColModal(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateAndAdd() {
    if (!newColTitle.trim() || !page) return;
    try {
      const res = await callCreateCollection({ title: newColTitle.trim() });
      const data = res.data as any;
      await callAddPageToCollection({ collectionId: data.collectionId, pageId: page.id });
      alert('Collection created and verse added!');
      setNewColTitle('');
      setShowColModal(false);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!page) return <div className="page-center"><p>Living Page not found.</p></div>;

  const vibe = page.vibePreset || 'orchid_noir';
  const styles = getVibeStyles(vibe);
  const isOwner = user?.uid === page.uid;
  const publicURL = typeof window !== 'undefined' ? `${window.location.origin}/gallery/${page.id}` : '';
  const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicURL)}&color=${styles.accent.replace('#', '')}&bgcolor=ffffff00`;

  // Protect private pages
  if (!page.isPublic && !isOwner && !loading) {
    return (
      <div className="page-center">
        <p className="text-muted">This verse is private.</p>
        <button className="btn btn-secondary mt-4" onClick={() => router.push('/gallery')}>Return to Gallery</button>
      </div>
    );
  }

  return (
    <main className={`living-page-container ${styles.animation}`} style={{ background: styles.background, fontFamily: styles.font }}>
      <div className="content-wrapper glass-panel">
        <header className="page-header" style={{ borderColor: styles.accent }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="title" style={{ color: styles.accent }}>{page.title || 'Untitled Verse'}</h1>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>By {page.userName || 'The Muse'}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="vibe-badge" style={{ background: styles.accent }}>{vibe.replace('_', ' ')}</div>
            {isOwner && (
              <button 
                className={`btn btn-sm ${page.isPublic ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={handleTogglePublic}
                style={{ fontSize: '0.7rem' }}
              >
                {page.isPublic ? '🌐 Public' : '🔒 Private'}
              </button>
            )}
          </div>
        </header>

        <section className="media-section">
          {page.videoURL && page.lastGenerationStatus === 'success' ? (
            <video src={page.videoURL} controls autoPlay loop className="main-media" />
          ) : page.lastGenerationStatus === 'running' ? (
            <div className="avatar-frame processing">
              <img src={page.avatarURL} alt="Muse Avatar" className="main-media blur-pulse" />
              <div className="processing-overlay">
                <div className="spinner-glow" />
                <p>Verse is Blooming...</p>
              </div>
            </div>
          ) : (
            <div className="avatar-frame">
              {page.avatarURL ? (
                <img src={page.avatarURL} alt="Muse Avatar" className="main-media" />
              ) : (
                <div className="avatar-placeholder">🌸</div>
              )}
            </div>
          )}
          
          {/* QR Connection (Physical Link) */}
          {page.isPublic && (
            <div className="qr-container glass-card" style={{ marginTop: '2rem', textAlign: 'center', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Physical World Connection</h4>
              <img src={qrCodeURL} alt="QR Code" style={{ width: '120px', height: '120px', border: `2px solid ${styles.accent}`, padding: '4px', borderRadius: '8px' }} />
              <p style={{ fontSize: '0.7rem', marginTop: '1rem', opacity: 0.6 }}>Scan to link physical art to this digital verse.</p>
            </div>
          )}
        </section>

        <article className="poem-section">
          <p className="poem-text" style={{ fontStyle: 'italic' }}>{page.textContent}</p>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 'var(--space-xl)' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleShare}>
              {shareMessage || '🔗 Share Soul'}
            </button>
            {isOwner && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowColModal(true)}>
                   📚 Add to Collection
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')} disabled={exporting}>
                  📄 Export PDF
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleExport('video')} disabled={exporting}>
                  🎬 Cinematic Export
                </button>
              </>
            )}
          </div>

          {page.audioURL && (
            <div className="audio-player" style={{ marginTop: 'var(--space-2xl)' }}>
              <audio src={page.audioURL} controls style={{ width: '100%' }} />
            </div>
          )}
        </article>

        <footer className="page-footer">
          <div className="sentiment-analysis" style={{ color: styles.accent }}>
            Captured Sentiment: <span style={{ fontWeight: '600' }}>{page.sentiment || 'Reflective'}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/gallery')}>
            Back to Gallery
          </button>
        </footer>
      </div>

      {/* Collection Modal */}
      {showColModal && (
        <div className="modal-backdrop" onClick={() => setShowColModal(false)} style={modalBackdropStyle}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={modalContentStyle}>
            <h3 className="heading-md" style={{ marginBottom: '1.5rem', color: 'var(--orchid-950)' }}>Add to Collection</h3>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {collections.length === 0 ? (
                <p className="text-muted" style={{ padding: '1rem', textAlign: 'center' }}>No volumes created yet.</p>
              ) : (
                collections.map(col => (
                  <button 
                    key={col.id} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', marginBottom: '8px', justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => handleAddToCollection(col.id)}
                    disabled={col.livingPageIds?.includes(page.id)}
                  >
                    📖 {col.title} {col.livingPageIds?.includes(page.id) && '(Added)'}
                  </button>
                ))
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.7 }}>Create New Volume</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Midnight Whispers..." 
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleCreateAndAdd}>Create</button>
              </div>
            </div>
            
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setShowColModal(false)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .living-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: white;
          transition: all 1s ease-in-out;
        }
        .content-wrapper {
          max-width: 1000px;
          width: 100%;
          padding: 3rem;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
          border-radius: 2rem;
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: bloom-in 1s ease-out;
        }
        @keyframes bloom-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .page-header {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid;
          padding-bottom: 1.5rem;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 2.5rem;
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .vibe-badge {
          padding: 4px 16px;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .main-media {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 1.5rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .main-media:hover {
          transform: scale(1.02);
        }
        .poem-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .poem-text {
          font-size: 1.3rem;
          line-height: 1.8;
          white-space: pre-wrap;
          opacity: 0.95;
        }
        .page-footer {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 900px) {
          .content-wrapper {
            grid-template-columns: 1fr;
            padding: 2rem;
            gap: 2rem;
          }
          .title { font-size: 2rem; }
        }
        .avatar-frame.processing { position: relative; }
        .blur-pulse { filter: blur(4px); animation: pulse-blur 2s infinite ease-in-out; }
        @keyframes pulse-blur {
          0%, 100% { filter: blur(4px); opacity: 0.7; }
          50% { filter: blur(8px); opacity: 0.5; }
        }
        .processing-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 1.5rem;
          z-index: 10;
        }
        .spinner-glow {
          width: 40px;
          height: 40px;
          border: 3px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px rgba(255,255,255,0.5);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(10px)',
};

const modalContentStyle: React.CSSProperties = {
  padding: '2rem',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
};

const getVibeStyles = (vibe: string) => {
  switch (vibe) {
    case 'harlem_soul':
      return {
        background: 'linear-gradient(135deg, #2d1b0d 0%, #1a0f08 100%)',
        accent: '#f59e0b',
        font: "'Playfair Display', serif",
        animation: 'animate-drift'
      };
    case 'k_dreamer':
      return {
        background: 'linear-gradient(135deg, #fce7f3 0%, #f0f9ff 100%)',
        accent: '#ec4899',
        font: "'Inter', sans-serif",
        animation: 'animate-float'
      };
    case 'cosmic_bloom':
      return {
        background: 'linear-gradient(135deg, #1e1b4b 0%, #020617 100%)',
        accent: '#818cf8',
        font: "'Orbitron', sans-serif",
        animation: 'animate-pulse-slow'
      };
    case 'orchid_noir':
    default:
      return {
        background: 'linear-gradient(135deg, #1f1235 0%, #0d0614 100%)',
        accent: '#a855f7',
        font: "'Lora', serif",
        animation: 'animate-bloom'
      };
  }
};
