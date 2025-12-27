import { useState } from "react";

const FILES = [
  {
    key: "hot.txt",
    label: "Hot",
    sub: "S3 Standard",
    desc: "Frequent access",
  },
  {
    key: "warm.txt",
    label: "Warm",
    sub: "S3 Standard-IA",
    desc: "Infrequent access",
  },
  {
    key: "cold.txt",
    label: "Cold",
    sub: "S3 Glacier",
    desc: "Archive storage",
  },
];

export default function Demo() {
  const [log, setLog] = useState([]);
  const [loadingKey, setLoadingKey] = useState(null);

  const addLog = (item) => setLog((l) => [...l, item]);

  const run = async (key) => {
    setLoadingKey(key);
    addLog({ type: "info", text: `Requesting ${key}...` });

    try {
      const res = await fetch(
        `/api/get-presigned?key=${encodeURIComponent(key)}`
      );
      const data = await res.json();

      if (!res.ok) {
        addLog({
          type: "error",
          text: `${key} FAILED`,
          meta: data?.message || data?.error || "Request failed",
        });
        return;
      }

      addLog({
        type: "success",
        text: `${key} SUCCESS`,
        meta: `${data.storageClass || "STANDARD"} — opened download in new tab`,
      });

      window.open(data.url, "_blank");
    } catch (e) {
      addLog({
        type: "error",
        text: `${key} FAILED`,
        meta: e?.message || "Unexpected error",
      });
    } finally {
      setLoadingKey(null);
    }
  };

  const clear = () => setLog([]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>S3 Storage Class Demo</h1>
          </div>
        </header>

        <div style={styles.grid}>
          {FILES.map((f) => (
            <div key={f.key} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div
                    style={{
                      ...styles.badge,
                      ...(f.label === "Hot"
                        ? styles.badgeHot
                        : f.label === "Warm"
                        ? styles.badgeWarm
                        : styles.badgeCold),
                    }}
                  >
                    {f.label}
                  </div>

                  <div style={styles.cardTitle}>{f.sub}</div>
                  <div style={styles.cardDesc}>{f.desc}</div>
                </div>
              </div>

              <div style={styles.smallNote}>
                File: <span style={styles.mono}>{f.key}</span>
              </div>

              {/* Button bottom-right */}
              <div style={styles.cardFooter}>
                <button
                  onClick={() => run(f.key)}
                  disabled={loadingKey === f.key}
                  style={{
                    ...styles.primaryBtn,
                    ...styles.testBtn,
                    ...(loadingKey === f.key ? styles.btnDisabled : null),
                  }}
                >
                  {loadingKey === f.key ? "Testing..." : "Test"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <section style={styles.logSection}>
          <div style={styles.logHeader}>
            <div style={styles.logTitle}>Live Log</div>

            <button onClick={clear} style={styles.clearLogBtn}>
              Clear log
            </button>
          </div>

          <div style={styles.logBox}>
            {log.length === 0 ? (
              <div style={styles.empty}>
                Click a test button to test Hot / Warm / Cold.
              </div>
            ) : (
              log.map((item, idx) => (
                <div key={idx} style={styles.logRow}>
                  <span
                    style={{
                      ...styles.dot,
                      ...(item.type === "success"
                        ? styles.dotSuccess
                        : item.type === "error"
                        ? styles.dotError
                        : styles.dotInfo),
                    }}
                  />
                  <div style={styles.logText}>
                    <div style={styles.logMain}>{item.text}</div>
                    {item.meta ? (
                      <div style={styles.logMeta}>{item.meta}</div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f8fb 0%, #ffffff 55%, #f7f8fb 100%)",
    padding: 24,
    color: "#0f172a",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 34,
    letterSpacing: -0.6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 2px 14px rgba(15, 23, 42, 0.06)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  badge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
  },

  // Hot = red, Warm = yellow, Cold = blue
  badgeHot: { background: "#fee2e2", color: "#991b1b" },
  badgeWarm: { background: "#fef3c7", color: "#92400e" },
  badgeCold: { background: "#dbeafe", color: "#1e40af" },

  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.35,
    maxWidth: 220,
  },
  smallNote: {
    marginTop: 14,
    fontSize: 12,
    color: "#64748b",
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    color: "#0f172a",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "auto",
  },

  primaryBtn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.10)",
    whiteSpace: "nowrap",
  },

  // Softer blue, distinct from Cold badge blue
  testBtn: { background: "#7c8ff6", color: "#ffffff" },

  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  logSection: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 2px 14px rgba(15, 23, 42, 0.06)",
  },
  logHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  logTitle: { fontSize: 14, fontWeight: 800 },

  clearLogBtn: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    color: "#0f172a",
    fontSize: 13,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
  },

  logBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  empty: { color: "#64748b", fontSize: 13 },
  logRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  logText: { flex: 1 },
  logMain: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  logMeta: { fontSize: 12, color: "#64748b", marginTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
    flex: "0 0 auto",
  },
  dotSuccess: { background: "#22c55e" },
  dotError: { background: "#ef4444" },
  dotInfo: { background: "#3b82f6" },
};
