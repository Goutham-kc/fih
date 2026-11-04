import { CHARACTERS } from '@/lib/pixelValleyTheme';
import { VILLAGE_DIALOGUE } from '@/content/dialogue';
import SpeechBubble from '@/components/ui/SpeechBubble';

export default function TabStoryBanner({ activeTab, envMode }) {
  const storyData = VILLAGE_DIALOGUE[activeTab] || VILLAGE_DIALOGUE.todos;
  const character = CHARACTERS[storyData.character] || CHARACTERS.pip;

  // Purely derived contextual greeting based on time of day
  const hour = typeof window !== 'undefined' ? new Date().getHours() : 12;
  let greeting = storyData.day || storyData.tales[0];
  if (hour >= 5 && hour < 11) greeting = storyData.morning || greeting;
  else if (hour >= 17 && hour < 20) greeting = storyData.evening || greeting;
  else if (hour >= 20 || hour < 5) greeting = storyData.night || greeting;

  // Combine contextual greeting with the tales array
  const allTales = [greeting, ...storyData.tales.filter((t) => t !== greeting)];

  return (
    <div className="pixel-chapter-banner">
      <SpeechBubble
        character={character}
        tales={allTales}
      />
    </div>
  );
}
