import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignIn() {
  const router = useRouter();
  const { status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      void router.replace("/dashboard");
    }
  }, [router, status]);

    const handleGitHubSignIn = async () => {
          setErrorMessage(null);
              setIsSubmitting(true);

                  try {
                        await signIn("github", { callbackUrl: "/dashboard" });
                            } catch (error) {
                                  setErrorMessage(
                                          error instanceof Error ? error.message : "GitHub sign-in failed. Please try again."
                                                );
                                                      setIsSubmitting(false);
                                                          }
                                                            };
                                                            
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #111827 0%, #4338ca 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.25)",
        }}
      >
        <p style={{ margin: 0, color: "#c4b5fd", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Secure sign-in
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.75rem 0 0.5rem" }}>Sign in to Talisman Forge</h1>
        <p style={{ color: "#e2e8f0", lineHeight: 1.7 }}>
          Continue with GitHub to access your protected workspace and begin your ritual-ready experience.
        </p>

        {errorMessage ? (
          <p style={{ color: "#fda4af", marginTop: "1rem" }}>{errorMessage}</p>
        ) : null}

        <button
          onClick={handleGitHubSignIn}
          disabled={isSubmitting}
          style={{
            marginTop: "1.5rem",
            padding: "0.9rem 1.25rem",
            fontSize: "1rem",
            backgroundColor: "#24292f",
            color: "#ffffff",
            border: "none",
            borderRadius: "999px",
            cursor: isSubmitting ? "wait" : "pointer",
            fontWeight: 700,
          }}
        >
          {isSubmitting ? "Connecting…" : "Continue with GitHub"}
        </button>
      </section>
    </main>
  );
}
