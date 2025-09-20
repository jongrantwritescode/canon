// Canon Universe Builder - Seed Data
// This creates a demo universe with worlds, characters, and cultures
//
// UNIVERSE DATING SYSTEM:
// - Year 0 = Universe creation (all worlds fully formed)
// - All dates are universe-consistent across all worlds
// - Characters have birthdate, deathDate, and lifeEvents timeline
// - This is a HISTORICAL database - all characters have death dates
// - Life events format: "Year: Event description | Year: Next event"

// Create demo universe
MERGE (u:Universe {id:'u_demo'}) 
SET u.name='Aetheria Prime', 
    u.description='A vast galaxy-spanning civilization with multiple intelligent species',
    u.createdAt=timestamp();

// Create categories
UNWIND ['Worlds','Characters','Cultures','Technologies'] AS cname
MERGE (c:Category {name:cname})
MERGE (u)-[:HAS_CATEGORY]->(c);

// Create worlds
MERGE (w1:World {id:'w_terra_nova'}) 
SET w1.name='Terra Nova', 
    w1.type='Terrestrial',
    w1.climate='Temperate',
    w1.atmosphere='Breathable',
    w1.gravity='1.2g',
    w1.x=450,
    w1.y=320,
    w1.flora='Dense forests of blue-leafed trees, floating kelp forests, crystalline flower fields',
    w1.fauna='Sky whales, crystal deer, bioluminescent fish, flying jellyfish',
    w1.markdown='# Terra Nova\n\nA lush, Earth-like world with vast oceans and dense forests. The planet is home to the Terran Federation, a democratic society that values exploration and scientific advancement.\n\n## Geography\n- **Continents**: 3 major landmasses\n- **Oceans**: 70% water coverage\n- **Climate**: Mild temperate zones\n\n## Resources\n- Rich mineral deposits\n- Abundant water\n- Fertile soil for agriculture';

MERGE (w2:World {id:'w_void_station'}) 
SET w2.name='Void Station Alpha', 
    w2.type='Space Station',
    w2.climate='Artificial',
    w2.atmosphere='Controlled',
    w2.gravity='0.8g',
    w2.x=500,
    w2.y=500,
    w2.flora='Hydroponic gardens, bio-engineered plants, artificial oxygen producers',
    w2.fauna='Maintenance drones, bio-engineered pets, station cats',
    w2.markdown='# Void Station Alpha\n\nA massive space station orbiting a neutron star, serving as a hub for interstellar trade and diplomacy. The station is home to representatives from dozens of species.\n\n## Architecture\n- **Size**: 50km diameter\n- **Population**: 2.5 million\n- **Purpose**: Trade hub and diplomatic center\n\n## Technology\n- Advanced life support systems\n- Artificial gravity generators\n- Quantum communication arrays';

// Link worlds to universe
MATCH (u:Universe {id:'u_demo'})
MATCH (c:Category {name:'Worlds'})
MERGE (c)-[:HAS_PAGE]->(w1);
MERGE (c)-[:HAS_PAGE]->(w2);

// Create characters
MERGE (ch1:Character {id:'ch_captain_reyes'}) 
SET ch1.name='Captain Elena Reyes', 
    ch1.species='Human',
    ch1.role='Starship Captain',
    ch1.homeworld='Terra Nova',
    ch1.birthdate=1247,
    ch1.deathDate=1305,
    ch1.lifeEvents='1247: Born on Terra Nova | 1265: Graduated Starfleet Academy | 1270: First command assignment | 1275: First Contact with Zephyrian Collective | 1280: Promoted to Captain | 1282: Current assignment on exploration vessel | 1305: Died in heroic sacrifice during the Battle of the Void',
    ch1.markdown='# Captain Elena Reyes\n\nA seasoned starship captain with 15 years of experience in deep space exploration. Known for her diplomatic skills and innovative problem-solving.\n\n## Background\n- **Born**: Terra Nova, Universe Year 1247\n- **Education**: Starfleet Academy\n- **Specialization**: First Contact protocols\n\n## Personality\n- Calm under pressure\n- Excellent communicator\n- Risk-taker when necessary';

MERGE (ch2:Character {id:'ch_zara_thorn'}) 
SET ch2.name='Zara Thorn', 
    ch2.species='Zephyrian',
    ch2.role='Diplomat',
    ch2.homeworld='Void Station Alpha',
    ch2.birthdate=1240,
    ch2.deathDate=1312,
    ch2.lifeEvents='1240: Born on Zephyr Prime | 1258: Completed telepathic training | 1260: Joined diplomatic corps | 1265: First interspecies negotiation | 1275: Assigned to Void Station Alpha | 1280: Promoted to Senior Diplomat | 1282: Current assignment as cultural liaison | 1312: Died peacefully in retirement on Zephyr Prime',
    ch2.markdown='# Zara Thorn\n\nA Zephyrian diplomat known for her ability to navigate complex interspecies negotiations. Her species communicates through bioluminescent patterns.\n\n## Background\n- **Born**: Zephyr Prime, Universe Year 1240\n- **Education**: Intergalactic Diplomatic Institute\n- **Specialization**: Conflict resolution\n\n## Abilities\n- Bioluminescent communication\n- Empathic sensing\n- Multilingual (12 languages)';

