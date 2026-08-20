import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 34,
          background: "linear-gradient(135deg, #46178F 0%, #240B4D 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFA602",
          fontWeight: 900,
          borderRadius: "16px",
          border: "3px solid #FFA602",
          letterSpacing: "-2px",
        }}
      >
        C!
      </div>
    ),
    {
      ...size,
    }
  );
}
