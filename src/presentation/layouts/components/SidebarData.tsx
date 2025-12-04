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
      { label: "registar Tecnico", to: "/admin/registertecnico" },
      { label: "Activar Tecnico", to: "/admin/activarTecnico" },
    ],
  },
   {
    key: "tecnicos",
    icon: <FaUser />,
    title: "Tecnicos",
    items: [


      { label: "Tecnicos", to: "/admin/technicians" },
      { label: "Categoria", to: "/admin/categoria" },

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
export const BRAND = "SmartService.Admin";
