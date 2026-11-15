import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JustGive — Give Freely. Feel Good. Repeat.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "72px", background: "linear-gradient(135deg, #fff5e8 0%, #e7f8f1 100%)", color: "#173c42", fontFamily: "sans-serif" }}>
      <div style={{ width: 690, display: "flex", flexDirection: "column", gap: 25 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 58, height: 58, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 19, background: "#b8f0df", color: "#087f8c", fontSize: 34 }}>♥</div>
          JustGive
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, letterSpacing: -3 }}>Give Freely.<br />Feel Good.<br />Repeat.</div>
        <div style={{ fontSize: 25, color: "#45666a" }}>A personal place for voluntary giving.</div>
      </div>
      <div style={{ position: "absolute", right: 84, top: 154, width: 330, height: 330, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "48% 52% 48% 52%", background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #b8f0df 58%, #ffb7a4 100%)", transform: "rotate(-10deg)" }}>
        <div style={{ width: 186, height: 186, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 55, background: "#fff5e8", color: "#ff8b78", fontSize: 100, transform: "rotate(10deg)" }}>♥</div>
      </div>
      <div style={{ position: "absolute", right: 54, top: 113, color: "#087f8c", fontSize: 44 }}>✦</div>
      <div style={{ position: "absolute", right: 375, bottom: 88, color: "#ff8b78", fontSize: 34 }}>✦</div>
    </div>,
    { ...size },
  );
}
