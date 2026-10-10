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
  modes: [
    {
      id: "practice-pvp",
      index: "01",
      name: "Practice PvP",
      summary:
        "Player-versus-player combat. Fight others and work on your aim, timing and game sense.",
    },
    {
      id: "survival",
      index: "02",
      name: "Survival",
      summary:
        "Classic survival. Gather, build and hold your ground in a shared world.",
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
      },
      {
        id: "discord-level",
        index: "02",
        name: "Discord level-up",
        summary:
          "Level up your Discord account to earn coins automatically.",
      },
      {
        id: "purchase",
        index: "03",
        name: "Buy coins",
        summary:
          "Purchase coins directly. Payment integration coming soon.",
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
    { href: "/status", label: "Status" },
    { href: "/faq", label: "FAQ" },
    { href: "/rules", label: "Rules" },
    { href: "/terms", label: "Terms" },
  ],
} as const;
