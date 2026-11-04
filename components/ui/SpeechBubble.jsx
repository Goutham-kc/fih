import { useState, useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, ChevronRight } from 'lucide-react';
import { playSound, isSoundEnabled, toggleSound } from '@/lib/soundEffects';

export default function SpeechBubble({
  character, // { id, name, role, avatar, chapter, themeColor }
  tales = [],
  onNextTale,
}) {
  const [taleIndex, setTaleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(() => tales[0] || '');
  const [isTyping, setIsTyping] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const currentTale = tales[taleIndex] || tales[0] || '';

  const handleSkipOrNext = () => {
    if (isTyping) {
      // Instant reveal
      setDisplayedText(currentTale);
      setIsTyping(false);
      playSound('paper');
    } else if (tales.length > 1) {
      playSound('paper');
      const nextIdx = (taleIndex + 1) % tales.length;
      setTaleIndex(nextIdx);
      setDisplayedText(tales[nextIdx] || '');
      if (onNextTale) onNextTale(nextIdx);
    }
  };

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
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
        padding: '14px 18px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(201, 143, 85, 0.3)',
        marginBottom: 20,
        position: 'relative',
      }}
      onClick={handleSkipOrNext}
      title={isTyping ? 'Click to show full tale' : 'Click to hear next lore'}
    >
      {/* Corner Studs */}
      <span style={{ position: 'absolute', top: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', bottom: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
      <span style={{ position: 'absolute', bottom: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />

      {/* Character Portrait Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 80,
          borderRadius: 10,
          background: 'linear-gradient(180deg, #3d2315 0%, #24140b 100%)',
          border: '2px solid #a36c3a',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.5)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: 32,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
          }}
        >
          {character.avatar}
        </span>
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
            <span style={{ fontSize: 13, fontWeight: 700, color: character.themeColor || '#f2c230' }}>
              {character.name}
            </span>
            <span style={{ fontSize: 11, color: '#a38d7b' }}>
              • {character.role}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
            {tales.length > 1 && (
              <button
                onClick={handleSkipOrNext}
                className="pixel-btn secondary"
                style={{ fontSize: 10, padding: '3px 8px', minHeight: 26 }}
              >
                <BookOpen size={11} />
                <span>Next Lore ({taleIndex + 1}/{tales.length})</span>
                <ChevronRight size={11} />
              </button>
            )}

            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Sound On' : 'Sound Muted'}
              style={{
                background: 'transparent',
                border: 'none',
                color: soundOn ? '#f2c230' : '#8d8a86',
                cursor: 'pointer',
                padding: 4,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
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
          {isTyping && <span className="pixel-caret" style={{ display: 'inline-block', width: 6, height: 12, background: '#f2c230', marginLeft: 4 }} />}
        </p>
      </div>
    </div>
  );
}
