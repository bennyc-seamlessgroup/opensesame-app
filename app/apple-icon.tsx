import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff8a00 0%, #ff5a1f 100%)",
          color: "white",
          fontSize: 56,
          fontWeight: 700,
          borderRadius: 36,
        }}
      >
        OS
      </div>
    ),
    size
  );
}
