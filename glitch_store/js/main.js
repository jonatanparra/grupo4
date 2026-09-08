/* =========================================================
   Glitch — Comportamiento general del sitio
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Año dinámico en el footer
  document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Menú de navegación móvil
  const botonMenu = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (botonMenu && menu) {
    botonMenu.addEventListener("click", () => {
      menu.classList.toggle("nav-links--abierto");
      const expandido = menu.classList.contains("nav-links--abierto");
      botonMenu.setAttribute("aria-expanded", String(expandido));
    });
  }

  // Marca el link de navegación activo según la página actual
  const rutaActual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === rutaActual) link.classList.add("activo");
  });
});

/** Crea el HTML de una tarjeta de producto para la vitrina/listado. */
function tarjetaProductoHTML(producto) {
  return `
    <article class="tarjeta-producto">
      <a href="detalle-producto.html?codigo=${producto.codigo}" class="tarjeta-producto__imagen-link">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="tarjeta-producto__imagen" loading="lazy">
      </a>
      <div class="tarjeta-producto__cuerpo">
        <p class="tarjeta-producto__categoria">${producto.categoria}</p>
        <a href="detalle-producto.html?codigo=${producto.codigo}" class="tarjeta-producto__nombre">${producto.nombre}</a>
        <div class="tarjeta-producto__pie">
          <span class="tarjeta-producto__precio">${formatoCLP(producto.precio)}</span>
          <button type="button" class="boton boton--pequeno" data-agregar="${producto.codigo}">Añadir</button>
        </div>
      </div>
    </article>
  `;
}

/** Renderiza un listado de productos dentro de un contenedor, y liga los botones "Añadir". */
function renderGrillaProductos(contenedorId, listaProductos) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = listaProductos.map(tarjetaProductoHTML).join("");

  contenedor.querySelectorAll("[data-agregar]").forEach((boton) => {
    boton.addEventListener("click", (evento) => {
      evento.preventDefault();
      agregarAlCarrito(boton.dataset.agregar, 1);
      boton.textContent = "Añadido ✓";
      setTimeout(() => (boton.textContent = "Añadir"), 1200);
    });
  });
}
