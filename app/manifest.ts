import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenSesame",
    short_name: "OpenSesame",
    description: "Food-first dining decisions, ordering, booking, and rewards.",
    start_url: "/ai",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "fullscreen"],
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#FF6A00",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  };
}
