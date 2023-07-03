export const Agent1SystemPrompt: string = `
You are going to play the role of a character in a fantasy world. Here is the information about your character:
"thalos_the_mystic": {
  "description": "A wise and ancient elf with long silver hair and captivating evergreen eyes. Adorned in robes interwoven with spider silk and peppered with starstone, Thalos radiates an ambiance of magic.",
  "traits": "Scholarly, serene, polite, mysterious, possesses incredible magical abilities",
  "starting_position": "elderwood_library",
  "goal": "Thalos aims to decipher an ancient prophecy about a forthcoming great calamity and find a way to thwart it.",
},
Given that you are roleplaying, it is very important that you do not break character.
You must only respond in the voice of your character, and you must not use any knowledge that your character would not have.
`;

export const Agent2SystemPrompt: string = `
You are going to play the role of a character in a fantasy world. Here is the information about your character:
"morgana_blackstone": {
  "description": "A human knight in black steel armor, Morgana is known for her stern steel-grey eyes and raven hair. Displaying her family's crest - a flaming sword - on her attire, she is a formidable force on the battlefield.",
  "traits": "Courageous, disciplined, loyal, pragmatic, brilliant strategist",
  "starting_position": "blackstone_castle",
  "goal": "Being the rightful heiress, Morgana is desperately trying to reclaim her stolen throne from an evil, usurping relative.",
},
Given that you are roleplaying, it is very important that you do not break character.
You must only respond in the voice of your character, and you must not use any knowledge that your character would not have.
`;

export const Agent3SystemPrompt = `
You are going to play the role of a character in a fantasy world. Here is the information about your character:
"ranulf_flameheart": {
  "description": "A hardy dwarf with flaming red hair and a fiery spirit that matches, Ranulf is a renowned blacksmith. Known for his booming laugh and vast generosity as much as his artistry with magic-infused weapons.",
  "traits": "Strong, jovial, generous, dedicated, master blacksmith",
  "starting_position": "flamekeeper_forges",
  "goal": "Ranulf searches for a mythical ore, said to endure the ethereal fire of the Smoldering Plains, in order to craft a weapon of legend.",
},
Given that you are roleplaying, it is very important that you do not break character.
You must only respond in the voice of your character, and you must not use any knowledge that your character would not have.
`;

export const Agent4SystemPrompt = `
You are going to play the role of a character in a fantasy world. Here is the information about your character:
"elara_moonshade": {
  "description": "Elara is a lithe and beguiling sylph with luminescent skin and hair, tinged an ethereal silver. Wearing a cloak made of sparkling moondust, she moves like a whisper between shadows.",
  "traits": "Clever, stealthy, agile, nocturnal, sly",
  "starting_position": "moonshadow_valley",
  "goal": "Elara is searching for a legendary artifact allegedly hidden in Lunarian Rock to restore power to her fading forest.",
}
Given that you are roleplaying, it is very important that you do not break character.
You must only respond in the voice of your character, and you must not use any knowledge that your character would not have.
`;

export const WorldCreatorPrompt = `Your job is to create a cohesive, comprehensive, consistent virtual fantasy world. To create the world, you will describe various locations, items, and characters. When describing a location, make note of what is nearby, and keep a mental model of the map of the world. (e.g. if you go north from this place, where do you end up?). Create many interesting locations and items, at least 20 of each, and also create 5 characters. 
Produce the world in this format, valid JSON with Camel Casing:
\`\`\`
const world = {
'name_of_thing': 'description_of_thing',
'name_of_thing2': 'description_of_thing2',
...
'name of thingN': 'description_of_thingN'
}
\`\`\`
`;

// use this with the context of the world state to create characters:
export const CharacterCreatorPrompt: string = `Now, create 4 characters that will live in this world. 
Describe their features, characteristics, traits, and their starting positions in the world. Describe their goals. 
Explain why you are placing them where you are on the map, and explain how far apart they are from eachother and
 what it would take for them to cross paths.`;

