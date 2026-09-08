/* =========================================================
   FOLLAJE ADMIN — comportamiento común del panel
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const rutaActual = window.location.pathname.split("/").pop() || "home.html";
  document.querySelectorAll(".admin-sidebar a").forEach((link) => {
    if (link.getAttribute("href") === rutaActual) link.classList.add("activo");
  });
});

/** Genera el HTML de una fila de la tabla de productos. */
function filaProductoHTML(producto) {
  const critico = producto.stock <= producto.stockCritico;
  return `
    <tr>
      <td>${producto.codigo}</td>
      <td>${producto.nombre}</td>
      <td>${producto.categoria}</td>
      <td>${formatoCLP(producto.precio)}</td>
      <td>
        <span class="etiqueta-stock ${critico ? "etiqueta-stock--critico" : "etiqueta-stock--ok"}">
          ${producto.stock} ${critico ? "· crítico" : ""}
        </span>
      </td>
      <td class="acciones-tabla">
        <a href="mostrar-producto.html?codigo=${producto.codigo}">Ver</a>
        <a href="editar-producto.html?codigo=${producto.codigo}">Editar</a>
        <a href="#" data-eliminar-producto="${producto.codigo}">Eliminar</a>
      </td>
    </tr>
  `;
}

/** Genera el HTML de una fila de la tabla de usuarios. */
function filaUsuarioHTML(usuario) {
  return `
    <tr>
      <td>${usuario.run}</td>
      <td>${usuario.nombre} ${usuario.apellidos}</td>
      <td>${usuario.correo}</td>
      <td><span class="etiqueta-rol">${usuario.tipo}</span></td>
      <td class="acciones-tabla">
        <a href="mostrar-usuario.html?run=${usuario.run}">Ver</a>
        <a href="editar-usuario.html?run=${usuario.run}">Editar</a>
        <a href="#" data-eliminar-usuario="${usuario.run}">Eliminar</a>
      </td>
    </tr>
  `;
}
