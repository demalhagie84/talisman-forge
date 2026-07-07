import React from "react";
import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        gap: "1rem",
      }}
    >
      <h1 style={{ color: "white", fontSize: "2.5rem" }}>Dashboard</h1>
      <p style={{ color: "#f0f0f0", fontSize: "1.1rem" }}>
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
      </p>
      <p style={{ color: "#f0f0f0", fontSize: "0.9rem" }}>
        Your talisman workspace is ready. More tools coming soon.
      </p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "white",
          color: "#667eea",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
