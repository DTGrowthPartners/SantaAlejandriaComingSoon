import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";
import { Menu, MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import logo from "@/assets/logo-santa-alejandria.png";

const WHATSAPP_URL =
  "https://wa.me/573126915453?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Cartagena";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Historia", href: "#historia" },
  { label: "Habitaciones", href: "#habitaciones" },
  { label: "Servicios", href: "#servicios" },
  { label: "Ubicación", href: "#ubicacion" },
];

const CartagenaNavbar = () => {
  const { scrollY } = useScrollProgress();
  const [activeSection, setActiveSection] = useState("inicio");
  const [sheetOpen, setSheetOpen] = useState(false);
  const isScrolled = scrollY > 80;

  // Track active section
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        isScrolled
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src={logo}
            alt="Santa Alejandría"
            className={cn(
              "transition-all duration-300",
              isScrolled ? "h-8" : "h-10"
            )}
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 font-sans text-xs tracking-wide uppercase transition-all duration-300 rounded-full",
                activeSection === link.href.replace("#", "")
                  ? "text-highlight bg-highlight/10"
                  : "text-[#FDFCF6]/70 hover:text-[#FDFCF6]"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-xs font-medium text-white tracking-wide transition-all duration-300 hover:bg-accent/90 hover:scale-105"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Reservar
        </a>

        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="md:hidden p-2 text-[#FDFCF6]">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-primary border-primary w-72">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="mt-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "px-4 py-3 font-sans text-sm tracking-wide uppercase rounded-lg transition-colors",
                    activeSection === link.href.replace("#", "")
                      ? "text-highlight bg-highlight/10"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  )}
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-4 border-t border-primary-foreground/10 pt-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reservar Ahora
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default CartagenaNavbar;
