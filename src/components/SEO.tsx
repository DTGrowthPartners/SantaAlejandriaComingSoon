import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  structuredData?: object;
}

const BASE_URL = "https://www.santalejandriahotels.com";
const DEFAULT_IMAGE = `${BASE_URL}/assets/hero-santa-alejandria.jpg`;

const SEO = ({
  title,
  description,
  canonical = BASE_URL,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  keywords,
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes("Santa Alejandría")
    ? title
    : `${title} | Santa Alejandría Hotel`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_CO" />
      <meta property="og:site_name" content="Santa Alejandría Hotel" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Hreflang */}
      <link rel="alternate" hreflang="es" href={canonical} />
      <link
        rel="alternate"
        hreflang="en"
        href={`${canonical}${canonical.includes("?") ? "&" : "?"}lang=en`}
      />
      <link rel="alternate" hreflang="x-default" href={canonical} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
