import medalloImage from "@/assets/Medallo.avif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";

const InformativeSection = () => {
  const [dataConsent, setDataConsent] = useState(false);
  const [howYouFoundUs, setHowYouFoundUs] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataConsent) {
      alert(t("informative", "alertConsent"));
      return;
    }

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Create formal message for WhatsApp
    const message = `¡Saludos!

He visitado su página web de Santa Alejandría Hotel y me encuentro muy interesado en conocer más detalles sobre sus servicios.

Datos de contacto:
*Nombre*: ${name}
*Email*: ${email}
*Teléfono*: ${phone}
*¿Cómo nos conoció?*: ${howYouFoundUs ? getHowYouFoundUsLabel(howYouFoundUs) : 'No especificado'}

Quedo atento a su respuesta.

Saludos cordiales.`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp URL with the message
    const whatsappUrl = `https://wa.me/573126915453?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const getHowYouFoundUsLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      'redes-sociales': t("informative", "redesSociales"),
      'google': t("informative", "google"),
      'recomendacion': t("informative", "recomendacion"),
      'otro-sitio-web': t("informative", "otroSitioWeb"),
      'publicidad': t("informative", "publicidad"),
      'evento': t("informative", "evento"),
      'otro': t("informative", "otro"),
    };
    return labels[value] || value;
  };

  return (
    <section className="relative min-h-screen flex items-center" style={{ backgroundImage: `url(${medalloImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-primary/80" />
      <div className="container relative z-10 w-full">
        <div className="mx-auto max-w-3xl text-center">
          {/* Decorative element */}
          <div className="mb-8 flex justify-center">
            <div className="h-px w-20 bg-highlight" />
          </div>

          <h2 className="mb-6 font-serif text-2xl font-medium text-primary-foreground md:text-3xl lg:text-4xl">
            {t("informative", "heading")}
          </h2>

          <p className="mb-8 font-sans text-base font-light leading-relaxed text-primary-foreground/85 md:text-lg">
            {t("informative", "subtitle")}
          </p>

          <p className="font-serif text-lg italic text-highlight md:text-xl">
            {t("informative", "sedesAbiertas")}
          </p>

          {/* Contact Form */}
          <div className="mt-12">
            <p className="mb-6 font-sans text-base font-light text-primary-foreground/85 md:text-lg">
              {t("informative", "formIntro")}
            </p>
            <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 bg-[#C9952F]/80 p-6 rounded-xl shadow-2xl">
              <div>
                <Label htmlFor="name" className="text-[#FDFCF6] mb-2 leading-relaxed">{t("informative", "nombre")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("informative", "placeholderNombre")}
                  required
                  className="bg-white border-2 border-white text-primary-foreground placeholder:text-gray-400 focus-visible:ring-0 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#FDFCF6] mb-2 leading-relaxed">{t("informative", "correo")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="bg-white border-2 border-white text-primary-foreground placeholder:text-gray-400 focus-visible:ring-0 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#FDFCF6] mb-2 leading-relaxed">{t("informative", "telefono")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  required
                  className="bg-white border-2 border-white text-primary-foreground placeholder:text-gray-400 focus-visible:ring-0 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="how-you-found-us" className="text-[#FDFCF6] mb-2 leading-relaxed">{t("informative", "comoNosConociste")}</Label>
                <Select value={howYouFoundUs} onValueChange={setHowYouFoundUs}>
                  <SelectTrigger className="bg-white border-2 border-white text-gray-700 focus-visible:ring-0 rounded-lg">
                    <SelectValue placeholder={t("informative", "seleccionaOpcion")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redes-sociales">{t("informative", "redesSociales")}</SelectItem>
                    <SelectItem value="google">{t("informative", "google")}</SelectItem>
                    <SelectItem value="recomendacion">{t("informative", "recomendacion")}</SelectItem>
                    <SelectItem value="otro-sitio-web">{t("informative", "otroSitioWeb")}</SelectItem>
                    <SelectItem value="publicidad">{t("informative", "publicidad")}</SelectItem>
                    <SelectItem value="evento">{t("informative", "evento")}</SelectItem>
                    <SelectItem value="otro">{t("informative", "otro")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="data-consent"
                  checked={dataConsent}
                  onCheckedChange={(checked) => setDataConsent(checked === true)}
                  className="border-white data-[state=checked]:bg-highlight data-[state=checked]:text-primary"
                />
                <Label htmlFor="data-consent" className="text-sm font-light text-primary-foreground/85 leading-relaxed">
                  {t("informative", "consentimiento")}
                </Label>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white rounded-xl transition-all duration-300">
                {t("informative", "enviar")}
              </Button>
            </form>
          </div>

          {/* Decorative element */}
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-highlight" />
              <div className="h-1.5 w-1.5 rounded-full bg-highlight" />
              <div className="h-1 w-1 rounded-full bg-highlight" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformativeSection;
