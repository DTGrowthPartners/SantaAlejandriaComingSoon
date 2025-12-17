import { Construction } from "lucide-react";

const ConstructionNotice = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className="group relative flex items-center gap-2 bg-secondary/90 backdrop-blur-sm text-[#FDFCF6] px-4 py-2 rounded-full shadow-lg border border-secondary/20 transition-all duration-300 hover:bg-secondary hover:shadow-xl">
        <Construction className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Sitio web en construcción
        </span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/80 text-[#FDFCF6] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          ¡Muy pronto estarán disponibles todas nuestras funcionalidades!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionNotice;