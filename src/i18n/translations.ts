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
    seleccionaSede: { es: "Elige tu destino", en: "Choose your destination" },
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
    heading: { es: "Reserva tu experiencia boutique", en: "Book Your Boutique Experience" },
    subtitle: {
      es: "Dos hoteles boutique en las ciudades más fascinantes de Colombia. Arquitectura colonial, servicio personalizado y ubicaciones privilegiadas en Cartagena de Indias y Medellín.",
      en: "Two boutique hotels in Colombia's most fascinating cities. Colonial architecture, personalized service, and prime locations in Cartagena de Indias and Medellín.",
    },
    sedesAbiertas: {
      es: "Nuestras sedes están abiertas y listas para recibirte.",
      en: "Our locations are open and ready to welcome you.",
    },
    formIntro: {
      es: "Déjanos tu contacto para recibir ofertas exclusivas y novedades de Santa Alejandría Hotel.",
      en: "Leave your contact info to receive exclusive offers and news from Santa Alejandría Hotel.",
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

  // ===== MEDELLÍN HERO =====
  medellinHero: {
    eternaPrimavera: { es: "La Ciudad de la Eterna Primavera", en: "The City of Eternal Spring" },
    tagline: {
      es: "Un oasis de tranquilidad entre jardines y espacios libres de humo, en el corazón del sector Estadio",
      en: "An oasis of tranquility among gardens and smoke-free spaces, in the heart of the Estadio district",
    },
    reservar: { es: "Reservar Ahora", en: "Book Now" },
    explorar: { es: "Explorar", en: "Explore" },
  },

  // ===== MEDELLÍN ABOUT =====
  medellinAbout: {
    label: { es: "Nuestra Historia", en: "Our Story" },
    heading: {
      es: "Una Década Creando Experiencias Inolvidables",
      en: "A Decade Creating Unforgettable Experiences",
    },
    paragraph1: {
      es: "Hace una década, en un rincón privilegiado de la vibrante Medellín, nació un sueño que hoy es realidad: el Hotel Santa Alejandría. Fue concebido con el deseo de crear un refugio donde la calidez humana, la tranquilidad y la naturaleza se encontraran en perfecta armonía. Entre jardines que respiran vida y espacios libres de humo diseñados para el descanso absoluto, nuestro hotel se convirtió en un oasis dentro de la ciudad de la eterna primavera.",
      en: "A decade ago, in a privileged corner of vibrant Medellín, a dream was born that is now a reality: Hotel Santa Alejandría. It was conceived with the desire to create a refuge where human warmth, tranquility, and nature would meet in perfect harmony. Among gardens that breathe life and smoke-free spaces designed for absolute rest, our hotel became an oasis within the city of eternal spring.",
    },
    diferentesLabel: { es: "Lo Que Nos Hace Diferentes", en: "What Makes Us Different" },
    diferentesHeading: {
      es: "La Verdadera Magia Está en los Detalles",
      en: "The Real Magic Is in the Details",
    },
    paragraph2: {
      es: "En Santa Alejandría creemos que la verdadera magia está en los detalles. Nuestro equipo no solo trabaja para atenderte: vive para acompañarte, anticipar tus necesidades y hacerte sentir como en casa, incluso estando lejos de ella. La calidez de nuestra gente, la respuesta oportuna en cada momento y esa sensación de familiaridad que te acompaña desde el primer saludo… eso es lo que nos distingue. No ofrecemos solo estadías: ofrecemos experiencias que se quedarán contigo.",
      en: "At Santa Alejandría, we believe the real magic is in the details. Our team doesn't just work to serve you: they live to accompany you, anticipate your needs, and make you feel at home, even when you're far from it. The warmth of our people, the timely response at every moment, and that feeling of familiarity from the very first greeting… that's what sets us apart. We don't just offer stays: we offer experiences that will stay with you.",
    },
    capacidad: { es: "Capacidad (personas)", en: "Capacity (guests)" },
    anosExperiencia: { es: "Años de experiencia", en: "Years of experience" },
    libreHumo: { es: "Libre de humo", en: "Smoke-free" },
    atencion: { es: "Atención", en: "Service" },
    badgeCapacidad: { es: "176 Personas", en: "176 Guests" },
    badgePrimavera: { es: "Eterna Primavera", en: "Eternal Spring" },
    badgeEstadio: { es: "Sector Estadio", en: "Estadio District" },
    badge24h: { es: "24 Horas", en: "24 Hours" },
    imagePlaceholder: { es: "Foto del hotel próximamente", en: "Hotel photo coming soon" },
    earlyCheckIn: { es: "Early check-in: +$10.000/hora", en: "Early check-in: +$10,000/hour" },
    lateCheckOut: { es: "Late check-out: +$10.000/hora", en: "Late check-out: +$10,000/hour" },
  },

  // ===== MEDELLÍN ROOMS =====
  medellinRooms: {
    label: { es: "Alojamiento", en: "Accommodation" },
    heading: { es: "Nuestras Habitaciones & Apartaestudios", en: "Our Rooms & Studio Apartments" },
    description: {
      es: "Más de 60 habitaciones en diversas configuraciones y 10 apartaestudios totalmente equipados. Opciones con aire acondicionado o ventilador para adaptarnos a tu preferencia.",
      en: "Over 60 rooms in various configurations and 10 fully equipped studio apartments. Options with air conditioning or fan to suit your preference.",
    },
    habitacionesDisponibles: { es: "habitaciones disponibles", en: "rooms available" },
    imagePlaceholder: { es: "Fotos de esta habitación próximamente", en: "Photos of this room coming soon" },
    configuraciones: { es: "Configuraciones disponibles", en: "Available configurations" },
    personas: { es: "personas", en: "guests" },
    reservarHabitacion: { es: "Reservar esta Habitación", en: "Book this Room" },
  },

  // Medellín room names
  medellinRoomNames: {
    "doble-sencilla": { es: "Doble Sencilla", en: "Double Room" },
    twins: { es: "Twins", en: "Twin Room" },
    triple: { es: "Triple", en: "Triple Room" },
    cuadruple: { es: "Cuádruple", en: "Quadruple Room" },
    camarote: { es: "Camarote", en: "Bunk Room" },
    "suite-junior": { es: "Suite Junior", en: "Junior Suite" },
    apartaestudios: { es: "Apartaestudios", en: "Studio Apts" },
  },

  // Medellín room descriptions
  medellinRoomDescriptions: {
    "doble-sencilla": {
      es: "Cómoda habitación con cama doble, ideal para parejas o viajeros individuales que buscan descanso en el corazón del sector Estadio.",
      en: "Comfortable room with a double bed, ideal for couples or individual travelers seeking rest in the heart of the Estadio district.",
    },
    twins: {
      es: "Habitación con dos camas sencillas y aire acondicionado. Perfecta para amigos, colegas o viajeros que prefieren camas individuales.",
      en: "Room with two single beds and air conditioning. Perfect for friends, colleagues, or travelers who prefer individual beds.",
    },
    triple: {
      es: "Espaciosa habitación para tres personas. Disponible en diferentes configuraciones de camas para adaptarse a las necesidades de tu grupo o familia.",
      en: "Spacious room for three guests. Available in different bed configurations to suit your group or family's needs.",
    },
    cuadruple: {
      es: "Habitación amplia para grupos de hasta 4 personas. Múltiples configuraciones de camas disponibles con aire acondicionado o ventilador.",
      en: "Spacious room for groups of up to 4 guests. Multiple bed configurations available with air conditioning or fan.",
    },
    camarote: {
      es: "Habitación con literas ubicada en el primer piso, con capacidad para hasta 6 personas. Aire acondicionado incluido. Ideal para grupos grandes o equipos deportivos.",
      en: "Bunk room located on the first floor, with capacity for up to 6 guests. Air conditioning included. Ideal for large groups or sports teams.",
    },
    "suite-junior": {
      es: "Nuestra habitación más exclusiva. Amplia suite con cama King Size y aire acondicionado. El máximo confort para una experiencia premium en Medellín.",
      en: "Our most exclusive room. Spacious suite with a King Size bed and air conditioning. Maximum comfort for a premium experience in Medellín.",
    },
  },

  // ===== MEDELLÍN APARTAESTUDIOS =====
  medellinApartaestudios: {
    heading: { es: "Apartaestudios", en: "Studio Apartments" },
    description: {
      es: "10 apartaestudios totalmente equipados, ideales para estadías cortas o largas. Para 1 persona o pareja. Disponibles por día o por mes con servicios incluidos.",
      en: "10 fully equipped studio apartments, ideal for short or long stays. For 1 person or couple. Available daily or monthly with services included.",
    },
    ambiente: { es: "Ambiente", en: "Room" },
    ambientes: { es: "Ambientes", en: "Rooms" },
    disponibles: { es: "disponibles", en: "available" },
    porDia: { es: "Por día", en: "Per day" },
    porMes: { es: "Por mes", en: "Per month" },
    serviciosIncluidos: { es: "Servicios incluidos en tarifa mensual", en: "Services included in monthly rate" },
    todosIncluyen: { es: "Todos los apartaestudios incluyen", en: "All studio apartments include" },
    consultar: { es: "Consultar Disponibilidad", en: "Check Availability" },
  },

  // ===== MEDELLÍN EXTERIORES / FACILITIES GALLERY =====
  medellinExteriores: {
    label: { es: "Nuestras Instalaciones", en: "Our Facilities" },
    heading: { es: "Conoce nuestros espacios", en: "Discover our spaces" },
    description: {
      es: "Recorre las áreas comunes, terrazas, gimnasio y zonas exteriores que hacen de Santa Alejandría un verdadero oasis en el corazón de Medellín.",
      en: "Take a tour of the common areas, terraces, gym, and outdoor spaces that make Santa Alejandría a true oasis in the heart of Medellín.",
    },
    fachadas: { es: "Fachada & Entrada", en: "Facade & Entrance" },
    recepcion: { es: "Recepción", en: "Reception" },
    gimnasio: { es: "Gimnasio", en: "Gym" },
    terrazas: { es: "Terrazas", en: "Terraces" },
    comedor: { es: "Comedor", en: "Dining Area" },
    sinFotos: { es: "Sin fotos disponibles en esta categoría.", en: "No photos available in this category." },
  },

  // ===== MEDELLÍN SERVICES =====
  medellinServices: {
    label: { es: "Comodidades", en: "Amenities" },
    heading: { es: "Servicios & Amenidades", en: "Services & Amenities" },
    includedLabel: { es: "Incluidos en la tarifa", en: "Included in the rate" },
    additionalLabel: { es: "Servicios Adicionales", en: "Additional Services" },
    facilitiesLabel: { es: "Instalaciones del Hotel", en: "Hotel Facilities" },
  },

  medellinServiceNames: {
    "Desayuno Americano": { es: "Desayuno Americano", en: "American Breakfast" },
    "Wi-Fi en cada piso": { es: "Wi-Fi en cada piso", en: "Wi-Fi on every floor" },
    "Caja de seguridad": { es: "Caja de seguridad", en: "Safety box" },
    "Limpieza diaria": { es: "Limpieza diaria", en: "Daily cleaning" },
    "Lavandería": { es: "Lavandería", en: "Laundry" },
    "Minibar en recepción": { es: "Minibar en recepción", en: "Minibar at reception" },
    "Plancha y secador": { es: "Plancha y secador", en: "Iron & hair dryer" },
    "Recepción 24/7": { es: "Recepción 24/7", en: "24/7 Reception" },
  },

  medellinServiceDescriptions: {
    "Servido de 7:00 AM a 9:30 AM": { es: "Servido de 7:00 AM a 9:30 AM", en: "Served from 7:00 AM to 9:30 AM" },
    "Conexión gratuita en todo el hotel": { es: "Conexión gratuita en todo el hotel", en: "Free connection throughout the hotel" },
    "Disponible en cada habitación": { es: "Disponible en cada habitación", en: "Available in every room" },
    "De 9:00 AM a 2:00 PM, cambio de lencería cada 2 días": { es: "De 9:00 AM a 2:00 PM, cambio de lencería cada 2 días", en: "From 9:00 AM to 2:00 PM, linen change every 2 days" },
    "Servicio de lavandería (costo adicional)": { es: "Servicio de lavandería (costo adicional)", en: "Laundry service (additional cost)" },
    "Snacks y bebidas disponibles": { es: "Snacks y bebidas disponibles", en: "Snacks and drinks available" },
    "Disponibles bajo solicitud": { es: "Disponibles bajo solicitud", en: "Available upon request" },
    "Atención personalizada a cualquier hora": { es: "Atención personalizada a cualquier hora", en: "Personalized attention at any time" },
  },

  medellinAmenityNames: {
    "Terraza de lectura": { es: "Terraza de lectura", en: "Reading terrace" },
    "Terraza de fiestas": { es: "Terraza de fiestas", en: "Party terrace" },
    "Gimnasio": { es: "Gimnasio", en: "Gym" },
    "Zona libre de humo": { es: "Zona libre de humo", en: "Smoke-free zone" },
  },

  // ===== MEDELLÍN LOCATION =====
  medellinLocation: {
    label: { es: "Cómo Llegar", en: "How to Get Here" },
    heading: { es: "Encuéntranos", en: "Find Us" },
    direccion: { es: "Dirección", en: "Address" },
    telefono: { es: "Teléfono", en: "Phone" },
    email: { es: "Email", en: "Email" },
    horario: { es: "Horario", en: "Hours" },
    servicio24h: { es: "Servicio 24 horas", en: "24-hour service" },
    cercaDe: { es: "Cerca de nosotros", en: "Near us" },
  },

  // ===== MEDELLÍN BOOKING CTA =====
  medellinBookingCTA: {
    heading1: { es: "Vive la experiencia", en: "Live the experience" },
    heading2: { es: "Santa Alejandría Medellín", en: "Santa Alejandría Medellín" },
    subtitle: {
      es: "Un oasis en la ciudad de la eterna primavera. Jardines, tranquilidad y el mejor servicio te esperan en el sector Estadio de Medellín.",
      en: "An oasis in the city of eternal spring. Gardens, tranquility, and the best service await you in the Estadio district of Medellín.",
    },
    reservar: { es: "Reservar Ahora", en: "Book Now" },
  },
} as const;

export default translations;
