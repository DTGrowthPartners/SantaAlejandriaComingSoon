export type Lang = "es" | "en";

const translations = {
  // ===== NAVBAR (Cartagena) =====
  nav: {
    inicio: { es: "Inicio", en: "Home" },
    historia: { es: "Historia", en: "History" },
    habitaciones: { es: "Habitaciones", en: "Rooms" },
    servicios: { es: "Servicios", en: "Services" },
    ubicacion: { es: "Ubicación", en: "Location" },
    reservar: { es: "Reservar", en: "Book Now" },
    reservarAhora: { es: "Reservar Ahora", en: "Book Now" },
  },

  // ===== HERO (Cartagena) =====
  cartagenaHero: {
    hotelBoutique: { es: "Hotel Boutique", en: "Boutique Hotel" },
    subtitle: { es: "Cartagena de Indias", en: "Cartagena de Indias" },
    tagline: {
      es: "Donde la historia colonial se encuentra con el lujo contemporáneo",
      en: "Where colonial history meets contemporary luxury",
    },
    reservar: { es: "Reservar Ahora", en: "Book Now" },
    explorar: { es: "Explorar", en: "Explore" },
  },

  // ===== ABOUT (Cartagena) =====
  cartagenaAbout: {
    label: { es: "Nuestra Historia", en: "Our History" },
    heading: {
      es: "Un Legado Colonial en el Corazón de Cartagena",
      en: "A Colonial Legacy in the Heart of Cartagena",
    },
    paragraph1: {
      es: "Santa Alejandría Hotel se encuentra situado en la tradicional calle de la Cruz del Barrio San Diego, en pleno corazón del Centro Histórico. Una tradicional calle de la ciudad nos presta una de sus antiguas casonas para hacer realidad el sueño de combinar las comodidades del siglo XXI con la magia que evocan las casonas viejas que la colonia española dejó en Cartagena.",
      en: "Santa Alejandría Hotel is located on the traditional Calle de la Cruz in the San Diego neighborhood, in the heart of the Historic Center. A traditional city street lends us one of its old colonial houses to make the dream of combining 21st century comforts with the magic evoked by the old houses left by the Spanish colony in Cartagena.",
    },
    paragraph2: {
      es: "Nuestro Hotel es una propuesta que combina el compromiso de atenderle como si estuviera en su hogar, con unos buenos estándares de servicio. Santa Alejandría está diseñada para que usted encuentre la comodidad, tranquilidad y la fina atención de estar como en su propia casa.",
      en: "Our Hotel combines the commitment to serve you as if you were at home, with high service standards. Santa Alejandría is designed so that you find the comfort, tranquility, and fine attention of being in your own home.",
    },
    badge14: { es: "14 Habitaciones", en: "14 Rooms" },
    badgeColonial: { es: "Estilo Colonial", en: "Colonial Style" },
    badgeCentro: { es: "Centro Histórico", en: "Historic Center" },
    badge24h: { es: "24 Horas", en: "24 Hours" },
    checkIn: { es: "Check-in", en: "Check-in" },
    checkOut: { es: "Check-out", en: "Check-out" },
  },

  // ===== ROOMS (Cartagena) =====
  cartagenaRooms: {
    label: { es: "Alojamiento", en: "Accommodation" },
    heading: { es: "Nuestras Habitaciones", en: "Our Rooms" },
    description: {
      es: "14 cómodas y bien dotadas habitaciones que conservan detalles del estilo colonial, grandes ventanas con barrotes, viejos baúles y los tradicionales farolitos que llenan de magia los espacios.",
      en: "14 comfortable and well-equipped rooms that preserve colonial style details, large barred windows, old trunks, and traditional lanterns that fill the spaces with magic.",
    },
    personaAdicional: { es: "Persona adicional", en: "Additional person" },
    ninos: { es: "Niños (3-10 años)", en: "Children (3-10 years)" },
    noche: { es: "/ noche", en: "/ night" },
    piso: { es: "Piso", en: "Floor" },
    cama: { es: "Cama", en: "Bed" },
    capacidad: { es: "Capacidad", en: "Capacity" },
    personas: { es: "personas", en: "guests" },
    disponibles: { es: "Disponibles", en: "Available" },
    hab: { es: "hab.", en: "rooms" },
    reservarHabitacion: { es: "Reservar esta Habitación", en: "Book this Room" },
    irAFoto: { es: "Ir a foto", en: "Go to photo" },
  },

  // Room names
  roomNames: {
    "doble-economica": { es: "Habitación Doble Económica", en: "Economy Double Room" },
    familiar: { es: "Habitación Familiar", en: "Family Room" },
    "doble-estandar": { es: "Habitación Doble Estándar", en: "Standard Double Room" },
    twins: { es: "Habitación Estándar Twins", en: "Standard Twin Room" },
    king: { es: "Habitación King", en: "King Room" },
    "king-superior": { es: "Habitación King Superior", en: "Superior King Room" },
  },

  roomShortNames: {
    "doble-economica": { es: "Doble Económica", en: "Economy Double" },
    familiar: { es: "Familiar", en: "Family" },
    "doble-estandar": { es: "Doble Estándar", en: "Standard Double" },
    twins: { es: "Twins", en: "Twin" },
    king: { es: "King", en: "King" },
    "king-superior": { es: "King Superior", en: "Superior King" },
  },

  roomDescriptions: {
    "doble-economica": {
      es: "Acogedora habitación con cama doble en el primer piso. Perfecta para quienes buscan confort a un precio accesible, conservando los detalles coloniales que caracterizan nuestro hotel.",
      en: "Cozy room with a double bed on the first floor. Perfect for those seeking comfort at an accessible price, preserving the colonial details that characterize our hotel.",
    },
    familiar: {
      es: "Espaciosa habitación con cama doble y cama sencilla, ideal para familias. Ubicada en el primer piso para mayor comodidad de acceso.",
      en: "Spacious room with a double bed and a single bed, ideal for families. Located on the first floor for easy access.",
    },
    "doble-estandar": {
      es: "Habitación con cama doble en el segundo piso, con grandes ventanas con barrotes coloniales que dejan entrar la luz y la brisa caribeña. Un equilibrio perfecto entre comodidad y encanto histórico.",
      en: "Room with a double bed on the second floor, featuring large colonial barred windows that let in the light and Caribbean breeze. A perfect balance between comfort and historic charm.",
    },
    twins: {
      es: "Habitación con dos camas sencillas en el segundo piso. Perfecta para amigos o colegas que viajan juntos y prefieren camas individuales.",
      en: "Room with two single beds on the second floor. Perfect for friends or colleagues traveling together who prefer individual beds.",
    },
    king: {
      es: "Amplia habitación con cama King Size en el segundo piso. El máximo confort con espacio generoso, detalles coloniales y todas las comodidades modernas.",
      en: "Spacious room with a King Size bed on the second floor. Maximum comfort with generous space, colonial details, and all modern amenities.",
    },
    "king-superior": {
      es: "Nuestra habitación más exclusiva. Ubicada en el tercer piso con vistas privilegiadas, cama King Size y cama sencilla auxiliar. La experiencia más completa de Santa Alejandría.",
      en: "Our most exclusive room. Located on the third floor with privileged views, King Size bed and auxiliary single bed. The most complete Santa Alejandría experience.",
    },
  },

  roomHighlights: {
    "Primer piso": { es: "Primer piso", en: "First floor" },
    "Tarifa más accesible": { es: "Tarifa más accesible", en: "Most affordable rate" },
    "Ideal para familias": { es: "Ideal para familias", en: "Ideal for families" },
    "2 camas": { es: "2 camas", en: "2 beds" },
    "Segundo piso": { es: "Segundo piso", en: "Second floor" },
    "Ventanas coloniales": { es: "Ventanas coloniales", en: "Colonial windows" },
    "Nuestra más popular": { es: "Nuestra más popular", en: "Our most popular" },
    "2 camas individuales": { es: "2 camas individuales", en: "2 individual beds" },
    "Cama King Size": { es: "Cama King Size", en: "King Size bed" },
    "Más espacio": { es: "Más espacio", en: "More space" },
    "Tercer piso": { es: "Tercer piso", en: "Third floor" },
    "Nuestra mejor habitación": { es: "Nuestra mejor habitación", en: "Our best room" },
    "Cama auxiliar incluida": { es: "Cama auxiliar incluida", en: "Extra bed included" },
  },

  roomAmenities: {
    "Aire acondicionado": { es: "Aire acondicionado", en: "Air conditioning" },
    'TV LED 32"': { es: 'TV LED 32"', en: '32" LED TV' },
    "Wi-Fi alta velocidad": { es: "Wi-Fi alta velocidad", en: "High-speed Wi-Fi" },
    "Caja de seguridad": { es: "Caja de seguridad", en: "Safety box" },
    Minibar: { es: "Minibar", en: "Minibar" },
    "Baño privado": { es: "Baño privado", en: "Private bathroom" },
    Teléfono: { es: "Teléfono", en: "Telephone" },
    "Ropa de cama premium": { es: "Ropa de cama premium", en: "Premium bed linen" },
  },

  roomBedTypes: {
    "Cama Doble": { es: "Cama Doble", en: "Double Bed" },
    "Cama Doble + Cama Sencilla": { es: "Cama Doble + Cama Sencilla", en: "Double + Single Bed" },
    "2 Camas Sencillas": { es: "2 Camas Sencillas", en: "2 Single Beds" },
    "Cama King Size": { es: "Cama King Size", en: "King Size Bed" },
    "Cama King Size + Cama Auxiliar": { es: "Cama King Size + Cama Auxiliar", en: "King Size + Extra Bed" },
  },

  roomFloors: {
    "1er Piso": { es: "1er Piso", en: "1st Floor" },
    "2do Piso": { es: "2do Piso", en: "2nd Floor" },
    "3er Piso": { es: "3er Piso", en: "3rd Floor" },
  },

  pricingNote: {
    es: "Todas las tarifas son por 1 noche de alojamiento con desayuno incluido, para 1 o 2 personas.",
    en: "All rates are per night with breakfast included, for 1 or 2 guests.",
  },

  // ===== SERVICES (Cartagena) =====
  cartagenaServices: {
    label: { es: "Comodidades", en: "Amenities" },
    heading: { es: "Servicios & Amenidades", en: "Services & Amenities" },
    includedLabel: { es: "Incluidos en la tarifa", en: "Included in the rate" },
    additionalLabel: { es: "Servicios Adicionales", en: "Additional Services" },
    roomAmenitiesLabel: { es: "En cada habitación", en: "In every room" },
  },

  serviceNames: {
    "Desayuno Americano": { es: "Desayuno Americano", en: "American Breakfast" },
    "Wi-Fi Alta Velocidad": { es: "Wi-Fi Alta Velocidad", en: "High-Speed Wi-Fi" },
    "TV Digital": { es: "TV Digital", en: "Digital TV" },
    "Llamadas Locales": { es: "Llamadas Locales", en: "Local Calls" },
    "Recepción 24 Horas": { es: "Recepción 24 Horas", en: "24-Hour Reception" },
    "Traslado Aeropuerto": { es: "Traslado Aeropuerto", en: "Airport Transfer" },
    "Asesoría Turística": { es: "Asesoría Turística", en: "Tourist Advisory" },
    Lavandería: { es: "Lavandería", en: "Laundry" },
  },

  serviceDescriptions: {
    "Servido a la mesa cada mañana": { es: "Servido a la mesa cada mañana", en: "Served at the table every morning" },
    "Conexión gratuita en todo el hotel": { es: "Conexión gratuita en todo el hotel", en: "Free connection throughout the hotel" },
    "Televisores LED de 32 pulgadas": { es: "Televisores LED de 32 pulgadas", en: '32-inch LED TVs' },
    "Llamadas locales sin costo": { es: "Llamadas locales sin costo", en: "Free local calls" },
    "Atención personalizada a cualquier hora": { es: "Atención personalizada a cualquier hora", en: "Personalized attention at any time" },
    "Servicio de transporte (costo adicional)": { es: "Servicio de transporte (costo adicional)", en: "Transportation service (additional cost)" },
    "Información y recomendaciones de la ciudad": { es: "Información y recomendaciones de la ciudad", en: "City information and recommendations" },
    "Servicio de lavandería (costo adicional)": { es: "Servicio de lavandería (costo adicional)", en: "Laundry service (additional cost)" },
  },

  amenityNames: {
    "Aire Acondicionado": { es: "Aire Acondicionado", en: "Air Conditioning" },
    'TV LED 32"': { es: 'TV LED 32"', en: '32" LED TV' },
    "Wi-Fi": { es: "Wi-Fi", en: "Wi-Fi" },
    "Caja Fuerte": { es: "Caja Fuerte", en: "Safe Box" },
    Minibar: { es: "Minibar", en: "Minibar" },
    "Baño Privado": { es: "Baño Privado", en: "Private Bathroom" },
    Teléfono: { es: "Teléfono", en: "Telephone" },
    "Agua Caliente": { es: "Agua Caliente", en: "Hot Water" },
  },

  // ===== LOCATION (Cartagena) =====
  cartagenaLocation: {
    label: { es: "Cómo Llegar", en: "How to Get Here" },
    heading: { es: "Encuéntranos", en: "Find Us" },
    direccion: { es: "Dirección", en: "Address" },
    telefono: { es: "Teléfono", en: "Phone" },
    email: { es: "Email", en: "Email" },
    horario: { es: "Horario", en: "Hours" },
    servicio24h: { es: "Servicio 24 horas", en: "24-hour service" },
    reviewsLabel: { es: "Lo que dicen nuestros huéspedes", en: "What our guests say" },
  },

  // ===== BOOKING CTA (Cartagena) =====
  cartagenaBookingCTA: {
    heading1: { es: "Vive la experiencia", en: "Live the experience" },
    heading2: { es: "Santa Alejandría", en: "Santa Alejandría" },
    subtitle: {
      es: "14 habitaciones de encanto colonial en el corazón de Cartagena de Indias. Nos hemos propuesto lograr que su estadía sea una experiencia inolvidable.",
      en: "14 rooms of colonial charm in the heart of Cartagena de Indias. We are committed to making your stay an unforgettable experience.",
    },
    reservar: { es: "Reservar Ahora", en: "Book Now" },
  },

  // ===== HERO (Main page) =====
  mainHero: {
    h1Title: { es: "Hotel Boutique en Cartagena y Medellín", en: "Boutique Hotel in Cartagena & Medellín" },
    seleccionaSede: { es: "Selecciona una sede", en: "Select a location" },
    reservaAhoraEn: { es: "RESERVA AHORA EN", en: "BOOK NOW IN" },
  },

  // ===== LOCATIONS SECTION (Main page) =====
  locations: {
    experienciasUnicas: { es: "Experiencias únicas", en: "Unique experiences" },
    nuestrasSedes: { es: "Nuestras Sedes", en: "Our Locations" },
    sede: { es: "Sede", en: "Location" },
    reservarWhatsApp: { es: "Reservar en WhatsApp", en: "Book on WhatsApp" },
    verSede: { es: "Ver Sede", en: "View Location" },
    cartagenaDesc: {
      es: "Nuestro hotel boutique en Cartagena Colombia se encuentra en el corazón de la ciudad amurallada. Un hotel en el centro histórico donde la arquitectura colonial se encuentra con el lujo contemporáneo.",
      en: "Our boutique hotel in Cartagena Colombia is located in the heart of the walled city. A hotel in the historic center where colonial architecture meets contemporary luxury.",
    },
    medellinDesc: {
      es: "Una experiencia de hotel boutique en Medellín, la ciudad de la eterna primavera. Rodeados de montañas y naturaleza, con la calidez y el servicio premium de Santa Alejandría.",
      en: "A boutique hotel experience in Medellín, the city of eternal spring. Surrounded by mountains and nature, with the warmth and premium service of Santa Alejandría.",
    },
  },

  // ===== INFORMATIVE SECTION (Main page) =====
  informative: {
heading: { es: "Hoteles boutique en Cartagena y Medellín", en: "Boutique Hotels in Cartagena & Medellín" },
    subtitle: {
      es: "Estamos construyendo nuestro nuevo sitio web. Muy pronto podrás conocer habitaciones, servicios y experiencias de nuestros hoteles en Cartagena de Indias y Medellín en un solo lugar.",
      en: "We are building our new website. Very soon you will be able to discover rooms, services, and experiences at our Cartagena and Medellín hotels in one place.",
    },
    sedesAbiertas: {
      es: "Por ahora, nuestras sedes están abiertas y listas para recibirte.",
      en: "For now, our locations are open and ready to welcome you.",
    },
    formIntro: {
      es: "Déjanos tu contacto para que te enteres de nuestro lanzamiento, ofertas y promociones.",
      en: "Leave us your contact info to learn about our launch, offers and promotions.",
    },
    nombre: { es: "Nombre", en: "Name" },
    placeholderNombre: { es: "Tu nombre", en: "Your name" },
    correo: { es: "Correo electrónico", en: "Email" },
    telefono: { es: "Número de teléfono", en: "Phone number" },
    comoNosConociste: { es: "¿Cómo nos conociste?", en: "How did you find us?" },
    seleccionaOpcion: { es: "Selecciona una opción", en: "Select an option" },
    redesSociales: { es: "Redes sociales", en: "Social media" },
    google: { es: "Google", en: "Google" },
    recomendacion: { es: "Recomendación de un amigo", en: "Friend's recommendation" },
    otroSitioWeb: { es: "Otro sitio web", en: "Another website" },
    publicidad: { es: "Publicidad", en: "Advertising" },
    evento: { es: "Evento o feria", en: "Event or fair" },
    otro: { es: "Otro", en: "Other" },
    consentimiento: {
      es: "Autorizo el tratamiento de mis datos personales conforme a la Política de Privacidad y Protección de Datos de Santa Alejandría Hotel para recibir información comercial, ofertas y comunicaciones relacionadas con sus servicios.",
      en: "I authorize the processing of my personal data in accordance with Santa Alejandría Hotel's Privacy and Data Protection Policy to receive commercial information, offers and communications related to their services.",
    },
    enviar: { es: "Enviar", en: "Submit" },
    alertConsent: {
      es: "Debes autorizar el tratamiento de datos para continuar.",
      en: "You must authorize data processing to continue.",
    },
  },

  // ===== FOOTER =====
  footer: {
    derechos: {
      es: "Santa Alejandría Hotel - Todos los derechos reservados. Desarrollado con tecnología propia por",
      en: "Santa Alejandría Hotel - All rights reserved. Developed with proprietary technology by",
    },
  },

  // ===== WHATSAPP BUTTON =====
  whatsapp: {
    reservarPorWhatsApp: { es: "Reservar por WhatsApp", en: "Book via WhatsApp" },
  },

  // ===== GALLERY DIALOG =====
  gallery: {
    titulo: { es: "Galería de fotos", en: "Photo gallery" },
    foto: { es: "Foto", en: "Photo" },
  },
} as const;

export default translations;
