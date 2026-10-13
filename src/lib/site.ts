export const site = {
  name: "Jack Network",
  domain: "jacknetwork.in",
  url: "https://jacknetwork.in",
  copyrightYear: 2026,
  description:
    "Jack Network is a Minecraft server running practice PvP and survival. Join at play.jacknetwork.in or meet the community on Discord.",
  server: {
    address: "play.jacknetwork.in",
    editions: ["Java", "Bedrock"],
  },
  discord: {
    url: "https://dsc.gg/jackknetwork",
    label: "Discord",
  },
  hero: {
    kicker: "Jack Network — Minecraft · Java & Bedrock",
    headlineTop: "One address.",
    headlineBottom: "Two battlefields.",
    description:
      "Jack Network runs practice PvP and survival on a single server. Same IP on Java and Bedrock — copy it, join, and play.",
  },
  network: {
    kicker: "The network",
    statement: "Two ways to play. Zero friction to start.",
    bodyA:
      "Jack Network is a Minecraft server built around two experiences: the sharp end of Practice PvP and the slow burn of Survival. Both run on one address for Java and Bedrock — no separate installs, no second IP.",
    bodyB:
      "Coins tie it together: earn them free in chat games and Discord, or buy them when the store opens. The Discord is where announcements land first and where support lives.",
    facts: [
      { value: "Java + Bedrock", label: "One address, no separate port" },
      { value: "Free to play", label: "Coins are optional" },
      { value: "Two modes", label: "Practice PvP and Survival" },
    ],
  },
  connect: {
    kicker: "Get connected",
    title: "Join in under a minute.",
    description:
      "No launcher mods, no extra downloads. Four steps between you and the server.",
    steps: [
      {
        index: "01",
        title: "Open Minecraft",
        text: "Java or Bedrock — both connect to the same address.",
      },
      {
        index: "02",
        title: "Add a server",
        text: "Go to Multiplayer, choose Add Server.",
      },
      {
        index: "03",
        title: "Paste the address",
        text: "Enter play.jacknetwork.in as the server address.",
      },
      {
        index: "04",
        title: "Join and play",
        text: "Save, join, and pick Practice PvP or Survival.",
      },
    ],
  },
  modes: [
    {
      id: "practice-pvp",
      index: "01",
      name: "Practice PvP",
      tagline: "Sharpen the fight",
      description:
        "Straight into combat. Test your aim, timing and game sense against other players in endless practice fights, and get sharper with every round.",
      traits: ["Player vs player", "Every round a rematch", "All skill levels"],
      image: "/media/practice-nether.webp",
      imageAlt:
        "Red Nether landscape in Minecraft with lava falls and glowing fire",
      width: "full" as const,
    },
    {
      id: "survival",
      index: "02",
      name: "Survival",
      tagline: "Build your ground",
      description:
        "A shared world to gather, build and hold your ground. Day one starts with a dirt hut — the rest is up to you and the players beside you.",
      traits: ["Shared world", "Gather and build", "Play your way"],
      image: "/media/survival-taiga.webp",
      imageAlt:
        "Green taiga Minecraft valley with spruce forest and a river",
      width: "panel" as const,
    },
  ],
  coins: {
    sources: [
      {
        id: "chat-games",
        index: "01",
        name: "In-game chat games",
        summary:
          "Play chat games on the Minecraft server to earn coins for free.",
        icon: "chat",
      },
      {
        id: "discord-level",
        index: "02",
        name: "Discord level-up",
        summary:
          "Level up your Discord account to earn coins automatically.",
        icon: "discord",
      },
      {
        id: "purchase",
        index: "03",
        name: "Buy coins",
        summary:
          "Purchase coins directly. Payment integration coming soon.",
        icon: "coin",
      },
    ],
  },
  faq: [
    {
      q: "How do I join the server?",
      a: "Open Minecraft, go to Multiplayer, and add the server address play.jacknetwork.in. Both Java and Bedrock editions are supported.",
    },
    {
      q: "How can I get coins?",
      a: "You can earn coins three ways: play in-game chat games on the Minecraft server, level up your Discord account, or buy them directly. The store opens soon.",
    },
    {
      q: "Is the server free to play?",
      a: "Yes. The server is free to join and play. Coins are optional and used for in-game perks. You never need to pay to enjoy the server.",
    },
    {
      q: "What can I spend coins on?",
      a: "Coins can be spent on in-game perks and cosmetics. The full store catalog will be listed once the payment system goes live.",
    },
    {
      q: "Can I get a refund on coin purchases?",
      a: "Once coins are credited to your account, purchases are final and non-refundable. See the Terms of Service for the full policy.",
    },
    {
      q: "Which Minecraft editions work?",
      a: "Both Java and Bedrock editions connect at the same address. No separate install or port is needed.",
    },
    {
      q: "How do I report a player or bug?",
      a: "Join the Discord and open a support ticket or report the issue in the designated channel. Staff will review it.",
    },
    {
      q: "Where do I check if the server is online?",
      a: "The status page updates live. You can also see a status indicator in the site header.",
    },
  ],
  nav: [
    { href: "#modes", label: "Modes" },
    { href: "/coins", label: "Coins" },
    { href: "https://store.jacknetwork.in", label: "Store" },
    { href: "/status", label: "Status" },
    { href: "/faq", label: "FAQ" },
    { href: "/rules", label: "Rules" },
    { href: "/terms", label: "Terms" },
  ],
  credits: {
    images:
      "Minecraft imagery via Wikimedia Commons, CC BY 3.0 (1.18 mountains, Nether, Taiga screenshots).",
  },
} as const;
