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
  nav: [
    { href: "#modes", label: "Modes" },
    { href: "#status", label: "Status" },
    { href: "#join", label: "Join" },
    { href: "/rules", label: "Rules" },
    { href: "/status", label: "Live Status" },
    { href: "/terms", label: "Terms" },
    { href: "/login", label: "Login" },
  ],
} as const;
