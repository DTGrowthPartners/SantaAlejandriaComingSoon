import { useEffect, useState } from "react";
import CityLoadingScreen from "@/components/CityLoadingScreen";
import MedellinNavbar from "@/components/medellin/MedellinNavbar";
import MedellinHero from "@/components/medellin/MedellinHero";
import MedellinAbout from "@/components/medellin/MedellinAbout";
import MedellinRooms from "@/components/medellin/MedellinRooms";
import MedellinExteriores from "@/components/medellin/MedellinExteriores";
import MedellinServices from "@/components/medellin/MedellinServices";
import MedellinLocation from "@/components/medellin/MedellinLocation";
import MedellinBookingCTA from "@/components/medellin/MedellinBookingCTA";
import MedellinWhatsAppButton from "@/components/medellin/MedellinWhatsAppButton";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const medellinStructuredData = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "Santa Alejandría Hotel Medellín",
  description:
    "Hotel en el sector Estadio de Medellín, la ciudad de la eterna primavera. Capacidad para 176 personas, jardines, espacios libres de humo, gimnasio y desayuno incluido.",
  url: "https://www.santalejandriahotels.com/medellin",
  logo: "https://www.santalejandriahotels.com/assets/logo-santa-alejandria.png",
  image:
    "https://www.santalejandriahotels.com/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "CRA 77C No 48 – 91, Sector Estadio",
    addressLocality: "Medellín",
    addressRegion: "Antioquia",
    postalCode: "050034",
    addressCountry: "CO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 6.2476,
    longitude: -75.5898,
  },
  telephone: "+57-305-309-3723",
  priceRange: "$$",
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "WiFi gratuito",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Aire acondicionado",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Gimnasio",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Desayuno incluido",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Apartaestudios",
      value: true,
    },
  ],
  checkinTime: "15:00",
  checkoutTime: "12:00",
  availableLanguage: ["es", "en"],
  numberOfRooms: 73,
  petsAllowed: false,
  containedInPlace: {
    "@type": "City",
    name: "Medellín",
    containedInPlace: {
      "@type": "Country",
      name: "Colombia",
    },
  },
};

const Medellin = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {showLoader && (
        <CityLoadingScreen variant="medellin" onFinish={() => setShowLoader(false)} />
      )}
      <SEO
        title="Santa Alejandría Hotel Medellín | Hotel Sector Estadio"
        description="Hotel en el sector Estadio de Medellín. 176 personas de capacidad, habitaciones con A/C o ventilador, apartaestudios, gimnasio, desayuno incluido. A 3 min del Metro Floresta."
        canonical="https://www.santalejandriahotels.com/medellin"
        keywords="hotel Medellín, hotel sector Estadio Medellín, hotel cerca metro Medellín, hotel con desayuno Medellín, apartaestudio Medellín, hospedaje Medellín Colombia, hotel cerca Atanasio Girardot"
        structuredData={medellinStructuredData}
      />
      <div className="medellin-theme bg-background text-foreground">
        <MedellinNavbar />
        <main>
          <MedellinHero />
          <MedellinAbout />
          <MedellinRooms />
          <MedellinExteriores />
          <MedellinServices />
          <MedellinLocation />
          <MedellinBookingCTA />
        </main>
        <MedellinWhatsAppButton />
      </div>
      <Footer />
    </div>
  );
};

export default Medellin;
