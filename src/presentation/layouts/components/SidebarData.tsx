import type { ReactNode } from "react";
import { FaUser} from "react-icons/fa";

export type LinkItem = { label: string; to: string };
export type Section = {
  key: string;
  icon: ReactNode;
  title: string;
  items: LinkItem[];
};

export const sections: Section[] = [
  {
    key: "usuario",
    icon: <FaUser />,
    title: "Usuario",
    items: [
      { label: "Bitácora", to: "/admin/bitacora" },
      { label: "Lista de Usuarios", to: "/admin/listausuario" },

    ],
  },
   {
    key: "tecnicos",
    icon: <FaUser />,
    title: "Tecnicos",
    items: [


      { label: "Tecnicos", to: "/admin/technicians" },
    ],
  },
   {
    key: "solicitudes",
    icon: <FaUser />,
    title: "Solicitudes",
    items: [


      { label: "Solicitudes", to: "/admin/request" },
    ],
  },
    {
    key: "Pagos y Comisiones",
    icon: <FaUser />,
    title: "Pagos y Comisiones",
    items: [


      { label: "Pagos y Comisiones", to: "/admin/payments" },
    ],
  },
      {
    key: "Reportes",
    icon: <FaUser />,
    title: "Reportes",
    items: [


      { label: "Reportes", to: "/admin/reports" },
    ],
  },
];

export const soporteLink: LinkItem = { label: "Soporte Tecnico", to: "/admin/soporte" };
export const ManualLink: LinkItem = { label: "Manual Tecnico", to: "/admin/manual" };
export const ManualteoricoLink: LinkItem = { label: "Manual", to: "/admin/manualteorico" };
export const BRAND = "SmartService.Admin";
