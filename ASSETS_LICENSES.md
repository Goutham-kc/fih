# Asset & Intellectual Property Register: "Pixel Valley"

> **Compliance Authority:** Section 2.1 of `stardew-redesign-spec.md`  
> **Policy:** All assets, character names, dialogues, sprites, color palettes, and audio synthesizers are 100% original, open-source (OFL / MIT), or CC0 public domain. No proprietary game assets, sprites, or trademarks are used.

---

## 1. Character Cast & Names (100% Original)

| Character Name | Role | Species / Archetype | Status & Origin |
| :--- | :--- | :--- | :--- |
| **Pip** | Homestead Farmer | Human in straw hat & dungarees | Original character (Spec Section 6.1) |
| **Hoot** | Clock Tower Keeper | Round owl with brass bell | Original character (Spec Section 6.1) |
| **Marigold** | Notice Board Keeper | Rabbit in market apron with pencil | Original character (Spec Section 6.1) |
| **Bram** | Ledger Keeper | Badger in round spectacles & visor | Original character (Spec Section 6.1) |
| **Juniper** | Cinema Projectionist | Fox with cap and scarf | Original character (Spec Section 6.1) |
| **Moss** | Underground Archivist | Ancient turtle with lantern shell | Original character (Spec Section 6.1) |
| **Wren** | Messenger Pigeon | Blue-winged carrier pigeon | Original character (Spec Section 6.1) |
| **Clover** | Village Elder & Gardener | Cheerful goat elder with flower basket | Original character (Replaces placeholder Evelyn) |
| **Rowan** | Village Builder & Tinkerer | Hedgehog carpenter with leather belt | Original character (Replaces placeholder Robin) |

---

## 2. Typography

| Font Family | Usage | License | Origin |
| :--- | :--- | :--- | :--- |
| **Pixelify Sans** | Headings, chapter banners, HUD badges | SIL Open Font License (OFL 1.1) | Google Fonts / Stefie Justprince |
| **Press Start 2P** | Micro labels, coin indicators, retro badges | SIL Open Font License (OFL 1.1) | CodeMan38 / Google Fonts |
| **Plus Jakarta Sans** | Highly legible dense table body & financial digits | SIL Open Font License (OFL 1.1) | Tokotype / Google Fonts |
| **Instrument Serif** | Storybook chapter titles & editorial dialogue quotes | SIL Open Font License (OFL 1.1) | Rodrigo Fuenzalida / Google Fonts |

---

## 3. Audio & Sound Synthesis

| Sound Asset / Effect | Generator / File | License | Technical Mechanism |
| :--- | :--- | :--- | :--- |
| **Coin Clink** | `lib/soundEffects.js` (`coin`) | MIT / CC0 (Procedural) | Dual harmonic sine-wave oscillator ping synthesized via native Web Audio API. Zero external audio downloads. |
| **Harvest / Level Up** | `lib/soundEffects.js` (`harvest`) | MIT / CC0 (Procedural) | 4-note ascending major arpeggio ($C_5 \rightarrow E_5 \rightarrow G_5 \rightarrow C_6$) triangle waves synthesized via native Web Audio API. |
| **Wood Plank Tap** | `lib/soundEffects.js` (`wood`) | MIT / CC0 (Procedural) | Short exponential decay sine wave at 240Hz $\rightarrow$ 90Hz simulating wooden block impact. |
| **Paper Rustle** | `lib/soundEffects.js` (`paper`) | MIT / CC0 (Procedural) | Filtered triangle-wave frequency sweep. |
| **Fairy Sparkle** | `lib/soundEffects.js` (`sparkle`) | MIT / CC0 (Procedural) | High-register multi-oscillator shimmer arpeggio ($880\text{Hz} \rightarrow 1760\text{Hz}$). |

---

## 4. Visual Assets & Sprites

| Asset | Format | License | Origin |
| :--- | :--- | :--- | :--- |
| **WoodPanel Frame** | Pure CSS 9-slice / Box-Shadow | MIT | Handcrafted procedural CSS |
| **Pixel Icons** | SVG vectors | MIT | Lucide Icons |
| **Atmospheric Leaves** | HTML5 Canvas 2D | MIT | Procedural math particle generator |
| **Dialogue Speech Bubble** | CSS Vector Border Frame | MIT | Handcrafted procedural CSS |
