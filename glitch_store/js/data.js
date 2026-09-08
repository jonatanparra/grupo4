/* =========================================================
   GLITCH STORE — Datos de ejemplo (arreglos en JavaScript)
   Este archivo simula lo que más adelante sería una base de datos.
   ========================================================= */

// ---------- Productos ----------
// Todos los títulos son ficticios, creados para este proyecto académico.
const PRODUCTOS = [
  {
    codigo: "GS-001",
    nombre: "Hollow Knight",
    categoria: "Indie",
    precio: 34990,
    stock: 22,
    stockCritico: 5,
    descripcion:
      "Cilantro1",
    imagen: "img/juegos/GS-001.jpg",
  },
  {
    codigo: "GS-002",
    nombre: "Hollow Knight - Silksong",
    categoria: "Indie",
    precio: 27990,
    stock: 30,
    stockCritico: 6,
    descripcion:
      "Cilantro2",
    imagen: "img/juegos/GS-002.webp",
  },
  {
    codigo: "GS-003",
    nombre: "Life is Strange Remastered Collection",
    categoria: "Narrativo",
    precio: 29990,
    stock: 18,
    stockCritico: 4,
    descripcion:
      "Terror psicológico narrativo sobre una familia que vuelve a un pueblo que ya no figura en los mapas. Pocos monstruos, mucha atmósfera y decisiones que cambian el final.",
    imagen: "img/juegos/GS-003.jpg",
  },
  {
    codigo: "GS-004",
    nombre: "Outlast",
    categoria: "Terror",
    precio: 39990,
    stock: 25,
    stockCritico: 5,
    descripcion:
      "Hack and slash de terror gótico: combate rápido, criaturas que sangran luz roja y un ritmo pensado para sesiones intensas de una sentada.",
    imagen: "img/juegos/GS-004.jpg",
  },
  {
    codigo: "GS-005",
    nombre: "Red Dead Redemption II",
    categoria: "Acción",
    precio: 44990,
    stock: 16,
    stockCritico: 3,
    descripcion:
      "Shooter en tercera persona ambientado en una instalación militar abandonada. Cobertura táctica, enemigos que aprenden tus patrones y jefes de sector.",
    imagen: "img/juegos/GS-005.jpg",
  },
  {
    codigo: "GS-006",
    nombre: "Dark Souls Remastered",
    categoria: "Acción",
    precio: 19990,
    stock: 40,
    stockCritico: 8,
    descripcion:
      "Roguelike de terror: cada partida genera un mapa distinto y amenazas nuevas, así que memorizar rutas no te va a salvar dos veces seguidas.",
    imagen: "img/juegos/GS-006.jpg",
  },
  {
    codigo: "GS-007",
    nombre: "Resident Evil II",
    categoria: "Terror",
    precio: 24990,
    stock: 20,
    stockCritico: 4,
    descripcion:
      "Walking simulator de tensión dentro de un hospital psiquiátrico cerrado. Casi no hay combate: la exploración lenta y el sonido ambiental hacen todo el trabajo.",
    imagen: "img/juegos/GS-007.jpg",
  },
  {
    codigo: "GS-008",
    nombre: "Hotline Miami Collection",
    categoria: "Indie",
    precio: 14990,
    stock: 35,
    stockCritico: 7,
    descripcion:
      "Terror indie en pixel art sobre una radio comunitaria que empieza a transmitir voces que nadie grabó. Corto, directo y pensado para una sola sesión.",
    imagen: "img/juegos/GS-008.jpg",
  },
  {
    codigo: "GS-009",
    nombre: "Shadow Of The Colssus",
    categoria: "Narrativo",
    precio: 32990,
    stock: 28,
    stockCritico: 6,
    descripcion:
      "Aventura minimalista donde debes escalar y vencer a 16 colosos gigantes para salvar una vida.",
    imagen: "img/juegos/GS-009.jpg",
  },
  {
    codigo: "GS-010",
    nombre: "Dragon Ball Figther Z",
    categoria: "Multijugador",
    precio: 22990,
    stock: 24,
    stockCritico: 5,
    descripcion:
      "Juego de pelea 2.5D por equipos de 3v3 con estética idéntica al anime y ritmo frenético.",
    imagen: "img/juegos/GS-010.jpg",
  },
  {
    codigo: "GS-011",
    nombre: "Minecraft",
    categoria: "Acción",
    precio: 37990,
    stock: 15,
    stockCritico: 3,
    descripcion:
      "Sandbox de bloques centrado en la exploración, construcción y supervivencia en un mundo infinito.",
    imagen: "img/juegos/GS-011.jpg",
  },
  {
    codigo: "GS-012",
    nombre: "Call of Dutty Black OPS III",
    categoria: "Multijugador",
    precio: 26990,
    stock: 32,
    stockCritico: 6,
    descripcion:
      "Shooter futurista en primera persona con campaña, multijugador ágil y modo Zombies.",
    imagen: "img/juegos/GS-012.jpg",
  },
];

// ---------- Usuarios de ejemplo (para el listado del administrador) ----------
const USUARIOS = [
  {
    run: "191102203",
    nombre: "Camila",
    apellidos: "Rojas Muñoz",
    correo: "camila.rojas@duoc.cl",
    tipo: "Administrador",
    region: "metropolitana",
    comuna: "santiago",
    direccion: "Av. Siempre Viva 123",
  },
  {
    run: "178456321",
    nombre: "Matías",
    apellidos: "Fernández Soto",
    correo: "matias.fernandez@gmail.com",
    tipo: "Vendedor",
    region: "araucania",
    comuna: "temuco",
    direccion: "Los Alerces 456",
  },
  {
    run: "203344112",
    nombre: "Javiera",
    apellidos: "Contreras Díaz",
    correo: "javiera.contreras@profesor.duoc.cl",
    tipo: "Cliente",
    region: "nuble",
    comuna: "chillan",
    direccion: "Camino Real 789",
  },
];

// ---------- Regiones y comunas ----------
const REGIONES = [
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
const DOMINIOS_CORREO_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];
