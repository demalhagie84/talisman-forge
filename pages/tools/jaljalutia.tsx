import type { GetServerSideProps, NextPage } from "next";
import { auth } from "../../auth";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { buildJaljalutia, type JaljalutiaResult } from "../../lib/talismanTemplates";

interface JaljalutiaPageProps {
  hasAccess: boolean;
  intention: string;
  result: JaljalutiaResult | null;
}

export const getServerSideProps: GetServerSideProps<JaljalutiaPageProps> = async ({ req, res, query }) => {
  const session = await auth(req as any, res as any);

  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { subscriptions: { select: { tier: true, status: true } } },
  });

  const subscription = user?.subscriptions?.[0];
  const hasAccess = subscription?.tier === "PRO" && subscription?.status === "ACTIVE";

  const intentionParam = query.intention;
  const intention = (Array.isArray(intentionParam) ? intentionParam[0] : intentionParam) || "clarity and steadfastness";

  return {
    props: {
      hasAccess,
      intention,
      result: hasAccess ? buildJaljalutia(intention) : null,
    },
  };
};

const JaljalutiaPage: NextPage<JaljalutiaPageProps> = ({ hasAccess, intention, result }) => {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem", background: "#f5f3ff", color: "#4c1d95" }}>
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
        <p style={{ margin: 0, color: "#7c3aed", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Spirit element tool
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.75rem 0" }}>Jaljalutia Chart</h1>
        <p style={{ lineHeight: 1.7 }}>
          A sequential numerological chart inspired by the layered-invocation jaljalutia tradition. This template
          is exclusive to Pro subscribers.
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
            <table style={{ width: "100%", marginTop: "1.5rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#6d28d9" }}>
                  <th style={{ padding: "0.5rem", borderBottom: "2px solid #ddd6fe" }}>Row</th>
                  <th style={{ padding: "0.5rem", borderBottom: "2px solid #ddd6fe" }}>Letter</th>
                  <th style={{ padding: "0.5rem", borderBottom: "2px solid #ddd6fe" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.row}>
                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #ede9fe" }}>{row.row}</td>
                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #ede9fe", textTransform: "capitalize" }}>
                      {row.letter}
                    </td>
                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #ede9fe" }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {hasAccess ? (
          <p style={{ fontSize: "0.9rem", color: "#6d28d9", marginTop: "1rem" }}>
            Generated from intention: &quot;{intention}&quot;
          </p>
        ) : null}
      </section>
    </main>
  );
};

export default JaljalutiaPage;
