import React from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
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
      <h1 style={{ color: "white", fontSize: "2.5rem", marginBottom: "1.5rem" }}>
        Sign in to Talisman Forge
      </h1>
      <button
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        style={{
          padding: "12px 24px",
          fontSize: "1rem",
          backgroundColor: "#24292f",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Continue with GitHub
      </button>
    </div>
  );
}
