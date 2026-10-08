export default function Home() {
  return (
    <main className="flex-1 px-[max(1rem,env(safe-area-inset-left))] py-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="font-mono text-sm text-fg-subtle">jack.network</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg">
          Jack Network
        </h1>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-fg-muted">
          A Minecraft server running practice PvP and survival.
        </p>
        <p className="mt-6 border-t border-line pt-4 text-sm text-fg-subtle">
          Site content pending — server address, game modes and links have not
          been supplied yet.
        </p>
      </div>
    </main>
  );
}
