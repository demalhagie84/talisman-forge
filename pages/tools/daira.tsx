import type { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { buildDaira, type DairaResult } from "../../lib/talismanTemplates";

interface DairaPageProps {
  hasAccess: boolean;
  intention: string;
  result: DairaResult | null;
}

export const getServerSideProps: GetServerSideProps<DairaPageProps> = async ({ req, query }) => {
  const token = await getToken({ req: req as any, secret: process.env.AUTH_SECRET });

  if (!token?.email) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: token.email as string },
    select: { subscriptions: { select: { tier: true, status: true } } },
  });

  const subscription = user?.subscriptions?.[0];
  const hasAccess = subscription?.tier === "PRO" && subscription?.status === "ACTIVE";

  const intentionParam = query.intention;
  const intention = (Array.isArray(intentionParam) ? intentionParam[0] : intentionParam) || "protection and clarity";

  return {
    props: {
      hasAccess,
      intention,
      result: hasAccess ? buildDaira(intention) : null,
    },
  };
};

const DairaPage: NextPage<DairaPageProps> = ({ hasAccess, intention, result }) => {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem", background: "#eef2ff", color: "#312e81" }}>
      <section
        style={{
          maxWidth: "840px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ margin: 0, color: "#6366f1", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Air element tool
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.75rem 0" }}>Da&apos;ira Generator</h1>
        <p style={{ lineHeight: 1.7 }}>
          A circular arrangement of abjad-derived values, traditionally used as a protective enclosure. This
          template is exclusive to Pro subscribers.
        </p>

        {!hasAccess ? (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              borderRadius: "14px",
              background: "#fde68a",
              color: "#7c4a03",
            }}
          >
            This template requires an active Pro subscription.{" "}
            <Link href="/dashboard" style={{ color: "#7c4a03", fontWeight: 700 }}>
              Manage your plan
            </Link>
            .
          </div>
        ) : (
          result && (
            <div
              style={{
                position: "relative",
                width: "320px",
                height: "320px",
                margin: "2rem auto",
                borderRadius: "50%",
                border: "2px solid #a5b4fc",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                }}
              >
                {result.centerValue}
              </div>
              {result.segments.map((segment, index) => {
                const angle = (360 / result.ringSize) * index - 90;
                const radius = 140;
                const x = 160 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 160 + radius * Math.sin((angle * Math.PI) / 180);
                return (
                  <div
                    key={segment.position}
                    title={segment.label}
                    style={{
                      position: "absolute",
                      top: `${y}px`,
                      left: `${x}px`,
                      transform: "translate(-50%, -50%)",
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    {segment.value}
                  </div>
                );
              })}
            </div>
          )
        )}

        {hasAccess ? (
          <p style={{ fontSize: "0.9rem", color: "#4338ca" }}>Generated from intention: &quot;{intention}&quot;</p>
        ) : null}
      </section>
    </main>
  );
};

export default DairaPage;
