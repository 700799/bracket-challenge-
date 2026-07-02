/**
 * Pure data for the Kart Hero avatar system — palettes, trait types, and the 50
 * unique presets. Kept JSX-free so it can be imported by server code and tests;
 * the SVG rendering lives in `avatars.tsx`.
 */

export const INK = "#0A0A12";

export const SKIN: Record<string, string> = {
  light: "#F6D2B0",
  peach: "#F2C9A0",
  tan: "#E0A878",
  brown: "#C68642",
  deep: "#8D5524",
  robot: "#C2CAD6",
  alien: "#8BE58B",
  ghost: "#E8ECFF",
  ember: "#F0A56B",
  frost: "#CFE9FF",
};

export const HAIR: Record<string, string> = {
  black: "#1B1B22",
  brown: "#6B4423",
  blonde: "#E7C765",
  red: "#C0392B",
  blue: "#2E64E0",
  purple: "#7A3CF0",
  white: "#EDEDED",
  green: "#2FA84F",
  teal: "#12B5C9",
  flame: "#FF7A1A",
  pink: "#E23C86",
};

export interface Jersey {
  c: string;
  d: string;
}

export const JERSEYS: Jersey[] = [
  { c: "#E5322D", d: "#B31F1B" }, // 0 red
  { c: "#1B4DE4", d: "#123BB0" }, // 1 blue
  { c: "#33C14E", d: "#1F9A38" }, // 2 green
  { c: "#F5C518", d: "#D19E00" }, // 3 gold
  { c: "#7A3CF0", d: "#5A24C2" }, // 4 purple
  { c: "#0FB5C9", d: "#0A7F8C" }, // 5 teal
  { c: "#FF7A1A", d: "#C85800" }, // 6 orange
  { c: "#E23C86", d: "#A82461" }, // 7 pink
  { c: "#2B2F4A", d: "#1A1D30" }, // 8 navy
  { c: "#EDEDED", d: "#B9B9B9" }, // 9 white
  { c: "#111318", d: "#000000" }, // 10 black
  { c: "#8BE58B", d: "#3FA85F" }, // 11 lime
];

export type EyeType =
  | "normal" | "determined" | "goggles" | "shades" | "star"
  | "wink" | "wide" | "fiery" | "electric" | "visor";
export type TopType =
  | "hair" | "cap" | "headband" | "helmet" | "beanie" | "sweatband"
  | "crown" | "mohawk" | "bandana" | "hood" | "none";
export type HandType = "fists" | "gloves" | "thumbs" | "ball" | "point";
export type EquipType =
  | "ball" | "whistle" | "trophy" | "cone" | "flag" | "medal"
  | "bottle" | "star" | "boot" | "gk" | "cards" | "band";
export type Element =
  | "none" | "fire" | "lightning" | "ice" | "star" | "wind"
  | "water" | "leaf" | "shadow" | "rainbow";

export interface AvatarPreset {
  id: string;
  name: string;
  group: "Sport" | "Elemental";
  skin: keyof typeof SKIN;
  hair: keyof typeof HAIR;
  jersey: number;
  eyes: EyeType;
  top: TopType;
  hands: HandType;
  equip: EquipType;
  element: Element;
}

