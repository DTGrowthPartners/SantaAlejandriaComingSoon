import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  AlertTriangle,
  Clock,
  Lightbulb,
  Home,
  UtensilsCrossed,
  DoorOpen,
  Sparkles,
  Shield,
  VolumeX,
  Wrench,
  ScrollText,
  PawPrint,
  Ban,
  Gavel,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowUp,
} from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import logo from "@/assets/logo-santa-alejandria.png";

interface ReglamentoSection {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: string[];
}

const sections: ReglamentoSection[] = [
  {
    id: "registro",
    number: "I",
    title: "Registro",
    icon: ClipboardCheck,
    color: "#2d7a4a",
    content: [
      "Todo huésped, tanto el individual como el de grupo deberá de llenar una hoja de registro de manera individual o bien por cada habitación, misma que le será proporcionada a su llegada en la recepción del Hotel.",
    ],
  },
  {
    id: "informacion",
    number: "II",
    title: "Obligación de Información por Parte del Huésped",
    icon: AlertTriangle,
    color: "#c67b30",
    content: [
      "Es obligación del huésped informar en la recepción del Hotel de padecimientos o enfermedades contagiosas, fallecimientos, infracciones o delitos que acontezcan en el establecimiento y sean de su conocimiento, a fin de que el Hotel pueda a su vez, tomar las medidas oportunas y dar cuenta inmediata a la autoridad cuando proceda.",
      "En caso de sentir quebranto de salud, el huésped debe reportarlo a la recepción para que se le solicite médico en casa. Este servicio estará cubierto por el seguro hotelero que se brinda, para no incurrir en gastos adicionales. En caso de no aceptación del mismo por parte del cliente en el momento de su check-in, el hotel no corre con los costos generados en el servicio, por ende, el huésped cubrirá el valor total.",
    ],
  },
  {
    id: "check-in-out",
    number: "III",
    title: "Registro del Huésped al Hotel",
    icon: Clock,
    color: "#2563eb",
    content: [
      "La hora de registro para entrar a la habitación será de las 3:00 PM en adelante, y la hora de salida deberá ser a las 12:00 M. Caso contrario se cobrará una noche adicional de estadía o equivalente de $20.000 pesos por hora.",
      "Recomendamos que a su llegada revise el inventario de la habitación ya que al momento de su retiro será revisado y en caso de faltantes o daños deberán ser cubiertos por el huésped por otro producto igual o en su defecto se cobrará a su precio.",
    ],
  },
  {
    id: "servicios",
    number: "IV",
    title: "Utilización de los Servicios",
    icon: Lightbulb,
    color: "#eab308",
    content: [
      "Los servicios (agua, electricidad, gas, etc.) prestados por el Hotel deberán utilizarse de conformidad con las normas de buena fe, sin que se entienda incluido en el precio el derroche o utilización desproporcionada de los mismos. Ayúdanos a mantener las tarifas bajas y accesibles, así como a cuidar el medio ambiente.",
      "Se pide a los huéspedes el uso moderado y racional de los muebles de la habitación, cuidando de ellos debidamente; de igual manera todo huésped al salir de la habitación, tiene la obligación de dejar cerradas las ventanas, puertas de entrada, llaves de agua y apagar luces.",
    ],
  },
  {
    id: "estancia",
    number: "V",
    title: "Estancia en el Hotel",
    icon: Home,
    color: "#7c3aed",
    content: [
      "Los huéspedes deben dejar en la recepción las llaves de su habitación cada vez que salgan del establecimiento. En caso de no estar de acuerdo y ocurre el extravío de la misma, debe cancelar el valor de $20.000 pesos.",
      "No podrán alojar en sus habitaciones a personas diferentes de las registradas en todo caso. Los visitantes de los clientes no podrán quedarse a pasar la noche. Tampoco podrán venir a disfrutar los servicios personas distintas de las que han realizado la contratación, ni se podrá utilizar el Hotel como lugar de realización de transacciones mercantiles.",
      "En ningún caso, el número de personas alojadas en cada habitación podrá ser mayor de la capacidad asignada por el Hotel a cada cuarto.",
    ],
  },
  {
    id: "alimentacion",
    number: "VI",
    title: "Alimentación",
    icon: UtensilsCrossed,
    color: "#dc2626",
    content: [
      "En el costo de la habitación no estará incluido el desayuno; este es un valor agregado del hotel. Todo desayuno adicional debe ser cancelado en la recepción del hotel antes de su entrega.",
    ],
  },
  {
    id: "acceso",
    number: "VII",
    title: "Acceso al Hotel",
    icon: DoorOpen,
    color: "#0891b2",
    content: [
      "El Hotel estará abierto al público las 24 horas. Si el huésped desea entrar o salir después de las 9:30 PM, deberá tocar el timbre de la puerta principal. La puerta de acceso al hotel después de las 9:30 PM será abierta y cerrada únicamente por personal del hotel.",
    ],
  },
  {
    id: "limpieza",
    number: "VIII",
    title: "Limpieza de las Habitaciones",
    icon: Sparkles,
    color: "#ec4899",
    content: [
      "La limpieza de habitaciones se realizará en horario de mañana, desde las 9:00 AM hasta las 2:00 PM. Los clientes que no pongan a disposición sus habitaciones durante esas horas no se les realizará el servicio a la habitación.",
      "Se informa a los huéspedes tanto individuales como grupales, que en este establecimiento se realiza un aseo sencillo diario y se cambian los blancos de la habitación cada tercera noche de estadía por el mismo cliente.",
    ],
  },
  {
    id: "seguridad",
    number: "IX",
    title: "Medidas de Seguridad",
    icon: Shield,
    color: "#059669",
    content: [
      "El huésped deberá guardar sus objetos de valor lejos del alcance de toda persona. Si tiene algún objeto de valor, el hotel no se hace responsable de pérdida o extravío de joyas y valores dejados en las habitaciones.",
      "El hotel pone a disposición una caja fuerte que el huésped puede solicitar en la recepción, con previo aviso por parte del huésped que cuenta con los objetos de valor.",
    ],
  },
  {
    id: "silencio",
    number: "X",
    title: "Silencio y Respeto al Resto de Clientes y Personal",
    icon: VolumeX,
    color: "#6366f1",
    content: [
      "Desde las 7:00 PM en todas las habitaciones debe moderarse el volumen acústico. Respete también el silencio nocturno en los pasillos y en las escaleras.",
      "En todo momento se pide a los huéspedes silencio absoluto. Se deberá evitar cualquier actuación molesta para el resto de los huéspedes del hotel.",
    ],
  },
  {
    id: "desperfectos",
    number: "XI - XII",
    title: "Desperfectos, Suciedad y Disposiciones Varias",
    icon: Wrench,
    color: "#78716c",
    content: [
      "En caso de dañar el inmueble o el mobiliario del hotel, así como de perder las llaves, es el causante quien paga por el daño ocasionado. Pagos de este tipo se realizan inmediatamente y en efectivo. En el caso de grupos, el responsable es el organizador y/o representante, por lo que será él quien debe adelantar el importe.",
      "Robos o daños intencionados serán denunciados inmediatamente a la policía. Está prohibido ejecutar cualquier acto que ocasione daños o perjuicios al Hotel o a los demás huéspedes, o conductas contrarias al decoro o al comportamiento social.",
    ],
  },
  {
    id: "mascotas",
    number: "XIII",
    title: "Mascotas",
    icon: PawPrint,
    color: "#d97706",
    content: [
      "De momento el hotel no cuenta con las condiciones mínimas para alojamiento con mascotas. Sin embargo, si el huésped desea compartir su estadía con su mascota deberá dejar un depósito en recepción en efectivo por valor de OCHENTA MIL PESOS ($80.000) pesos colombianos (o su equivalente en dólares). Este depósito se hará efectivo cuando se verifiquen daños o suciedad en la habitación; en caso contrario se le devolverá al momento de realizar el check-out.",
      "Nota 1: No está permitido que las mascotas puedan subirse a la cama de la habitación; debe tener su propia cama.\nNota 2: Las mascotas no deben ser agresivas.\nNota 3: La mascota no puede estar en zona de alimentación.\nNota 4: La mascota que ingrese al hotel debe estar completamente libre de pulgas y garrapatas, desparasitada con sus vacunas al día.\nNota 5: Los dueños deben supervisar sus mascotas mientras estén en zonas comunes y nunca deben ser dejadas solas.\nNota 6: Si tu mascota defeca u orina es tu responsabilidad asear la zona.\nNota 7: Si por alguna razón tu mascota agrede físicamente a algún huésped, es tu responsabilidad los posibles gastos a la persona o destrozos en el lugar.\nNota 8: El huésped debe colocar la precaución (Mascota dentro de) en el picaporte de la puerta.\nNota 9: La mascota no debe estar en la habitación al momento que la camarera ingrese a hacer la limpieza.",
    ],
  },
  {
    id: "prohibiciones",
    number: "XIV",
    title: "Prohibiciones",
    icon: Ban,
    color: "#dc2626",
    content: [
      "Está prohibido el consumo de drogas tóxicas, estupefacientes o sustancias psicotrópicas, dentro de cualquier área del hotel. De esta infracción se dará parte inmediatamente a las autoridades correspondientes.",
      "Queda prohibido alterar el orden o causar molestias a los demás usuarios dentro del establecimiento, usar la corriente eléctrica y los equipos mecánicos instalados en las habitaciones para otros fines que no sean a los que están destinados.",
    ],
  },
  {
    id: "incumplimiento",
    number: "XV",
    title: "Incumplimiento de las Normas del Hotel",
    icon: Gavel,
    color: "#1e293b",
    content: [
      "En caso de infracción de una o más de las condiciones y/o prohibiciones citadas anteriormente, el Hotel tiene el derecho de rescindir inmediatamente el contrato de alojamiento. El cliente queda igualmente obligado a pagar por todos los días de alojamiento fijados en la reserva.",
      "Quedan a salvo los derechos del establecimiento como de los huéspedes para denunciar ante las autoridades competentes los hechos que constituyan algún ilícito o que dieran lugar a responsabilidad por alguna de las partes en sus personas y bienes, siempre y cuando ocurran dentro del hotel.",
    ],
  },
];

