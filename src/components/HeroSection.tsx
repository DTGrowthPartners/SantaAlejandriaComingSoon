import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import heroImage from "@/assets/pillow-bed.jpg";
import logo from "@/assets/logo-santa-alejandria.png";
import cartagenaImage from "@/assets/Que.png";
import medellinImage from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleReservarCartagena = () => {
    navigate("/cartagena");
  };

  const handleReservarMedellin = () => {
    window.open("https://wa.me/573126915453?text=Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Medellín", "_blank");
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
      </div>

      {/* Background Image with Parallax */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Santa Alejandría Hotel - Interior colonial elegante"
          className="h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Logo with floating animation */}
        <div className="-mt-16 mb-6 animate-fade-in">
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className="h-32 w-auto drop-shadow-lg md:h-48 lg:h-56 animate-float"
          />
        </div>

        {/* H1 for SEO */}
        <h1 className="animate-fade-in-delay-1 mb-4 font-serif text-2xl md:text-4xl lg:text-5xl font-medium tracking-wide text-[#FDFCF6]">
          {t("mainHero", "h1Title")}
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-delay-2 mb-8 font-sans text-lg md:text-2xl font-light tracking-wide text-[#FDFCF6]/85">
          {t("mainHero", "seleccionaSede")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md animate-fade-in-delay-3 sm:flex-row sm:gap-8 sm:max-w-none sm:justify-center">
          <div
            onClick={handleReservarCartagena}
            className="relative w-full max-w-[720px] h-[100px] md:h-[300px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1"
          >
            <img
              src={cartagenaImage}
              alt="Cartagena"
              className="h-full w-full object-cover transform scale-110 transition-transform duration-700 group-hover:scale-125"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[#FDFCF6] text-xs md:text-sm text-gotham font-thin uppercase tracking-wide text-center transition-all duration-300 group-hover:tracking-[0.3em]"><span className="text-left ml-[-1.5rem] md:ml-[-5rem]">{t("mainHero", "reservaAhoraEn")}</span></p>
              <p className="text-highlight text-2xl md:text-4xl text-gotham font-bold uppercase tracking-wide text-center transition-all duration-300 group-hover:tracking-[0.15em]">CARTAGENA</p>
            </div>
          </div>
          <div
            onClick={handleReservarMedellin}
            className="relative w-full max-w-[720px] h-[100px] md:h-[300px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1"
          >
            <img
              src={medellinImage}
              alt="Medellín"
              className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#D3D3D3]/80 transition-all duration-700 group-hover:bg-[#D3D3D3]/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-primary text-xs md:text-sm text-gotham font-thin uppercase tracking-wide text-center transition-all duration-300 group-hover:tracking-[0.3em]"><span className="text-left ml-[0rem] md:ml-[-2.8rem]">{t("mainHero", "reservaAhoraEn")}</span></p>
              <p className="text-primary text-2xl md:text-4xl text-gotham font-bold uppercase tracking-wide text-center transition-all duration-300 group-hover:tracking-[0.15em]">MEDELLÍN</p>
            </div>
          </div>
        </div>

        {/* White footer */}
        <div className="absolute bottom-0 left-0 w-full h-[32vh] bg-[#FDFCF6] z-[-1] hidden md:block"></div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-highlight/50 to-highlight" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
