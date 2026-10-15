import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <h1 className="font-display text-[clamp(4rem,18vw,9rem)] leading-none font-black text-hero-ink">
          404
        </h1>
        <p className="mt-5 text-base text-fg-subtle">This page does not exist.</p>
        <Link href="/" className="jn-btn jn-btn-primary mt-8">
          Go home
        </Link>
      </div>
    </main>
  );
}
