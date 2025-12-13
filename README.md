# 🎨 SmartService Admin Web

Panel administrativo y portal web para **SmartService** — una plataforma integral para la gestión, recomendación y análisis de servicios a domicilio mediante **Inteligencia Artificial** y **Business Intelligence**.

---

## 🚀 Descripción General

**SmartService Admin Web** es una aplicación web moderna desarrollada con **React 19**, **TypeScript** y **Vite**. Proporciona un panel de administración robusto para gestionar usuarios, servicios, técnicos, solicitudes, pagos y análisis de IA.

---

## 🛠️ Tecnologías Utilizadas

### Frontend Stack
- **React** `19.1.1` - Librería UI moderna
- **TypeScript** `~5.9.3` - Tipado estático
- **Vite** `7.1.7` - Build tool ultrarrápido
- **React Router** `7.9.4` - Enrutamiento
- **TailwindCSS** `3.4.18` - Utilidades CSS

### State Management & Formularios
- **React Hook Form** `7.65.0` - Gestión de formularios eficiente
- **Zod** `4.1.12` - Validación de esquemas TypeScript

### Comunicación
- **Axios** `1.13.2` - Cliente HTTP
- **Socket.io Client** `4.8.1` - WebSocket en tiempo real

### Visualización
- **Chart.js** `4.5.1` - Gráficos
- **Recharts** `3.3.0` - Gráficos React
- **Lucide React** `0.559.0` - Iconografía moderna
- **React Icons** `5.5.0` - Más iconos

### Exportación de Datos
- **jsPDF** `3.0.4` - Generación de PDFs
- **html2canvas** `1.4.1` - Captura de HTML a imagen
- **XLSX** `0.18.5` - Exportación a Excel

### Mapas
- **@react-google-maps/api** `2.20.7` - Google Maps integration

### Dev Tools
- **Vite React SWC Plugin** - Compilación rápida
- **ESLint** `9.36.0` - Linting
- **TypeScript ESLint** - Linting TypeScript
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad CSS

---

## 📁 Estructura del Proyecto

```
smartservice-admin-web/
├── src/
│   ├── main.tsx                    # Punto de entrada
│   ├── App.tsx                     # Componente raíz
│   ├── App.css                     # Estilos globales
│   ├── index.css                   # Tailwind imports
│   ├── api/                        # Clientes y servicios HTTP
│   │   ├── auth.ts
│   │   ├── usuarios.ts
│   │   ├── tecnicos.ts
│   │   ├── servicios.ts
│   │   ├── solicitud.ts
│   │   ├── pago.ts
│   │   ├── chat.ts
│   │   ├── reportes.ts
│   │   ├── ml.ts
│   │   └── axios.ts                # Instancia Axios configurada
│   ├── context/
│   │   └── AuthContext.tsx         # Contexto de autenticación
│   ├── hooks/
│   │   ├── useML.ts                # Hook para IA
│   │   └── useRecomendaciones.ts   # Hook para recomendaciones
│   ├── types/                      # Tipos TypeScript
│   │   ├── authType.ts
│   │   ├── userType.ts
│   │   ├── tecnicoType.ts
│   │   ├── ml.ts
│   │   └── ...
│   ├── presentation/
│   │   ├── pages/                  # Páginas/Pantallas
│   │   │   ├── auth/
│   │   │   ├── cliente/
│   │   │   ├── tecnico/
│   │   │   └── ...
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── AuthModal.tsx
│   │   │   ├── ChatGrupal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ml/
│   │   ├── layouts/                # Layouts
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ClienteLayout.tsx
│   │   │   └── TecnicoLayout.tsx
│   │   ├── router/                 # Rutas
│   │   │   ├── AppRouter.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ProtectedRouteByRole.tsx
│   │   └── viewmodels/             # ViewModels (MVVM)
│   │       └── useAuthVM.ts
│   └── utils/                      # Utilidades
│       ├── socket.ts               # Configuración Socket.io
│       └── uploadCloudinary.ts     # Upload a Cloudinary
├── public/
│   └── _redirects                  # Config para Netlify
├── .env                            # Variables de entorno (NO subir)
├── .env-example                    # Ejemplo de variables
├── index.html                      # HTML raíz
├── package.json
├── tsconfig.json                   # Configuración TypeScript
├── vite.config.ts                  # Configuración Vite
├── tailwind.config.js              # Configuración TailwindCSS
├── postcss.config.js               # Configuración PostCSS
├── eslint.config.js                # Configuración ESLint
└── README.md
```

---

## 🎯 Características Principales

### 👨‍💼 Administrador
✅ **Gestión de Usuarios** - CRUD de clientes y técnicos
✅ **Panel de Control** - Dashboard con métricas
✅ **Auditoría** - Bitácora de actividades
✅ **Reportes** - Análisis y exportación de datos

