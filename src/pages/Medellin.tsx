import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import medellinImage from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg";
import logo from "@/assets/logo-santa-alejandria.png";

const medellinStructuredData = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Santa Alejandría Hotel Medellín",
  "description":
    "Hotel boutique en Medellín, la ciudad de la eterna primavera. Arquitectura moderna con toque colonial, habitaciones premium, spa y servicio personalizado.",
  "url": "https://santalejandriahotels.com/medellin",
  "logo": "https://santalejandriahotels.com/assets/logo-santa-alejandria.png",
  "image": "https://santalejandriahotels.com/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Carrera 43A #7-50, El Poblado",
    "addressLocality": "Medellín",
    "addressRegion": "Antioquia",
    "postalCode": "050010",
    "addressCountry": "CO",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 6.2087,
    "longitude": -75.5744,
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
    { "@type": "LocationFeatureSpecification", "name": "Spa", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Desayuno incluido", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Gimnasio", "value": true },
  ],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "availableLanguage": ["es", "en"],
  "containedInPlace": {
    "@type": "City",
    "name": "Medellín",
    "containedInPlace": {
      "@type": "Country",
      "name": "Colombia",
    },
  },
};

const medellinServices = [
  {
    icon: "🍳",
    title: { es: "Desayuno Included", en: "Breakfast Included" },
    description: { es: "Desayuno buffet con opciones locales e internacionales", en: "Buffet breakfast with local and international options" },
  },
  {
    icon: "🏊",
    title: { es: "Piscina Infinity", en: "Infinity Pool" },
    description: { es: "Piscina en la azotea con vista a la ciudad", en: "Rooftop pool with city views" },
  },
  {
    icon: "💆",
    title: { es: "Spa & Bienestar", en: "Spa & Wellness" },
    description: { es: "Tratamientos rejuvenecedores y masajes relajantes", en: "Rejuvenating treatments and relaxing massages" },
  },
  {
    icon: "🍽️",
    title: { es: "Restaurante Gourmet", en: "Gourmet Restaurant" },
    description: { es: "Cocina colombiana contemporánea con ingredientes locales", en: "Contemporary Colombian cuisine with local ingredients" },
  },
];

const Medellin = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF6]">
      <SEO
        title="Hotel Boutique en Medellín | Santa Alejandría Hotel"
        description="Hotel boutique en Medellín, la ciudad de la eterna primavera. Arquitectura moderna con toque colonial, spa, piscina infinity y servicio personalizado. Reserva ahora."
        canonical="https://santalejandriahotels.com/medellin"
        keywords="hotel boutique Medellín, hotel Medellín, hotel spa Medellín, hotel centro Medellín, hotel con piscina Medellín, alojamiento premium Medellín, hospedaje Antioquia"
        structuredData={medellinStructuredData}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Santa Alejandría" className="h-10" />
          </Link>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-[#FDFCF6] hover:text-highlight">
                Inicio
              </Button>
            </Link>
            <Link to="/cartagena">
              <Button variant="ghost" className="text-[#FDFCF6] hover:text-highlight">
                Cartagena
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={medellinImage}
            alt="Santa Alejandra Hotel Medellin"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        <div className="relative z-10 text-center text-[#FDFCF6] px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
            Santa Alejandría
          </h1>
          <p className="text-xl md:text-2xl font-light mb-2">Medellín</p>
          <p className="text-lg md:text-xl text-highlight">
            La ciudad de la eterna primavera
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">
            Experiencia Boutique en Medellín
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Ubicado en el exclusive barrio El Poblado, Santa Alejandría Medellín 
            combina la modernidad de la ciudad con la calidez de la arquitectura colonial 
            colombiana. Disfruta de vistas espectaculares, servicios premium y una 
            experiencia de hospedaje inolvidable en la ciudad de la eterna primavera.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card className="bg-primary text-[#FDFCF6]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-highlight">5★</p>
                <p className="text-sm">Categoría</p>
              </CardContent>
            </Card>
            <Card className="bg-primary text-[#FDFCF6]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-highlight">42</p>
                <p className="text-sm">Habitaciones</p>
              </CardContent>
            </Card>
            <Card className="bg-primary text-[#FDFCF6]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-highlight">2</p>
                <p className="text-sm">Restaurantes</p>
              </CardContent>
            </Card>
            <Card className="bg-primary text-[#FDFCF6]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-highlight">24/7</p>
                <p className="text-sm">Concierge</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-primary text-[#FDFCF6]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">
            Servicios Premium
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {medellinServices.map((service, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-[#FDFCF6]/5 hover:bg-[#FDFCF6]/10 transition-colors"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-serif mb-2">{service.title.es}</h3>
                <p className="text-sm text-[#FDFCF6]/80">{service.description.es}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-highlight text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">
            Reserva tu experiencia en Medellín
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Contáctanos directamente por WhatsApp para reservas y atención personalizada.
          </p>
          <a
            href="https://wa.me/573126915453?text=Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Medellín"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-[#FDFCF6] px-8 py-4 rounded-xl text-lg hover:bg-primary/90 transition-colors"
          >
            <span>📱</span>
            <span>Reservar por WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-[#FDFCF6] py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img src={logo} alt="Santa Alejandría" className="h-8" />
          </div>
          <p className="text-sm text-[#FDFCF6]/60">
            © 2026 Santa Alejandría Hotel. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Medellin;
