import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

// Dynamically import PhaserGame with SSR disabled (Phaser requires browser window / canvas)
const PhaserGame = dynamic(
  () => import('@/components/game/PhaserGame').then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1b140f',
        color: '#ffedd5',
        fontFamily: 'monospace',
        fontSize: '18px'
      }}>
        Loading Village Game Engine...
      </div>
    ),
  }
);

export default function PhaserGamePage() {
  return (
    <>
      <Head>
        <title>Fields of Mistria - Phaser 3 Village Engine</title>
        <meta name="description" content="2D top-down pixelated web game built with React, TypeScript, and Phaser 3" />
      </Head>

      <div style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1b140f'
      }}>
        {/* Top Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 16,
          zIndex: 100,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'rgba(30, 20, 15, 0.85)',
          padding: '8px 16px',
          borderRadius: 8,
          border: '2px solid #a3724c',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          color: '#fdf6e2',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          backdropFilter: 'blur(4px)'
        }}>
          <Link
            href="/"
            style={{
              color: '#facc15',
              fontWeight: 'bold',
              textDecoration: 'none',
              paddingRight: 10,
              borderRight: '1px solid #785032'
            }}
          >
            ← Return to Dashboard
          </Link>
          <span>🎮 <b>Controls:</b> WASD / Arrow Keys (8-Directional Movement)</span>
          <span style={{ color: '#a3a3a3' }}>|</span>
          <span style={{ color: '#4ade80' }}>● Arcade Physics 60 FPS</span>
        </div>

        {/* The Phaser 3 Canvas Component */}
        <PhaserGame />
      </div>
    </>
  );
}
