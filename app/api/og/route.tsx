import { ImageResponse } from "@vercel/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Coconut Labs";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#ECE6D6",
          color: "#1A1611",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div style={{ color: "#4A5B49", fontFamily: "monospace", fontSize: 28, marginBottom: 34 }}>
          Coconut Labs
        </div>
        <div style={{ fontSize: 86, lineHeight: 0.95, maxWidth: 960, textAlign: "center" }}>{title}</div>
      </div>
    ),
    {
      height: 630,
      width: 1200,
    },
  );
}