export const WorldState = {
  "emerald_forest":
    "A lush, green forest teeming with exotic wildlife and mystical creatures. Tall trees with emerald leaves sway gracefully in the wind, and magical springs dot the forest floor.",
  "crystal_lake":
    "A pristine lake located at the heart of Emerald Forest, it sparkles under the sunlight, akin to countless crystals spread out. The water is enchanted, rumored to possess healing properties.",
  "wandering_peak":
    "A snow-capped mountain to the north of Emerald Forest. Renowned for its dangerous terrains and unpredictable weather. Home to the rare Ice Fire flower.",
  "blackstone_castle":
    "An imposing castle nestled upon the Wandering Peak. Built with black stone, it houses secret chambers and deadly traps.",
  "smoldering_plains":
    "West of the Wandering peak, these plains are always burning with ethereal fire.The fire doesn't consume, but the heat is intense, making it hostile for most creatures.",
  "veridian_village":
    "Situated near the Emerald Forest, it's a peaceful settlement with thatched-roof cottages. Famed for local weaved baskets and herbal potions.",
  "moonshadow_valley":
    "Located east of Emerald Forest. At night, moonlight filters through the sparse trees giving the place an ethereal glow. Many nocturnal, magical creatures call this valley home.",
  "whispering_winds_canyon":
    "North from Smoldering Plains. The winds here supposedly whisper the secrets of the world to those who listen closely enough.",
  "midnight_caverns":
    "Deep, maze-like caverns found underneath Moonshadow Valley. It hosts a variety of crystals and rare ores like Starstone which glows under the moonlight.",
  "sumerian_sands":
    "A vast, sprawling desert to the west of Smoldering Plains. Home to the mystical Sand Serpents and ancient ruins believed to be remnants of a forgotten civilization.",
  "thunderfall":
    "A colossal waterfall pouring into Crystal Lake from the Wandering Peak. The crashing sounds from the waterfall resemble thunder, giving it its name.",
  "starlight_springs":
    "These magical springs in Emerald Forest are believed to possess restorative powers. They shimmer under the stars, earning their name.",
  "elder_tree":
    "The oldest and largest tree in the Emerald Forest. It is said to house the spirit of the forest.",
  "radiant_orchard":
    "South of Veridian Village, this orchard boasts a variety of magical fruits which can also be used as components for spells.",
  "bleak_bay":
    "An eerily calm bay located south of Sumerian Sands. Despite its unwelcoming environment, it's rich with rare sea creatures and pearls.",
  "mirrorlake_isle":
    "A small island in the middle of Crystal Lake. It's believed that its waters reflect not just your image, but your true self.",
  "giant_strides":
    "An unusual terrain west of Smoldering Plains with large, nearly perfectly round mounds. According to local lore, they are footprints of an ancient giant.",
  "spider_silk_market":
    "A bustling market at the outskirts of Veridian Village known for its wide array of goods, especially enchanted garments woven from spider silk.",
  "lunarian_rock":
    "A mysterious rock formation near Sumerian Sands. During full moon nights, the rock formation supposedly moves, revealing paths to hidden treasures.",
  "whisperglade":
    "A serene glade located in the heart of Emerald Forest, where wind whispers ancient tales across the ages.",
  "parched_throat":
    "A notorious tavern in Veridian Village serving the strongest spirits and moon-ale in the realm.",
  "oracle_grove":
    "A sacred grove located atop Wandering Peak, it houses the famed Crystal Orb. who's reflections are known to reveal the future.",
  "wyrm_bone_beach":
    "A beach at the edge of Bleak Bay, known for the numerous ancient dragon bones that wash up on its shores.",
  "nimbus_cloudbridge":
    "A magical bridge made of clouds linking Wandering Peak and Moonshadow Valley.",
  "meridian_meadows":
    "South of Veridian Village, stretches of beautiful meadows blooming with colorful flowers which are used for making magical potions and dyes.",
  "dragon_breath_volcano":
    "Active volcano located west of Smoldering Plains. Its eruptions are said to forge Dragon glass, a material with magical properties.",
  "twin_moons_inn":
    "A cozy and popular inn on the outskirts of Veridian Village. Known for its magical mead and enchanting bedtime stories.",
  "celestial_gardens":
    "Magical gardens found within Blackstone Castle. The plants and flowers here make anyone sick just by touching them",
  "endless_echo_canyon":
    "A deep canyon east of the Whispering Winds Canyon, where each sound multiplies and reverberates endlessly. A challenge for those who rely on sounds for navigation.",
  "luna_lotus_lake":
    "A lake located near Moonshadow Valley, famous for its moonlit lotus flowers which bloom only during the full moon.",
  "labyrinth_of_illusions":
    "Found within Blackstone Castle, this magical maze changes its path frequently, creating illusions and traps to deceive trespassers.",
  "stargazer_mountain":
    "The highest point in Wandering Peak, where the starlit sky can be seen in its full glory. According to folklore, wishes made under this sky come true.",
  "twisted_tower":
    "A tower that spirals towards the sky, within Blackstone Castle. Each floor is populated with magical defences.",
  "solstice_springs":
    "Hot springs located south of Sumerian Sands with water magically warmed by the energy of the sun itself.",
  "shadowfen":
    "A treacherous marshland on the outskirts of Moonshadow Valley. Home to strange, shadowy creatures.",
  "banshee_bluffs":
    "A series of eerie, windswept cliffs north of Whispering Winds Canyon. Known for strange, wailing winds that sound like banshees.",
  "dune_sea":
    "A vast, seemingly endless desert located in the heart of Sumerian Sands. Navigating its shifting sands is a great challenge.",
  "dragon_scale_forge":
    "An ancient forge at the heart of Dragon Breath Volcano. Weapons forged in Dragon scale forge carry the magic of the Dragons with them.",
  "diamond_dust_glacier":
    "Located north of Wandering Peak, a massive glacier which glitters like diamond dust under the sunlight.",
  "siren_shallow_bay":
    "A shallow bay adjacent to Bleak Bay, rumored to be home to mystical sirens.",
  "elemental_stone_garden":
    "An array of stone formations near Smoldering Plains. Each stone represents a different element and emits a unique magic energy.",
  "weeping_willow_graves":
    "A quiet graveyard at the outskirts of Veridian Village, marked by a willow tree that seems to weep under the moonlight.",
  "quicksilver_river":
    "A fast-flowing, silver-tinted river running from Thunderfall to Sumerian Sands. The water possesses magical properties of enhancement.",
  "constellation_cove":
    "A hidden cove in Bleak Bay where constellation patterns can be seen reflected in tranquil waters during the night.",
  "sundial_spire":
    "A towering spire at the center of Sumerian Sands, which acts as a massive sundial, marking the desert hours.",
  "harpy_heights":
    "Steep, rocky cliffs on the edge of Emerald Forest, known for being the nesting grounds for the enigmatic Harpies.",
  "sunsteel_mine":
    "A deep mine in the heart of Wandering Peak known for rich deposits of Sunsteel, a metal that absorbs sunlight for energy.",
  "tempest_tide":
    "A wild, stormy region in the northern part of Bleak Bay, known for shipwrecks and tales of sea monsters.",
  "flamekeeper_forges":
    "Legendary workshops within the Smoldering Plains, where Flamesmiths craft magical artifacts imbued with the ethereal fire's energy.",
  "reverie_ruins":
    "Ancient ruins nestled within Sumerian Sands. Enigmatic carvings and complex mural tell the stories of the civilisation that once thrived.",
  "will-o-wisp_bog":
    "Swampy region within Moonshadow Valley, known for the floating spiritual lights that are often seen dancing in the darkness.",
  "elderwood_library":
    "A grand library carved inside the Elder Tree. It houses ancient scripts and historical records of the world.",
  "direwolf_canyon":
    "A canyon in the outskirts of Smoldering Plains known to be the territory of mystical Direwolves.",
  "mystic_mangrove":
    "Mysterious mangrove located near Bleak Bay. Home to numerous, enchanting aquatic species.",
  "glittering_gorges":
    "Stony gorges covered in bioluminescent fungi in the outskirts of Midnight Caverns.",
  "silverglow_meadow":
    "A heavenly meadow to the south of the Meridian Meadows, known for its silver-hued grass that glows under the moonlight.",
  "titan_wall":
    "A giant, seemingly unending wall to the north of Blackstone Castle, believed to be built by ancient giants.",
  "sorcerer_springs":
    "Magical springs found in the heart of Whispering Winds Canyon where one is said to gain arcane knowledge by bathing.",
  "comet_crag":
    "A series of cliffs near Stargazer Mountain, where celestial bodies are believed to have fallen. The area is rich in cosmic material.",
  "marble_maiden_port":
    "A picturesque port south of Bleak Bay, lined by beautiful marble statues rumored to be enchanted maidens.",
  "umbral_covert":
    "A shadowy thicket in the depths of Moonshadow Valley, which is perpetually dark, even during noon.",
  "faetouched_glen":
    "A hidden glen within Emerald Forest, where the Fae are commonly sighted.",
  "kingfisher_reef":
    "A vibrant reef off Mirrorlake Isle, inhabited by a variety of magical marine creatures.",
  "enchanted_grove":
    "South of Lunar Lotus Lake, this grove is home to magical creatures and plants with high magical potency.",
  "echo_cave":
    "A secluded cave in the Whispering Winds Canyon that audibly repeats any sound made within.",
  "phoenix_nest":
    "Rising atop fiery Dragon Breath Volcano, a sanctuary rumored to be home to the immortal Phoenix.",
  "troll_bridges":
    "A series of bridges located around the outskirts of Smoldering Plains. Trolls often lurk underneath, demanding tolls from travelers.",
  "polaris_peak":
    "The northern mountain peak in Wandering Peak. From the top, one can always spot the North Star, Polaris, no matter the weather.",
  "griffin_gulch":
    "Steep valley amidst Wandering Peak, known to be the nesting grounds of mystical Griffins.",
  "eternal_ember_quarry":
    "A quarry within Smoldering Plains that produces eternal embers, flames that never die.",
  "dragon_bone_dyke":
    "A great wall made of dragon bones on the outskirts of Wyrm Bone Beach, believed to be protective against sea monsters.",
  "sunburst_orchard":
    "An orchard near Radiant Orchard, filled with trees that bear glowing, sun-coloured fruits.",
  "shattered_isles":
    "A cluster of fragmented islands in Bleak Bay, home to countless sea birds and exotic vegetation.",
  "crystalline_chasm":
    "A deep chasm within Midnight Caverns filled with various types of illuminated crystals and geodes.",
  "gilded_gallery":
    "An extravagant hall within Blackstone Castle adorned with golden murals and art from legendary craftsmen.",
  "cobra_cape":
    "A cape at the edge of the Giant Strides known for its serpentine winds and distinctive, cobra-shaped rock formation.",
  "monarch_mesa":
    "A flat-topped hill amidst Sumerian Sands, often used as a vantage point for navigating the desert.",
  "centaur_run":
    "Sprawling grasslands bordering the Veridian Village, home to herds of swift-footed Centaurs.",
  "raven_roost":
    "A large, ominous tree in Emerald Forest, where a multitude of ravens have made their home.",
  "spirit_stone_sanctuary":
    "A sanctuary full of ancient spirit stones within the precincts of Oracle Grove.",
  "frostfern_field":
    "A field near Diamond Dust Glacier, it sees a perennial growth of frost ferns, plants made of ice.",
  "golden_gauntlet_guild":
    "A grand guild for brave adventurers and valiant heroes situated in the heart of Veridian Village.",
  "opal_abyss":
    "A never-ending abyss within Diamond Dust Glacier, where opal encrusted ice formations are common.",
};

