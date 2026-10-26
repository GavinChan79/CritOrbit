import type { Metadata } from "next";

// Keep the production origin independent of request hosts and preview deployments.
export const SITE_URL = "https://critorbit.com";
export const HOME_TITLE = "CritOrbit | Assignment Help for Malaysian Students";
export const HOME_DESCRIPTION =
  "Find assignment support in Malaysia with CritOrbit. Compare helper profiles for coding, reports, presentations and design, then submit your brief for matching.";

export function publicPageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "CritOrbit", type: "website", locale: "en_MY", images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "CritOrbit — Assignment support for Malaysian students" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/opengraph-image`] },
  };
}

export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: true },
};

export const servicePages = [
  { path: "/assignment-help-malaysia", label: "Assignment Help Malaysia" },
  { path: "/business-assignment-help-malaysia", label: "Business Assignment Help Malaysia" },
  { path: "/cheap-assignment-help-malaysia", label: "Cheap Assignment Help Malaysia" },
  { path: "/coding-assignment-help-malaysia", label: "Coding Assignment Help Malaysia" },
  { path: "/diploma-assignment-help-malaysia", label: "Diploma Assignment Help Malaysia" },
  { path: "/do-assignment-for-me-malaysia", label: "Do Assignment For Me Malaysia" },
  { path: "/engineering-assignment-help-malaysia", label: "Engineering Assignment Help Malaysia" },
  { path: "/interior-design-assignment-help-malaysia", label: "Interior Design Assignment Help Malaysia" },
  { path: "/last-minute-assignment-help-malaysia", label: "Last Minute Assignment Help Malaysia" },
  { path: "/programming-assignment-help-malaysia", label: "Programming Assignment Help Malaysia" },
  { path: "/university-assignment-help-kl", label: "University Assignment Help KL" },
  { path: "/urgent-assignment-help-malaysia", label: "Urgent Assignment Help Malaysia" },
] as const;
