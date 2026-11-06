import { Skeleton } from "@/components/skeleton";
import styles from "./noblesmp.module.css";

/**
 * Noble SMP loading state — the floating pill topbar + centred crest hero,
 * coloured with the sub-site's own panel/gold tokens (noblesmp.module.css).
 * Serves /noblesmp, /rules, /ranks and /suggestions (parent boundary).
 */
export default function NobleSmpLoading() {
  const panel = { background: "var(--panel)", border: "1px solid var(--panel-line)" } as const;
  return (
    <div role="status" aria-label="Loading" className={styles.page}>
      <div className={styles.topbarSpacer} />
      <div className={styles.topbar} aria-hidden="true">
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Skeleton style={{ width: 30, height: 30, borderRadius: 8, background: "var(--gold)", border: "none" }} />
          <Skeleton style={{ width: 116, height: 13, border: "none", background: "var(--panel-line)" }} />
        </span>
        <Skeleton style={{ width: 132, height: 36, borderRadius: 999, ...panel }} />
      </div>

      <div className={styles.shell} style={{ paddingTop: 56, paddingBottom: 96 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Skeleton style={{ width: 176, height: 12, border: "none", background: "var(--panel-line)" }} />
          <Skeleton style={{ width: "min(360px, 78vw)", height: "min(360px, 78vw)", marginTop: 40, ...panel, borderRadius: 4 }} />
          <Skeleton style={{ width: "min(86%, 30rem)", height: 52, marginTop: 48, border: "none", background: "var(--panel)" }} />
          <Skeleton style={{ width: "min(70%, 24rem)", height: 52, marginTop: 16, border: "none", background: "var(--panel)" }} />
          <Skeleton style={{ width: "min(80%, 34rem)", height: 16, marginTop: 36, border: "none", background: "var(--panel)" }} />
          <Skeleton style={{ width: "min(64%, 28rem)", height: 16, marginTop: 12, border: "none", background: "var(--panel)" }} />
        </div>
      </div>
    </div>
  );
}
