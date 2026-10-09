import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 text-center">
        <h1 className="text-4xl font-semibold text-fg">404</h1>
        <p className="mt-3 text-fg-muted">Page not found</p>
        <div className="mt-6">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
