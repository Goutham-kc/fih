import { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, BookOpen, ChevronRight } from 'lucide-react';
import { playSound, isSoundEnabled, toggleSound } from '@/lib/soundEffects';

const STORIES = {
  todos: {
    chapter: 'Chapter I',
    title: 'The Morning Rooster & Farmstead Chores',
    speaker: 'Farmer Goutham',
    role: 'Valley Homestead Owner',
    avatar: '👨‍🌾',
    themeColor: '#10b981',
    propsType: 'crops',
    tales: [
      'The morning rooster crows across Pelican Town. Mist rises off the pond as a fresh autumn breeze stirs the maple trees. Grab your watering can and iron hoe—every chore finished today brings you closer to a bountiful harvest!',
      'Grandpa always said: "A homestead thrives not on grand declarations, but on the quiet rhythm of daily chores." Tend to the fences, inspect the coop, and cross off today’s quests before twilight sets in.',
      'The soil is rich and the valley air is brisk. When the sun dips behind the western mountains, you will look back on today’s rows with pride. One task at a time, Farmer.'
    ],
  },
  reminders: {
    chapter: 'Chapter II',
    title: 'The Pelican Town Mailbox & Carrier Pigeons',
    speaker: 'Pelican Town Post',
    role: 'Morning Postal Dispatch',
    avatar: '📬',
    themeColor: '#3b82f6',
    propsType: 'letter',
    tales: [
      'Clack! The rusty metal flap on your farmhouse mailbox swings open. Inside lies folded parchment tied with hemp twine—letters from friends in town, medicine alerts, and scheduled dispatches awaiting your eye.',
      'Carrier pigeons circle above the barn cupola before dropping letters into the box. In Stardew Valley, a forgotten promise is a lost friendship—heed your dispatches and keep your word.',
      'The morning train just blew its steam whistle down the mountain line. Sealed notes and reminders have been sorted into your box. What requires your attention before midday?'
    ],
  },
  debts: {
    chapter: 'Chapter III',
    title: 'Pierre’s General Store Ledger & Golden Favors',
    speaker: 'Pierre',
    role: 'General Store Merchant',
    avatar: '⚖️',
    themeColor: '#f59e0b',
    propsType: 'scales',
    tales: [
      'Step into the pine-scented warmth of Pierre’s General Store. Upon the polished oak counter rests the brass balance scale and the village ledger. Every seed loan, tavern round, and neighborly favor is marked down to the last gold coin.',
      '"Good credit makes good neighbors!" Pierre taps his quill on the counter. Keep your accounts balanced, settle your tabs before the festival, and your pouch will always jingle with prosperity.',
      'Gold coins shine in the warm tavern lantern light. A clear conscience and an honest ledger ensure you will never hesitate to look any villager in the eye.'
    ],
  },
  deadlines: {
    chapter: 'Chapter IV',
    title: 'The Town Square Bulletin Board & Notice Clock',
    speaker: 'Mayor Lewis',
    role: 'Pelican Town Mayor',
    avatar: '📜',
    themeColor: '#f43f5e',
    propsType: 'board',
    tales: [
      'Outside Pierre’s store, beside the fountain, stands the weathered wooden bulletin board. Villagers tack urgent requests and academic submissions with brass pins. The sands of time trickle swiftly—keep watch on the countdown!',
      '"Attention residents!" Lewis adjusts his spectacles. "A major deadline approaches. Procrastination is the thief of good crops. Deliver your submissions before the town clock strikes!"',
      'The autumn wind flutters the parchment notices pinned to the corkboard. Check the hours remaining, prepare your tools, and see each commitment through to delivery.'
    ],
  },
  dates: {
    chapter: 'Chapter V',
    title: 'The Valley Almanac & Seasonal Festivals',
    speaker: 'Evelyn',
    role: 'Town Elder & Gardener',
    avatar: '🌸',
    themeColor: '#ec4899',
    propsType: 'calendar',
    tales: [
      'The valley calendar hangs by the hearth, adorned with pressed flowers and festive ribbons. From the Stardew Valley Fair to the Dance of the Moonlight Jellies, every milestone and birthday brings the village together.',
      'Dearie, life on the farm passes like a flowing stream. Do not forget the birthdays of those who care for you, nor the festivals where laughter fills the square!',
      'When the leaves turn crimson and the festival lanterns are strung between the lampposts, remember to stop working for an afternoon and celebrate with those you cherish.'
    ],
  },
  watchlist: {
    chapter: 'Chapter VI',
    title: 'Gunther’s Library & The Saloon Hearthfire',
    speaker: 'Gunther',
    role: 'Museum & Library Curator',
    avatar: '📚',
    themeColor: '#8b5cf6',
    propsType: 'books',
    tales: [
      'When dusk settles and crickets hum in the tall grass, head over to the Stardrop Saloon hearth or the quiet wooden reading desks of Gunther’s Library. Forgotten manuscripts, cinematic reels, and hearthside stories await.',
      'A true adventurer feeds both the sword and the imagination! The archives hold tales of ancient dwarves, galactic expeditions, and timeless plays. Pull up a chair beside the glowing woodstove.',
      'Rain patters softly against the library glass. A warm mug of tea, a cozy wool blanket, and a grand story to get lost in until the midnight bell rings.'
    ],
  },
  audit: {
    chapter: 'Chapter VII',
    title: 'The Junimo Annals & Sacred Forest Chronicle',
    speaker: 'Junimo',
    role: 'Forest Spirit of the Valley',
    avatar: '✨',
    themeColor: '#10b981',
    propsType: 'junimo',
    tales: [
      'Hut-hut! In the hidden corners of the Community Center, the apple-shaped Junimos dance among ancient stone plaques. Every crop harvested, letter sealed, and coin repaid is inscribed into the valley’s living history.',
      'The spirits see all! Nothing you have achieved is forgotten. Look back upon your ledger and marvel at how far your homestead has blossomed since the day you arrived on the bus.',
      'Golden stars twinkle above the mountain lake. Every verified transaction and completed quest feeds the magical heart of the valley.'
    ],
  },
  settings: {
    chapter: 'Epilogue',
    title: 'The Farmstead Hearth & Workbench',
    speaker: 'Robin',
    role: 'Mountain Carpenter',
    avatar: '🪵',
    themeColor: '#d97706',
    propsType: 'hearth',
    tales: [
      'Welcome to the warmth of your log cabin. The cast-iron woodstove radiates steady heat as you inspect your tools, adjust your carrier pigeon frequencies, and tune your homestead preferences.',
      'A good carpenter keeps her tools sharp and her workspace orderly. Adjust your settings to suit your rhythm, Farmer!',
      'The evening logs crackle softly in the hearth. Everything is secured, the livestock are tucked into the barn, and your farm runs like clockwork.'
    ],
  },
};