export const WorldStateOneLiner: string = `Calabasis is a fantasy world where the forrest meet the ocean`;

export const WorldStatePreamble = `You are roleplaying as a sophisticated AI. 
Your role is to manage a dynamic virtual world, reacting to the players' actions, and updating the world accordingly.\n`;

// with this prompt, assuming there are 3000 tokens worth of actions,
// we can safely afford to inject 3500 tokens worth of world state
export const GenerateRequestNextActionPrompt = (
  character: string,
  previous_action: string,
  recent_actions: string,
  world_state: string
): string => {
  return `Your task is to request the next action from a player in a turn-based environment.
To do so, you have access to three types of information:

Your task is to provide a Third-Person Objective Narration to a player in a turn-based, immersive environment.

You have access to a few types of information to facilitate this:

1. The latest action undertaken by the player (if available)
2. The most recent actions executed by other players (if applicable)
3. Pertinent details about the current state of the virtual world

It's crucial to remember that while you possess comprehensive information about the world, the players DO NOT. 
They can only act based on what they know from their perspective.

Your responsibility is to request the next move from the player by providing them with a succinct recap of relevant events, world states, and actions that have transpired since their last turn. 

${
  previous_action.length > 1 &&
  `Here is ${character}'s most recent action:
  ${character}: ${previous_action}`
}

Here are the recent actions taken by other players: ${recent_actions}

Here are some relevant elements of the current state of the virtual world that you are maintaining:
${world_state}

Now, compile the concise Third-Person Objective Narration for ${character}, using only information that is directly relevant to 
${character} and that may influence ${character}'s next move. Entirely ignore all information, player names, and actions that are not 
directly relevant to ${character}'s circumstance. In essence, you act as the eyes and ears of ${character}. You must not make any action, 
thought, feeling, or plan on behalf of ${character}.
\n`;
};

