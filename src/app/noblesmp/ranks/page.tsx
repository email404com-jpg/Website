'use client';

import { useCallback, useEffect, useState } from 'react';
import { NobleFonts, Spinner, SubFooter, SubTopbar, ToastStack, isValidMinecraftName, useToasts } from '../noblesmp-shared';
import styles from '../noblesmp.module.css';

type RankKey = 'verified' | 'media' | 'custom';

type Session = { id: string; username: string; avatar: string | null } | null;

type Pending = { minecraft: string; at: number } | null;

const RANKS: { key: RankKey; name: string; blurb: string }[] = [
  { key: 'verified', name: 'Verified Rank', blurb: 'Link your Discord and claim your survival identity.' },
  { key: 'media', name: 'Media Rank', blurb: 'For creators sharing Noble SMP with the world.' },
  { key: 'custom', name: 'Custom Rank', blurb: 'Something personal, granted through staff review.' },
];

function rankFromHash(): RankKey {
  if (typeof window === 'undefined') return 'verified';
  const h = window.location.hash.replace('#', '');
  if (h === 'media' || h === 'custom' || h === 'verified') return h;
  return 'verified';
}

export default function NobleSmpRanksPage() {
  const { toasts, push, dismiss } = useToasts();
  const [rank, setRank] = useState<RankKey>('verified');
  const [session, setSession] = useState<Session>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionFailed, setSessionFailed] = useState(false);
  const [minecraft, setMinecraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    setRank(rankFromHash());
    try {
      const raw = window.localStorage.getItem('noblesmp_verified_status');
      if (raw) setPending(JSON.parse(raw) as Pending);
    } catch {
      setPending(null);
    }
  }, []);

  const pick = (key: RankKey) => {
    setRank(key);
    try {
      window.location.hash = key;
    } catch {
      /* hash sync is best effort */
    }
  };

  const checkSession = useCallback(async () => {
    setSessionChecked(false);
    setSessionFailed(false);
    try {
      const res = await fetch('/noblesmp/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as Session;
        setSession(data);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
      setSessionFailed(true);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const startLogin = () => {
    try {
      window.location.href = '/noblesmp/api/auth/discord?returnTo=%2Fnoblesmp%2Franks';
    } catch {
      push('error', 'Could not start Discord login. Please try again.');
    }
  };

  const submitVerified = async () => {
    const name = minecraft.trim();
    if (!name) {
      push('error', 'Enter your Minecraft in game username first.');
      return;
    }
    if (!isValidMinecraftName(name)) {
      push('error', 'That Minecraft username looks invalid. Use 3 to 16 letters, numbers, or underscores.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/noblesmp/api/verified-rank', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ minecraftUsername: name }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: string };
      if (res.status === 429) {
        push('error', 'Too many attempts. Please wait before trying again.');
        return;
      }
      if (res.status === 409) {
        push('error', 'This request already exists. Your rank request is pending review.');
        return;
      }
      if (!res.ok) {
        push('error', data.error || 'Submission failed. Please try again in a moment.');
        return;
      }
      const record = { minecraft: name, at: Date.now() };
      setPending(record);
      try {
        window.localStorage.setItem('noblesmp_verified_status', JSON.stringify(record));
      } catch {
        /* persistence is best effort */
      }
      push('success', 'Your Verified Rank request has been received and your rank will be loaded within 1 minute.');
    } catch {
      push('error', 'Network error. Your request was not submitted. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <NobleFonts />
      <SubTopbar />
      <div className={styles.topbarSpacer} aria-hidden="true" />

      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            NOBLE SMP RANKS
          </div>
          <h1 className={`${styles.crestFont} ${styles.sectionTitle}`}>Pick Your Rank.</h1>
          <p className={styles.heroLede}>Select a rank to see exactly what it unlocks and how to claim it.</p>
        </section>

        <section className={styles.section} aria-label="Rank Selection">
          <div className={styles.rankTabs} role="group" aria-label="Available ranks">
            {RANKS.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={rank === r.key}
                onClick={() => pick(r.key)}
                className={rank === r.key ? `${styles.rankTab} ${styles.rankTabActive}` : styles.rankTab}
              >
                <span className={styles.rankTabName}>{r.name}</span>
                <span className={styles.rankTabBlurb}>{r.blurb}</span>
              </button>
            ))}
          </div>

          {rank === 'verified' && (
            <div className={styles.rankPanel} aria-label="Verified Rank details">
              <h2 className={styles.rankPanelTitle}>Verified Rank</h2>
              <p className={styles.rankPanelLede}>
                For whitelist members playing pure survival. Verify once and your rank loads in game within about 1 minute.
              </p>
              <ul className={styles.rankList}>
                <li>Verified role in Discord</li>
                <li>Faster whitelist review on reset seasons</li>
                <li>Access to member only channels and events</li>
              </ul>

              {!sessionChecked && (
                <p className={styles.mutedLine}>
                  <Spinner label="Checking Discord session..." />
                </p>
              )}

              {sessionChecked && !session && (
                <div className={styles.authBox}>
                  <p className={styles.mutedLine}>Authenticate with your Discord account to continue. We never ask for passwords or tokens.</p>
                  <button type="button" onClick={startLogin} className={styles.discordBtn}>
                    Login With Discord
                  </button>
                  {sessionFailed && (
                    <p className={styles.errorLine}>Login service is temporarily unavailable. Please try again in a moment.</p>
                  )}
                </div>
              )}

              {sessionChecked && session && (
                <div className={styles.authBox}>
                  <p className={styles.mutedLine}>
                    Signed in as <strong>{session.username}</strong>. Requests are tied to this Discord account.
                  </p>
                  {pending ? (
                    <div className={styles.pendingBox} role="status">
                      <span className={styles.pendingDot} aria-hidden="true" />
                      <div>
                        <p className={styles.pendingTitle}>Request Submitted - Pending</p>
                        <p className={styles.pendingBody}>
                          {pending.minecraft} is queued. Your rank will be loaded within 1 minute.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.formGrid}>
                      <div>
                        <label htmlFor="minecraft-name" className={styles.fieldLabel}>
                          Minecraft In Game Username
                        </label>
                        <input
                          id="minecraft-name"
                          type="text"
                          autoComplete="off"
                          spellCheck={false}
                          maxLength={16}
                          placeholder="e.g. Steve_2026"
                          value={minecraft}
                          onChange={(e) => setMinecraft(e.target.value)}
                          disabled={submitting}
                          className={styles.fieldInput}
                        />
                        <p className={styles.fieldHint}>3 to 16 characters. Letters, numbers, and underscores only.</p>
                      </div>
                      <button
                        type="button"
                        onClick={submitVerified}
                        disabled={submitting || minecraft.trim().length === 0}
                        className={styles.confirmBtn}
                      >
                        {submitting ? <Spinner label="Confirming..." /> : 'Confirm'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {rank === 'media' && (
            <div className={styles.rankPanel} aria-label="Media Rank details">
              <h2 className={styles.rankPanelTitle}>Media Rank</h2>
              <p className={styles.rankPanelLede}>For creators filming, streaming, or posting Noble SMP stories.</p>
              <ol className={styles.stepsList}>
                <li>Join the Discord server.</li>
                <li>Create a ticket in the tickets channel.</li>
                <li>Request the Media Rank and share a link to your content.</li>
              </ol>
              <div className={styles.closerActions}>
                <a href="https://dsc.gg/noblesmp" target="_blank" rel="noopener noreferrer" className={styles.discordBtn}>
                  Join Discord To Apply
                </a>
              </div>
            </div>
          )}

          {rank === 'custom' && (
            <div className={styles.rankPanel} aria-label="Custom Rank details">
              <h2 className={styles.rankPanelTitle}>Custom Rank</h2>
              <p className={styles.rankPanelLede}>Something personal, reviewed case by case by staff.</p>
              <ol className={styles.stepsList}>
                <li>Join the Discord server.</li>
                <li>Create a ticket in the tickets channel.</li>
                <li>Request the Custom Rank and describe what you have in mind.</li>
              </ol>
              <div className={styles.closerActions}>
                <a href="https://dsc.gg/noblesmp" target="_blank" rel="noopener noreferrer" className={styles.discordBtn}>
                  Join Discord To Apply
                </a>
              </div>
            </div>
          )}
        </section>
      </div>

      <SubFooter />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
