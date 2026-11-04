import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, BookOpen, ChevronRight } from 'lucide-react';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

export default function SpeechBubble({
  character, // { id, name, role, chapter, themeColor }
  tales = [],
  contextText = null,
  onNextTale = null,
}) {
  const [taleIndex, setTaleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => soundManager.isMuted());
  const [spriteState, setSpriteState] = useState('idle');

  const fullText = contextText || tales[taleIndex] || tales[0] || '';
  const timerRef = useRef(null);

  // Subscribe to external sound toggle events
  useEffect(() => {
    const unsub = eventBus.on(EVENTS.SOUND_TOGGLED, ({ muted }) => {
      setSoundMuted(muted);
    });
    return () => unsub();
  }, []);

  // Asynchronous typewriter effect whenever fullText changes
  useEffect(() => {
    if (!fullText) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      (localStorage.getItem('pv_reduced_motion') === 'true' ||
       window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    let charIdx = 0;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (prefersReducedMotion) {
        setDisplayedText(fullText);
        setIsTyping(false);
        setSpriteState('idle');
        clearInterval(timerRef.current);
        return;
      }

      charIdx++;
      if (charIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIdx));
        setIsTyping(true);
        setSpriteState('talk');
        if (charIdx % 2 === 0) {
          soundManager.playDialogueBlip(character?.id || 'pip');
        }
      } else {
        clearInterval(timerRef.current);
        setIsTyping(false);
        setSpriteState('idle');
      }
    }, 24);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [fullText, character?.id]);

  const handleSkipOrNext = () => {
    if (isTyping) {
      // Instant reveal
      clearInterval(timerRef.current);
      setDisplayedText(fullText);
      setIsTyping(false);
      setSpriteState('idle');
      soundManager.playSfx('paper');
    } else if (tales.length > 1) {
      soundManager.playSfx('paper');
      const nextIdx = (taleIndex + 1) % tales.length;
      setTaleIndex(nextIdx);
      if (onNextTale) onNextTale(nextIdx);
    }
  };

  const handleSoundToggle = (e) => {
    e.stopPropagation();
    const next = soundManager.toggleMute();
    setSoundMuted(next);
  };

  if (!character) return null;

  return (
    <div
      className="pixel-speech-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 16,
        alignItems: 'center',
        background: 'linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%)',
        border: '3px solid #7b4a28',
        borderRadius: 14,
        padding: '12px 18px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 2px 0 rgba(201, 143, 85, 0.3)',
        marginBottom: 20,
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={handleSkipOrNext}
      title={isTyping ? 'Click to show entire story' : 'Click to hear next tale'}
    >
      {/* Corner Studs */}
      <span style={{ position: 'absolute', top: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', bottom: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', bottom: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />

      {/* Character Portrait Box with Procedural Pixel Sprite */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 76,
          height: 84,
          borderRadius: 10,
          background: 'linear-gradient(180deg, #3d2315 0%, #24140b 100%)',
          border: '2px solid #a36c3a',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.5)',
          flexShrink: 0,
          userSelect: 'none',
          padding: 4,
        }}
      >
        <CharacterSprite
          characterId={character.id}
          state={spriteState}
          size={52}
          interactive={false}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#fde047',
            letterSpacing: '0.04em',
            marginTop: 2,
            fontFamily: 'var(--font-pixel, monospace)',
          }}
        >
          {character.name}
        </span>
      </div>

      {/* Speech Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: character.themeColor || '#f2c230' }}>
              {character.name}
            </span>
            <span style={{ fontSize: 11, color: '#a38d7b' }}>
              • {character.role}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
            {tales.length > 1 && (
              <button
                type="button"
                onClick={handleSkipOrNext}
                className="pixel-btn secondary"
                style={{ fontSize: 10, padding: '3px 8px', minHeight: 24, cursor: 'pointer' }}
              >
                <BookOpen size={11} />
                <span>Next Lore ({taleIndex + 1}/{tales.length})</span>
                <ChevronRight size={11} />
              </button>
            )}

            <button
              type="button"
              onClick={handleSoundToggle}
              title={soundMuted ? 'Sound Muted (Click to Unmute)' : 'Sound Active (Click to Mute)'}
              style={{
                background: 'transparent',
                border: 'none',
                color: soundMuted ? '#c2415a' : '#8fc45a',
                cursor: 'pointer',
                padding: 4,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Narrative Prose */}
        <p
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: 'clamp(13px, 1.05vw, 14.5px)',
            lineHeight: 1.55,
            color: '#fdf6e2',
            fontStyle: 'italic',
            letterSpacing: '0.01em',
            minHeight: '2.5em',
          }}
        >
          “{displayedText}”
          {isTyping && (
            <span
              className="pixel-caret"
              style={{
                display: 'inline-block',
                width: 6,
                height: 12,
                background: '#f2c230',
                marginLeft: 4,
                verticalAlign: 'middle',
              }}
            />
          )}
        </p>
      </div>
    </div>
  );
}
