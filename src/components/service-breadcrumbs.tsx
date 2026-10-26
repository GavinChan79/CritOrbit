import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";

export function ServiceBreadcrumbs({ path, label }: { path: string; label: string }) {
  const items = [
    { name: "Home", path: "/" },
    ...(path === "/assignment-help-malaysia" ? [] : [{ name: "Assignment help", path: "/assignment-help-malaysia" }]),
    { name: label, path },
  ];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-4 text-sm md:px-6">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link className="underline underline-offset-4" href={item.path}>{item.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, SITE_URL).toString(),
        })),
      }} />
    </>
  );
}
