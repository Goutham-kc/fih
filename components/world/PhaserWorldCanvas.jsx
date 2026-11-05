import { useEffect, useRef } from 'react';
import { initPhaserGame } from '@/lib/phaser/PhaserGame';

export default function PhaserWorldCanvas({
  activeTab = null,
  debtsData = [],
  todosData = [],
  remindersData = [],
  deadlinesData = [],
  datesData = [],
  watchlistData = [],
  auditData = [],
  envMode = 'live',
  onSelectDebt,
  onNavigateToChapter,
  onCloseChapter,
  onPlayerInteract,
  onNearbyBuildingChange,
  reducedMotion = false,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function startPhaser() {
      if (!containerRef.current) return;
      try {
        const game = await initPhaserGame(containerRef.current, {
          onNearbyBuildingChange,
          onPlayerInteract,
          onNavigateToChapter,
        });
        if (isMounted) {
          gameRef.current = game;
        } else if (game) {
          game.destroy(true);
        }
      } catch (err) {
        console.error('Failed to initialize Phaser 3 world:', err);
      }
    }

    startPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onNearbyBuildingChange, onPlayerInteract, onNavigateToChapter]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        imageRendering: 'pixelated',
        backgroundColor: '#1a1c18',
        ...style,
      }}
    />
  );
}
