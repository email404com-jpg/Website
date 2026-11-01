'use client';

import { useEffect, useRef, useState } from 'react';
import { NobleFonts, Spinner, SubFooter, SubTopbar, ToastStack, useToasts } from '../noblesmp-shared';
import styles from '../noblesmp.module.css';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const LAST_KEY = 'noblesmp_suggestion_last';
const HASH_KEY = 'noblesmp_suggestion_hash';

function hashText(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33 + input.charCodeAt(i)) >>> 0;
  }
  return String(h);
}

function PixelRocket() {
  return (
    <span className={styles.rocket} aria-hidden="true">
      <span className={styles.rocketBody} />
      <span className={styles.rocketWindow} />
      <span className={styles.rocketFinLeft} />
      <span className={styles.rocketFinRight} />
      <span className={styles.rocketFlame} />
      <span className={styles.rocketParticleOne} />
      <span className={styles.rocketParticleTwo} />
      <span className={styles.rocketParticleThree} />
    </span>
  );
}

export default function NobleSmpSuggestionsPage() {
  const { toasts, push, dismiss } = useToasts();
  const [username, setUsername] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [rocketKey, setRocketKey] = useState(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    try {
      reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduceMotion.current = false;
    }
    const tick = () => {
      try {
        const last = Number(window.localStorage.getItem(LAST_KEY) || 0);
        const left = Math.max(0, RATE_WINDOW_MS - (Date.now() - last));
        setCooldownLeft(left);
      } catch {
        setCooldownLeft(0);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cooldownLabel = cooldownLeft > 0 ? `${Math.ceil(cooldownLeft / 60000)} min` : '';

  const submit = async () => {
    const name = username.trim();
    const text = suggestion.trim();
    if (!name) {
      push('error', 'Enter your username first.');
      return;
    }
    if (text.length < 10) {
      push('error', 'Write a little more. Suggestions need at least 10 characters.');
      return;
    }
    if (text.length > 500) {
      push('error', 'Keep it under 500 characters so staff can read it fast.');
      return;
    }
    if (cooldownLeft > 0) {
      push('error', `Slow down. You can send the next suggestion in about ${cooldownLabel}.`);
      return;
    }
    setSubmitting(true);
    try {
      const fingerprint = hashText(`${name.toLowerCase()}|${text.toLowerCase()}`);
      try {
        if (window.localStorage.getItem(HASH_KEY) === fingerprint) {
          push('error', 'This looks like a duplicate of your last suggestion.');
          setSubmitting(false);
          return;
        }
      } catch {
        /* dedupe check is best effort */
      }
      const res = await fetch('/noblesmp/api/suggestions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: name, suggestion: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; retryAfterSeconds?: number };
      if (res.status === 429) {
        push('error', 'You already sent a suggestion recently. Please wait 10 minutes between ideas.');
        return;
      }
      if (!res.ok) {
        push('error', data.error || 'Suggestion failed. It was not sent. Please try again.');
        return;
      }
      try {
        window.localStorage.setItem(LAST_KEY, String(Date.now()));
        window.localStorage.setItem(HASH_KEY, fingerprint);
      } catch {
        /* persistence is best effort */
      }
      setSuggestion('');
      if (!reduceMotion.current) setRocketKey((k) => k + 1);
      push('success', 'Suggestion received. Thanks for helping Noble SMP grow.');
    } catch {
      push('error', 'Network error. Your suggestion was not sent. Try again in a moment.');
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
            SUGGESTION BOX
          </div>
          <h1 className={`${styles.crestFont} ${styles.sectionTitle}`}>Shape The Season.</h1>
          <p className={styles.heroLede}>One focused idea per message. Staff read everything sent through this box.</p>
        </section>

        <section className={styles.section} aria-label="Suggestion Form">
          <div className={styles.formCard}>
            <div>
              <label htmlFor="suggestion-username" className={styles.fieldLabel}>
                Username
              </label>
              <input
                id="suggestion-username"
                type="text"
                autoComplete="username"
                maxLength={32}
                placeholder="e.g. Steve_2026"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                className={styles.fieldInput}
              />
            </div>

            <div>
              <label htmlFor="suggestion-text" className={styles.fieldLabel}>
                Suggestion
              </label>
              <textarea
                id="suggestion-text"
                rows={5}
                maxLength={500}
                placeholder="What should change, and why would it make survival better?..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                disabled={submitting}
                className={styles.fieldArea}
              />
              <p className={styles.fieldHint}>{suggestion.trim().length}/500 characters. One suggestion every 10 minutes.</p>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={submitting || cooldownLeft > 0}
              className={styles.confirmBtn}
            >
              {submitting ? (
                <Spinner label="Sending..." />
              ) : cooldownLeft > 0 ? (
                `Wait ${cooldownLabel}`
              ) : (
                'Submit Suggestion'
              )}
            </button>
          </div>

          {rocketKey > 0 && (
            <div key={rocketKey} className={styles.rocketStage} aria-hidden="true">
              <PixelRocket />
            </div>
          )}
        </section>
      </div>

      <SubFooter />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
