import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace("/signin");
    }
  }, [router, status]);

  const handleSignOut = async () => {
    setErrorMessage(null);
    setIsSigningOut(true);

    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      setErrorMessage("We could not sign you out right now. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <p style={{ color: "#334155" }}>Loading your workspace…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #111827 0%, #312e81 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(17, 24, 39, 0.86)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.3)",
        }}
      >
        <p style={{ margin: 0, color: "#c4b5fd", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Secure dashboard
        </p>
        <h1 style={{ fontSize: "2.25rem", margin: "0.75rem 0" }}>Dashboard</h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#e2e8f0" }}>
          Welcome back, {session.user.name ?? "friend"}. Your Talisman Forge workspace is ready for protected rituals and upcoming generation tools.
        </p>

        {errorMessage ? (
          <p style={{ color: "#fda4af", marginTop: "1rem" }}>{errorMessage}</p>
        ) : null}

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{
            marginTop: "1.5rem",
            padding: "0.9rem 1.25rem",
            fontSize: "1rem",
            backgroundColor: "#ffffff",
            color: "#4338ca",
            border: "none",
            borderRadius: "999px",
            cursor: isSigningOut ? "wait" : "pointer",
            fontWeight: 700,
          }}
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </section>
    </main>
  );
}
