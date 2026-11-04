import React, { useState, useEffect } from 'react';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';

export default function RPGDialogueBox({
  character = 'bram',
  name = 'Bram the Factor',
  chapterName = 'Chapter 2: The Ledger Hut',
  text = '“Clear accounts make steadfast friends,” as we say in the valley. Settle your tabs before the autumn fair, and your pouch will always jingle with prosperity.',
  onNext,
  className = '',
  style = {},
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    const initTimer = setTimeout(() => {
      setDisplayedText('');
      setIsTyping(true);
    }, 0);

    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        if (index % 3 === 0) {
          soundManager.playDialogueBlip(character);
        }
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 28);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [text, character]);

  const handleClick = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`rpg-dialogue-box ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        background: '#2b1a11',
        border: '4px solid #1a0f08',
        outline: '2px solid #7b4a28',
        boxShadow: 'inset 3px 3px 0 #a36c3a, inset -3px -3px 0 #120b06, 0 6px 20px rgba(0,0,0,0.6)',
        borderRadius: 0,
        cursor: 'pointer',
        position: 'relative',
        ...style,
      }}
      title="Click to skip or proceed dialogue"
    >
      {/* 16-bit Character Portrait Frame */}
      <div
        style={{
          width: 54,
          height: 60,
          background: '#1a0f08',
          border: '2px solid #452817',
          boxShadow: 'inset 2px 2px 0 #0c0704, inset -2px -2px 0 #784323',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <CharacterSprite character={character} state={isTyping ? 'talk' : 'idle'} size={44} />
      </div>

      {/* Text Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel-display)',
              fontSize: 11,
              color: '#facc15',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-pixel-body)',
              fontSize: 12,
              color: '#a38d7b',
            }}
          >
            {chapterName}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: '#fdf6e2',
            fontFamily: 'var(--font-pixel-body)',
            wordBreak: 'break-word',
          }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse" style={{ color: '#facc15' }}>▋</span>}
        </p>
      </div>

      {/* Blinking Next Arrow */}
      {!isTyping && (
        <div
          style={{
            color: '#facc15',
            fontSize: 12,
            fontFamily: 'var(--font-pixel-display)',
            animation: 'bounce 0.8s infinite',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          ▼
        </div>
      )}
    </div>
  );
}
