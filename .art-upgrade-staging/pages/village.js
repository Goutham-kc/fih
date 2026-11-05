import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, DoorOpen, Volume2, VolumeX } from 'lucide-react';
import styles from '@/styles/village.module.css';

const PLACES = [
  { id: 'house', name: 'The Cottage', hint: 'Your cozy home and personal space.', x: 28, y: 25, tab: 'todos', icon: '⌂' },
  { id: 'tower', name: 'Bell Tower', hint: 'The heart of the village. Hear the latest news.', x: 50, y: 24, tab: 'dates', icon: '♜' },
  { id: 'archives', name: 'Archives Cellar', hint: 'A quiet place for your memories and records.', x: 70, y: 22, tab: 'audit', icon: '▤' },
  { id: 'bank', name: 'Village Bank', hint: 'Keep an eye on your coins and ledger.', x: 18, y: 48, tab: 'debts', icon: '◈' },
  { id: 'tools', name: 'Tools Shed', hint: 'Your tools for getting things done.', x: 80, y: 49, tab: 'settings', icon: '⚒' },
  { id: 'festival', name: 'Festival Grounds', hint: 'A place for plans, milestones and celebrations.', x: 25, y: 72, tab: 'deadlines', icon: '✿' },
  { id: 'notice', name: 'Notice Board', hint: 'Fresh reminders and things to do.', x: 50, y: 72, tab: 'reminders', icon: '▧' },
  { id: 'cinema', name: 'Moonlight Cinema', hint: 'Your watchlist beneath the stars.', x: 80, y: 72, tab: 'watchlist', icon: '✦' },
];

export default function Village() {
  const router = useRouter();
  const [pos, setPos] = useState({ x: 46, y: 57 });
  const [nearby, setNearby] = useState(null);
  const [active, setActive] = useState(null);
  const [muted, setMuted] = useState(true);
  const keys = useRef({});
  const posRef = useRef(pos);
  posRef.current = pos;

  const interact = useCallback((place) => {
    if (!place) return;
    setActive(place);
  }, []);

  useEffect(() => {
    let frame;
    let last = 0;
    const tick = (time) => {
      if (time - last > 24) {
        last = time;
        const k = keys.current;
        const speed = 0.16;
        let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0);
        let dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
        if (dx || dy) {
          const norm = dx && dy ? 0.707 : 1;
          setPos(p => ({ x: Math.max(5, Math.min(95, p.x + dx * speed * norm)), y: Math.max(8, Math.min(94, p.y + dy * speed * norm)) }));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const down = e => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      keys.current[e.key] = true;
      if (e.key.toLowerCase() === 'e' && nearby) interact(nearby);
      if (e.key === 'Escape') setActive(null);
    };
    const up = e => { keys.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [nearby, interact]);

  useEffect(() => {
    const p = PLACES.map(place => ({ place, distance: Math.hypot(place.x - pos.x, (place.y - pos.y) * 1.35) })).sort((a,b) => a.distance-b.distance)[0];
    setNearby(p && p.distance < 8 ? p.place : null);
  }, [pos]);

  const go = (place) => router.push(`/?tab=${place.tab}`);
  const move = (key) => { keys.current[key] = true; };
  const stop = (key) => { keys.current[key] = false; };

  return <>
    <Head><title>Fih Village — A little world of your own</title><meta name="description" content="Explore Fih Village, your cozy personal dashboard." /></Head>
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}><span className={styles.brandMark}>✿</span><div><strong>Fih Village</strong><small>A little world of your own</small></div></div>
        <div className={styles.topActions}><span className={styles.weather}>☀ <span>Sunny day</span></span><button className={styles.iconButton} onClick={() => setMuted(!muted)} aria-label="Toggle sound">{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button><button className={styles.mapButton} onClick={() => router.push('/login')}><DoorOpen size={16}/> Sign in</button></div>
      </header>
      <section className={styles.intro}><div><span className={styles.eyebrow}>WELCOME, LITTLE EXPLORER</span><h1>Take a stroll around.</h1><p>Wander through the village and visit a place to get started.</p></div><div className={styles.dayNote}>✧ <span>There’s always something to discover</span></div></section>
      <section className={styles.worldShell} aria-label="Interactive village map">
        <div className={styles.world}>
          <img className={styles.mapImage} src="/fih-village-map.png" alt="Pixel-art village with a house, bell tower, archives, bank, tools shed, festival grounds, notice board and moonlight cinema" draggable="false" />
          {PLACES.map(place => <button key={place.id} className={styles.hotspot} style={{ left: `${place.x}%`, top: `${place.y}%` }} onClick={() => interact(place)} aria-label={`Visit ${place.name}`} title={place.name}><span>{place.icon}</span></button>)}
          <div className={styles.player} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label="Your character"><span className={styles.playerShadow}/><span className={styles.playerBody}><i/><b/><em/></span></div>
        </div>
        <div className={styles.mapFooter}><span><Compass size={15}/> Explore at your own pace</span><span className={styles.coords}>VILLAGE SQUARE · EST. 2026</span></div>
      </section>
      <section className={styles.below}><div className={styles.controlCard}><div><strong>How to explore</strong><small>Move around and get close to a place.</small></div><div className={styles.controls}><div className={styles.keyRow}><kbd onMouseDown={() => move('ArrowUp')} onMouseUp={() => stop('ArrowUp')}>↑</kbd></div><div className={styles.keyRow}><kbd onMouseDown={() => move('ArrowLeft')} onMouseUp={() => stop('ArrowLeft')}>←</kbd><kbd onMouseDown={() => move('ArrowDown')} onMouseUp={() => stop('ArrowDown')}>↓</kbd><kbd onMouseDown={() => move('ArrowRight')} onMouseUp={() => stop('ArrowRight')}>→</kbd></div></div><span className={styles.keyHelp}>WASD / ARROWS <b>·</b> E TO ENTER</span></div><div className={styles.visitCard}>{nearby ? <><span className={styles.visitIcon}>{nearby.icon}</span><div><small>YOU'RE NEAR</small><strong>{nearby.name}</strong><p>{nearby.hint}</p></div><button onClick={() => interact(nearby)}>Enter <ArrowRight size={15}/></button></> : <><span className={styles.visitIcon}>✧</span><div><small>YOUR NEXT ADVENTURE</small><strong>Find somewhere to visit</strong><p>Walk up to a building or tap its marker on the map.</p></div></>}</div></section>
      <footer className={styles.footer}>Made with a little magic <span>✿</span> Fih Village</footer>
      {active && <div className={styles.modalBackdrop} onClick={() => setActive(null)}><div className={styles.modal} onClick={e => e.stopPropagation()}><button className={styles.close} onClick={() => setActive(null)}>×</button><div className={styles.modalIcon}>{active.icon}</div><span className={styles.eyebrow}>VILLAGE DESTINATION</span><h2>{active.name}</h2><p>{active.hint}</p><button className={styles.enterButton} onClick={() => go(active)}>Enter {active.name} <ArrowRight size={16}/></button></div></div>}
    </main>
  </>;
}
