import { Instagram, Facebook, ArrowUpRight, MapPin, ScrollText, ShieldCheck, FileText, Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-santa-alejandria.png";
import fondoImage from "@/assets/Fondo LV.png";
import { useTranslation } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface FooterProps {
  variant?: "cartagena" | "medellin";
}

const socialLinks = {
  cartagena: {
    instagram: { url: "https://www.instagram.com/santaalejandriahotelctg/", label: "santaalejandriahotelctg" },
    facebook: { url: "https://www.facebook.com/SantaAlejandriaHotelCtg/", label: "Santa Alejandría Hotel Cartagena" },
    booking: { url: "https://www.booking.com/Share-k86Psb", label: "Booking.com" },
    expedia: { url: "https://expe.onelink.me/hnLd/4hpbhbph", label: "Expedia" },
  },
  medellin: {
    instagram: { url: "https://www.instagram.com/santaalejandriahotelmed/", label: "santaalejandriahotelmed" },
    facebook: { url: "https://www.facebook.com/santaalejandriahotelmed/", label: "Santa Alejandría Hotel Medellín" },
    booking: { url: "https://booking.com/hotel/co/a-amp-a-santa-alejandria-medellin.es.html?label=New_English_EN_CO_26767227745-8Pi8nSYrBsC68_fucp60dwS634117823889%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atidsa-162435870265%3Alp9074849%3Ali%3Adec%3Adm%3Aag26767227745%3Acmp394643665&sid=89042d90f21bcf1ab634723a67b9ec9b&gclid=Cj0KCQjwqPLOBhCiARIsAKRMPZql20ChJ-NJ-ojl6C0A0o-YSfLocoYDOBvMyWZ5Dht3p3EmHVn69lYaAn_IEALw_wcB&aid=318615&ucfs=1&arphpl=1&dest_id=-592318&dest_type=city&group_adults=2&req_adults=2&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&srpvid=44c2890029770275&srepoch=1776108549&from=searchresults", label: "Booking.com" },
    expedia: { url: "https://www.expedia.com/Medellin-Hotels-HOTEL-AA-SANTA-ALEJANDRIA.h109356349.Hotel-Information?chkin=2026-04-27&chkout=2026-04-28&x_pwa=1&rfrr=HSR&pwa_ts=1776108600444&referrerUrl=aHR0cHM6Ly93d3cuZXhwZWRpYS5jb20vSG90ZWwtU2VhcmNo&useRewards=false&rm1=a2&regionId=6140804&destination=Medell%C3%ADn%2C+Antioquia%2C+Colombia&destType=MARKET&neighborhoodId=553248635939577572&selected=109356349&latLong=6.246186%2C-75.57513&hotelName=HOTEL+A%26A+SANTA+ALEJANDRIA&sort=RECOMMENDED&top_dp=229500&top_cur=COP&gclid=Cj0KCQjwqPLOBhCiARIsAKRMPZoNBxuRUE1BZzkLoEeLVrQZz9dRdPZPuA3o3fU30duKs3yfSuHTWMUaAmXgEALw_wcB&semcid=CO.B.GOOGLE.BD-c-EN.HOTEL&semdtl=a118926885407.b1146596345360.g1kwd-376196459405.e1c.m1Cj0KCQjwqPLOBhCiARIsAKRMPZoNBxuRUE1BZzkLoEeLVrQZz9dRdPZPuA3o3fU30duKs3yfSuHTWMUaAmXgEALw_wcB.r18c99c8b6eb4628f88ed1e270b4d63a149b85406f5d084c4523e282678261c801.c1.j19074849.k1.d1720934574302.h1p.i1.l1.n1.o1.p1.q1.s1expedia+medellin.t1.x1.f1.u1.v1.w1&userIntent=&selectedRoomType=325688962&selectedRatePlan=399842154&categorySearch=any_option&searchId=245a621a-4edf-4648-a0e8-8f58afaef540", label: "Expedia" },
  },
};

const defaultLinks = socialLinks.cartagena;

const Footer = ({ variant }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const links = variant ? socialLinks[variant] : defaultLinks;

  return (
    <footer ref={ref} className="relative py-12 md:py-16" style={{ backgroundImage: `url(${fondoImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className={`mb-8 h-24 w-auto md:h-32 transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          />

          {/* Contact Icons */}
          <div className={`mb-8 flex items-center gap-6 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link
              to="/cartagena"
              className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Ver sede Cartagena"
            >
              <MapPin className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Cartagena</span>
            </Link>
            <div className="h-4 w-px bg-secondary-foreground/30" />
            <Link
              to="/medellin"
              className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Ver sede Medellín"
            >
              <MapPin className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Medellín</span>
            </Link>
          </div>

          {/* Social & Booking Links - only shown on sede pages */}
          {variant && (
            <div className={`mb-8 flex flex-wrap items-center justify-center gap-5 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <a
                href={links.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Instagram</span>
              </a>
              <div className="h-4 w-px bg-secondary-foreground/30" />
              <a
                href={links.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Facebook</span>
              </a>
              <div className="h-4 w-px bg-secondary-foreground/30" />
              <a
                href={links.booking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
                aria-label="Reserva en Booking.com"
              >
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Booking.com</span>
              </a>
              <div className="h-4 w-px bg-secondary-foreground/30" />
              <a
                href={links.expedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
                aria-label="Reserva en Expedia"
              >
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Expedia</span>
              </a>
            </div>
          )}

          {/* Legal links */}
          <div className={`mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 transition-all duration-700 delay-[350ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link
              to="/reglamento"
              className="group inline-flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Reglamento y Normas"
            >
              <ScrollText className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Reglamento</span>
            </Link>
            <div className="h-4 w-px bg-secondary-foreground/30" />
            <Link
              to="/politica-datos"
              className="group inline-flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Política de Tratamiento de Datos Personales"
            >
              <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Tratamiento de Datos</span>
            </Link>
            <div className="h-4 w-px bg-secondary-foreground/30" />
            <Link
              to="/terminos"
              className="group inline-flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Términos y Condiciones"
            >
              <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Términos y Condiciones</span>
            </Link>
            <div className="h-4 w-px bg-secondary-foreground/30" />
            <Link
              to="/cookies"
              className="group inline-flex items-center gap-2 font-sans text-sm text-secondary-foreground/80 transition-colors hover:text-highlight"
              aria-label="Política de Cookies"
            >
              <Cookie className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Cookies</span>
            </Link>
          </div>

          {/* Divider */}
          <div className={`mb-8 h-px bg-secondary-foreground/20 transition-all duration-700 delay-[400ms] ${
            isVisible ? "w-32 opacity-100" : "w-0 opacity-0"
          }`} />

          {/* Legal */}
          <p className={`font-sans text-xs font-light tracking-wide text-secondary-foreground/60 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
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