### 👤 Cliente
✅ **Solicitud de Servicios** - Crear y trackear solicitudes
✅ **Búsqueda de Técnicos** - Con recomendaciones de IA
✅ **Chat** - Comunicación en tiempo real
✅ **Calificación** - Evaluar servicios completados
✅ **Pagos** - Integración Stripe

### 🔧 Técnico
✅ **Ofertas** - Responder a solicitudes
✅ **Calendario** - Gestionar disponibilidad
✅ **Ganancias** - Ver ingresos y estadísticas
✅ **Perfil** - Especialidades y zonas de cobertura

### 🤖 IA & ML
✅ **Recomendación de Técnicos** - Motor IA
✅ **Análisis Predictivo** - Insights de datos
✅ **Visualización de Modelos** - Métricas ML

---

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 3.0.0
- **Git**

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tuusuario/smartservice-admin-web.git
cd smartservice-admin-web
```

### 2. Instalar Dependencias
```bash
npm install
# o con yarn
yarn install
```

### 3. Configurar Variables de Entorno
```bash
cp .env-example .env
```

Editar `.env` con tus configuraciones:
```dotenv
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset
VITE_GOOGLE_MAPS_API_KEY=tu_api_key
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
# La app se abrirá en http://localhost:5173
```

---

## 🔨 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Formatear código
npm run lint -- --fix
```

---

## 🧪 Testing

```bash
# Ejecutar pruebas (si están configuradas)
npm run test

# Cobertura de pruebas
npm run test:coverage
```

---

## 📦 Build para Producción

```bash
npm run build
```

Genera carpeta `dist/` lista para desplegar.

**Desplegar con Netlify:**
```bash
# netlify.toml ya está configurado
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🏗️ Arquitectura y Patrones

### MVVM Pattern
- **Models** - Tipos TypeScript en `types/`
- **Views** - Componentes React en `presentation/pages/` y `presentation/components/`
- **ViewModels** - Custom Hooks en `presentation/viewmodels/`

### API Client
Axios configurado en `src/api/axios.ts`:
```typescript
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Autenticación
- JWT tokens guardados en localStorage
- `AuthContext` para estado global
- `ProtectedRoute` para rutas privadas
- `ProtectedRouteByRole` para rutas por rol

### Comunicación en Tiempo Real
Socket.io configurado en `src/utils/socket.ts`:
```typescript
export const socket = io(import.meta.env.VITE_SOCKET_URL);
```

---

## 🔐 Autenticación

### Flujo Login
1. Usuario ingresa credenciales
2. `POST /api/auth/login` retorna JWT
3. JWT se guarda en localStorage
4. Axios automáticamente agrega header `Authorization: Bearer {token}`

### Roles Soportados
- `admin` - Acceso total
- `cliente` - Área cliente
- `tecnico` - Área técnico

---

## 🎨 Estilos con TailwindCSS

Configuración completa en `tailwind.config.js`:
```typescript
// Personaliza colores, espaciado, etc.
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#...',
        secondary: '#...',
      },
    },
  },
};
```

---

## 📊 Integración con Google Maps

```typescript
import { GoogleMap, Marker } from '@react-google-maps/api';

<GoogleMap center={center} zoom={12}>
  <Marker position={location} />
</GoogleMap>
```

---

## 💳 Integración Stripe

Backend maneja pagos. Frontend solo redirige:
```typescript
const { clientSecret } = await apiClient.post('/api/pago/intent', {
  amount: 1000, // centavos
});
```

---

## ☁️ Upload a Cloudinary

Configurado en `src/utils/uploadCloudinary.ts`:
```typescript
export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  // ...
};
```

---

## 🧩 Componentes Reutilizables

### Table.tsx
Tabla genérica con sorting y paginación:
```typescript
<Table<Usuario>
  data={usuarios}
  columns={[
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
  ]}
/>
```

### AuthModal.tsx
Modal de autenticación reutilizable

### ChatGrupal.tsx / ChatPrivado.tsx
Componentes de chat con Socket.io

---

## 🐛 Solución de Problemas

### Error: "CORS policy"
Asegúrate que backend tiene CORS habilitado:
```javascript
// backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
```

### Error: "Module not found"
```bash
npm install
rm -rf node_modules/.vite
npm run dev
```

### Error: "Cannot find module '@'"
Vite alias está en `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': '/src',
  },
},
```

---

## 📚 Recursos

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [Axios Guide](https://axios-http.com)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NewFeature`)
3. Commit (`git commit -m 'Add NewFeature'`)
4. Push (`git push origin feature/NewFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Licencia **ISC**. Ver [LICENSE](LICENSE).

---

## 👨‍💻 Autor

**Jorge Choque Calle**

---

## 📞 Soporte

- 📧 Email: [tu-email@example.com](mailto:tu-email@example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tuusuario/smartservice-admin-web/issues)

---

**Última actualización:** Diciembre 2025

