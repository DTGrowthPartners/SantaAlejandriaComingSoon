import LegalLayout, { LegalSection } from "@/components/LegalLayout";

const PoliticaCookies = () => {
  return (
    <LegalLayout
      seoTitle="Política de Cookies"
      seoDescription="Política de Cookies del sitio web de Hotel Santa Alejandría — Inversiones Pandora 721 S.A.S. Información sobre tipos de cookies, finalidades y opciones de configuración."
      canonical="https://www.santalejandriahotels.com/cookies"
      keywords="política cookies, cookies hotel, privacidad web, Santa Alejandría"
      eyebrow="Privacidad web"
      title="Política de Cookies"
      subtitle="Cómo usamos cookies y tecnologías similares en este sitio"
      lastUpdated="16 de mayo de 2026"
    >
      <p className="mb-10 font-sans text-sm md:text-[15px] text-muted-foreground leading-relaxed">
        Esta Política de Cookies describe cómo <strong>INVERSIONES PANDORA 721 S.A.S.</strong>{" "}
        (NIT 900.796.740-2), responsable del sitio{" "}
        <a href="https://santalejandriahotels.com" className="text-primary underline hover:text-highlight">
          santalejandriahotels.com
        </a>
        , utiliza cookies y tecnologías de almacenamiento similares cuando usted visita o interactúa
        con nuestra página. Esta política complementa la{" "}
        <a href="/politica-datos" className="text-primary underline hover:text-highlight">
          Política de Tratamiento de Datos Personales
        </a>
        .
      </p>

      <LegalSection number="I" title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que un sitio web guarda en su navegador o
          dispositivo cuando usted lo visita. Permiten que el sitio recuerde acciones y preferencias
          (idioma, sesión iniciada, datos de navegación) durante un período determinado, para que no
          tenga que volver a configurarlas en cada visita.
        </p>
        <p>
          Junto a las cookies, los sitios web pueden utilizar otras tecnologías de almacenamiento
          local del navegador, como <em>localStorage</em> y <em>sessionStorage</em>, que cumplen una
          función similar.
        </p>
      </LegalSection>

      <LegalSection number="II" title="Tipos de cookies que utilizamos">
        <p>Clasificamos las cookies según su finalidad y duración:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Cookies estrictamente necesarias (técnicas):</strong> indispensables para el
            funcionamiento del Sitio y la prestación de los servicios solicitados (motor de reservas,
            sesión de usuario, preferencia de idioma). No requieren consentimiento.
          </li>
          <li>
            <strong>Cookies de preferencia:</strong> permiten recordar selecciones del usuario, como
            el idioma o si ya vio el video de bienvenida.
          </li>
          <li>
            <strong>Cookies analíticas:</strong> recopilan información agregada y anónima sobre el uso
            del Sitio (páginas visitadas, tiempo de permanencia, dispositivos) para mejorar la
            experiencia. Requieren consentimiento.
          </li>
          <li>
            <strong>Cookies publicitarias y de marketing:</strong> permiten mostrar publicidad
            relevante en otras plataformas (Google Ads, Meta Ads) basada en su navegación. Requieren
            consentimiento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="III" title="Cookies y tecnologías activas en este Sitio">
        <p>
          A la fecha de la última actualización de esta política, el Sitio utiliza únicamente
          tecnologías estrictamente necesarias:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm border-collapse mt-4">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 font-sans font-semibold">Nombre</th>
                <th className="text-left p-3 font-sans font-semibold">Tipo</th>
                <th className="text-left p-3 font-sans font-semibold">Finalidad</th>
                <th className="text-left p-3 font-sans font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-3 font-mono">sa_loader_seen</td>
                <td className="p-3">sessionStorage</td>
                <td className="p-3">Recordar si el usuario ya vio la pantalla de bienvenida durante la sesión.</td>
                <td className="p-3">Sesión</td>
              </tr>
              <tr>
                <td className="p-3 font-mono">i18n / idioma</td>
                <td className="p-3">localStorage</td>
                <td className="p-3">Recordar el idioma preferido (español/inglés) entre visitas.</td>
                <td className="p-3">Persistente</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Cuando habilitemos herramientas de analítica (Google Analytics) o pixeles publicitarios
          (Meta Pixel, Google Ads), esta tabla será actualizada y se le solicitará su consentimiento
          previo mediante un banner de cookies.
        </p>
      </LegalSection>

      <LegalSection number="IV" title="Cookies de terceros incorporadas por el motor de reservas">
        <p>
          El Sitio integra un motor de reservas y, dependiendo de la pasarela de pago seleccionada,
          puede cargar componentes de terceros que instalan sus propias cookies para procesar el pago
          de forma segura, prevenir fraude y mantener la sesión del usuario:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Bed24</strong> (channel manager / motor de reservas).</li>
          <li><strong>Pasarela de pago</strong> (Stripe, PayU, Wompi o Mercado Pago, según la opción habilitada).</li>
          <li><strong>Google Fonts</strong> (servicio de tipografías; no instala cookies de seguimiento).</li>
        </ul>
        <p>
          Estas cookies son gestionadas por los respectivos terceros bajo sus propias políticas de
          privacidad, las cuales recomendamos consultar.
        </p>
      </LegalSection>

      <LegalSection number="V" title="Base legal del tratamiento">
        <p>
          El uso de cookies estrictamente necesarias se ampara en el interés legítimo del Hotel para
          garantizar el correcto funcionamiento del Sitio. El resto de cookies (analíticas,
          publicitarias, de redes sociales) se utilizan únicamente con el consentimiento previo,
          expreso e informado del usuario, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
        </p>
      </LegalSection>

      <LegalSection number="VI" title="Cómo gestionar y revocar el consentimiento">
        <p>El usuario puede gestionar las cookies de las siguientes maneras:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>A través del banner de cookies:</strong> cuando esté disponible, aceptando,
            rechazando o configurando sus preferencias.
          </li>
          <li>
            <strong>Desde el navegador:</strong> la mayoría de los navegadores permiten ver, bloquear
            y eliminar cookies. Las guías oficiales se encuentran en:
            <ul className="mt-2 space-y-1 list-[circle] pl-5">
              <li><a className="text-primary underline hover:text-highlight" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a className="text-primary underline hover:text-highlight" href="https://support.mozilla.org/es/kb/proteccion-antirrastreo-mejorada-firefox-escritorio" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a className="text-primary underline hover:text-highlight" href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
              <li><a className="text-primary underline hover:text-highlight" href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </li>
        </ul>
        <p>
          Es importante tener en cuenta que el bloqueo de cookies estrictamente necesarias puede
          afectar el funcionamiento del Sitio (por ejemplo, impedir completar una reserva).
        </p>
      </LegalSection>

      <LegalSection number="VII" title="Transferencia internacional de datos">
        <p>
          Algunos proveedores de cookies de terceros (por ejemplo, Google, Meta o pasarelas de pago)
          pueden almacenar y procesar la información recolectada en servidores ubicados fuera de
          Colombia. Estos proveedores cuentan con políticas y mecanismos de seguridad acordes con
          estándares internacionales de protección de datos.
        </p>
      </LegalSection>

      <LegalSection number="VIII" title="Modificaciones de esta política">
        <p>
          Esta Política de Cookies puede ser modificada en cualquier momento para reflejar cambios
          legislativos, técnicos u operativos. La versión vigente será la publicada en este Sitio. Se
          recomienda revisarla periódicamente.
        </p>
      </LegalSection>

      <LegalSection number="IX" title="Contacto">
        <p>
          Si tiene dudas sobre esta Política de Cookies o desea ejercer sus derechos en relación con
          el tratamiento de sus datos personales, puede comunicarse al correo{" "}
          <strong>info@santalejandriahotels.com</strong> o consultar la{" "}
          <a href="/politica-datos" className="text-primary underline hover:text-highlight">
            Política de Tratamiento de Datos Personales
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
};

export default PoliticaCookies;
