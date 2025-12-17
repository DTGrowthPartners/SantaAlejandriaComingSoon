import { MessageCircle } from "lucide-react";

interface LocationCardProps {
  city: string;
  image: string;
  description: string;
  whatsappNumber: string;
  reversed?: boolean;
}

const LocationCard = ({
  city,
  image,
  description,
  whatsappNumber,
  reversed = false,
}: LocationCardProps) => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola, me gustaría hacer una reserva en Santa Alejandría – ${city}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div
      className={`grid gap-8 lg:grid-cols-2 lg:gap-12 ${
        reversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[2/1] lg:min-h-[300px] overflow-hidden lg:[direction:ltr]">
        <img
          src={image}
          alt={`Santa Alejandría – ${city}`}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 border-2 border-secondary"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-secondary/0 transition-colors duration-500 hover:bg-secondary/10" />
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-center p-4 lg:[direction:ltr] ${reversed ? '' : 'lg:ml-12'}`}>
        <span className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Sede
        </span>
        <h3 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
          Santa Alejandría – {city}
        </h3>
        <div className="mb-8 h-px w-16 bg-accent" />
        <p className="mb-8 max-w-md font-sans text-base font-light leading-relaxed text-muted-foreground">
          {description}
        </p>
        <button
          onClick={handleWhatsApp}
          className="group inline-flex w-fit items-center gap-3 border border-primary bg-transparent px-8 py-4 font-sans text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          <span>Reservar en WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
