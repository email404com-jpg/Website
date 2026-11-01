import type { Metadata } from 'next';
import NobleSmpExperience from './NobleSmpExperience';

export const metadata: Metadata = {
  title: 'Noble SMP - Jack Network',
  description:
    'Noble SMP is a whitelist-protected Minecraft survival server built around legendary swords. Request access on Discord.',
};

export default function NobleSmpPage() {
  return <NobleSmpExperience />;
}
