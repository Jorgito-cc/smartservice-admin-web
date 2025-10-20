


import { BrowserRouter, Routes, Route } from "react-router-dom";
import {LandingPage} from "../pages/landing/LandingPage";
import { AdminLayout } from "../layouts/AdminLayout";
import { TechnicianListPage } from "../pages/technicians/TechicianListPage";
import { TechnicianProfilePage } from "../pages/technicians/TechicianProfilePage";
import { RequestListPage } from "../pages/requests/RequestListPage";
import { PaymentsListPage } from "../pages/payments/PaymentsListPage";
import { ReportsBIPage } from "../pages/reports/ReportsBIPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* paguina publica  */}
        <Route path="/" element={<LandingPage />} />
        {/* panel administrativo  */}
        <Route path="/admin" element={<AdminLayout />}>
       <Route path="technicians" element={<TechnicianListPage />} />
<Route path="technicians/:id" element={<TechnicianProfilePage />} />
       <Route path="request" element={<RequestListPage />} />


       <Route path="payments" element={<PaymentsListPage />} />
       <Route path="reports" element={<ReportsBIPage />} />

      </Route>
      </Routes>
    </BrowserRouter>
  );
}
