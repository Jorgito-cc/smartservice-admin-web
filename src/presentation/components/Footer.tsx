export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300 mt-20 border-t border-indigo-700/30">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Marca */}
        <div>
          <h3 className="text-white font-extrabold text-lg">
            SmartService S.R.L.
          </h3>
          <p className="text-sm mt-3 text-gray-400 leading-relaxed">
            Plataforma web inteligente basada en <span className="text-indigo-400 font-semibold">Machine Learning</span> y 
            <span className="text-indigo-400 font-semibold"> Business Intelligence</span> para la gestión, recomendación y análisis 
            de servicios a domicilio.
          </p>
        </div>

        {/* Sección de navegación */}
        <div>
          <h3 className="text-white font-semibold mb-3">Navegación</h3>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-indigo-400 transition" href="#">Inicio</a></li>
            <li><a className="hover:text-indigo-400 transition" href="#">Solicitar Servicio</a></li>
            <li><a className="hover:text-indigo-400 transition" href="#">Técnicos</a></li>
            <li><a className="hover:text-indigo-400 transition" href="#">Panel Administrativo</a></li>
            <li><a className="hover:text-indigo-400 transition" href="#">Recomendaciones (IA)</a></li>
          </ul>
        </div>

        {/* Información del proyecto */}
        <div>
          <h3 className="text-white font-semibold mb-3">Tecnologías</h3>
          <ul className="space-y-2 text-sm">
            <li className="text-gray-400 hover:text-indigo-400 transition">Machine Learning (Python / Scikit-learn)</li>
            <li className="text-gray-400 hover:text-indigo-400 transition">Business Intelligence (Power BI / Metabase)</li>
            <li className="text-gray-400 hover:text-indigo-400 transition">Backend: Django REST Framework</li>
            <li className="text-gray-400 hover:text-indigo-400 transition">Frontend: React & Flutter</li>
            <li className="text-gray-400 hover:text-indigo-400 transition">Base de Datos: PostgreSQL</li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contacto</h3>
          <p className="text-sm text-gray-400">📧 soporte@smartservice.com.bo</p>
          <p className="text-sm text-gray-400">📍 Santa Cruz de la Sierra – Bolivia</p>
          <p className="text-sm text-gray-400 mt-3">
            Horario de atención: <br />
            <span className="text-indigo-400">Lun - Vie 08:00 a 18:00</span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700/40 text-center py-4 text-xs text-gray-500">
        © 2025 SmartService S.R.L. — Sistema Web y Móvil con Inteligencia Artificial. Todos los derechos reservados.
      </div>
    </footer>
  );
};
