import { MessageCircle, Instagram, ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-santa-alejandria.png";
import fondoImage from "@/assets/Fondo LV.png";
import { useTranslation } from "@/i18n/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="relative py-12 md:py-16" style={{ backgroundImage: `url(${fondoImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className="mb-8 h-24 w-auto md:h-32"
          />

          {/* Contact Icons */}
          <div className="mb-8 flex items-center gap-6">
            <Link
              to="/cartagena"
              className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Ver sede Cartagena"
            >
              <MapPin className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Cartagena</span>
            </Link>
            <div className="h-4 w-px bg-secondary-foreground/30" />
            <a
              href="https://wa.me/573126915453"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Contactar por WhatsApp - Medellín"
            >
              <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Medellín</span>
            </a>
          </div>

          {/* Instagram */}
          <div className="mb-8">
            <a
              href="https://www.instagram.com/santaalejandriahotel/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Síguenos en Instagram"
            >
              <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>@santaalejandriahotel</span>
            </a>
          </div>

          {/* Divider */}
          <div className="mb-8 h-px w-32 bg-secondary-foreground/20" />

          {/* Legal */}
          <p className="font-sans text-xs font-light tracking-wide text-secondary-foreground/60">
            © {currentYear} {t("footer", "derechos")}{" "}
            <a
              href="https://dtgrowthpartners.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-highlight transition-colors"
            >
              DT Growth Partners
              <ArrowUpRight className="inline h-3 w-3 ml-1" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
