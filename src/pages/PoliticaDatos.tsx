import LegalLayout, { LegalSection } from "@/components/LegalLayout";

const PoliticaDatos = () => {
  return (
    <LegalLayout
      seoTitle="Política de Tratamiento de Datos Personales"
      seoDescription="Política de Tratamiento de Datos Personales de Inversiones Pandora 721 S.A.S - Hotel Santa Alejandría, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013."
      canonical="https://www.santalejandriahotels.com/politica-datos"
      keywords="política datos personales, habeas data, ley 1581, Santa Alejandría, protección datos hotel"
      eyebrow="Habeas Data"
      title="Política de Tratamiento de Datos Personales"
      subtitle="Inversiones Pandora 721 S.A.S — Hotel Santa Alejandría"
      lastUpdated="16 de mayo de 2026"
    >
      <p className="mb-10 font-sans text-sm md:text-[15px] text-muted-foreground leading-relaxed">
        En cumplimiento de lo establecido en la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas
        concordantes que regulan la protección de datos personales en la República de Colombia,{" "}
        <strong>INVERSIONES PANDORA 721 S.A.S.</strong>, identificada con NIT 900.796.740-2 (en adelante,
        el "Hotel"), pone en conocimiento de los titulares de datos personales su Política de Tratamiento
        de Datos Personales, que será aplicada en todas las bases de datos administradas por el Hotel y
        por sus establecimientos de comercio Hotel Santa Alejandría, Apartahotel San Pedro de Alejandría
        y Hotel Santo Domingo de Alejandría.
      </p>

      <LegalSection number="I" title="Identificación del responsable del tratamiento">
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Razón social:</strong> INVERSIONES PANDORA 721 S.A.S.</li>
          <li><strong>NIT:</strong> 900.796.740-2</li>
          <li><strong>Domicilio principal:</strong> Calle 9 N° 48 N, Calle de la Cruz, Barrio Centro, Cartagena, Bolívar, Colombia</li>
          <li><strong>Teléfonos:</strong> 301 771 4083 — 312 687 9340 — +57 312 691 5453</li>
          <li><strong>Correo electrónico legal:</strong> hotelsantaalejandriactg@hotmail.com</li>
          <li><strong>Correo electrónico de contacto:</strong> info@santalejandriahotels.com</li>
          <li><strong>Página web:</strong> https://santalejandriahotels.com</li>
        </ul>
      </LegalSection>

      <LegalSection number="II" title="Definiciones">
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Autorización:</strong> consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de sus datos personales.</li>
          <li><strong>Base de datos:</strong> conjunto organizado de datos personales objeto de tratamiento.</li>
          <li><strong>Dato personal:</strong> cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
          <li><strong>Dato sensible:</strong> aquellos que afectan la intimidad del titular o cuyo uso indebido puede generar discriminación (origen racial, salud, datos biométricos, entre otros).</li>
          <li><strong>Encargado del tratamiento:</strong> persona natural o jurídica que realiza el tratamiento de datos personales por cuenta del responsable.</li>
          <li><strong>Responsable del tratamiento:</strong> INVERSIONES PANDORA 721 S.A.S.</li>
          <li><strong>Titular:</strong> persona natural cuyos datos personales son objeto de tratamiento.</li>
          <li><strong>Tratamiento:</strong> cualquier operación sobre datos personales, tales como recolección, almacenamiento, uso, circulación o supresión.</li>
        </ul>
      </LegalSection>

      <LegalSection number="III" title="Finalidades del tratamiento">
        <p>Los datos personales recolectados por el Hotel serán tratados con las siguientes finalidades:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Gestionar reservas, check-in, check-out, estadía y servicios contratados.</li>
          <li>Procesar pagos, emitir facturas electrónicas y cumplir obligaciones tributarias.</li>
          <li>Cumplir con el registro hotelero exigido por las autoridades de turismo y migración de Colombia.</li>
          <li>Atender solicitudes, peticiones, quejas, reclamos y sugerencias.</li>
          <li>Enviar comunicaciones comerciales, ofertas, promociones y boletines, siempre que el titular lo haya autorizado.</li>
          <li>Realizar estudios estadísticos, encuestas de satisfacción y mejora de servicios.</li>
          <li>Compartir datos con plataformas de reservas (OTAs como Booking.com, Expedia, entre otras), pasarelas de pago y proveedores tecnológicos estrictamente necesarios para la prestación del servicio.</li>
          <li>Cumplir obligaciones legales, contables, contractuales, regulatorias y de prevención de lavado de activos.</li>
          <li>Atender requerimientos de autoridades administrativas, judiciales o de control.</li>
        </ul>
      </LegalSection>

      <LegalSection number="IV" title="Datos personales recolectados">
        <p>Para las finalidades anteriores, el Hotel podrá recolectar las siguientes categorías de datos:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Identificación:</strong> nombre completo, documento de identidad o pasaporte, nacionalidad, fecha de nacimiento.</li>
          <li><strong>Contacto:</strong> dirección, teléfono, correo electrónico, país y ciudad de residencia.</li>
          <li><strong>Datos de reserva:</strong> fechas de estadía, número de acompañantes, preferencias de habitación.</li>
          <li><strong>Datos de pago:</strong> información de tarjeta de crédito/débito o cuenta bancaria, los cuales son procesados directamente por la pasarela de pago certificada PCI-DSS y no son almacenados en los servidores del Hotel.</li>
          <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y cookies (ver Política de Cookies).</li>
          <li><strong>Datos sensibles (opcionales):</strong> alergias alimentarias, condiciones de salud o de movilidad informadas voluntariamente para garantizar una mejor atención.</li>
        </ul>
        <p>
          El suministro de datos sensibles es facultativo. El titular no está obligado a autorizar su
          tratamiento; la negativa no impedirá la prestación del servicio principal de alojamiento.
        </p>
      </LegalSection>

      <LegalSection number="V" title="Derechos del titular">
        <p>Conforme al artículo 8 de la Ley 1581 de 2012, el titular de los datos personales tiene derecho a:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada al Hotel.</li>
          <li>Ser informado, previa solicitud, sobre el uso que se le ha dado a sus datos personales.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la normatividad vigente.</li>
          <li>Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
          <li>Acceder gratuitamente a sus datos personales que hayan sido objeto de tratamiento.</li>
        </ul>
      </LegalSection>

      <LegalSection number="VI" title="Procedimiento para ejercer los derechos">
        <p>
          Los titulares podrán ejercer sus derechos enviando una solicitud escrita al correo
          electrónico <strong>info@santalejandriahotels.com</strong> o a la dirección física del Hotel
          (Calle 9 N° 48 N, Calle de la Cruz, Centro, Cartagena), indicando:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Nombre completo y documento de identidad del titular.</li>
          <li>Descripción clara de los hechos que dan lugar a la solicitud.</li>
          <li>Datos de contacto y dirección para notificaciones.</li>
          <li>Documentos que soporten la solicitud, cuando aplique.</li>
        </ul>
        <p>
          <strong>Tiempos de respuesta:</strong> las consultas serán atendidas en un término máximo de
          diez (10) días hábiles y los reclamos en un término máximo de quince (15) días hábiles, ambos
          contados a partir del día siguiente a la fecha de recibo. Cuando no fuere posible atender la
          solicitud en estos plazos, se informará al interesado los motivos de la demora y la fecha en
          que se atenderá, la cual no podrá superar ocho (8) días hábiles adicionales.
        </p>
      </LegalSection>

      <LegalSection number="VII" title="Transferencia y transmisión de datos">
        <p>
          El Hotel podrá compartir datos personales con terceros, dentro y fuera de Colombia, cuando
          sea necesario para cumplir las finalidades aquí descritas. Estos terceros incluyen:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Plataformas de gestión de reservas (Channel Manager Bed24 y similares).</li>
          <li>Agencias de viaje en línea (OTAs): Booking.com, Expedia y otras donde el Hotel se encuentre publicado.</li>
          <li>Pasarelas de pago certificadas PCI-DSS.</li>
          <li>Proveedores de servicios tecnológicos, contables y de facturación electrónica.</li>
          <li>Autoridades administrativas, judiciales o tributarias cuando sea legalmente requerido.</li>
        </ul>
        <p>
          Cuando se realice transferencia internacional de datos, se garantizará que el receptor cumpla
          con estándares de seguridad y protección equivalentes a los exigidos por la normativa colombiana.
        </p>
      </LegalSection>

      <LegalSection number="VIII" title="Vigencia de las bases de datos">
        <p>
          Los datos personales serán conservados mientras subsista la relación comercial con el
          titular y posteriormente por el tiempo que la ley exija (en general, cinco a diez años para
          efectos contables y tributarios), o hasta que el titular solicite válidamente su supresión.
        </p>
      </LegalSection>

      <LegalSection number="IX" title="Seguridad de la información">
        <p>
          El Hotel adopta medidas técnicas, humanas y administrativas razonables para proteger los
          datos personales y evitar su adulteración, pérdida, consulta, uso o acceso no autorizado o
          fraudulento. Sin embargo, el Hotel no garantiza la seguridad absoluta de la información
          transmitida por internet, por lo que cualquier transmisión se realiza bajo el propio riesgo
          del titular.
        </p>
      </LegalSection>

      <LegalSection number="X" title="Modificaciones">
        <p>
          El Hotel se reserva el derecho de modificar la presente Política en cualquier momento. Las
          modificaciones serán informadas a través del sitio web{" "}
          <a href="https://santalejandriahotels.com" className="text-primary underline hover:text-highlight">
            santalejandriahotels.com
          </a>{" "}
          y se entenderán aceptadas con el uso continuado de los servicios después de su publicación.
        </p>
      </LegalSection>

      <LegalSection number="XI" title="Autoridad de control">
        <p>
          La Superintendencia de Industria y Comercio (SIC) es la autoridad colombiana encargada de
          velar por el cumplimiento de la normatividad en materia de protección de datos personales.
          El titular podrá presentar quejas o reclamos a través de la página{" "}
          <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-highlight">
            www.sic.gov.co
          </a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
};

export default PoliticaDatos;