// Link characters to universe
MATCH (u:Universe {id:'u_demo'})
MATCH (c:Category {name:'Characters'})
MERGE (c)-[:HAS_PAGE]->(ch1);
MERGE (c)-[:HAS_PAGE]->(ch2);

// Create cultures
MERGE (cu1:Culture {id:'cu_terran_federation'}) 
SET cu1.name='Terran Federation', 
    cu1.species='Human',
    cu1.government='Democratic Republic',
    cu1.technologyLevel='Advanced',
    cu1.markdown='# Terran Federation\n\nA democratic society that emerged from Earth expansion into space. The Federation values individual freedom, scientific progress, and peaceful exploration.\n\n## Values\n- **Individual Rights**: Personal freedom and expression\n- **Scientific Advancement**: Continuous research and innovation\n- **Peaceful Exploration**: Non-aggressive expansion\n\n## Government\n- **Structure**: Representative democracy\n- **Capital**: Terra Nova\n- **Military**: Defensive forces only';

MERGE (cu2:Culture {id:'cu_zephyrian_collective'}) 
SET cu2.name='Zephyrian Collective', 
    cu2.species='Zephyrian',
    cu2.government='Consensus-based',
    cu2.technologyLevel='Highly Advanced',
    cu2.markdown='# Zephyrian Collective\n\nA telepathic species that operates through consensus decision-making. Their society is built around harmony and collective wisdom.\n\n## Values\n- **Harmony**: Balance between all members\n- **Wisdom**: Collective knowledge and experience\n- **Connection**: Deep telepathic bonds\n\n## Society\n- **Structure**: Consensus-based governance\n- **Communication**: Telepathic networks\n- **Technology**: Bio-integrated systems';

// Link cultures to universe
MATCH (u:Universe {id:'u_demo'})
MATCH (c:Category {name:'Cultures'})
MERGE (c)-[:HAS_PAGE]->(cu1);
MERGE (c)-[:HAS_PAGE]->(cu2);

// Create technologies
MERGE (t1:Technology {id:'t_ftl_drive'}) 
SET t1.name='Quantum FTL Drive', 
    t1.type='Propulsion',
    t1.level='Revolutionary',
    t1.markdown='# Quantum FTL Drive\n\nA revolutionary faster-than-light propulsion system that manipulates quantum fields to create warp bubbles around spacecraft.\n\n## Principles\n- **Quantum Field Manipulation**: Creates localized spacetime distortions\n- **Warp Bubble**: Protects ship from relativistic effects\n- **Speed**: Up to 1000x light speed\n\n## Limitations\n- Requires massive energy input\n- Cannot operate near gravity wells\n- Limited by quantum field stability';

MERGE (t2:Technology {id:'t_neural_link'}) 
SET t2.name='Neural Link Interface', 
    t2.type='Communication',
    t2.level='Advanced',
    t2.markdown='# Neural Link Interface\n\nA bio-integrated communication system that allows direct neural connection between individuals and computer systems.\n\n## Features\n- **Direct Neural Interface**: Brain-computer connection\n- **Telepathic Amplification**: Extends natural telepathic range\n- **Data Transfer**: High-speed information exchange\n\n## Applications\n- Enhanced communication\n- Direct computer control\n- Shared experiences and memories';

// Link technologies to universe
MATCH (u:Universe {id:'u_demo'})
MATCH (c:Category {name:'Technologies'})
MERGE (c)-[:HAS_PAGE]->(t1);
MERGE (c)-[:HAS_PAGE]->(t2);

// Create relationships
MATCH (ch1:Character {id:'ch_captain_reyes'})
MATCH (w1:World {id:'w_terra_nova'})
MATCH (cu1:Culture {id:'cu_terran_federation'})
MERGE (ch1)-[:FROM]->(w1);
MERGE (ch1)-[:BELONGS_TO]->(cu1);

MATCH (ch2:Character {id:'ch_zara_thorn'})
MATCH (w2:World {id:'w_void_station'})
MATCH (cu2:Culture {id:'cu_zephyrian_collective'})
MERGE (ch2)-[:FROM]->(w2);
MERGE (ch2)-[:BELONGS_TO]->(cu2);

MATCH (cu1:Culture {id:'cu_terran_federation'})
MATCH (w1:World {id:'w_terra_nova'})
MERGE (cu1)-[:LOCATED_ON]->(w1);

MATCH (cu2:Culture {id:'cu_zephyrian_collective'})
MATCH (w2:World {id:'w_void_station'})
MERGE (cu2)-[:LOCATED_ON]->(w2);

MATCH (cu1:Culture {id:'cu_terran_federation'})
MATCH (t1:Technology {id:'t_ftl_drive'})
MERGE (cu1)-[:DEVELOPED]->(t1);

MATCH (cu2:Culture {id:'cu_zephyrian_collective'})
MATCH (t2:Technology {id:'t_neural_link'})
MERGE (cu2)-[:DEVELOPED]->(t2);
