import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/landing/LandingPage";
import { AdminLayout } from "../layouts/AdminLayout";
import { TechnicianListPage } from "../pages/technicians/TechicianListPage";
import { TechnicianProfilePage } from "../pages/technicians/TechicianProfilePage";
import { RequestListPage } from "../pages/requests/RequestListPage";
import { PaymentsListPage } from "../pages/payments/PaymentsListPage";
import { ReportsBIPage } from "../pages/reports/ReportsBIPage";
import ProtectedRoute from "./ProtectedRoute";
import { Bitacora } from "../pages/auditoria/Bitacora";
import { ListarUsuarios } from "../pages/listaUsuario/ListarUsuarios";
import { RegisterTecnico } from "../pages/registerTecnico/RegisterTecnico";
import { GestionTecnicos } from "../pages/technicians/GestionTecnicos";
import { Categoria } from "../pages/categoria/Categoria";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Panel ADMIN protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="technicians" element={<TechnicianListPage />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="listausuario" element={<ListarUsuarios />} />
          <Route path="registertecnico" element={<RegisterTecnico/>} />
          <Route path="technicians/:id" element={<TechnicianProfilePage />} />
          <Route path="request" element={<RequestListPage />} />
          <Route path="payments" element={<PaymentsListPage />} />
          <Route path="reports" element={<ReportsBIPage />} />
          <Route path="reports" element={<ReportsBIPage />} />
          <Route path="activarTecnico" element={<GestionTecnicos />} />
          <Route path="categoria" element={<Categoria />} />


        </Route>

        {/* Rutas de error */}
        <Route path="/unauthorized" element={<h1>No autorizado</h1>} />
        <Route path="/login" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};
