import heroImage from "@/assets/pillow-bed.jpg";
import logo from "@/assets/logo-santa-alejandria.png";
import cartagenaImage from "@/assets/Que.png";
import medellinImage from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg";

const HeroSection = () => {
  const handleReservarCartagena = () => {
    window.open("https://wa.me/573126915453?text=Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Cartagena", "_blank");
  };

  const handleReservarMedellin = () => {
    window.open("https://wa.me/573126915453?text=Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Medellín", "_blank");
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Santa Alejandría Hotel - Interior colonial elegante"
          className="h-full w-full object-cover grayscale"
        />
        {/* Elegant overlay gradient - darker for better text legibility */}
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="-mt-16 mb-6 animate-fade-in">
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className="h-32 w-auto drop-shadow-lg md:h-48 lg:h-56"
          />
        </div>

        {/* Text Section */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl animate-fade-in-delay-2 mb-6 text-center md:text-left">
          <div className="flex-1 text-center md:text-right pr-0 md:pr-6 mb-4 md:mb-0">
            <p className="font-sans text-xl md:text-4xl font-light uppercase text-[#FDFCF6] leading-none">
              <span className="text-highlight">SITIO WEB EN</span><br />
              CONSTRUCCIÓN
            </p>
          </div>
          <div className="h-px md:h-12 w-1/2 md:w-px mx-auto bg-[#FDFCF6]/50"></div>
          <div className="flex-1 text-center md:text-left pl-0 md:pl-6">
            <p className="text-gotham text-lg md:text-2xl font-thin tracking-wide text-[#FDFCF6]/85 leading-none">
              <span className="text-highlight block md:inline mt-2 md:mt-6">Mientras tanto, puedes reservar</span> directamente con nosotros.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md animate-fade-in-delay-3 sm:flex-row sm:gap-8 sm:max-w-none sm:justify-center mt-8">
          <div
            onClick={handleReservarCartagena}
            className="relative w-full max-w-[720px] h-[100px] md:h-[300px] rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105"
          >
            <img
              src={cartagenaImage}
              alt="Cartagena"
              className="h-full w-full object-cover transform scale-110"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[#FDFCF6] text-xs md:text-sm text-gotham font-thin uppercase tracking-wide text-center"><span className="text-left ml-[-1.5rem] md:ml-[-5rem]">RESERVA AHORA EN</span></p>
              <p className="text-highlight text-2xl md:text-4xl text-gotham font-bold uppercase tracking-wide text-center">CARTAGENA</p>
            </div>
          </div>
          <div
            onClick={handleReservarMedellin}
            className="relative w-full max-w-[720px] h-[100px] md:h-[300px] rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105"
          >
            <img
              src={medellinImage}
              alt="Medellín"
              className="h-full w-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-[#D3D3D3]/80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-primary text-xs md:text-sm text-gotham font-thin uppercase tracking-wide text-center"><span className="text-left ml-[0rem] md:ml-[-2.8rem]">RESERVA AHORA EN</span></p>
              <p className="text-primary text-2xl md:text-4xl text-gotham font-bold uppercase tracking-wide text-center">MEDELLÍN</p>
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
