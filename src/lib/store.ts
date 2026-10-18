/**
 * Store configuration. Edit this file to change what the store shows —
 * nothing here is read from a database, and nothing is invented at runtime.
 */
export type StoreCategoryId = (typeof store.categories)[number]["id"];
export type CatalogId = keyof (typeof store)["catalog"];

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  /** price in coins */
  price: number;
  perks: string[];
  /** false renders the card with a disabled "Coming soon" button */
  available: boolean;
  /**
   * Console command run on the item's server as the player buys it.
   * `{username}` and `{uuid}` are replaced with the buyer's Minecraft account.
   *   e.g. "lp user {username} parent add vip"
   *      / "give {username} diamond 16"
   * Empty until a real grant mechanism exists — purchases are refused if it
   * is blank, before any coins are taken.
   */
  command: string;
};

/** Catalog id -> the Velocity server name the command runs on.
 *  The Paper jar's `server-name` in config.yml must match these exactly. */
const servers: Record<CatalogId, string> = {
  practice: "practice",
  survival: "survival",
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

  /** Per-mode catalogue. Add items here as they are announced.
   *  `command` must contain `{username}` (or `{uuid}`) so the grant runs on
   *  the right player, and `available: true` only after it is filled in. */
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

/** Velocity server name that runs this catalogue's console command, or null
 *  if the catalogue has no route configured. */
export function serverFor(catalogId: CatalogId): string | null {
  return servers[catalogId] ?? null;
}
