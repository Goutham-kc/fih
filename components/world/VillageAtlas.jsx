import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './VillageAtlas.module.css';

export const CHAPTER_ANCHORS = {
  todos: { name: 'The Cottage', chapterTitle: 'Daily tasks and plans' },
  reminders: { name: 'Bell Tower', chapterTitle: 'Reminders and notices' },
  debts: { name: 'Village Bank', chapterTitle: 'Your personal ledger' },
  deadlines: { name: 'Notice Board', chapterTitle: 'Deadlines and due dates' },
  dates: { name: 'Festival Grounds', chapterTitle: 'Important dates and celebrations' },
  watchlist: { name: 'Moonlight Cinema', chapterTitle: 'Your watchlist beneath the stars' },
  audit: { name: 'Archives Cellar', chapterTitle: 'Your history and records' },
  settings: { name: 'Tools Shed', chapterTitle: 'Village settings and tools' },
};

export function shouldShowDialogue({ activeTab, hasInteracted, nearbyBuilding }) {
  return Boolean(activeTab || nearbyBuilding || hasInteracted);
}

export function getHudControlsGuide({ activeTab, nearbyBuilding }) {
  if (activeTab) return 'Esc to return to the village';
  if (nearbyBuilding) return 'Press E to enter';
  return 'WASD or arrows to explore';
}

const DESTINATIONS = [
  { id: 'todos', x: 28.5, y: 26, label: 'The Cottage', detail: 'Open your daily task list.' },
  { id: 'reminders', x: 50, y: 23, label: 'Bell Tower', detail: 'Check reminders and announcements.' },
  { id: 'audit', x: 70, y: 22.5, label: 'Archives Cellar', detail: 'Browse your personal history.' },
  { id: 'debts', x: 18, y: 48, label: 'Village Bank', detail: 'Review balances and debts.' },
  { id: 'settings', x: 79, y: 49, label: 'Tools Shed', detail: 'Adjust your village settings.' },
  { id: 'dates', x: 26, y: 73, label: 'Festival Grounds', detail: 'Plan important dates and celebrations.' },
  { id: 'deadlines', x: 50, y: 73, label: 'Notice Board', detail: 'See upcoming deadlines.' },
  { id: 'watchlist', x: 79, y: 73, label: 'Moonlight Cinema', detail: 'Choose what to watch next.' },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function VillageAtlas({
  activeTab,
  onNavigateToChapter,
  onNearbyBuildingChange,
  onPlayerInteract,
  reducedMotion = false,
}) {
  const [position, setPosition] = useState({ x: 50.2, y: 58 });
  const keys = useRef(new Set());
  const nearbyRef = useRef(null);

  const nearby = useMemo(() => {
    const closest = DESTINATIONS
      .map((destination) => ({ destination, distance: Math.hypot(destination.x - position.x, (destination.y - position.y) * 1.35) }))
      .sort((a, b) => a.distance - b.distance)[0];
    return closest?.distance < 7.5 ? closest.destination : null;
  }, [position]);

  const visit = useCallback((destination) => {
    if (!destination) return;
    onPlayerInteract?.();
    onNavigateToChapter?.(destination.id, { panelOnly: false });
  }, [onNavigateToChapter, onPlayerInteract]);

  useEffect(() => {
    nearbyRef.current = nearby;
    onNearbyBuildingChange?.(nearby);
  }, [nearby, onNearbyBuildingChange]);

  useEffect(() => {
    let frameId;
    let last = 0;
    const speed = 0.016;

    const tick = (now) => {
      const elapsed = Math.min(32, now - last || 16);
      last = now;
      const pressed = keys.current;
      const horizontal = (pressed.has('ArrowRight') || pressed.has('KeyD') ? 1 : 0) - (pressed.has('ArrowLeft') || pressed.has('KeyA') ? 1 : 0);
      const vertical = (pressed.has('ArrowDown') || pressed.has('KeyS') ? 1 : 0) - (pressed.has('ArrowUp') || pressed.has('KeyW') ? 1 : 0);
      if (horizontal || vertical) {
        const diagonal = horizontal && vertical ? 0.707 : 1;
        setPosition((current) => ({
          x: clamp(current.x + horizontal * speed * elapsed * diagonal, 5, 95),
          y: clamp(current.y + vertical * speed * elapsed * diagonal, 8, 92),
        }));
      }
      frameId = requestAnimationFrame(tick);
    };

    const onKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (event.code === 'KeyE' && nearbyRef.current) {
        event.preventDefault();
        visit(nearbyRef.current);
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        keys.current.add(event.code);
        onPlayerInteract?.();
      }
    };
    const onKeyUp = (event) => keys.current.delete(event.code);

    frameId = requestAnimationFrame(tick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onPlayerInteract, visit]);

  const focusDestination = (destination) => {
    setPosition({ x: destination.x, y: Math.min(91, destination.y + 5) });
    onPlayerInteract?.();
  };

  return (
    <section className={styles.atlas} aria-label="Fih village map">
      <div className={styles.map}>
        <Image src="/fih-village-map.png" width={1664} height={945} priority alt="A colorful village map with a cottage, bell tower, archives, bank, workshop, festival grounds, notice board, and moonlight cinema." draggable="false" />
        {DESTINATIONS.map((destination) => (
          <button
            className={styles.destination}
            key={destination.id}
            style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
            onClick={() => focusDestination(destination)}
            onDoubleClick={() => visit(destination)}
            aria-label={`Walk to ${destination.label}`}
          />
        ))}
        <div
          aria-label="Your character"
          className={`${styles.player} ${reducedMotion ? styles.still : ''}`}
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        ><span /><i /><b /></div>
        {nearby && !activeTab && (
          <div className={styles.prompt} role="status">
            <strong>{nearby.label}</strong>
            <span>{nearby.detail}</span>
            <button type="button" onClick={() => visit(nearby)}>Enter</button>
          </div>
        )}
      </div>
      <div className={styles.legend}>
        <span>Walk with WASD or arrow keys</span>
        <span>Click a place to walk there · Press E to enter</span>
      </div>
    </section>
  );
}
