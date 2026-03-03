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

const Cartagena = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
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
    </>
  );
};

export default Cartagena;
