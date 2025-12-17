import HeroSection from "@/components/HeroSection";
import LocationsSection from "@/components/LocationsSection";
import InformativeSection from "@/components/InformativeSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <LocationsSection />
      <InformativeSection />
      <Footer />
    </main>
  );
};

export default Index;
