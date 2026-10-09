import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Rules',
  description: 'Jack Network server rules',
};

export default function RulesPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
          Rules
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Rules will be added here when provided. No rules have been invented.
        </p>
      </div>
    </main>
  );
}
