import Link from "next/link";
import { useSession } from "next-auth/react";

const highlights = [
  {
    title: "Secure workspace",
    description: "Every session is protected and routed through authenticated access.",
  },
  {
    title: "Intentional talismans",
    description: "Generate symbolic designs with structured numerology and ritual guidance.",
  },
  {
    title: "Production-ready foundation",
    description: "Built with TypeScript, Prisma, and GitHub OAuth for reliable deployment.",
  },
] as const;

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #0f172a 0%, #312e81 45%, #7c3aed 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "860px",
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "24px",
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
        }}
      >
        <p style={{ margin: 0, color: "#c4b5fd", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Islamic talisman generator SaaS
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0.75rem 0 1rem" }}>
          Talisman Forge
        </h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "680px", color: "#e2e8f0" }}>
          Create spiritually grounded talismans with a secure, polished experience. The platform is designed for dependable authentication, clear user flows, and a strong foundation for future premium features.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.75rem" }}>
          <Link
            href={isAuthenticated ? "/dashboard" : "/signin"}
            style={{
              padding: "0.85rem 1.25rem",
              backgroundColor: "#ffffff",
              color: "#4338ca",
              borderRadius: "999px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {isAuthenticated ? "Open dashboard" : "Get started"}
          </Link>
          {!isAuthenticated ? (
            <Link
              href="/signin"
              style={{
                padding: "0.85rem 1.25rem",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#f8fafc",
                borderRadius: "999px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginTop: "2rem",
          }}
        >
          {highlights.map((item) => (
            <article
              key={item.title}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "1rem",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
