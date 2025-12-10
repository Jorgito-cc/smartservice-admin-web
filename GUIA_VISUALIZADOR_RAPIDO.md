/**
 * GUIA DE USO: VisualizadorRecomendacionesRápido
 * 
 * Este documento muestra cómo integrar el visualizador de recomendaciones
 * en diferentes páginas de tu aplicación.
 */

## 1. Uso en una Página de Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { VisualizadorRecomendacionesRápido } from '@/presentation/components/ml/VisualizadorRecomendacionesRápido';
import { obtenerRecomendacionesTecnicos } from '@/api/ml';
import { TecnicoConRecomendacion } from '@/types/ml';

export const DashboardClientePage: React.FC = () => {
  const [recomendaciones, setRecomendaciones] = useState<TecnicoConRecomendacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(true);

  useEffect(() => {
    const cargarRecomendaciones = async () => {
      try {
        setLoading(true);
        // Usar una solicitud de ejemplo o la más reciente
        const data = await obtenerRecomendacionesTecnicos(1); // id_solicitud = 1
        setRecomendaciones(data);
      } catch (error) {
        console.error('Error cargando recomendaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarRecomendaciones();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Mi Dashboard</h1>
      
      {/* Visualizador flotante */}
      {mostrarRecomendaciones && (
        <VisualizadorRecomendacionesRápido
          tecnicos={recomendaciones}
          loading={loading}
          onClose={() => setMostrarRecomendaciones(false)}
        />
      )}

      {/* Resto del contenido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cards del dashboard */}
      </div>
    </div>
  );
};
```

## 2. Uso en Modal/Popup

```tsx
import React, { useState } from 'react';
import { VisualizadorRecomendacionesRápido } from '@/presentation/components/ml/VisualizadorRecomendacionesRápido';

export const ModalRecomendaciones: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  id_solicitud: number;
}> = ({ isOpen, onClose, id_solicitud }) => {
  const { recomendaciones, loading } = useRecomendaciones(id_solicitud);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <VisualizadorRecomendacionesRápido
          tecnicos={recomendaciones}
          loading={loading}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
```

## 3. Uso en Sidebar

```tsx
import React from 'react';
import { VisualizadorRecomendacionesRápido } from '@/presentation/components/ml/VisualizadorRecomendacionesRápido';

export const ClienteLayout: React.FC = () => {
  const { recomendaciones, loading } = useRecomendaciones(currentSolicitudId);

  return (
    <div className="flex gap-6">
      {/* Contenido principal */}
      <main className="flex-1">
        {/* ... */}
      </main>

      {/* Sidebar con recomendaciones */}
      <aside className="w-96">
        <VisualizadorRecomendacionesRápido
          tecnicos={recomendaciones}
          loading={loading}
        />
      </aside>
    </div>
  );
};
```

## 4. Uso con Props Personalizados

```tsx
// Solo mostrar los 3 primeros
const top3 = recomendaciones.slice(0, 3);

<VisualizadorRecomendacionesRápido
  tecnicos={top3}
  loading={false}
  onClose={() => console.log('Recomendaciones cerradas')}
/>
```

## 5. Uso en Lista de Solicitudes

```tsx
import React from 'react';
import { VisualizadorRecomendacionesRápido } from '@/presentation/components/ml/VisualizadorRecomendacionesRápido';
import { Solicitud } from '@/types/solicitud';

interface SolicitudConRecomendacionesProps {
  solicitud: Solicitud;
}

export const SolicitudConRecomendaciones: React.FC<SolicitudConRecomendacionesProps> = ({
  solicitud,
}) => {
  const { recomendaciones, loading } = useRecomendaciones(solicitud.id);
  const [expandir, setExpandir] = React.useState(false);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{solicitud.descripcion}</h3>
        <button
          onClick={() => setExpandir(!expandir)}
          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          {expandir ? 'Ocultar' : 'Ver Recomendaciones'}
        </button>
      </div>

      {expandir && (
        <div className="mt-4 pt-4 border-t">
          <VisualizadorRecomendacionesRápido
            tecnicos={recomendaciones}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};
```

## 6. Uso con Efectos y Animaciones

```tsx
import React, { useState, useEffect } from 'react';
import { VisualizadorRecomendacionesRápido } from '@/presentation/components/ml/VisualizadorRecomendacionesRápido';

export const RecomendacionesConAnimación: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { recomendaciones, loading } = useRecomendaciones(solicitudId);

  useEffect(() => {
    // Mostrar después de 2 segundos
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {visible && (
        <VisualizadorRecomendacionesRápido
          tecnicos={recomendaciones}
          loading={loading}
          onClose={() => setVisible(false)}
        />
      )}
    </div>
  );
};
```

## 7. Características del Componente

### Props Disponibles:
- `tecnicos: TecnicoConRecomendacion[]` - Array de técnicos a mostrar (REQUERIDO)
- `loading?: boolean` - Si está cargando (default: false)
- `onClose?: () => void` - Callback al cerrar (opcional)

### Características:
- ✅ Navegación entre técnicos (anterior/siguiente)
- ✅ Indicadores de progreso (barra y puntos)
- ✅ Información completa: foto, nombre, especialidades, calificación, distancia, compatibilidad
- ✅ Botones de contacto (email, teléfono)
- ✅ Badges de disponibilidad
- ✅ Descripción del técnico
- ✅ Enlace a vista completa
- ✅ Responsive (funciona en móvil y desktop)
- ✅ Modo cargando con animación

## 8. Integración en ClienteLayout

Recomendación: Añade una sección flotante en la parte superior del dashboard:

```tsx
// En ClienteLayout.tsx
{mostrarRecomendaciones && (
  <div className="mb-6">
    <VisualizadorRecomendacionesRápido
      tecnicos={recomendaciones}
      loading={loading}
      onClose={() => setMostrarRecomendaciones(false)}
    />
  </div>
)}
```

## 9. Estilos Personalizados

Si quieres personalizar colores:

```tsx
// Añade variables CSS en tu archivo global
:root {
  --color-recomendacion-primary: #4f46e5; /* Indigo */
  --color-recomendacion-secondary: #9333ea; /* Purple */
  --color-recomendacion-success: #22c55e; /* Green */
}

// Y usa en los className de VisualizadorRecomendacionesRápido
```

## 10. Mensajes de Error

El componente maneja automáticamente:
- Array vacío: No renderiza nada
- Loading: Muestra spinner
- Sin foto: Muestra iniciales en círculo gradiente

¡El componente está listo para usar en cualquier página! 🚀