export default function TabStoryBanner({ activeTab, envMode }) {
  const story = STORIES[activeTab] || STORIES.todos;
  const [taleIndex, setTaleIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [isAnimatingTale, setIsAnimatingTale] = useState(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setTaleIndex(0);
  }, [activeTab]);

  const handleNextTale = () => {
    playSound('paper');
    setIsAnimatingTale(true);
    setTimeout(() => {
      setTaleIndex((prev) => (prev + 1) % story.tales.length);
      setIsAnimatingTale(false);
    }, 150);
  };

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  return (
    <div
      className="stardew-story-card"
      style={{
        position: 'relative',
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        border: '2px solid rgba(196, 136, 63, 0.4)',
        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        background: 'linear-gradient(135deg, rgba(32, 21, 14, 0.95) 0%, rgba(19, 13, 9, 0.98) 100%)',
      }}
    >
      {/* Decorative Stardew Corner Rivets */}
      <div style={{ position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
      <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />

      {/* Top Banner Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(196, 136, 63, 0.25)',
          background: 'rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '3px 9px',
              borderRadius: 6,
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            {story.chapter}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fef3c7', letterSpacing: '-0.01em' }}>
            {story.title}
          </span>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? 'Cozy Valley Chimes Active' : 'Sound Muted'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: soundOn ? '#f59e0b' : '#9ca3af',
            padding: '4px 10px',
            borderRadius: 14,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{soundOn ? 'Chimes' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Dialogue Box Interior */}
      <div
        style={{
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 20,
          alignItems: 'center',
        }}
      >
        {/* Character Avatar Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 76,
            height: 84,
            borderRadius: 14,
            background: 'linear-gradient(180deg, #422616 0%, #29150b 100%)',
            border: '2px solid #c4883f',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0,0,0,0.4)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 34,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              animation: 'stardewFloat 3s ease-in-out infinite',
            }}
          >
            {story.avatar}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#fde68a',
              letterSpacing: '0.04em',
              marginTop: 2,
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            {story.speaker}
          </span>
        </div>

        {/* Narrative Dialogue Bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                {story.speaker}
              </span>
              <span style={{ fontSize: 11, color: '#a3a3a3' }}>
                • {story.role}
              </span>
            </div>

            {/* Cycle Tale Button */}
            <button
              onClick={handleNextTale}
              className="stardew-lore-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fef3c7',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <BookOpen size={12} style={{ color: '#f59e0b' }} />
              <span>Next Lore ({taleIndex + 1}/{story.tales.length})</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Tale Prose with smooth fade */}
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(13px, 1.1vw, 15px)',
              lineHeight: 1.6,
              color: '#f5f5f4',
              fontStyle: 'italic',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              opacity: isAnimatingTale ? 0.3 : 1,
              transform: isAnimatingTale ? 'translateY(3px)' : 'translateY(0)',
            }}
          >
            “{story.tales[taleIndex]}”
          </p>
        </div>
      </div>
    </div>
  );
}
