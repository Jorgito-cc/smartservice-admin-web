/**
 * GUÍA DE INTEGRACIÓN - Cómo usar los componentes de ML
 * 
 * Hay 3 formas diferentes de mostrar técnicos recomendados:
 */

// ============================================
// OPCIÓN 1: En el Dashboard del Cliente
// ============================================
// Archivo: src/presentation/pages/cliente/DashboardClientePage.tsx

/*
import { TarjetaRecomendacionesMini } from "../../components/ml/TarjetaRecomendacionesMini";

export const DashboardClientePage = () => {
  const solicitudActual = 1; // ID de la solicitud que el cliente está viendo

  return (
    <div className="space-y-6">
      <h1>Dashboard del Cliente</h1>
      
      {/* Mostrar recomendaciones aquí }
      <TarjetaRecomendacionesMini
        id_solicitud={solicitudActual}
        maxMostrar={3}
        onSelectTecnico={(tecnico) => {
          console.log("Técnico seleccionado:", tecnico);
          // Navegar o hacer algo con el técnico
        }}
      />
    </div>
  );
};
*/

// ============================================
// OPCIÓN 2: En el listado de solicitudes
// ============================================
// Archivo: src/presentation/pages/cliente/MisSolicitudesPage.tsx

/*
import { ListaSolicitudesConRecomendaciones } from "../../components/ml/ListaSolicitudesConRecomendaciones";

export const MisSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  // Cargar solicitudes...

  return (
    <div>
      <h1>Mis Solicitudes</h1>
      
      {/* Mostrar lista con recomendaciones integradas }
      <ListaSolicitudesConRecomendaciones solicitudes={solicitudes} />
    </div>
  );
};
*/

// ============================================
// OPCIÓN 3: Página completa de recomendaciones
// ============================================
// URL: /cliente/solicitud/:id/recomendados
// Archivo: src/presentation/pages/TecnicosRecomendadosPage.tsx

// Ya existe y se accede desde la ruta indicada

// ============================================
// COMPONENTS DISPONIBLES:
// ============================================

/**
 * 1. TarjetaRecomendacionesMini
 * - Muestra 3 técnicos recomendados en formato tarjeta
 * - Perfecto para dashboard o preview
 * - Incluye foto, rating, distancia, compatibilidad
 * 
 * Props:
 * - id_solicitud: number (REQUERIDO)
 * - maxMostrar?: number (default: 3)
 * - onSelectTecnico?: (tecnico) => void
 */

/**
 * 2. ListaSolicitudesConRecomendaciones
 * - Muestra lista de solicitudes expandibles
 * - Al expandir, muestra recomendaciones para esa solicitud
 * - Integra TarjetaRecomendacionesMini internamente
 * 
 * Props:
 * - solicitudes: Solicitud[] (REQUERIDO)
 */

/**
 * 3. TecnicosRecomendadosPage
 * - Página completa dedicada a recomendaciones
 * - Acceso: /cliente/solicitud/{id}/recomendados
 * - Muestra todos los técnicos con muchos detalles
 */

/**
 * 4. BuscarTecnicosRecomendados
 * - Componente antiguo, usar TarjetaRecomendacionesMini en su lugar
 */

// ============================================
// HOOKS DISPONIBLES:
// ============================================

import { useRecomendaciones, useFiltrarRecomendaciones } from "../hooks/useRecomendaciones";

/*
// Usar el hook en un componente:
const MiComponente = () => {
  const { tecnicos, loading, error, mlStatus, refetch } = 
    useRecomendaciones(id_solicitud, true);

  // Filtrar y ordenar
  const tecnicosOrdenados = useFiltrarRecomendaciones(tecnicos, {
    ordenarPor: "score",
    limitar: 5,
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tecnicosOrdenados.map(t => (
        <div key={t.id_tecnico}>
          {t.nombre} - {t.score_recomendacion}%
        </div>
      ))}
    </div>
  );
};
*/

// ============================================
// API DISPONIBLE:
// ============================================

import { 
  obtenerRecomendacionesTecnicos,
  verificarSaludML, 
  obtenerInfoModelo 
} from "../api/ml";

/*
// Usar directamente en un componente:
const tecnicos = await obtenerRecomendacionesTecnicos(id_solicitud);
const salud = await verificarSaludML();
const info = await obtenerInfoModelo();
*/

// ============================================
// TIPOS TYPESCRIPT:
// ============================================

import { 
  TecnicoConRecomendacion,
  MLHealthResponse,
  MLRecomendacionResponse 
} from "../types/ml";

// ============================================
// EJEMPLO COMPLETO DE USO:
// ============================================

/*
import React, { useState, useEffect } from 'react';
import { TarjetaRecomendacionesMini } from '../../components/ml/TarjetaRecomendacionesMini';
import { TecnicoConRecomendacion } from '../../types/ml';

export const EjemploCompleto = () => {
  const [solicitudActual, setSolicitudActual] = useState(1);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<TecnicoConRecomendacion | null>(null);

  const handleTecnicoSeleccionado = (tecnico: TecnicoConRecomendacion) => {
    setTecnicoSeleccionado(tecnico);
    console.log("Técnico elegido:", tecnico.nombre, tecnico.apellido);
    // Aquí podrías navegar o abrir un modal con más detalles
  };

  return (
    <div className="p-6 space-y-4">
      <h1>Solicitud #{solicitudActual}</h1>
      
      <TarjetaRecomendacionesMini
        id_solicitud={solicitudActual}
        maxMostrar={3}
        onSelectTecnico={handleTecnicoSeleccionado}
      />

      {tecnicoSeleccionado && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>Has seleccionado a: {tecnicoSeleccionado.nombre} {tecnicoSeleccionado.apellido}</p>
          <p>Email: {tecnicoSeleccionado.email}</p>
          <p>Rating: {tecnicoSeleccionado.calificacion_promedio}⭐</p>
        </div>
      )}
    </div>
  );
};
*/

// ============================================
// RECOMENDACIONES DE USO:
// ============================================

/*
✅ USAR TarjetaRecomendacionesMini CUANDO:
   - Quieres mostrar un preview rápido
   - Estás en un dashboard o lista
   - El espacio es limitado
   - Quieres que sea visual y compacto

✅ USAR ListaSolicitudesConRecomendaciones CUANDO:
   - Tienes una lista de solicitudes
   - Quieres que las recomendaciones sean expandibles
   - Quieres agrupar todo en un componente

✅ USAR TecnicosRecomendadosPage CUANDO:
   - Quieres una vista completa y detallada
   - El usuario hace clic en "Ver todos"
   - Quieres mostrar muchas opciones de ordenamiento

✅ USAR useRecomendaciones HOOK CUANDO:
   - Quieres controlar manualmente la lógica
   - Necesitas acceso a loading, error, status
   - Quieres implementar un componente personalizado
*/

export const GUIA_INTEGRACION = true;
