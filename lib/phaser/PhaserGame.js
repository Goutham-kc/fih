import createBootScene from './scenes/BootScene';
import createVillageScene from './scenes/VillageScene';

export async function initPhaserGame(container, callbacks = {}) {
  if (typeof window === 'undefined' || !container) return null;

  const Phaser = (await import('phaser')).default;

  const BootScene = createBootScene(Phaser);
  const VillageScene = createVillageScene(Phaser);

  const config = {
    type: Phaser.AUTO,
    parent: container,
    width: container.clientWidth || 800,
    height: container.clientHeight || 600,
    pixelArt: true,
    roundPixels: true,
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, VillageScene],
  };

  const game = new Phaser.Game(config);

  // Event Bridge between Phaser Scene and React Callbacks
  if (callbacks.onNearbyBuildingChange) {
    game.events.on('nearby-building-changed', callbacks.onNearbyBuildingChange);
  }
  if (callbacks.onPlayerInteract) {
    game.events.on('player-interacted', callbacks.onPlayerInteract);
  }
  if (callbacks.onNavigateToChapter) {
    game.events.on('building-clicked', (b) => {
      callbacks.onNavigateToChapter(b.id);
    });
  }

  return game;
}
