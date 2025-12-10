import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/landing/LandingPage";
import { AdminLayout } from "../layouts/AdminLayout";
import { ClienteLayout } from "../layouts/ClienteLayout";
import { TecnicoLayout } from "../layouts/TecnicoLayout";
import { TechnicianListPage } from "../pages/technicians/TechicianListPage";
import { TechnicianProfilePage } from "../pages/technicians/TechicianProfilePage";
import { RequestListPage } from "../pages/requests/RequestListPage";
import { PaymentsListPage } from "../pages/payments/PaymentsListPage";
import { ReportsBIPage } from "../pages/reports/ReportsBIPage";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteByRole from "./ProtectedRouteByRole";
import { Bitacora } from "../pages/auditoria/Bitacora";
import { ListarUsuarios } from "../pages/listaUsuario/ListarUsuarios";
import { RegisterTecnico } from "../pages/registerTecnico/RegisterTecnico";
import { GestionTecnicos } from "../pages/technicians/GestionTecnicos";
import { Categoria } from "../pages/categoria/Categoria";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardClientePage } from "../pages/cliente/DashboardClientePage";
import { CrearSolicitudPage } from "../pages/cliente/CrearSolicitudPage";
import { MisSolicitudesPage } from "../pages/cliente/MisSolicitudesPage";
import { MisServiciosClientePage } from "../pages/cliente/MisServiciosClientePage";
import { ChatGrupalPage } from "../pages/cliente/ChatGrupalPage";
import { ListaOfertasPage } from "../pages/cliente/ListaOfertasPage";
import { ChatPrivadoPage } from "../pages/cliente/ChatPrivadoPage";
import { DashboardTecnicoPage } from "../pages/tecnico/DashboardTecnicoPage";
import { SolicitudesDisponiblesPage } from "../pages/tecnico/SolicitudesDisponiblesPage";
import { ChatGrupalTecnicoPage } from "../pages/tecnico/ChatGrupalTecnicoPage";
import { ChatPrivadoTecnicoPage } from "../pages/tecnico/ChatPrivadoTecnicoPage";
import { MisServiciosPage } from "../pages/tecnico/MisServiciosPage";
import { PerfilClientePage } from "../pages/cliente/PerfilClientePage";
import { PerfilTecnicoPage } from "../pages/tecnico/PerfilTecnicoPage";
import { PagoPage } from "../pages/cliente/PagoPage";
import { CalificarTecnicoPage } from "../pages/cliente/CalificarTecnicoPage";
import { TecnicosRecomendadosPage } from "../pages/TecnicosRecomendadosPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Panel ADMIN protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRouteByRole allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRouteByRole>
          }
        >
          <Route path="technicians" element={<TechnicianListPage />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="listausuario" element={<ListarUsuarios />} />
          <Route path="registertecnico" element={<RegisterTecnico />} />
          <Route path="technicians/:id" element={<TechnicianProfilePage />} />
          <Route path="request" element={<RequestListPage />} />
          <Route path="payments" element={<PaymentsListPage />} />
          <Route path="reports" element={<ReportsBIPage />} />
          <Route path="activarTecnico" element={<GestionTecnicos />} />
          <Route path="categoria" element={<Categoria />} />
        </Route>

        {/* Panel CLIENTE protegido */}
        <Route
          path="/cliente"
          element={
            <ProtectedRouteByRole allowedRoles={["cliente"]}>
              <ClienteLayout />
            </ProtectedRouteByRole>
          }
        >
          <Route index element={<DashboardClientePage />} />
          <Route path="solicitar" element={<CrearSolicitudPage />} />
          <Route path="solicitudes" element={<MisSolicitudesPage />} />
          <Route path="servicios" element={<MisServiciosClientePage />} />
          <Route path="solicitud/:id/chat" element={<ChatGrupalPage />} />
          <Route path="solicitud/:id/ofertas" element={<ListaOfertasPage />} />
          <Route path="solicitud/:id/recomendados" element={<TecnicosRecomendadosPage />} />
          <Route path="servicio/:id/chat" element={<ChatPrivadoPage />} />
          <Route path="servicio/:id/pago" element={<PagoPage />} />
          <Route path="servicio/:id/calificar" element={<CalificarTecnicoPage />} />
          <Route path="perfil" element={<PerfilClientePage />} />
        </Route>

        {/* Panel TÉCNICO protegido */}
        <Route
          path="/tecnico"
          element={
            <ProtectedRouteByRole allowedRoles={["tecnico"]}>
              <TecnicoLayout />
            </ProtectedRouteByRole>
          }
        >
          <Route index element={<DashboardTecnicoPage />} />
          <Route path="solicitudes" element={<SolicitudesDisponiblesPage />} />
          <Route path="solicitud/:id/chat" element={<ChatGrupalTecnicoPage />} />
          <Route path="servicios" element={<MisServiciosPage />} />
          <Route path="servicio/:id/chat" element={<ChatPrivadoTecnicoPage />} />
          <Route path="perfil" element={<PerfilTecnicoPage />} />
        </Route>

        {/* Rutas de error */}
        <Route path="/unauthorized" element={<h1>No autorizado</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