export const FunctionRequestPreamble = `${WorldStatePreamble}
Given the state of the world and the most recent action of the players, 
your task is to assess how these actions have affected the state of the world, 
and then rewrite the state accordingly using the functions you have been provided with. 
Only update a few items or locations in the world, and only update them if they have been affected in a meaningful way by the recent actions.
If new items or locations emerge as a result of the recent actions, add them to the world.
When rewriting the state of an item and/or location, be extremely wary not to leave out any prior information that is still true or relevant. 
Below is information that represents the current state of the world 
(ordered from most relevant to least relevant, but use your judgement):\n`;

// This is just for context, to analyze performance.
const characterInfo = `{
  "characters": {
    "thalos_the_mystic": {
      "description": "A wise and ancient elf with long silver hair and captivating evergreen eyes. Adorned in robes interwoven with spider silk and peppered with starstone, Thalos radiates an ambiance of magic.",
      "traits": "Scholarly, serene, polite, mysterious, possesses incredible magical abilities",
      "starting_position": "elderwood_library",
      "goal": "Thalos aims to decipher an ancient prophecy about a forthcoming great calamity and find a way to thwart it.",
      "reason_for_position": "Placed in Elderwood Library, Thalos has access to most ancient scripts and historical records of the world in his quest for knowledge."
    },
    "morgana_blackstone": {
      "description": "A human knight in black steel armor, Morgana is known for her stern steel-grey eyes and raven hair. Displaying her family's crest - a flaming sword - on her attire, she is a formidable force on the battlefield.",
      "traits": "Courageous, disciplined, loyal, pragmatic, brilliant strategist",
      "starting_position": "blackstone_castle",
      "goal": "Being the rightful heiress, Morgana is desperately trying to reclaim her stolen throne from an evil, usurping relative.",
      "reason_for_position": "Morgana starts in Blackstone Castle, the heart of her heritage and the seat she aspires to reclaim."
    },
    "ranulf_flameheart": {
      "description": "A hardy dwarf with flaming red hair and a fiery spirit that matches, Ranulf is a renowned blacksmith. Known for his booming laugh and vast generosity as much as his artistry with magic-infused weapons.",
      "traits": "Strong, jovial, generous, dedicated, master blacksmith",
      "starting_position": "flamekeeper_forges",
      "goal": "Ranulf searches for a mythical ore, said to endure the ethereal fire of the Smoldering Plains, in order to craft a weapon of legend.",
      "reason_for_position": "The Flamekeeper Forges are the perfect place for Ranulf as it gives him the environment to hone his craft."
    },
    "elara_moonshade": {
      "description": "Elara is a lithe and beguiling sylph with luminescent skin and hair, tinged an ethereal silver. Wearing a cloak made of sparkling moondust, she moves like a whisper between shadows.",
      "traits": "Clever, stealthy, agile, nocturnal, sly",
      "starting_position": "moonshadow_valley",
      "goal": "Elara is searching for a legendary artifact allegedly hidden in Lunarian Rock to restore power to her fading forest.",
      "reason_for_position": "Moonshadow Valley is Elara's home, and her nocturnal nature allows her to use this environment to her advantage."
    }
  },
  "relationships": {
    "distance": "Morgana's castle is the farthest from Elara's forest, requiring them to traverse the dangerous Wandering Peak or the mystical Emerald Forest to meet. Ranulf and Thalos, meanwhile, are closer to each other. Ranulf's forges are west of Thalos's library, requiring a journey through the Emerald Forest. On the other hand, Morgana and Ranulf would have to cross the fiery Smoldering Plains to find each other.",
    "crossing_paths": "In order to cross paths, each will need to travel outside their comfort zones. Thalos might need to journey to Morgana's castle for historical records in recovering his prophecy. Meanwhile, the ore Ranulf seeks might very well be within the depths of the castle Morgana seeks to reclaim. Elara may be drawn to the Flamekeeper Forges, should she need Ranulf's skills to unlock the power of the artifact she seeks."
  }
}`;
