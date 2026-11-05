'use client';

import React, { useEffect, useRef } from 'react';

export interface PhaserGameProps {
  className?: string;
  style?: React.CSSProperties;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ className = '', style = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPhaser() {
      if (typeof window === 'undefined' || !containerRef.current) return;

      const Phaser = (await import('phaser')).default;
      const { createGameConfig } = await import('@/src/game/config');

      if (!isMounted) return;

      if (!gameRef.current) {
        const config = createGameConfig(containerRef.current);
        const game = new Phaser.Game(config);
        gameRef.current = game;
        (window as any).__PHASER_GAME__ = game;
      }
    }

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        delete (window as any).__PHASER_GAME__;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`phaser-game-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
};

export default PhaserGame;
