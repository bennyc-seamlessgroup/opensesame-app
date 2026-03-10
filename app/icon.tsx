import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 112,
          fontWeight: 700,
          borderRadius: 96,
        }}
      >
        OS
      </div>
    ),
    size
  );
}
