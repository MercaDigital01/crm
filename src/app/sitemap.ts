import type { MetadataRoute } from "next";

// Hardcoded to the temporary Vercel domain — update once the project has its
// own production domain (see public/robots.txt for the matching note).
const BASE_URL = "https://crm-git-dev-merca-digital.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/crm", "/terminos", "/privacidad", "/eliminar-datos"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
