import { Route, Routes } from "react-router-dom";
import LayoutTienda from "./components/layout/LayoutTienda";
import LayoutAdmin from "./components/layout/LayoutAdmin";
import RutaProtegida from "./components/common/RutaProtegida";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import CategoriaDetalle from "./pages/CategoriaDetalle";
import Ofertas from "./pages/Ofertas";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import CompraResultado from "./pages/CompraResultado";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import Blogs from "./pages/Blogs";
import BlogDetalle from "./pages/BlogDetalle";
import NoEncontrado from "./pages/NoEncontrado";

import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminOrdenDetalle, AdminOrdenes } from "./pages/admin/AdminOrdenes";
import {
  AdminProductoEditar,
  AdminProductoMostrar,
  AdminProductoNuevo,
  AdminProductos,
  AdminProductosCriticos,
} from "./pages/admin/AdminProductos";
import { AdminUsuarioEditar, AdminUsuarioMostrar, AdminUsuarioNuevo, AdminUsuarios } from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";

const STAFF = ["Administrador", "Vendedor"];
const SOLO_ADMIN = ["Administrador"];

/** Mapa de rutas de la aplicación (flujo de navegación tienda + panel administrativo). */
export default function App() {
  return (
    <Routes>
      {/* Tienda pública */}
      <Route element={<LayoutTienda />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:codigo" element={<DetalleProducto />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:id" element={<CategoriaDetalle />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra/exito/:id" element={<CompraResultado exito />} />
        <Route path="/compra/error/:id" element={<CompraResultado exito={false} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetalle />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      {/* Panel administrativo (requiere sesión de Administrador o Vendedor) */}
      <Route
        path="/admin"
        element={
          <RutaProtegida roles={STAFF}>
            <LayoutAdmin />
          </RutaProtegida>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="ordenes" element={<AdminOrdenes />} />
        <Route path="ordenes/:id" element={<AdminOrdenDetalle />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="productos-criticos" element={<AdminProductosCriticos />} />
        <Route path="productos/nuevo" element={<RutaProtegida roles={SOLO_ADMIN}><AdminProductoNuevo /></RutaProtegida>} />
        <Route path="productos/:codigo" element={<AdminProductoMostrar />} />
        <Route path="productos/:codigo/editar" element={<RutaProtegida roles={SOLO_ADMIN}><AdminProductoEditar /></RutaProtegida>} />
        <Route path="usuarios" element={<RutaProtegida roles={SOLO_ADMIN}><AdminUsuarios /></RutaProtegida>} />
        <Route path="usuarios/nuevo" element={<RutaProtegida roles={SOLO_ADMIN}><AdminUsuarioNuevo /></RutaProtegida>} />
        <Route path="usuarios/:run" element={<RutaProtegida roles={SOLO_ADMIN}><AdminUsuarioMostrar /></RutaProtegida>} />
        <Route path="usuarios/:run/editar" element={<RutaProtegida roles={SOLO_ADMIN}><AdminUsuarioEditar /></RutaProtegida>} />
        <Route path="reportes" element={<AdminReportes />} />
      </Route>
    </Routes>
  );
}
