import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../noblesmp.module.css';
import { NobleFonts, SubFooter, SubTopbar } from '../noblesmp-shared';

export const metadata: Metadata = {
  title: 'Server Rules - Noble SMP',
  description: 'Read the Noble SMP server rules before you play. Whitelist protected pure survival.',
};

const RULES: { title: string; body: string }[] = [
  {
    title: 'Respect Every Player',
    body: 'No harassment, hate speech, slurs, threats, or targeted toxicity in chat, voice, builds, or signs. Friendly rivalries stay friendly. If staff ask you to stop, you stop.',
  },
  {
    title: 'No Griefing Or Stealing',
    body: 'Do not break, deface, or loot what you did not build or earn. This includes chests, farms, paths, and shared infrastructure. Pranks that damage or waste resources count as griefing.',
  },
  {
    title: 'No Cheating Or Exploits',
    body: 'No hacked clients, xray, kill aura, fly, speed, auto clickers, or duplication glitches. Report exploits to staff instead of using them. Vanilla-first means fair for everyone.',
  },
  {
    title: 'Protect The Whitelist',
    body: 'Accounts are personal. Do not share your account, lend your whitelist spot, or help banned players evade. Every player must be vetted before joining.',
  },
  {
    title: 'Keep Chat Clean',
    body: 'No spam, flooding, advertising other servers, or sharing personal information about players. Keep politics and drama out of public chat.',
  },
  {
    title: 'Build With Care',
    body: 'Do not claim huge areas you will never use, wall off public resources, or leave floating eyesores and lag machines. Clean up abandoned builds when staff ask.',
  },
  {
    title: 'No Pay To Win Abuse',
    body: 'There is no server-run economy and no pay to win. Do not sell whitelist access, ranks, or in game advantages for real money.',
  },
  {
    title: 'Legendary Swords Stay Earned',
    body: 'Legendary swords are one of a kind world artifacts. Duplicating, spawning, or trading them through exploits leads to removal and a ban review.',
  },
  {
    title: 'Staff Decisions Are Final',
    body: 'Staff may warn, mute, temp ban, or permanently remove players to protect the world. Ban evasion or arguing in public chat extends the punishment. Appeal through a Discord ticket.',
  },
];

export default function NobleSmpRulesPage() {
  return (
    <div className={styles.page}>
      <NobleFonts />
      <SubTopbar />
      <div className={styles.topbarSpacer} aria-hidden="true" />

      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            SERVER RULES
          </div>
          <h1 className={`${styles.crestFont} ${styles.sectionTitle}`}>Play Fair. Keep It Legendary.</h1>
          <p className={styles.heroLede}>
            Noble SMP is small on purpose. These rules keep the world worth playing for everyone on the whitelist.
          </p>
        </section>

        <section className={styles.section} aria-label="Server Rules">
          <ol className={styles.rulesList}>
            {RULES.map((rule, i) => (
              <li key={rule.title} className={styles.ruleCard}>
                <span className={styles.ruleIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className={styles.ruleTitle}>{rule.title}</h2>
                  <p className={styles.ruleBody}>{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.closerActions}>
            <Link href="/noblesmp" className={styles.discordBtn}>
              Back To Noble SMP
            </Link>
            <a
              href="https://dsc.gg/noblesmp"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ip}
            >
              <span className={styles.ipLabel}>IP</span>
              noblesmp.mcsh.io
            </a>
          </div>
        </section>
      </div>

      <SubFooter />
    </div>
  );
}
