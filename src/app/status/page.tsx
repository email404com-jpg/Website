import type { Metadata } from 'next';
import { ServerStatus } from '@/components/server-status';

export const metadata: Metadata = {
  title: 'Status',
  description: 'Jack Network server status',
};

export default function StatusPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
          Server Status
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Live status updates every 10 seconds.
        </p>
        <div className="mt-8">
          <ServerStatus />
        </div>
      </div>
    </main>
  );
}
