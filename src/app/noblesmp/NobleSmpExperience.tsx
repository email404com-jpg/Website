'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './noblesmp.module.css';

const MENU_LINKS = [
  { href: '/noblesmp/rules', name: 'Rules', desc: 'Fair play for the whole whitelist.' },
  { href: '/noblesmp/ranks', name: 'Ranks', desc: 'Verified, Media, and Custom.' },
  { href: '/noblesmp/suggestions', name: 'Suggestion Box', desc: 'Shape the next season.' },
];

const DISCORD_URL = 'https://dsc.gg/noblesmp';
const SERVER_IP = 'play.noblesmp.cyou';

const TAGLINE = ['Forged', 'in', 'amethyst.', 'Ruled', 'by', 'the', 'whitelist.'];

const FEATURES = [
  {
    name: 'Legendary Swords',
    desc: "One-of-a-kind, hand-forged blades woven into the world. Each has its own name and history. Find one, and it's yours to lose.",
  },
  {
    name: 'Whitelist Protected',
    desc: 'Every player is vetted before joining. Small community, standing builds, personal grudges.',
  },
  {
    name: 'Pure Survival',
    desc: 'Vanilla-first rules. No pay-to-win, no server-run economy. What you have, you built or you took.',
  },
];

const SPECS = [
  { label: 'Server Version', value: '1.16 - 1.21.x' },
  { label: 'Game Mode', value: 'Pure Survival' },
  { label: 'Access', value: 'Whitelist Only' },
  { label: 'Economy', value: 'No Pay To Win' },
];

// In-game capture photos live in public/ (next to noblesmp-logo.png).
// Expected paths: /image-01.jpg, /image-02.jpg, /image-03.jpg, /image-04.jpg
const GALLERY = [
  { src: '/image-01.jpg', name: 'image-01', alt: 'Noble SMP in game screenshot 01' },
  { src: '/image-02.jpg', name: 'image-02', alt: 'Noble SMP in game screenshot 02' },
  { src: '/image-03.jpg', name: 'image-03', alt: 'Noble SMP in game screenshot 03' },
  { src: '/image-04.jpg', name: 'image-04', alt: 'Noble SMP in game screenshot 04' },
];

/**
 * Tracks pointer position over `ref` and writes CSS custom properties
 * directly to the element style (no re-renders) so the tilt/sheen
 * stay smooth. Skips entirely when the user prefers reduced motion.
 */
function useTilt(ref: React.RefObject<HTMLElement | null>, strength = 8) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rx = (px - 0.5) * strength * 2;
      const ry = (0.5 - py) * strength * 2;
      el!.style.setProperty('--rx', `${rx}deg`);
      el!.style.setProperty('--ry', `${ry}deg`);
      el!.style.setProperty('--sx', `${px * 100}%`);
      el!.style.setProperty('--sy', `${py * 100}%`);
    }

    function handleLeave() {
      el!.style.setProperty('--rx', '0deg');
      el!.style.setProperty('--ry', '0deg');
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref, strength]);
}

function DiscordGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.3 5.4A17.5 17.5 0 0 0 15.9 4l-.3.6a13 13 0 0 1 3.7 1.4 15.6 15.6 0 0 0-13.8 0A13 13 0 0 1 9.2 4.6L8.9 4a17.4 17.4 0 0 0-4.4 1.4C1.7 9.6 1 13.7 1.3 17.7a17.6 17.6 0 0 0 5.3 2.7l.7-1.2a11.4 11.4 0 0 1-1.9-.9l.5-.4a12.7 12.7 0 0 0 11 0l.5.4a11.4 11.4 0 0 1-1.9.9l.7 1.2a17.5 17.5 0 0 0 5.3-2.7c.4-4.6-.7-8.7-2.9-12.3ZM8.7 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COPYRIGHT_YEAR = 2026;

