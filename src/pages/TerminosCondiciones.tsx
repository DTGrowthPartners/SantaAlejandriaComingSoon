import LegalLayout, { LegalSection } from "@/components/LegalLayout";

const TerminosCondiciones = () => {
  return (
    <LegalLayout
      seoTitle="Términos y Condiciones"
      seoDescription="Términos y Condiciones de uso del sitio web y del sistema de reservas de Hotel Santa Alejandría — Inversiones Pandora 721 S.A.S."
      canonical="https://www.santalejandriahotels.com/terminos"
      keywords="términos y condiciones, reservas hotel, política reservas, Santa Alejandría, Cartagena"
      eyebrow="Términos legales"
      title="Términos y Condiciones"
      subtitle="Uso del sitio web y del sistema de reservas en línea"
      lastUpdated="16 de mayo de 2026"
    >
      <p className="mb-10 font-sans text-sm md:text-[15px] text-muted-foreground leading-relaxed">
        El presente documento regula el acceso, navegación y uso del sitio web{" "}
        <strong>santalejandriahotels.com</strong> (en adelante, el "Sitio") y la contratación de los
        servicios de alojamiento ofrecidos por <strong>INVERSIONES PANDORA 721 S.A.S.</strong>,
        identificada con NIT 900.796.740-2 (en adelante, el "Hotel"). El uso del Sitio implica la
        aceptación plena y sin reservas de estos Términos y Condiciones. Si el usuario no está de
        acuerdo con ellos, deberá abstenerse de utilizar el Sitio.
      </p>

      <LegalSection number="I" title="Información de la empresa">
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Razón social:</strong> INVERSIONES PANDORA 721 S.A.S.</li>
          <li><strong>NIT:</strong> 900.796.740-2</li>
          <li><strong>Matrícula mercantil:</strong> 33819212 — Cámara de Comercio de Cartagena</li>
          <li><strong>RNT Hotel Santa Alejandría:</strong> 38868 (vigente hasta 31/03/2027)</li>
          <li><strong>RNT Apartahotel San Pedro de Alejandría:</strong> 70605 (vigente hasta 31/03/2027)</li>
          <li><strong>Domicilio:</strong> Calle 9 N° 48 N, Calle de la Cruz, Centro, Cartagena, Bolívar</li>
          <li><strong>Contacto:</strong> info@santalejandriahotels.com — +57 312 691 5453</li>
        </ul>
      </LegalSection>

      <LegalSection number="II" title="Objeto del Sitio">
        <p>
          El Sitio tiene como finalidad informar a los usuarios sobre los servicios de alojamiento del
          Hotel y permitir la realización de reservas en línea con pago directo, sin intermediarios.
          La información publicada (tarifas, disponibilidad, descripciones, fotografías) es de
          carácter referencial y puede ser actualizada por el Hotel en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection number="III" title="Proceso de reserva">
        <ol className="space-y-2 list-decimal pl-5">
          <li>El usuario selecciona fechas, tipo de habitación y número de huéspedes en el motor de reservas.</li>
          <li>Diligencia los datos personales requeridos y acepta estos Términos y la Política de Tratamiento de Datos.</li>
          <li>Efectúa el pago a través de la pasarela habilitada en el Sitio.</li>
          <li>Una vez confirmado el pago, el sistema enviará un correo electrónico con la confirmación de la reserva y los datos de check-in.</li>
        </ol>
        <p>
          La reserva solo se considera confirmada cuando el Hotel ha recibido y validado el pago. En
          caso de pago rechazado, la reserva quedará automáticamente cancelada sin responsabilidad
          para el Hotel.
        </p>
      </LegalSection>

      <LegalSection number="IV" title="Precios e impuestos">
        <p>
          Todas las tarifas publicadas en el Sitio están expresadas en pesos colombianos (COP) e
          incluyen el <strong>Impuesto al Valor Agregado (IVA) del 19%</strong> aplicable a los
          servicios de alojamiento, conforme a la legislación tributaria colombiana vigente. Los
          huéspedes extranjeros podrán acogerse a la exención de IVA cuando cumplan los requisitos
          establecidos por la DIAN (presentación de pasaporte y sello de ingreso al país), caso en el
          cual el Hotel realizará el ajuste correspondiente al momento del check-in.
        </p>
        <p>
          Los servicios adicionales no incluidos en la tarifa de habitación (desayuno extra, lavandería,
          servicio a la habitación, traslados, entre otros) serán cobrados por separado conforme a la
          lista de precios vigente al momento de la prestación.
        </p>
      </LegalSection>

      <LegalSection number="V" title="Política de pagos">
        <p>
          El Hotel acepta los siguientes medios de pago a través de su pasarela habilitada: tarjeta de
          crédito, tarjeta débito, PSE (débito directo bancario) y demás métodos disponibles. Los datos
          de la tarjeta son procesados de manera segura por la pasarela de pago certificada PCI-DSS y
          no son almacenados en los servidores del Hotel.
        </p>
        <p>
          El cobro se realizará en el momento de la reserva. En caso de tarifas con cobro al check-in,
          el Hotel podrá solicitar una garantía o pre-autorización sobre la tarjeta del huésped.
        </p>
      </LegalSection>

      <LegalSection number="VI" title="Política de cancelación, modificación y reembolso">
        <p>
          Las condiciones específicas de cancelación, modificación y reembolso aplicables a cada
          reserva se mostrarán al usuario antes de finalizar el proceso de pago y serán incluidas en
          el correo de confirmación. Como regla general:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Tarifa flexible:</strong> permite cancelación gratuita hasta cierta antelación al check-in. Pasado ese plazo, se cobrará el importe correspondiente a una noche o el porcentaje señalado en la confirmación.</li>
          <li><strong>Tarifa no reembolsable:</strong> no admite cancelación ni cambio. El importe pagado no será devuelto, salvo causa de fuerza mayor debidamente acreditada.</li>
          <li><strong>No-show:</strong> la no presentación del huésped en la fecha de check-in sin aviso previo dará lugar al cobro del 100% del valor de la reserva.</li>
          <li><strong>Reembolsos:</strong> cuando proceda devolución, esta se realizará a través del mismo medio de pago utilizado, en un plazo máximo de treinta (30) días hábiles desde la aprobación.</li>
        </ul>
        <p>
          El Hotel se reserva el derecho de evaluar excepciones por causas de fuerza mayor o caso
          fortuito (emergencia médica con certificado, calamidad doméstica, restricciones gubernamentales,
          entre otros).
        </p>
      </LegalSection>

      <LegalSection number="VII" title="Check-in, check-out y reglamento interno">
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Check-in:</strong> a partir de las 3:00 PM.</li>
          <li><strong>Check-out:</strong> hasta las 12:00 M (mediodía). El late check-out se cobrará a razón de $20.000 COP por hora o como noche adicional, según disponibilidad.</li>
          <li>Para registrarse, el huésped deberá presentar documento de identidad o pasaporte vigente.</li>
          <li>El uso de las instalaciones se sujeta al{" "}
            <a href="/reglamento" className="text-primary underline hover:text-highlight">
              Reglamento Interno
            </a>{" "}
            del Hotel, que el huésped declara conocer y aceptar al momento de hacer la reserva.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="VIII" title="Obligaciones del usuario">
        <p>Al utilizar el Sitio y contratar servicios, el usuario se obliga a:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Proporcionar información veraz, completa y actualizada en el proceso de reserva.</li>
          <li>Conservar la confidencialidad de las credenciales de acceso a su reserva.</li>
          <li>No utilizar el Sitio para fines fraudulentos, ilegales o contrarios a la moral y al orden público.</li>
          <li>Respetar los derechos de propiedad intelectual del Hotel y de terceros.</li>
          <li>Cumplir el reglamento interno durante su estadía.</li>
        </ul>
      </LegalSection>

      <LegalSection number="IX" title="Propiedad intelectual">
        <p>
          Todos los contenidos del Sitio (textos, fotografías, logos, marcas, diseños, código fuente,
          bases de datos) son propiedad exclusiva de INVERSIONES PANDORA 721 S.A.S. o de sus
          licenciantes, y se encuentran protegidos por las leyes colombianas e internacionales sobre
          propiedad intelectual. Queda prohibida su reproducción, distribución, comunicación pública o
          transformación sin autorización previa y escrita del Hotel.
        </p>
      </LegalSection>

      <LegalSection number="X" title="Limitación de responsabilidad">
        <p>
          El Hotel realiza esfuerzos razonables para mantener el Sitio disponible y libre de errores,
          pero no garantiza la ausencia de interrupciones, demoras, defectos o fallos. El Hotel no
          será responsable por:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Daños derivados de la imposibilidad de acceder al Sitio o de las interrupciones del servicio.</li>
          <li>Pérdida de información o reservas causada por fallos del usuario en el proceso de pago.</li>
          <li>Información incorrecta proporcionada por el usuario en la reserva.</li>
          <li>Daños causados por terceros (pasarelas de pago, OTAs, proveedores de internet).</li>
          <li>Fuerza mayor o caso fortuito (desastres naturales, pandemias, conflictos armados, restricciones gubernamentales).</li>
        </ul>
      </LegalSection>

      <LegalSection number="XI" title="Protección al consumidor (Estatuto del Consumidor)">
        <p>
          Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor de Colombia), el huésped tiene
          derecho a recibir información veraz y suficiente sobre los servicios contratados. Las
          peticiones, quejas y reclamos podrán dirigirse al correo{" "}
          <strong>info@santalejandriahotels.com</strong>. El Hotel responderá dentro de los quince
          (15) días hábiles siguientes a la recepción del requerimiento.
        </p>
      </LegalSection>

      <LegalSection number="XII" title="Tratamiento de datos personales">
        <p>
          El tratamiento de los datos personales suministrados por el usuario se regirá por la{" "}
          <a href="/politica-datos" className="text-primary underline hover:text-highlight">
            Política de Tratamiento de Datos Personales
          </a>{" "}
          publicada en el Sitio, cuya aceptación es requisito para completar cualquier reserva.
        </p>
      </LegalSection>

      <LegalSection number="XIII" title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier
          controversia derivada de su interpretación o ejecución se someterá a la jurisdicción
          ordinaria de los jueces y tribunales de Cartagena, Bolívar, salvo que las normas imperativas
          de protección al consumidor dispongan otro fuero.
        </p>
      </LegalSection>

      <LegalSection number="XIV" title="Modificaciones">
        <p>
          El Hotel podrá modificar estos Términos y Condiciones en cualquier momento. La versión
          vigente será la publicada en el Sitio al momento de realizar la reserva. Se recomienda al
          usuario revisar este documento periódicamente.
        </p>
      </LegalSection>
    </LegalLayout>
  );
};

export default TerminosCondiciones;