export const AVATARS: AvatarPreset[] = [
  // --- Sport heroes (25) ---
  { id: "striker-red", name: "Red Striker", group: "Sport", skin: "light", hair: "black", jersey: 0, eyes: "determined", top: "hair", hands: "ball", equip: "ball", element: "none" },
  { id: "blue-blaze", name: "Blue Blaze", group: "Sport", skin: "tan", hair: "blue", jersey: 1, eyes: "goggles", top: "helmet", hands: "gloves", equip: "boot", element: "none" },
  { id: "green-machine", name: "Green Machine", group: "Sport", skin: "brown", hair: "black", jersey: 2, eyes: "normal", top: "headband", hands: "thumbs", equip: "cone", element: "none" },
  { id: "golden-boot", name: "Golden Boot", group: "Sport", skin: "peach", hair: "blonde", jersey: 3, eyes: "star", top: "cap", hands: "point", equip: "boot", element: "none" },
  { id: "purple-power", name: "Purple Power", group: "Sport", skin: "deep", hair: "purple", jersey: 4, eyes: "wide", top: "mohawk", hands: "fists", equip: "star", element: "none" },
  { id: "teal-tornado", name: "Teal Tornado", group: "Sport", skin: "tan", hair: "teal", jersey: 5, eyes: "determined", top: "bandana", hands: "ball", equip: "ball", element: "none" },
  { id: "orange-ace", name: "Orange Ace", group: "Sport", skin: "light", hair: "brown", jersey: 6, eyes: "shades", top: "cap", hands: "thumbs", equip: "medal", element: "none" },
  { id: "pink-rocket", name: "Pink Rocket", group: "Sport", skin: "peach", hair: "red", jersey: 7, eyes: "wink", top: "headband", hands: "point", equip: "cone", element: "none" },
  { id: "navy-captain", name: "Navy Captain", group: "Sport", skin: "brown", hair: "black", jersey: 8, eyes: "determined", top: "cap", hands: "fists", equip: "band", element: "none" },
  { id: "white-keeper", name: "White Keeper", group: "Sport", skin: "light", hair: "blonde", jersey: 9, eyes: "goggles", top: "none", hands: "gloves", equip: "gk", element: "none" },
  { id: "ref-whistle", name: "The Ref", group: "Sport", skin: "tan", hair: "white", jersey: 10, eyes: "normal", top: "cap", hands: "point", equip: "cards", element: "none" },
  { id: "lime-livewire", name: "Lime Livewire", group: "Sport", skin: "peach", hair: "green", jersey: 11, eyes: "wide", top: "sweatband", hands: "thumbs", equip: "bottle", element: "none" },
  { id: "red-rebound", name: "Red Rebound", group: "Sport", skin: "deep", hair: "black", jersey: 0, eyes: "normal", top: "beanie", hands: "fists", equip: "trophy", element: "none" },
  { id: "blue-bullet", name: "Blue Bullet", group: "Sport", skin: "light", hair: "blue", jersey: 1, eyes: "determined", top: "mohawk", hands: "ball", equip: "boot", element: "none" },
  { id: "green-goalie", name: "Green Goalie", group: "Sport", skin: "tan", hair: "brown", jersey: 2, eyes: "goggles", top: "cap", hands: "gloves", equip: "gk", element: "none" },
  { id: "gold-glory", name: "Gold Glory", group: "Sport", skin: "peach", hair: "blonde", jersey: 3, eyes: "star", top: "crown", hands: "thumbs", equip: "trophy", element: "none" },
  { id: "violet-volley", name: "Violet Volley", group: "Sport", skin: "brown", hair: "purple", jersey: 4, eyes: "wink", top: "bandana", hands: "point", equip: "medal", element: "none" },
  { id: "teal-tackler", name: "Teal Tackler", group: "Sport", skin: "deep", hair: "teal", jersey: 5, eyes: "determined", top: "headband", hands: "fists", equip: "cone", element: "none" },
  { id: "orange-outlaw", name: "Orange Outlaw", group: "Sport", skin: "light", hair: "red", jersey: 6, eyes: "shades", top: "hood", hands: "fists", equip: "flag", element: "none" },
  { id: "pink-pace", name: "Pink Pace", group: "Sport", skin: "peach", hair: "pink", jersey: 7, eyes: "wide", top: "hair", hands: "ball", equip: "ball", element: "none" },
  { id: "navy-net", name: "Navy Net", group: "Sport", skin: "tan", hair: "black", jersey: 8, eyes: "normal", top: "beanie", hands: "gloves", equip: "gk", element: "none" },
  { id: "snow-sprinter", name: "Snow Sprinter", group: "Sport", skin: "ghost", hair: "white", jersey: 9, eyes: "wide", top: "sweatband", hands: "thumbs", equip: "bottle", element: "none" },
  { id: "shadow-back", name: "Shadow Back", group: "Sport", skin: "deep", hair: "black", jersey: 10, eyes: "determined", top: "hood", hands: "fists", equip: "band", element: "none" },
  { id: "lime-libero", name: "Lime Libero", group: "Sport", skin: "light", hair: "green", jersey: 11, eyes: "normal", top: "headband", hands: "point", equip: "star", element: "none" },
  { id: "captain-crest", name: "Captain Crest", group: "Sport", skin: "brown", hair: "brown", jersey: 1, eyes: "star", top: "crown", hands: "thumbs", equip: "band", element: "none" },

  // --- Elemental characters (25) ---
  { id: "fire-fury", name: "Fire Fury", group: "Elemental", skin: "ember", hair: "flame", jersey: 0, eyes: "fiery", top: "mohawk", hands: "fists", equip: "ball", element: "fire" },
  { id: "blaze-baron", name: "Blaze Baron", group: "Elemental", skin: "tan", hair: "flame", jersey: 6, eyes: "fiery", top: "helmet", hands: "gloves", equip: "boot", element: "fire" },
  { id: "ember-ace", name: "Ember Ace", group: "Elemental", skin: "peach", hair: "red", jersey: 0, eyes: "determined", top: "bandana", hands: "ball", equip: "cone", element: "fire" },
  { id: "inferno-imp", name: "Inferno Imp", group: "Elemental", skin: "ember", hair: "flame", jersey: 6, eyes: "wide", top: "none", hands: "point", equip: "star", element: "fire" },
  { id: "magma-keeper", name: "Magma Keeper", group: "Elemental", skin: "brown", hair: "red", jersey: 0, eyes: "fiery", top: "helmet", hands: "gloves", equip: "gk", element: "fire" },
  { id: "phoenix-pace", name: "Phoenix Pace", group: "Elemental", skin: "peach", hair: "flame", jersey: 6, eyes: "star", top: "crown", hands: "thumbs", equip: "trophy", element: "fire" },
  { id: "flare-flanker", name: "Flare Flanker", group: "Elemental", skin: "tan", hair: "red", jersey: 0, eyes: "determined", top: "cap", hands: "fists", equip: "flag", element: "fire" },
  { id: "cinder-striker", name: "Cinder Striker", group: "Elemental", skin: "deep", hair: "flame", jersey: 6, eyes: "fiery", top: "mohawk", hands: "ball", equip: "boot", element: "fire" },
  { id: "bolt-brawler", name: "Bolt Brawler", group: "Elemental", skin: "light", hair: "blonde", jersey: 3, eyes: "electric", top: "mohawk", hands: "fists", equip: "star", element: "lightning" },
  { id: "thunder-ace", name: "Thunder Ace", group: "Elemental", skin: "tan", hair: "teal", jersey: 3, eyes: "electric", top: "helmet", hands: "gloves", equip: "boot", element: "lightning" },
  { id: "volt-keeper", name: "Volt Keeper", group: "Elemental", skin: "brown", hair: "blue", jersey: 5, eyes: "visor", top: "cap", hands: "gloves", equip: "gk", element: "lightning" },
  { id: "spark-sprint", name: "Spark Sprint", group: "Elemental", skin: "peach", hair: "blonde", jersey: 3, eyes: "electric", top: "headband", hands: "ball", equip: "ball", element: "lightning" },
  { id: "storm-captain", name: "Storm Captain", group: "Elemental", skin: "deep", hair: "white", jersey: 8, eyes: "determined", top: "crown", hands: "thumbs", equip: "band", element: "lightning" },
  { id: "surge-scout", name: "Surge Scout", group: "Elemental", skin: "light", hair: "teal", jersey: 5, eyes: "visor", top: "bandana", hands: "point", equip: "cone", element: "lightning" },
  { id: "flash-flanker", name: "Flash Flanker", group: "Elemental", skin: "tan", hair: "blonde", jersey: 3, eyes: "electric", top: "sweatband", hands: "fists", equip: "medal", element: "lightning" },
  { id: "zap-zephyr", name: "Zap Zephyr", group: "Elemental", skin: "peach", hair: "blue", jersey: 5, eyes: "wide", top: "hood", hands: "thumbs", equip: "bottle", element: "lightning" },
  { id: "frost-fox", name: "Frost Fox", group: "Elemental", skin: "frost", hair: "white", jersey: 1, eyes: "goggles", top: "beanie", hands: "gloves", equip: "gk", element: "ice" },
  { id: "glacier-guard", name: "Glacier Guard", group: "Elemental", skin: "ghost", hair: "blue", jersey: 5, eyes: "visor", top: "helmet", hands: "gloves", equip: "boot", element: "ice" },
  { id: "star-shooter", name: "Star Shooter", group: "Elemental", skin: "peach", hair: "purple", jersey: 4, eyes: "star", top: "crown", hands: "ball", equip: "star", element: "star" },
  { id: "cosmic-captain", name: "Cosmic Captain", group: "Elemental", skin: "alien", hair: "purple", jersey: 4, eyes: "wide", top: "none", hands: "thumbs", equip: "band", element: "star" },
  { id: "gale-glider", name: "Gale Glider", group: "Elemental", skin: "light", hair: "teal", jersey: 5, eyes: "determined", top: "bandana", hands: "point", equip: "flag", element: "wind" },
  { id: "tide-tackler", name: "Tide Tackler", group: "Elemental", skin: "tan", hair: "blue", jersey: 1, eyes: "goggles", top: "cap", hands: "fists", equip: "bottle", element: "water" },
  { id: "leaf-libero", name: "Leaf Libero", group: "Elemental", skin: "brown", hair: "green", jersey: 2, eyes: "normal", top: "headband", hands: "ball", equip: "cone", element: "leaf" },
  { id: "shadow-striker", name: "Shadow Striker", group: "Elemental", skin: "deep", hair: "black", jersey: 10, eyes: "fiery", top: "hood", hands: "fists", equip: "boot", element: "shadow" },
  { id: "rainbow-runner", name: "Rainbow Runner", group: "Elemental", skin: "peach", hair: "purple", jersey: 7, eyes: "star", top: "mohawk", hands: "thumbs", equip: "trophy", element: "rainbow" },
];

export const AVATAR_BY_ID = new Map(AVATARS.map((a) => [a.id, a]));
export const AVATAR_IDS: string[] = AVATARS.map((a) => a.id);
export const DEFAULT_AVATAR = AVATARS[0].id;