function TiltFrame() {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, 10);

  return (
    <div className={styles.frameWrap}>
      <div ref={ref} className={styles.frame}>
        <span className={styles.cornerTL} aria-hidden="true" />
        <span className={styles.cornerTR} aria-hidden="true" />
        <span className={styles.cornerBL} aria-hidden="true" />
        <span className={styles.cornerBR} aria-hidden="true" />
        <div className={styles.frameInner}>
          <Image
            src="/noblesmp-logo.png"
            alt="Noble SMP crest - a gold crown over stone Noble SMP lettering with an amethyst sword, set against a purple Minecraft night sky"
            width={760}
            height={760}
            className={styles.frameImg}
            priority
          />
          <div className={styles.sheen} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function TiltFeatureCard({ name, desc }: { name: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, 4);

  return (
    <div ref={ref} className={styles.featureCard}>
      <h3 className={styles.featureName}>{name}</h3>
      <p className={styles.featureDesc}>{desc}</p>
      <div className={styles.sheen} aria-hidden="true" />
    </div>
  );
}

function GalleryCard({ src, name, alt }: { src: string; name: string; alt: string }) {
  return (
    <figure className={styles.galleryCard}>
      <div className={styles.galleryFrame}>
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className={styles.galleryImg}
          loading="lazy"
        />
      </div>
      <figcaption className={styles.galleryCaption}>{name}</figcaption>
    </figure>
  );
}

export default function NobleSmpExperience() {
  const glowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function handleMove(e: MouseEvent) {
      glowRef.current?.style.setProperty('--mx', `${e.clientX}px`);
      glowRef.current?.style.setProperty('--my', `${e.clientY}px`);
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  return (
    <div className={styles.page}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Space+Mono&family=Inter:wght@400;500;600&display=swap"
      />

      <div ref={glowRef} className={styles.ambientGlow} aria-hidden="true" />

      <header className={styles.topbar}>
        <a href="/" className={styles.mark}>
          <span className={styles.markChip}>JN</span>
          <span className={styles.markText}>JACK NETWORK</span>
        </a>
        <div className={styles.topbarActions}>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.discordBtn} ${styles.discordBtnSmall}`}
          >
            <span className={styles.discordIconChip}>
              <DiscordGlyph />
            </span>
            Join Discord
          </a>
          <div ref={menuRef} className={styles.menuWrap}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`${styles.discordBtn} ${styles.discordBtnSmall} ${styles.menuBtn}`}
            >
              Menu
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={menuOpen ? styles.menuChevronOpen : undefined}>
                <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {menuOpen && (
              <div role="menu" aria-label="Noble SMP menu" className={styles.menuPanel}>
                {MENU_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className={styles.menuItem}
                  >
                    <span className={styles.menuItemName}>{link.name}</span>
                    <span className={styles.menuItemDesc}>{link.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className={styles.topbarSpacer} aria-hidden="true" />

      <div className={styles.shell}>
        {/* ---------------- Hero ---------------- */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            WHITELIST PROTECTED
          </div>

          <TiltFrame />

          <h1 className={`${styles.crestFont} ${styles.tagline}`}>
            {TAGLINE.map((word, i) => (
              <span
                key={word + i}
                className={styles.taglineWord}
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                {word}
                {i < TAGLINE.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h1>

          <p className={styles.heroLede}>
            A pure survival world, closed to the public and opened by
            invitation. Every legendary sword on this server was earned by
            someone who&apos;s still playing.
          </p>
        </section>

        <div className={styles.ctaRow}>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordBtn}
          >
            <span className={styles.discordIconChip}>
              <DiscordGlyph />
            </span>
            Request Whitelist on Discord
            <ArrowGlyph className={styles.discordBtnArrow} />
          </a>
          <span className={styles.ip}>
            <span className={styles.ipLabel}>IP</span>
            {SERVER_IP}
          </span>
        </div>

        {/* ---------------- Specs ---------------- */}
        <section className={styles.section} aria-label="Server Specifications">
          <div className={styles.sectionHead}>
            <h2 className={`${styles.crestFont} ${styles.sectionTitle}`}>
              Server Specifications
            </h2>
            <p>The facts that matter before you request access.</p>
          </div>

          <dl className={styles.specGrid}>
            {SPECS.map((s) => (
              <div key={s.label} className={styles.specCard}>
                <dt className={styles.specLabel}>{s.label}</dt>
                <dd className={styles.specValue}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- Features ---------------- */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={`${styles.crestFont} ${styles.sectionTitle}`}>
              What sets it apart
            </h2>
            <p>Noble SMP is small on purpose. That&apos;s what keeps it worth playing.</p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <TiltFeatureCard key={f.name} name={f.name} desc={f.desc} />
            ))}
          </div>
        </section>

        {/* ---------------- Gallery ---------------- */}
        <section className={styles.section} aria-label="Inside The Server">
          <div className={styles.sectionHead}>
            <h2 className={`${styles.crestFont} ${styles.sectionTitle}`}>
              Inside The Server
            </h2>
            <p>Real views from the world. More captures land here as the season grows.</p>
          </div>

          <div className={styles.galleryGrid}>
            {GALLERY.map((g) => (
              <GalleryCard key={g.name} src={g.src} name={g.name} alt={g.alt} />
            ))}
          </div>
        </section>

        {/* ---------------- Closing CTA ---------------- */}
        <section className={styles.closer}>
          <h2 className={`${styles.crestFont} ${styles.closerTitle}`}>
            Get on the list.
          </h2>
          <p className={styles.closerLede}>
            Whitelist requests are handled in the Noble SMP Discord. Join,
            say hello, and you&apos;ll be pointed to the right channel.
          </p>
          <div className={styles.closerActions}>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.discordBtn}
            >
              <span className={styles.discordIconChip}>
                <DiscordGlyph />
              </span>
              Open Discord
              <ArrowGlyph className={styles.discordBtnArrow} />
            </a>
            <span className={styles.ip}>
              <span className={styles.ipLabel}>IP</span>
              {SERVER_IP}
            </span>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerRow}>
            <div className={styles.footerBrand}>
              <span className={styles.markChip}>JN</span>
              <span className={styles.markText}>Noble SMP · Jack Network</span>
            </div>
            <nav className={styles.footerLinks}>
              <a href="/">jacknetwork.in</a>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                Discord
              </a>
            </nav>
          </div>
          <p className={styles.footerLegal}>
            &copy; {COPYRIGHT_YEAR} Jackk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
