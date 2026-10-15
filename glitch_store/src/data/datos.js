/* =========================================================
   GLITCH STORE — Datos semilla (simulan una base de datos)
   Estos arreglos son el estado inicial. Las colecciones de
   db.js los copian a localStorage y desde ahí se leen/modifican
   con operaciones CRUD.
   ========================================================= */

// ---------- Categorías ----------
export const CATEGORIAS = [
  { id: "terror", nombre: "Terror", descripcion: "Survival horror y experiencias que te quitan el sueño.", imagen: "/img/juegos/GS-007.jpg" },
  { id: "accion", nombre: "Acción", descripcion: "Mundos abiertos, combate y aventuras épicas.", imagen: "/img/juegos/GS-005.jpg" },
  { id: "narrativo", nombre: "Narrativo", descripcion: "Historias donde cada decisión importa.", imagen: "/img/juegos/GS-003.jpg" },
  { id: "indie", nombre: "Indie", descripcion: "Joyas de estudios independientes.", imagen: "/img/juegos/GS-001.jpg" },
  { id: "multijugador", nombre: "Multijugador", descripcion: "Para jugar con (o contra) tus amigos.", imagen: "/img/juegos/GS-010.jpg" },
];

// ---------- Productos ----------
// descuento: porcentaje de oferta (0 = sin oferta).
export const PRODUCTOS = [
  {
    codigo: "GS-001",
    nombre: "Hollow Knight",
    categoria: "Indie",
    precio: 13990,
    descuento: 0,
    stock: 22,
    stockCritico: 5,
    descripcion:
      "Aventura de acción y exploración en 2D donde debes recorrer un reino subterráneo, enfrentarte a criaturas y descubrir sus secretos.",
    imagen: "/img/juegos/GS-001.jpg",
  },
  {
    codigo: "GS-002",
    nombre: "Hollow Knight - Silksong",
    categoria: "Indie",
    precio: 14990,
    descuento: 0,
    stock: 30,
    stockCritico: 6,
    descripcion:
      "Aventura de acción en 2D protagonizada por Hornet, con nuevos escenarios, enemigos, habilidades y combates desafiantes.",
    imagen: "/img/juegos/GS-002.webp",
  },
  {
    codigo: "GS-003",
    nombre: "Life is Strange Remastered Collection",
    categoria: "Narrativo",
    precio: 7990,
    descuento: 0,
    stock: 18,
    stockCritico: 4,
    descripcion:
      "Aventura narrativa basada en decisiones, donde tus elecciones afectan la historia y las relaciones entre los personajes.",
    imagen: "/img/juegos/GS-003.jpg",
  },
  {
    codigo: "GS-004",
    nombre: "Outlast",
    categoria: "Terror",
    precio: 13990,
    descuento: 20,
    stock: 25,
    stockCritico: 5,
    descripcion:
      "Survival horror en primera persona donde debes escapar de peligros explorando un manicomio, sin posibilidad de combatir directamente.",
    imagen: "/img/juegos/GS-004.jpg",
  },
  {
    codigo: "GS-005",
    nombre: "Red Dead Redemption II",
    categoria: "Acción",
    precio: 22990,
    descuento: 0,
    stock: 3,
    stockCritico: 3,
    descripcion:
      "Aventura de mundo abierto ambientada en el Lejano Oeste, centrada en la exploración, acción y una historia sobre forajidos.",
    imagen: "/img/juegos/GS-005.jpg",
  },
  {
    codigo: "GS-006",
    nombre: "Dark Souls Remastered",
    categoria: "Acción",
    precio: 19990,
    descuento: 30,
    stock: 40,
    stockCritico: 8,
    descripcion:
      "RPG de acción desafiante donde debes explorar un mundo oscuro, combatir enemigos difíciles y aprender de cada derrota.",
    imagen: "/img/juegos/GS-006.jpg",
  },
  {
    codigo: "GS-007",
    nombre: "Resident Evil II",
    categoria: "Terror",
    precio: 22900,
    descuento: 0,
    stock: 20,
    stockCritico: 4,
    descripcion:
      "Survival horror centrado en la exploración, resolución de puzles y supervivencia frente a zombis y criaturas.",
    imagen: "/img/juegos/GS-007.jpg",
  },
  {
    codigo: "GS-008",
    nombre: "Hotline Miami Collection",
    categoria: "Indie",
    precio: 14990,
    descuento: 15,
    stock: 35,
    stockCritico: 7,
    descripcion:
      "Juego de acción frenética con vista cenital, combates rápidos, alta dificultad y una estética retro llena de violencia estilizada.",
    imagen: "/img/juegos/GS-008.jpg",
  },
  {
    codigo: "GS-009",
    nombre: "Shadow Of The Colossus",
    categoria: "Narrativo",
    precio: 16990,
    descuento: 0,
    stock: 5,
    stockCritico: 6,
    descripcion:
      "Aventura minimalista donde debes escalar y vencer a 16 colosos gigantes para salvar una vida.",
    imagen: "/img/juegos/GS-009.jpg",
  },
  {
    codigo: "GS-010",
    nombre: "Dragon Ball FighterZ",
    categoria: "Multijugador",
    precio: 19990,
    descuento: 0,
    stock: 24,
    stockCritico: 5,
    descripcion:
      "Juego de pelea 2.5D por equipos de 3v3 con estética idéntica al anime y ritmo frenético.",
    imagen: "/img/juegos/GS-010.jpg",
  },
  {
    codigo: "GS-011",
    nombre: "Minecraft",
    categoria: "Acción",
    precio: 37990,
    descuento: 25,
    stock: 15,
    stockCritico: 3,
    descripcion:
      "Sandbox de bloques centrado en la exploración, construcción y supervivencia en un mundo infinito.",
    imagen: "/img/juegos/GS-011.jpg",
  },
  {
    codigo: "GS-012",
    nombre: "Call of Duty Black Ops III",
    categoria: "Multijugador",
    precio: 14990,
    descuento: 40,
    stock: 32,
    stockCritico: 6,
    descripcion:
      "Shooter futurista en primera persona con campaña, multijugador ágil y modo Zombies.",
    imagen: "/img/juegos/GS-012.jpg",
  },
];

