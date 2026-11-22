import { Navigate, Route, Routes } from "react-router-dom";
import { useTienda } from "./context/TiendaContext";
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
import MisCompras from "./pages/MisCompras";

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
const CON_SESION = ["Administrador", "Vendedor", "Cliente"];

const soloAdmin = (pagina) => <RutaProtegida roles={SOLO_ADMIN}>{pagina}</RutaProtegida>;

/** /admin: el Administrador ve el dashboard; el Vendedor parte en Órdenes (no tiene dashboard). */
function InicioAdmin() {
  const { usuarioActual } = useTienda();
  return usuarioActual?.tipo === "Administrador" ? <AdminDashboard /> : <Navigate to="/admin/ordenes" replace />;
}

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
        <Route path="/mis-compras" element={<RutaProtegida roles={CON_SESION}><MisCompras /></RutaProtegida>} />
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
        {/* Administrador y Vendedor: lista y detalle de órdenes y productos */}
        <Route index element={<InicioAdmin />} />
        <Route path="ordenes" element={<AdminOrdenes />} />
        <Route path="ordenes/:id" element={<AdminOrdenDetalle />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="productos/:codigo" element={<AdminProductoMostrar />} />
        {/* Solo Administrador */}
        <Route path="productos-criticos" element={soloAdmin(<AdminProductosCriticos />)} />
        <Route path="productos/nuevo" element={soloAdmin(<AdminProductoNuevo />)} />
        <Route path="productos/:codigo/editar" element={soloAdmin(<AdminProductoEditar />)} />
        <Route path="usuarios" element={soloAdmin(<AdminUsuarios />)} />
        <Route path="usuarios/nuevo" element={soloAdmin(<AdminUsuarioNuevo />)} />
        <Route path="usuarios/:run" element={soloAdmin(<AdminUsuarioMostrar />)} />
        <Route path="usuarios/:run/editar" element={soloAdmin(<AdminUsuarioEditar />)} />
        <Route path="reportes" element={soloAdmin(<AdminReportes />)} />
      </Route>
    </Routes>
  );
}
