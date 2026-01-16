import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OnAir TMS",
    short_name: "OnAir TMS",
    description: "Platform training management",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/assets/icons/brand/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/icons/brand/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
