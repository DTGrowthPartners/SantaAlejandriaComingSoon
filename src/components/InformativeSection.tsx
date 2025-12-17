import medalloImage from "@/assets/Medallo.avif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const InformativeSection = () => {
  const [dataConsent, setDataConsent] = useState(false);
  const [howYouFoundUs, setHowYouFoundUs] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataConsent) {
      alert("Debes autorizar el tratamiento de datos para continuar.");
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
      'redes-sociales': 'Redes sociales',
      'google': 'Google',
      'recomendacion': 'Recomendación de un amigo',
      'otro-sitio-web': 'Otro sitio web',
      'publicidad': 'Publicidad',
      'evento': 'Evento o feria',
      'otro': 'Otro'
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
            Estamos construyendo nuestro nuevo sitio web
          </h2>

          <p className="mb-8 font-sans text-base font-light leading-relaxed text-primary-foreground/85 md:text-lg">
            Muy pronto podrás conocer habitaciones, servicios y experiencias en
            un solo lugar.
          </p>

          <p className="font-serif text-lg italic text-highlight md:text-xl">
            Por ahora, nuestras sedes están abiertas y listas para recibirte.
          </p>

          {/* Contact Form */}
          <div className="mt-12">
            <p className="mb-6 font-sans text-base font-light text-primary-foreground/85 md:text-lg">
              Déjanos tu contacto para que te enteres de nuestro lanzamiento, ofertas y promociones.
            </p>
            <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 bg-[#C9952F]/80 p-6 rounded-xl shadow-2xl">
              <div>
                <Label htmlFor="name" className="text-[#FDFCF6] mb-2 leading-relaxed">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  className="bg-white border-2 border-white text-primary-foreground placeholder:text-gray-400 focus-visible:ring-0 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#FDFCF6] mb-2 leading-relaxed">Correo electrónico</Label>
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
                <Label htmlFor="phone" className="text-[#FDFCF6] mb-2 leading-relaxed">Número de teléfono</Label>
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
                <Label htmlFor="how-you-found-us" className="text-[#FDFCF6] mb-2 leading-relaxed">¿Cómo nos conociste?</Label>
                <Select value={howYouFoundUs} onValueChange={setHowYouFoundUs}>
                  <SelectTrigger className="bg-white border-2 border-white text-gray-700 focus-visible:ring-0 rounded-lg">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redes-sociales">Redes sociales</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="recomendacion">Recomendación de un amigo</SelectItem>
                    <SelectItem value="otro-sitio-web">Otro sitio web</SelectItem>
                    <SelectItem value="publicidad">Publicidad</SelectItem>
                    <SelectItem value="evento">Evento o feria</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
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
                  Autorizo el tratamiento de mis datos personales conforme a la Política de Privacidad y Protección de Datos de Santa Alejandría Hotel para recibir información comercial, ofertas y comunicaciones relacionadas con sus servicios.
                </Label>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white rounded-xl transition-all duration-300">
                Enviar
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