// ---------- Usuarios ----------
// Credenciales de prueba (solo para demostración académica).
export const USUARIOS = [
  {
    run: "191102207",
    nombre: "Camila",
    apellidos: "Rojas Muñoz",
    correo: "camila.rojas@duoc.cl",
    contrasena: "admin123",
    tipo: "Administrador",
    fechaNacimiento: "1996-04-12",
    region: "metropolitana",
    comuna: "santiago",
    direccion: "Av. Siempre Viva 123",
  },
  {
    run: "178456326",
    nombre: "Matías",
    apellidos: "Fernández Soto",
    correo: "matias.fernandez@gmail.com",
    contrasena: "vende123",
    tipo: "Vendedor",
    fechaNacimiento: "1992-09-30",
    region: "araucania",
    comuna: "temuco",
    direccion: "Los Alerces 456",
  },
  {
    run: "203344112",
    nombre: "Javiera",
    apellidos: "Contreras Díaz",
    correo: "javiera.contreras@profesor.duoc.cl",
    contrasena: "cliente1",
    tipo: "Cliente",
    fechaNacimiento: "2000-01-20",
    region: "nuble",
    comuna: "chillan",
    direccion: "Camino Real 789",
  },
];

// ---------- Órdenes de ejemplo ----------
export const ORDENES = [
  {
    id: "ORD-1001",
    fecha: "2026-10-01T15:32:00.000Z",
    estado: "Pagado",
    cliente: { nombre: "Javiera", apellidos: "Contreras Díaz", correo: "javiera.contreras@profesor.duoc.cl" },
    envio: { tipo: "domicilio", calle: "Camino Real 789", departamento: "", region: "nuble", comuna: "chillan", indicaciones: "" },
    items: [
      { codigo: "GS-007", nombre: "Resident Evil II", precioUnitario: 22900, cantidad: 1 },
      { codigo: "GS-004", nombre: "Outlast", precioUnitario: 11192, cantidad: 1 },
    ],
    subtotal: 34092,
    descuentoCupon: 0,
    costoEnvio: 3990,
    total: 38082,
  },
  {
    id: "ORD-1002",
    fecha: "2026-10-05T19:10:00.000Z",
    estado: "Rechazado",
    cliente: { nombre: "Pedro", apellidos: "Soto Lagos", correo: "pedro.soto@gmail.com" },
    envio: { tipo: "retiro", calle: "", departamento: "", region: "metropolitana", comuna: "providencia", indicaciones: "" },
    items: [{ codigo: "GS-011", nombre: "Minecraft", precioUnitario: 28493, cantidad: 2 }],
    subtotal: 56986,
    descuentoCupon: 0,
    costoEnvio: 0,
    total: 56986,
  },
];

// ---------- Regiones y comunas ----------
export const REGIONES = [
  {
    id: "metropolitana",
    nombre: "Región Metropolitana de Santiago",
    comunas: [
      { id: "santiago", nombre: "Santiago" },
      { id: "providencia", nombre: "Providencia" },
      { id: "las-condes", nombre: "Las Condes" },
      { id: "nunoa", nombre: "Ñuñoa" },
      { id: "maipu", nombre: "Maipú" },
    ],
  },
  {
    id: "araucania",
    nombre: "Región de la Araucanía",
    comunas: [
      { id: "temuco", nombre: "Temuco" },
      { id: "villarrica", nombre: "Villarrica" },
      { id: "pucon", nombre: "Pucón" },
      { id: "angol", nombre: "Angol" },
    ],
  },
  {
    id: "nuble",
    nombre: "Región de Ñuble",
    comunas: [
      { id: "chillan", nombre: "Chillán" },
      { id: "san-carlos", nombre: "San Carlos" },
      { id: "bulnes", nombre: "Bulnes" },
    ],
  },
];

// Dominios de correo permitidos en todo el sitio
export const DOMINIOS_CORREO_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

// Cupones de descuento válidos (código → porcentaje)
export const CUPONES = { GLITCH10: 10, DUOC15: 15 };

// Despacho: costo fijo y monto desde el cual es gratis
export const COSTO_ENVIO = 3990;
export const ENVIO_GRATIS_DESDE = 50000;

export const TIPOS_USUARIO = ["Administrador", "Vendedor", "Cliente"];
