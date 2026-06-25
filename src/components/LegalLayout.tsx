import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ChevronDown } from "lucide-react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import logo from "@/assets/logo-santa-alejandria.png";

interface LegalLayoutProps {
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  keywords?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalLayout = ({
  seoTitle,
  seoDescription,
  canonical,
  keywords,
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) => {
  const { scrollY } = useScrollProgress();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setShowScrollTop(scrollY > 600);
  }, [scrollY]);

  return (
    <div className="overflow-x-hidden">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        keywords={keywords}
      />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          <div
            className="absolute top-20 left-10 w-32 h-32 border border-highlight/10 rounded-full"
            style={{ transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)` }}
          />
          <div
            className="absolute bottom-20 right-16 w-48 h-48 border border-highlight/10 rounded-full"
            style={{ transform: `translateY(${-scrollY * 0.1}px) rotate(${-scrollY * 0.03}deg)` }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 font-sans text-xs text-[#FDFCF6]/60 uppercase tracking-wide hover:text-highlight transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="animate-fade-in">
            <img
              src={logo}
              alt="Santa Alejandría Hotel"
              className="mx-auto h-14 md:h-16 mb-6 drop-shadow-lg"
            />
          </div>

          <div className="animate-fade-in-delay flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-highlight" />
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-highlight">
              {eyebrow}
            </span>
            <span className="h-px w-8 bg-highlight" />
          </div>

          <h1 className="animate-fade-in-delay font-serif text-3xl md:text-5xl font-medium text-[#FDFCF6] mb-4">
            {title}
          </h1>

          {subtitle && (
            <p className="animate-fade-in-delay-2 font-sans text-sm md:text-base text-[#FDFCF6]/60 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          <p className="animate-fade-in-delay-2 mt-6 font-sans text-[11px] uppercase tracking-wider text-[#FDFCF6]/40">
            Última actualización: {lastUpdated}
          </p>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-highlight/60" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="bg-background py-16 md:py-24">
        <article className="container mx-auto px-6 max-w-3xl prose-legal">
          {children}
        </article>
      </main>

      <Footer />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
        aria-label="Volver arriba"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export const LegalSection = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) => (
  <section className="mb-10 md:mb-12">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
        {number}
      </span>
      <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground leading-tight">
        {title}
      </h2>
    </div>
    <div className="space-y-4 font-sans text-sm md:text-[15px] text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

export default LegalLayout;
