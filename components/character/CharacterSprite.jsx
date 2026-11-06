import { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '@/lib/eventBus';

export const CHARACTER_META = {
  pip: {
    name: 'Pip',
    title: 'The Farmhand',
    role: 'Chore Master',
    location: 'The Farmstead',
    color: '#8fc45a',
  },
  hoot: {
    name: 'Hoot',
    title: 'The Timekeeper',
    role: 'Bell Tower Owl',
    location: 'The Bell Tower',
    color: '#f2c230',
  },
  marigold: {
    name: 'Marigold',
    title: 'The Festival Herald',
    role: 'Town Crier',
    location: 'The Notice Board',
    color: '#f472b6',
  },
  bram: {
    name: 'Bram',
    title: 'The Honest Factor',
    role: 'Ledger Banker',
    location: 'The Ledger Hut',
    color: '#c98f55',
  },
  juniper: {
    name: 'Juniper',
    title: 'The Projectionist',
    role: 'Cinema Fox',
    location: 'The Moonlight Cinema',
    color: '#fb923c',
  },
  moss: {
    name: 'Moss',
    title: 'The Chronicler',
    role: 'Ancient Archivist',
    location: 'The Archive Cellar',
    color: '#65a30d',
  },
  wren: {
    name: 'Wren',
    title: 'The Courier',
    role: 'WhatsApp Messenger Bird',
    location: 'The Sky Post',
    color: '#38bdf8',
  },
  clover: {
    name: 'Clover',
    title: 'The Elder',
    role: 'Festival Keeper',
    location: 'The Town Mill',
    color: '#a78bfa',
  },
  rowan: {
    name: 'Rowan',
    title: 'The Artisan',
    role: 'Homestead Builder',
    location: 'The Toolshed',
    color: '#eab308',
  },
};

export default function CharacterSprite({
  characterId = 'pip',
  state: forcedState = null,
  size = 64,
  interactive = true,
  onClick = null,
  className = '',
  style = {},
}) {
  const [internalState, setInternalState] = useState('idle');

  const effectiveState = forcedState || internalState;

  // EventBus auto-reactions
  useEffect(() => {
    let timeoutId;
    function triggerReaction() {
      setInternalState('react');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setInternalState('idle'), 1800);
    }

    const unsubscribers = [];

    if (characterId === 'pip') {
      unsubscribers.push(
        eventBus.on(EVENTS.TASK_COMPLETED, triggerReaction),
        eventBus.on(EVENTS.TASK_CREATED, triggerReaction)
      );
    } else if (characterId === 'hoot') {
      unsubscribers.push(
        eventBus.on(EVENTS.REMINDER_FIRED, triggerReaction),
        eventBus.on(EVENTS.REMINDER_CREATED, triggerReaction)
      );
    } else if (characterId === 'bram') {
      unsubscribers.push(
        eventBus.on(EVENTS.DEBT_SETTLED, triggerReaction),
        eventBus.on(EVENTS.DEBT_PAYMENT, triggerReaction)
      );
    } else if (characterId === 'marigold') {
      unsubscribers.push(
        eventBus.on(EVENTS.DEADLINE_COMPLETED, triggerReaction),
        eventBus.on(EVENTS.DEADLINE_CREATED, triggerReaction)
      );
    } else if (characterId === 'juniper') {
      unsubscribers.push(
        eventBus.on(EVENTS.WATCH_STATUS, triggerReaction),
        eventBus.on(EVENTS.WATCH_ADDED, triggerReaction)
      );
    } else if (characterId === 'wren') {
      unsubscribers.push(eventBus.on(EVENTS.WHATSAPP_ITEM_RECEIVED, triggerReaction));
    }

    return () => {
      clearTimeout(timeoutId);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [characterId]);

  function handleClick(e) {
    if (!forcedState && interactive) {
      setInternalState('react');
      setTimeout(() => setInternalState('idle'), 1400);
    }
    if (onClick) onClick(e);
  }

  // Render SVG pixel art per character
  return (
    <div
      onClick={handleClick}
      className={`pixel-character-sprite character-${characterId} state-${effectiveState} ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
      title={`${CHARACTER_META[characterId]?.name || characterId} (${effectiveState})`}
    >
      {/* Floating reaction particle */}
      {effectiveState === 'react' && (
        <span
          style={{
            position: 'absolute',
            top: -12,
            right: -4,
            fontSize: size * 0.35,
            animation: 'pv-bounce-sparkle 0.8s ease-out infinite alternate',
            zIndex: 2,
          }}
        >
          ✨
        </span>
      )}

      {effectiveState === 'sleep' && (
        <span
          style={{
            position: 'absolute',
            top: -14,
            right: 0,
            fontSize: size * 0.28,
            color: '#93c5fd',
            fontFamily: 'var(--font-pixel, monospace)',
            fontWeight: 800,
            animation: 'pv-float-z 1.8s ease-in-out infinite',
            zIndex: 2,
          }}
        >
          zZz
        </span>
      )}

      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          transform:
            effectiveState === 'react'
              ? 'translateY(-3px) scale(1.08)'
              : effectiveState === 'talk'
              ? 'translateY(-1px)'
              : 'translateY(0)',
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Render crisp pixel shapes based on characterId */}
        {renderCharacterPixels(characterId, effectiveState)}
      </svg>
    </div>
  );
}

function renderCharacterPixels(id, state) {
  const isBlinking = state === 'sleep';
  const isTalking = state === 'talk';

  switch (id) {
    // 1. PIP THE NOVICE FARMER
    case 'pip':
      return (
        <g>
          {/* Straw Hat Brim */}
          <rect x="6" y="7" width="20" height="3" fill="#fde047" />
          <rect x="8" y="4" width="16" height="3" fill="#fde047" />
          <rect x="8" y="6" width="16" height="1" fill="#b45309" /> {/* Hat Band */}
          {/* Face */}
          <rect x="9" y="10" width="14" height="9" fill="#fed7aa" />
          {/* Hair */}
          <rect x="8" y="10" width="2" height="5" fill="#78350f" />
          <rect x="22" y="10" width="2" height="5" fill="#78350f" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <rect x="11" y="13" width="3" height="1" fill="#431407" />
              <rect x="18" y="13" width="3" height="1" fill="#431407" />
            </>
          ) : (
            <>
              <rect x="11" y="12" width="2" height="3" fill="#431407" />
              <rect x="19" y="12" width="2" height="3" fill="#431407" />
            </>
          )}
          {/* Cheeks */}
          <rect x="10" y="15" width="2" height="1" fill="#f87171" opacity="0.8" />
          <rect x="20" y="15" width="2" height="1" fill="#f87171" opacity="0.8" />
          {/* Mouth */}
          <rect x="14" y={isTalking ? '16' : '15'} width="4" height={isTalking ? '2' : '1'} fill="#b91c1c" />
          {/* Red Flannel Shirt */}
          <rect x="8" y="19" width="16" height="4" fill="#dc2626" />
          {/* Blue Dungarees */}
          <rect x="10" y="21" width="12" height="7" fill="#2563eb" />
          <rect x="10" y="19" width="2" height="3" fill="#1d4ed8" /> {/* Strap */}
          <rect x="20" y="19" width="2" height="3" fill="#1d4ed8" /> {/* Strap */}
          <rect x="10" y="22" width="1" height="1" fill="#facc15" /> {/* Brass Button */}
          <rect x="21" y="22" width="1" height="1" fill="#facc15" /> {/* Brass Button */}
          {/* Boots */}
          <rect x="9" y="28" width="5" height="3" fill="#78350f" />
          <rect x="18" y="28" width="5" height="3" fill="#78350f" />
        </g>
      );

    // 2. HOOT THE TIMEKEEPER OWL
    case 'hoot':
      return (
        <g>
          {/* Owl Ear Tufts */}
          <rect x="8" y="4" width="3" height="4" fill="#92400e" />
          <rect x="21" y="4" width="3" height="4" fill="#92400e" />
          {/* Head & Body */}
          <rect x="9" y="7" width="14" height="18" fill="#b45309" />
          <rect x="11" y="9" width="10" height="9" fill="#fef3c7" /> {/* Face Disk */}
          {/* Spectacles (Round Gold Rims) */}
          <rect x="10" y="11" width="5" height="5" fill="none" stroke="#f59e0b" strokeWidth="1" />
          <rect x="17" y="11" width="5" height="5" fill="none" stroke="#f59e0b" strokeWidth="1" />
          <rect x="15" y="13" width="2" height="1" fill="#f59e0b" /> {/* Spectacle Bridge */}
          {/* Eyes */}
          {isBlinking ? (
            <>
              <rect x="11" y="13" width="3" height="1" fill="#451a03" />
              <rect x="18" y="13" width="3" height="1" fill="#451a03" />
            </>
          ) : (
            <>
              <rect x="12" y="12" width="2" height="3" fill="#1e1b4b" />
              <rect x="18" y="12" width="2" height="3" fill="#1e1b4b" />
              <rect x="12" y="12" width="1" height="1" fill="#ffffff" />
              <rect x="18" y="12" width="1" height="1" fill="#ffffff" />
            </>
          )}
          {/* Beak */}
          <rect x="15" y="15" width="2" height={isTalking ? '3' : '2'} fill="#ea580c" />
          {/* Chest Feathers */}
          <rect x="12" y="19" width="8" height="6" fill="#fef3c7" />
          <rect x="14" y="20" width="1" height="1" fill="#92400e" />
          <rect x="17" y="21" width="1" height="1" fill="#92400e" />
          <rect x="15" y="23" width="1" height="1" fill="#92400e" />
          {/* Wooden Mailbox Perch */}
          <rect x="6" y="27" width="20" height="3" fill="#78350f" />
          <rect x="11" y="25" width="3" height="2" fill="#ea580c" /> {/* Claws */}
          <rect x="18" y="25" width="3" height="2" fill="#ea580c" />
        </g>
      );

    // 3. MARIGOLD THE FESTIVAL RABBIT
    case 'marigold':
      return (
        <g>
          {/* Bunny Ears */}
          <rect x="10" y="2" width="3" height="10" fill="#f8fafc" />
          <rect x="11" y="4" width="1" height="7" fill="#fbcfe8" />
          <rect x="19" y="3" width="3" height="9" fill="#f8fafc" />
          <rect x="20" y="5" width="1" height="6" fill="#fbcfe8" />
          {/* Head */}
          <rect x="9" y="10" width="14" height="9" fill="#f8fafc" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <rect x="11" y="13" width="3" height="1" fill="#831843" />
              <rect x="18" y="13" width="3" height="1" fill="#831843" />
            </>
          ) : (
            <>
              <rect x="11" y="12" width="2" height="3" fill="#9d174d" />
              <rect x="19" y="12" width="2" height="3" fill="#9d174d" />
            </>
          )}
          {/* Pink Nose & Whiskers */}
          <rect x="15" y="15" width="2" height="1" fill="#f43f5e" />
          <rect x="8" y="15" width="2" height="1" fill="#cbd5e1" />
          <rect x="22" y="15" width="2" height="1" fill="#cbd5e1" />
          {/* Festival Vest (Emerald Green with Gold Trim) */}
          <rect x="9" y="19" width="14" height="7" fill="#047857" />
          <rect x="15" y="19" width="2" height="7" fill="#fbbf24" /> {/* Gold Ribbons */}
          {/* Parchment Scroll in Hand */}
          <rect x="6" y="20" width="4" height="7" fill="#fef3c7" stroke="#b45309" strokeWidth="0.5" />
          {/* Little Feet */}
          <rect x="10" y="26" width="4" height="3" fill="#f8fafc" />
          <rect x="18" y="26" width="4" height="3" fill="#f8fafc" />
        </g>
      );

    // 4. BRAM THE BADGER BANKER
    case 'bram':
      return (
        <g>
          {/* Badger Head (Grey & White Stripes) */}
          <rect x="8" y="8" width="16" height="11" fill="#334155" />
          <rect x="13" y="8" width="6" height="11" fill="#f8fafc" /> {/* Central White Stripe */}
          <rect x="6" y="7" width="3" height="3" fill="#1e293b" /> {/* Ears */}
          <rect x="23" y="7" width="3" height="3" fill="#1e293b" />
          {/* Half-Moon Spectacles */}
          <rect x="9" y="12" width="4" height="3" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
          <rect x="19" y="12" width="4" height="3" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <rect x="10" y="13" width="2" height="1" fill="#0f172a" />
              <rect x="20" y="13" width="2" height="1" fill="#0f172a" />
            </>
          ) : (
            <>
              <rect x="10" y="13" width="2" height="2" fill="#0f172a" />
              <rect x="20" y="13" width="2" height="2" fill="#0f172a" />
            </>
          )}
          {/* Dark Snout & Nose */}
          <rect x="14" y="15" width="4" height="3" fill="#1e293b" />
          <rect x="15" y="15" width="2" height="1" fill="#0f172a" />
          {/* Banker Vest & Collar */}
          <rect x="8" y="19" width="16" height="8" fill="#78350f" />
          <rect x="13" y="19" width="6" height="4" fill="#ffffff" /> {/* White Shirt Front */}
          <rect x="15" y="21" width="2" height="4" fill="#991b1b" /> {/* Crimson Tie */}
          {/* Quill in Hand */}
          <rect x="24" y="16" width="1" height="8" fill="#facc15" />
          <rect x="23" y="15" width="3" height="2" fill="#ffffff" />
          {/* Sturdy Boots */}
          <rect x="9" y="27" width="5" height="4" fill="#1e293b" />
          <rect x="18" y="27" width="5" height="4" fill="#1e293b" />
        </g>
      );

    // 5. JUNIPER THE FOX PROJECTIONIST
    case 'juniper':
      return (
        <g>
          {/* Fox Ears (Russet with Black Tips) */}
          <rect x="7" y="5" width="4" height="5" fill="#c2410c" />
          <rect x="7" y="4" width="4" height="2" fill="#1c1917" />
          <rect x="21" y="5" width="4" height="5" fill="#c2410c" />
          <rect x="21" y="4" width="4" height="2" fill="#1c1917" />
          {/* Newsboy Cap */}
          <rect x="8" y="7" width="16" height="4" fill="#44403c" />
          <rect x="6" y="10" width="20" height="2" fill="#292524" /> {/* Cap Visor */}
          {/* Fox Face */}
          <rect x="9" y="11" width="14" height="8" fill="#ea580c" />
          <rect x="12" y="13" width="8" height="6" fill="#fef08a" /> {/* Cream Snout */}
          {/* Amber Eyes */}
          {isBlinking ? (
            <>
              <rect x="10" y="13" width="3" height="1" fill="#431407" />
              <rect x="19" y="13" width="3" height="1" fill="#431407" />
            </>
          ) : (
            <>
              <rect x="10" y="12" width="2" height="3" fill="#b45309" />
              <rect x="20" y="12" width="2" height="3" fill="#b45309" />
              <rect x="11" y="13" width="1" height="1" fill="#1c1917" />
              <rect x="20" y="13" width="1" height="1" fill="#1c1917" />
            </>
          )}
          {/* Fox Black Nose */}
          <rect x="15" y="16" width="2" height="1" fill="#1c1917" />
          {/* Cozy Knitted Scarf (Teal) */}
          <rect x="7" y="18" width="18" height="4" fill="#0f766e" />
          <rect x="17" y="21" width="4" height="5" fill="#0f766e" /> {/* Scarf Tail */}
          {/* Jacket */}
          <rect x="9" y="22" width="14" height="6" fill="#78350f" />
          {/* Feet */}
          <rect x="10" y="28" width="4" height="3" fill="#1c1917" />
          <rect x="18" y="28" width="4" height="3" fill="#1c1917" />
        </g>
      );

    // 6. MOSS THE TURTLE ARCHIVIST
    case 'moss':
      return (
        <g>
          {/* Mossy Shell Background */}
          <rect x="6" y="12" width="20" height="15" fill="#78350f" rx="3" />
          <rect x="8" y="14" width="16" height="11" fill="#4d7c0f" rx="2" /> {/* Moss Cover */}
          {/* Turtle Head */}
          <rect x="12" y="7" width="8" height="8" fill="#65a30d" />
          {/* Spectacles */}
          <rect x="12" y="9" width="3" height="3" fill="none" stroke="#facc15" strokeWidth="0.8" />
          <rect x="17" y="9" width="3" height="3" fill="none" stroke="#facc15" strokeWidth="0.8" />
          {/* Gentle Eyes */}
          {isBlinking ? (
            <rect x="13" y="10" width="6" height="1" fill="#365314" />
          ) : (
            <>
              <rect x="13" y="10" width="1" height="2" fill="#365314" />
              <rect x="18" y="10" width="1" height="2" fill="#365314" />
            </>
          )}
          {/* Mouth */}
          <rect x="14" y="13" width="4" height="1" fill="#365314" />
          {/* Lantern Staff */}
          <rect x="4" y="8" width="2" height="21" fill="#b45309" />
          <rect x="2" y="8" width="6" height="5" fill="#facc15" opacity="0.9" /> {/* Brass Lantern */}
          <rect x="3" y="9" width="4" height="3" fill="#fef08a" /> {/* Glow */}
          {/* Big Archive Book in Foot */}
          <rect x="11" y="20" width="10" height="7" fill="#451a03" stroke="#facc15" strokeWidth="0.5" />
          <rect x="13" y="21" width="6" height="1" fill="#fef3c7" />
          {/* Steady Turtle Feet */}
          <rect x="8" y="27" width="4" height="3" fill="#65a30d" />
          <rect x="20" y="27" width="4" height="3" fill="#65a30d" />
        </g>
      );

    // 7. WREN THE MESSENGER BIRD
    case 'wren':
      return (
        <g>
          {/* Sky-Blue Dove/Pigeon Body */}
          <rect x="9" y="8" width="14" height="13" fill="#38bdf8" />
          <rect x="7" y="12" width="5" height="8" fill="#0284c7" /> {/* Wing */}
          {/* Beak with Mail Envelope */}
          <rect x="21" y="12" width="4" height="2" fill="#f59e0b" />
          <rect x="23" y="12" width="6" height="4" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.5" /> {/* Letter */}
          {/* Eye */}
          {isBlinking ? (
            <rect x="17" y="11" width="3" height="1" fill="#0c4a6e" />
          ) : (
            <rect x="17" y="10" width="2" height="2" fill="#0c4a6e" />
          )}
          {/* Leather Courier Satchel */}
          <rect x="11" y="14" width="7" height="6" fill="#78350f" />
          <rect x="9" y="11" width="11" height="1" fill="#451a03" /> {/* Strap */}
          <rect x="14" y="16" width="1" height="1" fill="#facc15" /> {/* Brass Buckle */}
          {/* Tail Feathers */}
          <rect x="5" y="16" width="4" height="3" fill="#0284c7" />
          {/* Little Orange Feet */}
          <rect x="12" y="21" width="2" height="4" fill="#f97316" />
          <rect x="16" y="21" width="2" height="4" fill="#f97316" />
        </g>
      );

    // 8. CLOVER THE GOAT ELDER
    case 'clover':
      return (
        <g>
          {/* Soft Curved Horns */}
          <rect x="7" y="4" width="3" height="4" fill="#d97706" />
          <rect x="9" y="3" width="2" height="3" fill="#b45309" />
          <rect x="22" y="4" width="3" height="4" fill="#d97706" />
          <rect x="21" y="3" width="2" height="3" fill="#b45309" />
          {/* Goat Face & Ears */}
          <rect x="10" y="8" width="12" height="11" fill="#fef3c7" />
          <rect x="6" y="9" width="4" height="3" fill="#fef3c7" /> {/* Droopy Ear */}
          <rect x="22" y="9" width="4" height="3" fill="#fef3c7" />
          {/* Eyes (Calm & Serene) */}
          {isBlinking ? (
            <>
              <rect x="11" y="12" width="3" height="1" fill="#78350f" />
              <rect x="18" y="12" width="3" height="1" fill="#78350f" />
            </>
          ) : (
            <>
              <rect x="11" y="11" width="3" height="2" fill="#78350f" />
              <rect x="18" y="11" width="3" height="2" fill="#78350f" />
            </>
          )}
          {/* Little Beard */}
          <rect x="14" y="18" width="4" height="3" fill="#fef3c7" />
          {/* Embroidered Poncho */}
          <rect x="8" y="19" width="16" height="8" fill="#991b1b" />
          <rect x="10" y="21" width="12" height="2" fill="#f59e0b" /> {/* Geometric Embroidery */}
          <rect x="12" y="24" width="8" height="2" fill="#15803d" />
          {/* Shepherd Staff */}
          <rect x="5" y="8" width="2" height="20" fill="#78350f" />
          <rect x="5" y="6" width="4" height="2" fill="#78350f" />
        </g>
      );

    // 9. ROWAN THE HEDGEHOG BUILDER
    case 'rowan':
      return (
        <g>
          {/* Chestnut Spines / Quills */}
          <rect x="6" y="5" width="20" height="14" fill="#78350f" />
          <rect x="4" y="7" width="2" height="10" fill="#451a03" />
          <rect x="26" y="7" width="2" height="10" fill="#451a03" />
          <rect x="7" y="3" width="18" height="2" fill="#451a03" />
          {/* Snout & Face */}
          <rect x="10" y="10" width="12" height="8" fill="#fed7aa" />
          <rect x="15" y="14" width="2" height="2" fill="#1c1917" /> {/* Black Nose */}
          {/* Eyes */}
          {isBlinking ? (
            <>
              <rect x="11" y="12" width="3" height="1" fill="#1c1917" />
              <rect x="18" y="12" width="3" height="1" fill="#1c1917" />
            </>
          ) : (
            <>
              <rect x="11" y="11" width="2" height="2" fill="#1c1917" />
              <rect x="18" y="11" width="2" height="2" fill="#1c1917" />
            </>
          )}
          {/* Craftsman Apron & Toolbelt */}
          <rect x="9" y="18" width="14" height="9" fill="#a16207" />
          <rect x="8" y="22" width="16" height="2" fill="#451a03" /> {/* Tool Belt */}
          {/* Little Brass Hammer */}
          <rect x="23" y="19" width="5" height="2" fill="#facc15" />
          <rect x="24" y="21" width="1" height="5" fill="#78350f" />
          {/* Boots */}
          <rect x="10" y="27" width="4" height="3" fill="#451a03" />
          <rect x="18" y="27" width="4" height="3" fill="#451a03" />
        </g>
      );

    default:
      return null;
  }
}
