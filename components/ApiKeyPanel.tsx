import { useEffect, useState } from "react";

export default function ApiKeyPanel() {
  const [state, setState] = useState<"loading" | "ineligible" | "ready" | "error">("loading");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/account/api-key");
        if (cancelled) return;

        if (res.status === 403) {
          setState("ineligible");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }

        const data = (await res.json()) as { apiKey: string };
        setApiKey(data.apiKey);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return null;
  }

  if (state === "ineligible") {
    return (
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.06)",
          color: "#cbd5f5",
          fontSize: "0.9rem",
        }}
      >
        Upgrade to Pro to unlock the talisman API (key-authenticated <code>/api/v1/talismans</code> endpoints).
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ marginTop: "1.5rem", color: "#fca5a5", fontSize: "0.9rem" }}>
        Could not load your API key right now.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.06)",
        color: "#e2e8f0",
      }}
    >
      <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#c4b5fd" }}>Pro API key</p>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
        Use this as a Bearer token against <code>/api/v1/talismans</code> (POST to generate, GET to list).
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <code
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.35)",
            fontSize: "0.85rem",
            wordBreak: "break-all",
          }}
        >
          {revealed ? apiKey : "tf_pro_••••••••••••••••••••••••••••"}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            background: "#a78bfa",
            color: "#1e1b4b",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
      </div>
    </div>
  );
}
