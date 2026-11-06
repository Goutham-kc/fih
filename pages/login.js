import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginScenicBackground from '@/components/world/LoginScenicBackground';
import { soundManager } from '@/lib/soundManager';
import { Volume2, VolumeX, Sparkles, User, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const VILLAGERS = [
  {
    id: 'celine',
    name: 'Celine',
    role: 'The Botanist',
    color: '#10b981',
    greeting: 'Welcome traveler! The valley blossoms are in bloom. Sign our registry to enter.',
    sprite: '/village_assets/villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_south.png',
  },
  {
    id: 'adeline',
    name: 'Adeline',
    role: 'Town Leader',
    color: '#a78bfa',
    greeting: 'Greetings! As Town Leader, I bid you a warm welcome to Fih Valley. Let us verify your pass.',
    sprite: '/village_assets/villagers/Adeline/Sprites/Spring/spr_npc_adeline_spring_walk_south.png',
  },
  {
    id: 'balor',
    name: 'Balor',
    role: 'The Merchant',
    color: '#fbbf24',
    greeting: 'Ah, a fresh face! Looking for trade and prosperity? Check in at the ledger first, friend.',
    sprite: '/village_assets/villagers/Balor/Sprites/Spring/spr_npc_balor_spring_walk_south.png',
  },
  {
    id: 'march',
    name: 'March',
    role: 'The Blacksmith',
    color: '#f87171',
    greeting: 'Hmph. Another traveler at the gates? Make sure your credentials are forged properly.',
    sprite: '/village_assets/villagers/March/Sprites/Spring/spr_npc_march_spring_walk_south.png',
  },
  {
    id: 'hayden',
    name: 'Hayden',
    role: 'The Rancher',
    color: '#60a5fa',
    greeting: 'Howdy! Come on in, the hearth is warm and the valley animals are always friendly.',
    sprite: '/village_assets/villagers/Hayden/Sprites/Spring/spr_npc_hayden_spring_walk_south.png',
  },
];

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setMuted(soundManager.isMuted());
  }, []);

  const activeVillager = VILLAGERS[heroIndex];

  function handleNextVillager() {
    soundManager.playSfx('wood');
    setHeroIndex((prev) => (prev + 1) % VILLAGERS.length);
  }

  function handleToggleSound() {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    soundManager.playSfx('click');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        soundManager.playSfx('wood');
        const data = await res.json();
        setError(data.error?.message || 'Invalid credentials. Seek the Village Warden.');
      } else {
        soundManager.playSfx('coin');
        router.push('/');
      }
    } catch {
      soundManager.playSfx('wood');
      setError('Network connection failed. The messenger bird could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Town Registrar & Registry — Fih Valley</title>
        <meta name="description" content="Sign in to your Fih Valley personal operating system" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          padding: '24px 16px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Silkscreen', monospace",
        }}
      >
        {/* Living 16-bit Scenic Village Background with Falling Blossoms & Fireflies */}
        <LoginScenicBackground />

        {/* Top Floating Control Bar */}
        <header
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {/* Realm Crest Badge */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(20, 32, 24, 0.94)',
              border: '2px solid #386e4e',
              boxShadow: 'inset 1px 1px 0 #5ca077, 0 3px 8px rgba(0,0,0,0.6)',
              padding: '6px 14px',
              borderRadius: 0,
              color: '#fef08a',
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={13} color="#facc15" />
            <span>REALM: FIH VALLEY • EST. 2026</span>
          </div>

          {/* Sound Mute/Unmute Control */}
          <button
            type="button"
            onClick={handleToggleSound}
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(20, 32, 24, 0.94)',
              border: '2px solid #386e4e',
              boxShadow: 'inset 1px 1px 0 #5ca077, 0 3px 8px rgba(0,0,0,0.6)',
              padding: '6px 14px',
              color: !muted ? '#fef08a' : '#94a3b8',
              fontSize: 11,
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: "'Silkscreen', monospace",
            }}
            title={!muted ? 'Mute cozy village audio' : 'Unmute village audio'}
          >
            {!muted ? <Volume2 size={14} color="#facc15" /> : <VolumeX size={14} color="#94a3b8" />}
            <span>{!muted ? 'AUDIO ON' : 'MUTED'}</span>
          </button>
        </header>

        {/* ── Main Town Registrar Ledger Card ── */}
        <main
          style={{
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            zIndex: 20,
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          {/* Outer Carved Timber Frame with Golden Inset Bevels */}
          <div
            style={{
              background: '#1a2e22',
              border: '4px solid #0d1a13',
              outline: '2px solid #386e4e',
              boxShadow: 'inset 3px 3px 0 #4f8b65, inset -3px -3px 0 #0d1a13, 0 12px 32px rgba(0, 0, 0, 0.75)',
              position: 'relative',
            }}
          >
            {/* 4 Corner Brass Rivets */}
            <div style={{ position: 'absolute', top: 4, left: 4, width: 6, height: 6, background: '#facc15', border: '1px solid #713f12' }} />
            <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: '#facc15', border: '1px solid #713f12' }} />
            <div style={{ position: 'absolute', bottom: 4, left: 4, width: 6, height: 6, background: '#facc15', border: '1px solid #713f12' }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 6, height: 6, background: '#facc15', border: '1px solid #713f12' }} />

            {/* Inner Platter / Header Banner */}
            <div
              style={{
                background: '#13241b',
                borderBottom: '3px solid #0d1a13',
                padding: '22px 20px 18px 20px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Title Crest Ribbon */}
              <div
                style={{
                  display: 'inline-block',
                  background: '#2b523c',
                  border: '2px solid #14291e',
                  boxShadow: 'inset 1px 1px 0 #468662, 0 2px 4px rgba(0,0,0,0.4)',
                  padding: '4px 12px',
                  marginBottom: 10,
                  fontSize: 10,
                  color: '#fef08a',
                  letterSpacing: '0.08em',
                }}
              >
                ★ TOWN HALL REGISTRAR & LEDGER ★
              </div>

              {/* Main Retro Game Title */}
              <h1
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 22,
                  color: '#facc15',
                  textShadow: '2px 2px 0 #713f12, 4px 4px 0 #000000',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                FIH VALLEY
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: '#bbf7d0',
                  letterSpacing: '0.03em',
                }}
              >
                The Cozy 16-Bit Operating System
              </p>
            </div>

            {/* Welcoming Villager Mascot Greeter Box */}
            <div
              style={{
                background: '#16281e',
                borderBottom: '2px solid #0d1a13',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Animated Walking Sprite Frame with 1.8x Scale */}
              <div
                onClick={handleNextVillager}
                title="Click to cycle welcoming villager!"
                style={{
                  width: 60,
                  height: 60,
                  flexShrink: 0,
                  background: '#13241b',
                  border: `2px solid ${activeVillager.color}`,
                  boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* CSS Sprite Sheet Animation for 4-Frame South Walk Cycle */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    transform: 'scale(1.75)',
                    transformOrigin: 'center center',
                    backgroundImage: `url('${activeVillager.sprite}')`,
                    backgroundRepeat: 'no-repeat',
                    animation: 'villagerWalkSouth 0.8s steps(4) infinite',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>

              {/* Speech Bubble */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: activeVillager.color }}>
                    {activeVillager.name} ({activeVillager.role})
                  </span>
                  <button
                    type="button"
                    onClick={handleNextVillager}
                    style={{
                      background: '#244533',
                      border: '1px solid #14291e',
                      color: '#fef08a',
                      fontSize: 9,
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontFamily: "'Silkscreen', monospace",
                    }}
                  >
                    NEXT ➔
                  </button>
                </div>
                <div
                  style={{
                    background: '#fcf8ef',
                    color: '#1c1917',
                    padding: '8px 12px',
                    fontSize: 10,
                    lineHeight: 1.45,
                    border: '2px solid #2d180c',
                    boxShadow: 'inset 1px 1px 0 #ffffff, 2px 2px 0 #0d1a13',
                    position: 'relative',
                  }}
                >
                  "{activeVillager.greeting}"
                </div>
              </div>
            </div>

            {/* Form Body: Scribe Registry */}
            <form onSubmit={handleSubmit} style={{ padding: '22px 22px 18px 22px' }}>
              {/* Field 1: Identifier */}
              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="identifier"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: '#fef08a',
                    marginBottom: 8,
                    letterSpacing: '0.04em',
                    fontWeight: 700,
                  }}
                >
                  <User size={13} color="#facc15" />
                  <span>TRAVELER IDENTIFIER</span>
                  <span style={{ fontSize: 9, color: '#86efac', fontWeight: 400 }}>(USERNAME OR EMAIL)</span>
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. celine or traveler@valley.io"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: 44,
                    padding: '0 14px',
                    background: '#fcf8ef',
                    border: '3px solid #0d1a13',
                    boxShadow: 'inset 2px 2px 0 #ded4be, 0 2px 0 #0d1a13',
                    color: '#1a1005',
                    fontSize: 12,
                    fontFamily: "'Silkscreen', monospace",
                    outline: 'none',
                    borderRadius: 0,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#eab308';
                    e.target.style.boxShadow = 'inset 2px 2px 0 #fde047, 0 0 8px rgba(250, 204, 21, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#0d1a13';
                    e.target.style.boxShadow = 'inset 2px 2px 0 #ded4be, 0 2px 0 #0d1a13';
                  }}
                />
              </div>

              {/* Field 2: Password */}
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: '#fef08a',
                    marginBottom: 8,
                    letterSpacing: '0.04em',
                    fontWeight: 700,
                  }}
                >
                  <Lock size={13} color="#facc15" />
                  <span>SECRET PASSPHRASE</span>
                  <span style={{ fontSize: 9, color: '#86efac', fontWeight: 400 }}>(PASSWORD)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: 44,
                    padding: '0 14px',
                    background: '#fcf8ef',
                    border: '3px solid #0d1a13',
                    boxShadow: 'inset 2px 2px 0 #ded4be, 0 2px 0 #0d1a13',
                    color: '#1a1005',
                    fontSize: 12,
                    fontFamily: "'Silkscreen', monospace",
                    outline: 'none',
                    borderRadius: 0,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#eab308';
                    e.target.style.boxShadow = 'inset 2px 2px 0 #fde047, 0 0 8px rgba(250, 204, 21, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#0d1a13';
                    e.target.style.boxShadow = 'inset 2px 2px 0 #ded4be, 0 2px 0 #0d1a13';
                  }}
                />
              </div>

              {/* Error Notice Scroll */}
              {error && (
                <div
                  style={{
                    background: '#450a0a',
                    border: '2px solid #ef4444',
                    boxShadow: 'inset 2px 2px 0 #7f1d1d, 0 3px 0 #1e0505',
                    color: '#fef2f2',
                    padding: '10px 14px',
                    marginBottom: 18,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    lineHeight: 1.4,
                  }}
                >
                  <ShieldAlert size={16} color="#f87171" style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* 16-Bit Golden Action Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  background: loading ? '#854d0e' : '#eab308',
                  color: '#1a1005',
                  border: '3px solid #713f12',
                  boxShadow: 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 4px 0 #422006',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  borderRadius: 0,
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(2px)';
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 0 #854d0e, 0 2px 0 #422006';
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 4px 0 #422006';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                    <span>VERIFYING PASS...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER THE VALLEY</span>
                    <ArrowRight size={14} color="#1a1005" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Town Bulletin Notice */}
            <footer
              style={{
                background: '#13241b',
                borderTop: '2px solid #0d1a13',
                padding: '12px 18px',
                fontSize: 10,
                color: '#94a3b8',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>📜</span>
              <span>
                <strong>Town Notice:</strong> Resident accounts are provisioned by the Realm Warden via the admin seed portal. Seek your administrator if you require a passport.
              </span>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Animation Styles for CSS Sprite Walking */}
      <style jsx global>{`
        @keyframes villagerWalkSouth {
          from {
            background-position: 0px 0px;
          }
          to {
            background-position: -320px 0px;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
