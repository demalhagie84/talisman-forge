import type { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../lib/prisma";

interface FireSquarePageProps {
  hasAccess: boolean;
  usage: {
    generated: number;
    limit: number;
  };
}

const freeLimit = 3;

function buildFireSquare() {
  return [
    [2, 7, 6],
    [9, 5, 1],
    [4, 3, 8],
  ];
}

export const getServerSideProps: GetServerSideProps<FireSquarePageProps> = async ({ req, res }) => {
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
    select: { id: true, subscriptions: { select: { tier: true, status: true } } },
  });

  const subscription = user?.subscriptions?.[0];
  const isPremiumOrPro = subscription?.tier === "PREMIUM" || subscription?.tier === "PRO";
  const subscriptionActive = subscription?.status === "ACTIVE";
  const hasAccess = isPremiumOrPro && subscriptionActive;

  const currentUsage = await prisma.subscription.findFirst({
    where: { userId: user?.id },
    select: { talismansGenerated: true },
  });

  const usage = {
    generated: currentUsage?.talismansGenerated ?? 0,
    limit: hasAccess ? Number.POSITIVE_INFINITY : freeLimit,
  };

  if (!hasAccess && usage.generated >= freeLimit) {
    return {
      props: {
        hasAccess: false,
        usage,
      },
    };
  }

  return {
    props: {
      hasAccess: true,
      usage,
    },
  };
};

const FireSquarePage: NextPage<FireSquarePageProps> = ({ hasAccess, usage }) => {
  const fireSquare = buildFireSquare();
  return (
    <main style={{ minHeight: "100vh", padding: "2rem", background: "#fff7ed", color: "#7c2d12" }}>
      <section style={{ maxWidth: "840px", margin: "0 auto", background: "white", borderRadius: "24px", padding: "2rem", boxShadow: "0 15px 40px rgba(0,0,0,0.08)" }}>
        <p style={{ margin: 0, color: "#f97316", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Fire element tool
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.75rem 0" }}>Fire Square Generator</h1>
        <p style={{ lineHeight: 1.7 }}>
          This tool demonstrates a Fire-aligned magic square with a secure usage gate. Free users can generate up to {freeLimit} times per month; premium plans unlock expanded access.
        </p>

        {!hasAccess ? (
          <div style={{ marginTop: "1.25rem", padding: "1rem", borderRadius: "14px", background: "#ffedd5", color: "#9a2c00" }}>
            Free quota reached. You have used {usage.generated} of {usage.limit} monthly generations.
          </div>
        ) : null}

        <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {fireSquare.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                style={{
                  padding: "1.1rem",
                  borderRadius: "14px",
                  textAlign: "center",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  color: "white",
                }}
              >
                {value}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default FireSquarePage;
