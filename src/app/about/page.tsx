import Link from "next/link";
import { SiteHeader, SiteFooter, Card, buttonStyles } from "@/components/ui";
import { StructuredData } from "@/components/structured-data";
import { platformDescription, platformQuestions } from "@/lib/answer-content";
import { publicPageMetadata, SITE_URL } from "@/lib/seo";

export const metadata = publicPageMetadata("/about", "About CritOrbit | Student Assignment Support in Malaysia", platformDescription);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <Link href="/" className="text-sm underline">Home</Link>
        <h1 className="mt-6 display-font text-5xl font-black">About CritOrbit</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8">{platformDescription}</p>
        <section className="mt-10">
          <h2 className="display-font text-3xl font-black">How a request works</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-6 leading-7">
            <li>Submit the task, marking criteria, attempted work, deadline and budget in a brief.</li>
            <li>Compare helper profiles and specialties, then select a suitable helper.</li>
            <li>Coordinate scope, helper availability, deliverables and payment with the CritOrbit admin.</li>
            <li>Track your request through your account dashboard.</li>
          </ol>
          <p className="mt-5 max-w-3xl leading-7">Scope, price and turnaround need to be confirmed for each request. Check your institution’s rules for outside assistance and retain responsibility for understanding and validating your own submission.</p>
        </section>
        <section className="mt-10" aria-labelledby="about-questions">
          <h2 id="about-questions" className="display-font text-3xl font-black">Common questions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {platformQuestions.slice(1).map(([question, answer]) => <Card key={question} className="bg-white"><h3 className="text-xl font-black">{question}</h3><p className="mt-3 text-sm leading-7">{answer}</p></Card>)}
          </div>
        </section>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/requirements" className={buttonStyles({ tone: "purple", size: "lg" })}>Submit a Brief</Link>
          <Link href="/assignment-help-malaysia" className={buttonStyles({ tone: "yellow", size: "lg" })}>Explore Assignment Support</Link>
        </div>
      </main>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "AboutPage", "@id": `${SITE_URL}/about#webpage`, url: `${SITE_URL}/about`, name: "About CritOrbit", description: platformDescription, inLanguage: "en", isPartOf: { "@id": `${SITE_URL}/#website` }, mainEntity: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "CritOrbit", url: `${SITE_URL}/`, description: platformDescription } }} />
      <SiteFooter />
    </div>
  );
}
