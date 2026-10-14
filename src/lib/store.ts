/**
 * Store configuration. Edit this file to change what the store shows —
 * nothing here is read from a database, and nothing is invented at runtime.
 */
export type StoreItem = {
  id: string;
  name: string;
  description: string;
  /** price in coins */
  price: number;
  perks: string[];
  /** false renders the card with a disabled "Coming soon" button */
  available: boolean;
};

export const store = {
  url: "https://store.jacknetwork.in",

  categories: [
    {
      id: "practice",
      href: "/practice",
      index: "01",
      name: "Practice PvP",
      tagline: "Ranks and upgrades for the fight",
      image: "/media/practice-nether.webp",
      imageAlt: "Red Nether landscape in Minecraft with lava falls",
    },
    {
      id: "survival",
      href: "/survival",
      index: "02",
      name: "Survival",
      tagline: "Ranks and perks for your world",
      image: "/media/survival-taiga.webp",
      imageAlt: "Green taiga Minecraft valley with spruce forest and a river",
    },
    {
      id: "coins",
      href: "/coins",
      index: "03",
      name: "Buy Coins",
      tagline: "Top up your balance",
      image: null,
      imageAlt: "",
    },
  ],

  /** Per-mode catalogue. Add items here as they are announced. */
  catalog: {
    practice: { ranks: [] as StoreItem[] },
    survival: { ranks: [] as StoreItem[] },
  },

  /** Copy for the "AFK earn coins" panel. Edit to match the in-game setup. */
  afk: {
    summary: "Keep the AFK page open and earn 2 coins every minute.",
    steps: [
      "Open the AFK page and press Start.",
      "Keep the tab open and visible — coins arrive every minute.",
      "Stop any time. A daily limit applies.",
    ],
    note: "Exact rates and the AFK location are shown in game.",
  },
} as const;

export type StoreCategoryId = (typeof store.categories)[number]["id"];
