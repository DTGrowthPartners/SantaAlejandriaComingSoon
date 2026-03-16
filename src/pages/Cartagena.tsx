import { useEffect } from "react";
import CartagenaNavbar from "@/components/cartagena/CartagenaNavbar";
import CartagenaHero from "@/components/cartagena/CartagenaHero";
import CartagenaAbout from "@/components/cartagena/CartagenaAbout";
import CartagenaRooms from "@/components/cartagena/CartagenaRooms";
import CartagenaServices from "@/components/cartagena/CartagenaServices";
import CartagenaLocation from "@/components/cartagena/CartagenaLocation";
import CartagenaBookingCTA from "@/components/cartagena/CartagenaBookingCTA";
import WhatsAppFloatingButton from "@/components/cartagena/WhatsAppFloatingButton";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const cartagenaStructuredData = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Santa Alejandría Hotel Cartagena",
  "description":
    "Hotel boutique en el Centro Histórico de Cartagena de Indias. Arquitectura colonial restaurada, habitaciones premium con aire acondicionado, piscina y servicio personalizado.",
  "url": "https://www.santalejandriahotels.com/cartagena",
  "logo": "https://www.santalejandriahotels.com/assets/logo-santa-alejandria.png",
  "image": "https://www.santalejandriahotels.com/assets/hero-santa-alejandria.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle de la Cruz N° 9-42, Barrio San Diego",
    "addressLocality": "Cartagena de Indias",
    "addressRegion": "Bolívar",
    "postalCode": "130001",
    "addressCountry": "CO",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.4236,
    "longitude": -75.5506,
  },
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
    { "@type": "LocationFeatureSpecification", "name": "Desayuno incluido", "value": true },
  ],
  "sameAs": [
    "https://www.booking.com/Share-k86Psb",
    "https://expe.onelink.me/hnLd/4hpbhbph",
  ],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "availableLanguage": ["es", "en"],
  "containedInPlace": {
    "@type": "City",
    "name": "Cartagena de Indias",
    "containedInPlace": {
      "@type": "Country",
      "name": "Colombia",
    },
  },
};

const Cartagena = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden">
      <SEO
        title="Santa Alejandría Hotel Cartagena | Hotel Boutique Centro Histórico"
        description="Hotel boutique en el corazón del Centro Histórico de Cartagena de Indias. 14 habitaciones coloniales, desayuno incluido, a pasos de las murallas. Reserva ahora."
        canonical="https://www.santalejandriahotels.com/cartagena"
        keywords="hotel boutique Cartagena, hotel centro histórico Cartagena, hotel colonial Cartagena de Indias, alojamiento premium Cartagena, hotel con piscina Cartagena, hospedaje Cartagena Colombia"
        structuredData={cartagenaStructuredData}
      />
      <CartagenaNavbar />
      <main>
        <CartagenaHero />
        <CartagenaAbout />
        <CartagenaRooms />
        <CartagenaServices />
        <CartagenaLocation />
        <CartagenaBookingCTA />
        <Footer />
      </main>
      <WhatsAppFloatingButton />
    </div>
  );
};

export default Cartagena;
