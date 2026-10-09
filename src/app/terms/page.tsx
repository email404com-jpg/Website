import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Jack Network Terms of Service',
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Terms of Service content will be added here when provided. No terms
          have been invented.
        </p>
      </div>
    </main>
  );
}
