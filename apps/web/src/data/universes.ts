export interface UniverseCategory {
  id: string;
  name: string;
  summary: string;
  body: string[];
  highlights?: string[];
}

export interface UniverseSummary {
  id: string;
  name: string;
  tagline: string;
  description: string;
  callToAction: string;
  categories: UniverseCategory[];
}

export const universes: UniverseSummary[] = [
  {
    id: "aurora-axis",
    name: "Aurora Axis",
    tagline: "A coalition charting luminous anomalies across the Orion Gulf.",
    description:
      "The Aurora Axis unites explorers, mathematicians, and archivists aboard a migratory station that follows the galaxy's brightest storms. Their charter is to catalogue civilizations shaped by stellar phenomena before the light fades.",
    callToAction: "Chart new observation lanes and decode spectral cultures.",
    categories: [
      {
        id: "factions",
        name: "Factions",
        summary:
          "Competing research guilds negotiate observation rights and steer the Axis' course through the nebular trade routes.",
        body: [
          "The Prism Assembly governs expedition protocol, balancing risk and discovery with a charter ratified by every guild aboard the station.",
          "The Lumen Syndicate handles diplomatic contact with light-born civilizations, often clashing with the rigorous containment policies enforced by the Radiant Wardens.",
          "Cartographers in the Vector Chorus maintain the lattice of jump corridors surrounding the Aurora Axis, ensuring the flotilla can escape when storms destabilize space-time.",
        ],
      },
      {
        id: "characters",
        name: "Characters",
        summary:
          "Scientists, poets, and navigators who left planetary life to chase the galaxy's brightest phenomena.",
        body: [
          "Admiral Selene Kor orchestrates the Axis' migratory cycle, wielding a crystalline astrolabe able to predict supernova harmonics days in advance.",
          "Archivist Juno Calder collects fragments of light-encoded languages and renders them into immersive choruses used to brief new diplomats.",
          "Navigator Ilian Voss interfaces directly with the station's living drive, a sentient photonic bloom that sings warnings through Ilian's nervous system.",
        ],
      },
      {
        id: "phenomena",
        name: "Phenomena",
        summary:
          "Cosmic events that sculpt entire cultures around rhythm, refraction, and gravitational resonance.",
        body: [
          "The Whispering Halo appears once each decade, drawing in luminescent leviathans whose migration patterns guide pilgrim flotillas to shelter worlds.",
          "Prismfall tides fracture light into physical petals that fall across inhabited moons, granting temporary clairvoyance to anyone they touch.",
          "Echo Wells form where collapsed stars rebound, creating whispering corridors that broadcast the memories of lost travelers.",
        ],
      },
    ],
  },
  {
    id: "mythic-tides",
    name: "Mythic Tides",
    tagline: "Oceanic civilizations rebuilding history after a moonfall.",
    description:
      "Mythic Tides spans archipelagos forged when an artificial moon shattered into thousands of islands. Oral historians sail memory-ships that weave new constellations each season to keep stories aligned across the floodbound cultures.",
    callToAction: "Rediscover drowned archives and broker peace between tidebound nations.",
    categories: [
      {
        id: "cultures",
        name: "Cultures",
        summary:
          "Island federations sustain their mythologies through seasonal regattas and storm-binding ceremonies.",
        body: [
          "The Coral Accord trades bioluminescent charts that only reveal safe passages when sung in perfect harmony.",
          "Stormcallers of the Tempest Choir tame cyclones by synchronizing their breathing with pressure fronts amplified through basalt amphitheaters.",
          "The Verdant Ledger keeps the only surviving index of pre-moonfall literature, etched into living mangrove roots that rearrange when tides shift.",
        ],
      },
      {
        id: "heroes",
        name: "Heroes",
        summary:
          "Navigators and chroniclers who shape the political tides as readily as they calm the seas.",
        body: [
          "Captain Maris Kaito commands the mnemonic flagship *Rhymer's Wake*, storing communal memories within crystallized spray suspended above the deck.",
          "Archivist Tamsin Noor dives into trench libraries guarded by sentient currents, trading childhood memories for safe passage.",
          "Oracle twins Eira and Elio interpret tidal seismographs, translating quakes into diplomatic directives for rival city-reefs.",
        ],
      },
      {
        id: "relics",
        name: "Relics",
        summary:
          "Artifacts unearthed from the seabed that redraw alliances whenever they surface.",
        body: [
          "The Tidal Crown amplifies acoustic rituals, allowing a single singer to harmonize entire fleets across stormfronts.",
          "Moonshard Lenses refract moonlight into tidal projections that reveal hidden reefs and dormant leviathans.",
          "Whispered Keels carry encoded treaties along currents, unfolding only when rival crews collaborate to assemble the hull.",
        ],
      },
    ],
  },
  {
    id: "quantum-veil",
    name: "Quantum Veil",
    tagline: "A borderland where reality flickers between parallel civic experiments.",
    description:
      "The Quantum Veil is a lattice of interwoven cities, each phasing in and out of resonance with their neighbors. Administrators known as Weavers maintain the synchronization towers that keep citizens aligned to the correct timeline.",
    callToAction: "Stabilize fading districts and map the political physics governing the Veil.",
    categories: [
      {
        id: "districts",
        name: "Districts",
        summary:
          "Each district prioritizes a different social experiment, from collective dreaming to algorithmic governance.",
        body: [
          "The Aurora Commons share lucid dreams nightly, coordinating urban planning through community-authored visions.",
          "Cipher Spire delegates policy decisions to predictive engines that audit themselves through citizen juries every lunar cycle.",
          "The Refraction Gardens cultivate quantum flora capable of storing alternate municipal histories in their petals.",
        ],
      },
      {
        id: "weavers",
        name: "Weavers",
        summary:
          "Temporal engineers who stitch districts back together when chronologies drift out of phase.",
        body: [
          "Chief Weaver Nyx Arden calibrates synchronization towers using a personal archive of timelines experienced and lost.",
          "Sage-programmer Orion Hale moderates disputes by simulating compromise scenarios across hundreds of micro-realities before selecting one to anchor.",
          "Liaison Ava Serrin mentors citizens adjusting to a new timeline, ensuring they retain critical relationships despite shifting personal histories.",
        ],
      },
      {
        id: "anomalies",
        name: "Anomalies",
        summary:
          "Instabilities that threaten to collapse overlapping realities into a single authoritarian outcome.",
        body: [
          "Phase storms sweep through transit corridors, freezing commuters between seconds until a Weaver rethreads the route.",
          "Consensus Echoes manifest when too many districts align on a single policy, erasing minority cultures unless resistance movements intervene.",
          "Entropy Bloom outbreaks seed fractal neighborhoods that replicate unchecked, consuming resources from neighboring timelines.",
        ],
      },
    ],
  },
];

export const getUniverseById = (id: string): UniverseSummary | undefined =>
  universes.find((universe) => universe.id === id);

export const getCategoryById = (
  universeId: string,
  categoryId: string
): UniverseCategory | undefined => {
  const universe = getUniverseById(universeId);
  return universe?.categories.find((category) => category.id === categoryId);
};
