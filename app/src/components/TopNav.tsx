'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from '../lib/firebase/auth';
import { subscribeToUserProfile } from '../lib/firebase/firestore';
import { User } from 'firebase/auth';

export default function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = subscribeToUserProfile(user.uid, (p) => {
        setProfile(p);
      });
      return unsubscribeProfile;
    } else {
      setProfile(null);
    }
  }, [user]);

  const credits = (profile?.creditBalance || 0) + (profile?.purchasedCredits || 0);
  const isLowCredits = credits < 5;

  return (
    <nav style={navStyle}>
      <div className="container" style={containerStyle}>
        <Link href="/" style={logoStyle}>
          <span style={{ fontSize: '1.5rem' }}>🌸</span>
          <span style={logoTextStyle}>The Living Muse</span>
        </Link>

        <div style={linksStyle}>
          <Link href="/gallery" style={pathname === '/gallery' ? activeLinkStyle : linkStyle}>
            Gallery
          </Link>
          <Link href="/create" style={pathname === '/create' ? activeLinkStyle : linkStyle}>
            Create
          </Link>
          <Link href="/pricing" style={pathname === '/pricing' ? activeLinkStyle : linkStyle}>
             Pricing
          </Link>
        </div>

        <div style={rightSectionStyle}>
          {user && (
            <div 
              className={isLowCredits ? 'pulse-red' : ''} 
              style={isLowCredits ? lowCreditBadgeStyle : creditBadgeStyle}
            >
              {isLowCredits && <span style={{ marginRight: '4px' }}>⚠️</span>}
              <span style={{ fontWeight: '700' }}>{credits}</span>
              <span style={{ fontSize: '0.7rem', marginLeft: '2px', opacity: 0.8 }}>CR</span>
            </div>
          )}
          
          {user ? (
            <Link href="/profile" style={profileIconStyle}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={avatarStyle} />
              ) : (
                <div style={avatarPlaceholderStyle}>{user.displayName?.[0] || 'U'}</div>
              )}
            </Link>
          ) : (
            <Link href="/" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Inline Styles (to avoid CSS module overhead for now) ───

const navStyle: React.CSSProperties = {
  height: '72px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(168, 85, 247, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
};

const logoTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--orchid-900)',
};

const linksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
};

const linkStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '500',
  color: 'var(--neutral-700)',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: 'var(--orchid-600)',
  fontWeight: '600',
};

const rightSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const creditBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 12px',
  background: 'var(--orchid-100)',
  color: 'var(--orchid-700)',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.85rem',
  border: '1px solid var(--orchid-200)',
};

const lowCreditBadgeStyle: React.CSSProperties = {
  ...creditBadgeStyle,
  background: 'var(--rose-500)',
  color: 'white',
  border: 'none',
};

const profileIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--orchid-200)',
};

const avatarPlaceholderStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'var(--orchid-500)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '0.9rem',
};
