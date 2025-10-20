
export const Footer = () => {
  return (
    <>

 <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-white font-semibold mb-2">SmartService S.R.L.</h3>
          <p className="text-sm">
            Plataforma inteligente para gestión y recomendación de servicios a domicilio.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">Enlaces</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-blue-400">Inicio</a></li>
            <li><a href="#" className="hover:text-blue-400">Servicios</a></li>
            <li><a href="#" className="hover:text-blue-400">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">Contacto</h3>
          <p className="text-sm">📧 contacto@smartservice.com.bo</p>
          <p className="text-sm">📍 Santa Cruz, Bolivia</p>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
        © 2025 SmartService S.R.L. - Todos los derechos reservados.
      </div>
    </footer>
    </>
  )
}
