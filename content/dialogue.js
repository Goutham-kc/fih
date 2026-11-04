// Pixel Valley - Character Dialogue & Lore Tables
// Strictly original cast: Pip, Hoot, Marigold, Bram, Juniper, Moss, Clover, Rowan, Wren
// Spec Section 6: Contextual speech, time-of-day greetings, weather remarks, empty states

export const VILLAGE_DIALOGUE = {
  todos: {
    character: 'pip',
    chapterTitle: 'Chapter 1: The Farmstead (Daily Quests)',
    morning: 'The morning rooster has sounded! Grab your hoe and watering can—let us tackle today’s quests before the sun climbs high.',
    day: 'The sun is shining over the crops. Check off your chores one by one and watch the farmstead flourish!',
    evening: 'Dusk falls softly over the crops. Review what was harvested today and tuck the tools into the barn.',
    night: 'The farmhouse hearth is crackling. Rest well, farmer; tomorrow brings another sunrise.',
    empty: 'All daily chores are harvested! The porch notice board is clear and grandpa’s journal is up to date.',
    rain: 'A blessed rain showers the parsnips today! No need to carry heavy watering buckets.',
    snow: 'Frost glazes the greenhouse glass. Bundle up in your woolen jacket before heading out!',
    fireflies: 'Warm summer fireflies hover over the strawberry beds. A tranquil evening on the farm.',
    tales: [
      'The morning sun breaks over the farmstead meadow. A cool autumn breeze rustles the willow branches. Water the parsnips, mend the fences, and cross off today’s chores before dusk settles!',
      'Grandpa’s old journal had one simple rule: "Tend the soil daily, and the harvest will take care of itself." Let us see what tasks await on the porch notice board.',
      'The roosters are crowing across Pixel Valley. Every completed task plants a seed for tomorrow’s harvest. What will we achieve today?',
    ],
  },
  reminders: {
    character: 'hoot',
    chapterTitle: 'Chapter 2: The Bell Tower (Mailbox & Alerts)',
    morning: 'Hoo-hoo! The morning chime strikes clean. Let us organize your alerts so the day unfolds without surprises.',
    day: 'The brass clock gears tick with quiet precision. Keep your alerts set, and Pixel Valley will always move in harmony.',
    evening: 'The brass bells chime for vespers. Let us see which promised hours remain before nightfall.',
    night: 'The owl watches from the bell tower spire while the village sleeps. Your alerts are in good talons.',
    empty: 'The tower bells are silent and tranquil. No pending alerts in the breeze.',
    rain: 'Mist clings to the belfry stones. Keep your letters dry beneath the copper eaves.',
    snow: 'Soft snow blankets the clock gears, but our escapement ticks as true as ever.',
    fireflies: 'Tiny sparks of light drift past the clock face. The summer night is peaceful.',
    tales: [
      'Hoo-hoo! The village bell tower stands tall against the clouds. Each hanging bell marks a promised hour. When time arrives, the bronze bell rings true!',
      'Time flies swifter than a barn swallow, young farmer. Tie your reminders to the tower garland so no pledge slips into the fog.',
      'The brass clock gears tick with quiet precision. Keep your alerts set, and Pixel Valley will always move in harmony.',
    ],
  },
  deadlines: {
    character: 'marigold',
    chapterTitle: 'Chapter 3: The Notice Board (Town Deadlines)',
    morning: 'Good morning! The town board has fresh notices pinned with bright festival ribbons. What due dates are ripening?',
    day: 'A punctual harvest is the pride of Pixel Valley! Deliver your projects and exam prep before the final bell.',
    evening: 'The sun sets behind the hills. Double check any deadlines due by nightfall!',
    night: 'Lanterns illuminate the town board. Peaceful hours to plan tomorrow’s deliveries.',
    empty: 'The notice board is clear! No looming deadlines on the horizon—take a breath and enjoy the fair.',
    rain: 'A cozy rainy day for studying or working through your deadlines with a cup of warm tea.',
    snow: 'Winter winds blow through the plaza, but your deadlines stay well organized and on time!',
    fireflies: 'Summer twilight turns the town square magical. Check off your goals under the fairy lanterns.',
    tales: [
      'Welcome to the Village Notice Board! Every deadline is a crop in the countdown field. Keep watch as the dates ripen—never let the crows catch you unprepared!',
      'A punctual harvest is the pride of Pixel Valley! Deliver your projects and exam prep before the final season bell rings.',
      'The sands of time trickle steadily down the glass. Review your upcoming dates, plan your week, and harvest success with confidence!',
    ],
  },
  debts: {
    character: 'bram',
    chapterTitle: 'Chapter 4: The Ledger Hut (Gold Ledger)',
    morning: 'The ledger is opened and the balance scales polished. Let us keep our gold honest and accounts clear.',
    day: '"Clear accounts make steadfast friends," as we say in the valley. Settle your tabs before the fair!',
    evening: 'Evening ledger tally time. A balanced ledger brings the soundest sleep in the valley.',
    night: 'The brass scales rest in the firelight. Every coin borrowed and lent is faithfully recorded.',
    empty: 'The ledger is completely clean! Zero outstanding debts—Bram gives an appreciative nod of financial peace.',
    rain: 'Listen to the rain drumming on the cedar shingles. A perfect hour to review your savings and debts.',
    snow: 'Winter supplies require careful budgeting. Keep your gold balanced and your hearth well-stocked.',
    fireflies: 'Warm summer breeze gently blows the ledger pages. An honest count makes for an easy heart.',
    tales: [
      'Step inside the oak trading post! The brass balance scales never lie. Every seed loan, neighborly favor, and gold coin is recorded in honest ink.',
      '"Clear accounts make steadfast friends," as we say in the valley. Settle your tabs before the autumn fair, and your pouch will always jingle with prosperity.',
      'Gold coins glimmer warmly in the lantern light. An honest ledger and a tranquil heart—the finest wealth any farmer can possess.',
    ],
  },
  dates: {
    character: 'clover',
    chapterTitle: 'Chapter 5: The Festival Grounds (Milestones)',
    morning: 'A bright morning for the village calendar! Which dear neighbor or milestone are we honoring next?',
    day: 'Flowers may wither in winter, but the warmth of remembered birthdays blooms forever. Mark milestones with joy!',
    evening: 'Evening bunting catches the golden hour light. May our valley memories grow sweeter each year.',
    night: 'Starlight twinkles over the festival ribbon arches. Happy memories never fade in Pixel Valley.',
    empty: 'The seasonal festival garland is prepared. Add birthdays and milestones to celebrate together!',
    rain: 'The raindrops glisten like beads on the festival ribbon garland. Every season brings its own beauty.',
    snow: 'Snowflakes fall softly upon the solstice square. Hot cider and warm hearts keep the winter cheerful.',
    fireflies: 'Summer festival night! Fireflies illuminate the ribbon trees while music floats over the meadow.',
    tales: [
      'Dearie, look at our village festival calendar! From the Starlight Solstice to annual birthdays, every celebration draws our valley family closer together.',
      'Flowers may wither in winter, but the warmth of remembered birthdays blooms forever. Mark every milestone with joy!',
      'The festival bunting flutters merrily in the wind. Never let a dear friend’s celebration pass without a handwritten card.',
    ],
  },
  watchlist: {
    character: 'juniper',
    chapterTitle: 'Chapter 6: The Moonlight Cinema (Watchlist)',
    morning: 'The cinema screen catches the dawn light. Grab a ticket stub and queue up tonight’s film reels!',
    day: 'Popcorn is popping by the projector desk! Pull up a log bench and let your imagination wander.',
    evening: 'Dusk has arrived—the projector lamp is warming up! The scent of roasted kettle corn fills the air.',
    night: 'Stars above, reels whirring below! Grab a log bench, fireflies are dancing in the projector beam.',
    empty: 'The projector spool is waiting for fresh reels! Hand Juniper a ticket to queue up your next movie or book.',
    rain: 'Under the canvas awning, the projector glows even warmer as rain patters on the forest canopy.',
    snow: 'Winter movie night! Wrap yourself in a heavy woolen quilt while the cinema projector rolls.',
    fireflies: 'Moths and fireflies flutter across the white cinema sheet. The projector whirrs softly.',
    tales: [
      'Welcome to the open-air cinema under the stars! The projector beam cuts through the evening mist as fireflies dance across the screen. What story shall we watch tonight?',
      'Popcorn is popping by the projector desk! Whether it is a grand fantasy chronicle or a cozy mystery reel, pull up a log bench and enjoy.',
      'The projector whirrs softly into the night. Stories let our imaginations wander far beyond the mountain ridge. Pick a ticket and settle in!',
    ],
  },
  audit: {
    character: 'moss',
    chapterTitle: 'Chapter 7: The Archive Cellar (The Chronicle)',
    morning: 'The cellar lantern is trimmed. The chronicle preserves every step taken in Pixel Valley.',
    day: 'Every verified transaction, dispatched reminder, and completed chore rests safely upon these cedar shelves.',
    evening: 'The shadows lengthen across the archives. Another day of deeds inscribed in indelible oak ink.',
    night: 'Underground, the quiet is timeless. The scrolls keep their silent vigil over all past events.',
    empty: 'The chronicle folio is pristine and awaiting its first inscribed historical act.',
    rain: 'Far beneath the earth, the gentle seepage nourishes the cellar moss. History rests undisturbed.',
    snow: 'The cellar remains warm and dry beneath the frozen soil. The records are safe for generations.',
    fireflies: 'Lantern light flickers against the cobblestone walls. Look back upon your journey, traveler.',
    tales: [
      'Step softly down the stone steps. In this ancient cellar, the records of Pixel Valley are inscribed into eternal volumes. History is never erased, only preserved.',
      'Every verified transaction, dispatched reminder, and completed chore rests safely upon these cedar shelves. The truth remains steadfast.',
      'Lantern light flickers against the cobblestone walls. Look back upon your journey, traveler, and see the steadfast ledger of your deeds.',
    ],
  },
  settings: {
    character: 'rowan',
    chapterTitle: 'The Toolshed Workbench',
    morning: 'Morning in the workshop! The coal stove is stoked and the chisels are sharp. Let us tune the homestead.',
    day: 'A master builder tunes her workshop to match her rhythm. Set your audio levels and visual controls.',
    evening: 'Putting away the files and calipers for dusk. Everything tuned to exact satisfaction.',
    night: 'Embers glow warmly in the forge. The workshop is quiet, calibrated, and ready.',
    empty: 'Tools are hung cleanly on the pegboard. Calibrate your audio levels and visual controls.',
    rain: 'Rain patters on the tin roof of the workshop—the most soothing sound for tinkering.',
    snow: 'Snow piles against the workshop door, but the woodstove keeps the craft bench thoroughly toasty.',
    fireflies: 'A cool summer draft flows through the workshop slats. All tools are oiled and ready.',
    tales: [
      'Welcome to the workbench! The woodstove is warm, the chisels are sharp, and the gears are well-oiled. Adjust your tools and valley preferences here.',
      'A master builder tunes her workshop to match her rhythm. Set your audio levels, test your sandbox environment, and make the homestead truly yours.',
      'The evening embers glow in the cast-iron stove. Everything is bolted down, calibrated, and ready for another fruitful day.',
    ],
  },
};

/**
 * Select the most fitting contextual dialogue for a character
 */
export function getContextualDialogue(tab, { timeOfDay = 'day', weather = 'clear', isEmpty = false } = {}) {
  const chapter = VILLAGE_DIALOGUE[tab] || VILLAGE_DIALOGUE.todos;

  if (isEmpty && chapter.empty) {
    return chapter.empty;
  }
  if (weather === 'rain' && chapter.rain) {
    return chapter.rain;
  }
  if (weather === 'snow' && chapter.snow) {
    return chapter.snow;
  }
  if (weather === 'fireflies' && chapter.fireflies) {
    return chapter.fireflies;
  }
  if (timeOfDay === 'morning' && chapter.morning) {
    return chapter.morning;
  }
  if (timeOfDay === 'evening' && chapter.evening) {
    return chapter.evening;
  }
  if (timeOfDay === 'night' && chapter.night) {
    return chapter.night;
  }

  // Fallback to random lore tale
  const tales = chapter.tales || [];
  return tales[0] || chapter.day || 'Welcome to Pixel Valley!';
}
