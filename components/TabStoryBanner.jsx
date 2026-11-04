import { useState, useEffect } from 'react';
import { CHARACTERS } from '@/lib/pixelValleyTheme';
import { VILLAGE_DIALOGUE } from '@/content/dialogue';
import SpeechBubble from '@/components/ui/SpeechBubble';

export default function TabStoryBanner({ activeTab, envMode }) {
  const storyData = VILLAGE_DIALOGUE[activeTab] || VILLAGE_DIALOGUE.todos;
  const character = CHARACTERS[storyData.character] || CHARACTERS.pip;

  return (
    <div className="pixel-chapter-banner">
      <SpeechBubble
        character={character}
        tales={storyData.tales}
      />
    </div>
  );
}
