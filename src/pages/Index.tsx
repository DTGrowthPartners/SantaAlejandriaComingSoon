import HeroSection from "@/components/HeroSection";
import LocationsSection from "@/components/LocationsSection";
import InformativeSection from "@/components/InformativeSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Santa Alejandría Hotel",
  "description":
    "Hotel boutique premium con sedes en Cartagena y Medellín, Colombia. Experiencias únicas de hospedaje con arquitectura colonial y servicio personalizado.",
  "url": "https://www.santalejandriahotels.com",
  "logo": "https://www.santalejandriahotels.com/assets/logo-santa-alejandria.png",
  "image": "https://www.santalejandriahotels.com/assets/hero-santa-alejandria.jpg",
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "Calle de la Cruz N° 9-42, Barrio San Diego",
      "addressLocality": "Cartagena de Indias",
      "addressRegion": "Bolívar",
      "addressCountry": "CO",
    },
    {
      "@type": "PostalAddress",
      "addressLocality": "Medellín",
      "addressRegion": "Antioquia",
      "addressCountry": "CO",
    },
  ],
  "telephone": "+57-312-691-5453",
  "priceRange": "$$$",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "4",
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi gratuito", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire acondicionado", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Piscina", "value": true },
  ],
  "sameAs": [
    "https://www.booking.com/Share-k86Psb",
    "https://expe.onelink.me/hnLd/4hpbhbph",
  ],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "availableLanguage": ["es", "en"],
};

const Index = () => {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <SEO
        title="Santa Alejandría Hotel | Hotel Boutique en Cartagena y Medellín"
        description="Hotel boutique premium con sedes en Cartagena y Medellín, Colombia. Arquitectura colonial, servicio personalizado y experiencias únicas de hospedaje. Reserva ahora."
        canonical="https://www.santalejandriahotels.com/"
        keywords="hotel boutique Cartagena, hotel boutique Medellín, hotel colonial Colombia, hospedaje premium Cartagena, hotel centro histórico Cartagena, alojamiento boutique Colombia, Cartagena Hotels, hotel ciudad amurallada, hotel con piscina Cartagena, hotel patrimonio histórico Colombia"
        structuredData={homeStructuredData}
      />
      <HeroSection />
      <LocationsSection />
      <InformativeSection />
      <Footer />
    </main>
  );
};

export default Index;