const SectionCard = ({ section, index }: { section: ReglamentoSection; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = section.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : `opacity-0 translate-y-12`
      )}
      style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-500",
          isOpen
            ? "border-transparent shadow-xl shadow-black/5"
            : "border-border/50 hover:border-border hover:shadow-lg hover:shadow-black/5"
        )}
      >
        {/* Colored top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
          style={{ backgroundColor: section.color, opacity: isOpen ? 1 : 0.4 }}
        />

        {/* Header - clickable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-4 p-5 md:p-6 text-left bg-card hover:bg-card/80 transition-colors duration-300"
        >
          {/* Number badge */}
          <div
            className={cn(
              "flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
              isOpen ? "scale-110" : "scale-100 group-hover:scale-105"
            )}
            style={{
              backgroundColor: `${section.color}15`,
              color: section.color,
            }}
          >
            <Icon className="h-6 w-6 md:h-7 md:w-7" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <span
              className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: section.color }}
            >
              Artículo {section.number}
            </span>
            <h3 className="font-serif text-lg md:text-xl font-medium text-foreground leading-tight mt-0.5">
              {section.title}
            </h3>
          </div>

          {/* Toggle icon */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500",
              isOpen ? "bg-primary text-primary-foreground rotate-180" : "bg-muted text-muted-foreground"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {/* Content - collapsible */}
        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-5 md:px-6 pb-6 pt-0 space-y-4 ml-16 md:ml-[4.5rem]">
              {section.content.map((paragraph, i) => (
                <div key={i}>
                  {paragraph.includes("\n") ? (
                    <div className="space-y-2.5">
                      {paragraph.split("\n").map((line, j) => (
                        <div
                          key={j}
                          className={cn(
                            "flex items-start gap-2 font-sans text-sm text-muted-foreground leading-relaxed transition-all duration-300",
                            isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                          )}
                          style={{ transitionDelay: `${(i * 100) + (j * 50) + 200}ms` }}
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: section.color }}
                          />
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "font-sans text-sm text-muted-foreground leading-relaxed transition-all duration-500",
                        isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${i * 150 + 200}ms` }}
                    >
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reglamento = () => {
  const { scrollY } = useScrollProgress();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setShowScrollTop(scrollY > 600);
  }, [scrollY]);

  return (
    <div className="overflow-x-hidden">
      <SEO
        title="Reglamento y Normas | Santa Alejandría Hotel"
        description="Reglamento y normas del Hotel A&A Santa Alejandría SAS. Conoce nuestras políticas de check-in, check-out, mascotas, seguridad y convivencia."
        canonical="https://www.santalejandriahotels.com/reglamento"
        keywords="reglamento hotel Santa Alejandría, normas hotel, políticas hotel Colombia, check-in check-out hotel"
      />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-primary">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          {/* Floating geometric shapes */}
          <div
            className="absolute top-20 left-10 w-32 h-32 border border-highlight/10 rounded-full"
            style={{ transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)` }}
          />
          <div
            className="absolute bottom-20 right-16 w-48 h-48 border border-highlight/10 rounded-full"
            style={{ transform: `translateY(${-scrollY * 0.1}px) rotate(${-scrollY * 0.03}deg)` }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-20 h-20 border border-highlight/5 rotate-45"
            style={{ transform: `translateY(${scrollY * 0.25}px) rotate(${45 + scrollY * 0.08}deg)` }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Back button */}
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
              className="mx-auto h-16 md:h-20 mb-6 drop-shadow-lg"
            />
          </div>

          <div className="animate-fade-in-delay flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-highlight" />
            <ScrollText className="h-5 w-5 text-highlight" />
            <span className="h-px w-8 bg-highlight" />
          </div>

          <h1 className="animate-fade-in-delay font-serif text-4xl md:text-6xl font-medium text-[#FDFCF6] mb-4">
            Reglamento y Normas
          </h1>

          <p className="animate-fade-in-delay-2 font-sans text-sm md:text-base text-[#FDFCF6]/60 max-w-xl mx-auto leading-relaxed">
            Hotel A&A Santa Alejandría SAS
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-highlight/60" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Quick stats bar */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 animate-fade-in">
            {[
              { label: "Artículos", value: "15" },
              { label: "Check-in", value: "3:00 PM" },
              { label: "Check-out", value: "12:00 M" },
              { label: "Silencio", value: "7:00 PM" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <p className="font-serif text-2xl font-medium text-primary">{stat.value}</p>
                <p className="font-sans text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionCard key={section.id} section={section} index={index} />
            ))}
          </div>

          {/* Important notice at bottom */}
          <div className="mt-16 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-highlight/20 to-primary/20 rounded-2xl blur-sm" />
            <div className="relative rounded-2xl bg-primary p-8 md:p-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-highlight" />
                <AlertTriangle className="h-5 w-5 text-highlight" />
                <span className="h-px w-8 bg-highlight" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-medium text-[#FDFCF6] mb-4">
                Importante
              </h3>
              <p className="font-sans text-sm text-[#FDFCF6]/70 leading-relaxed max-w-2xl mx-auto">
                Se da por entendido que al momento de hacer efectiva la reserva, el cliente y/o huésped conoce y manifiesta expresa y tácitamente que acepta en su totalidad el presente reglamento interno del Hotel A&A Santa Alejandría SAS, estando conforme y de acuerdo con todos los puntos antes mencionados.
              </p>
              <p className="mt-4 font-sans text-sm text-[#FDFCF6]/70 leading-relaxed max-w-2xl mx-auto">
                El hotel se acoge a la ley designada por los entes competitivos y reguladores de los establecimientos que ofrecen servicio de alojamiento. Toda persona que desee ingresar o alojarse en un hotel debe realizar un registro en la recepción de todas las personas que permanecerán en la habitación. En la circunstancia que los huéspedes se ausenten por más de veinticuatro horas sin previo aviso a la administración, se podrá prescindir o suspender el hospedaje.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Scroll to top button */}
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

export default Reglamento;
