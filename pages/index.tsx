import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <h1 style={{ color: "white", fontSize: "3rem", marginBottom: "1rem" }}>
        Talisman Forge
      </h1>
      <p
        style={{
          color: "#f0f0f0",
          fontSize: "1.2rem",
          marginBottom: "2rem",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        Islamic talisman generator SaaS platform for creating spiritual and
        protective talismans
      </p>
      <Link
        href="/signin"
        style={{
          padding: "12px 24px",
          fontSize: "1rem",
          backgroundColor: "white",
          color: "#667eea",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        Get Started
      </Link>
      <div style={{ marginTop: "3rem", color: "#f0f0f0", fontSize: "0.9rem", textAlign: "center" }}>
        <p>Production-ready SaaS platform</p>
        <p>Sign in to access your dashboard</p>
      </div>
    </div>
  );
}
