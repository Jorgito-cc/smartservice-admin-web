import viteLogo from "/vite.svg";

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-indigo-200/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">

        {/* LOGO + MARCA */}
        <div className="flex items-center gap-3">
          <img
            src={viteLogo}
            alt="logo de la app"
            className="w-9 h-9 drop-shadow-md"
          />
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            SmartService
          </h1>
        </div>

        {/* NAVBAR DE SECCIONES */}
    

        {/* BOTONES DE ROLES */}
        <div className="flex items-center gap-4">
          <button className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition">
            Acceder Técnico
          </button>

          <button className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition">
            Acceder Cliente
          </button>

          <button className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-md transition">
            Panel Admin
          </button>
        </div>
      </div>
    </header>
  );
};
