import { serviceAnswers } from "@/lib/answer-content";
import { SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";

export function ServiceAnswers({ slug }: { slug: string }) {
  const content = serviceAnswers[slug];
  if (!content) return null;
  const url = `${SITE_URL}/${slug}`;
  return (
    <section aria-labelledby={`${slug}-answer`} className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="retro-card bg-paper p-6 md:p-8">
        <h2 id={`${slug}-answer`} className="display-font text-3xl font-black">{content.name}</h2>
        <p className="mt-4 max-w-4xl text-base leading-8">{content.summary}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {content.questions.map(([question, answer]) => (
            <div key={question}>
              <h3 className="text-lg font-black">{question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{answer}</p>
            </div>
          ))}
        </div>
      </div>
      <StructuredData data={{
        "@context": "https://schema.org", "@type": "WebPage", "@id": `${url}#webpage`, url,
        name: content.name, description: content.summary, inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@type": "Service", "@id": `${url}#service`, name: content.name,
          description: content.summary, areaServed: { "@type": "Country", name: "Malaysia" },
          provider: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "CritOrbit", url: `${SITE_URL}/` } },
      }} />
    </section>
  );
}
