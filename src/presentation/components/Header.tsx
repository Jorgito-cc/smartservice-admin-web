import viteLogo from '/vite.svg'
export const Header = () => {
  return (
    <>
      <header>
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4  px-6">
          <div className="flex items-center gap-2">
            <img src={viteLogo} alt="logo de la app" className="w-8 h-8" />
            <h1 className="font-semibold text-lg text-gray-900">
              SMARTSERVCIE
            </h1>
          </div>
         
        
        </div>
      </header>
    </>
  );
};
