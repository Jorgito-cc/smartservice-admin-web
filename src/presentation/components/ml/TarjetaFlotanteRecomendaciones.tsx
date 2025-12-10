/**
 * TarjetaFlotanteRecomendaciones
 * 
 * Widget flotante que aparece en la esquina inferior derecha
 * mostrando recomendaciones de técnicos automáticamente
 */

import React, { useState, useEffect } from "react";
import { ChevronUp, X, Sparkles } from "lucide-react";
import { VisualizadorRecomendacionesRápido } from "./VisualizadorRecomendacionesRápido";
import type  { TecnicoConRecomendacion } from "../../../types/ml";

interface Props {
  tecnicos: TecnicoConRecomendacion[];
  loading?: boolean;
  posicion?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  autoAbrir?: boolean;
  tiempoAutoAbrir?: number;
}

export const TarjetaFlotanteRecomendaciones: React.FC<Props> = ({
  tecnicos,
  loading = false,
  posicion = "bottom-right",
  autoAbrir = true,
  tiempoAutoAbrir = 3000,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(true);

  useEffect(() => {
    if (autoAbrir && tecnicos.length > 0) {
      const timer = setTimeout(() => {
        setAbierto(true);
        setMinimizado(false);
      }, tiempoAutoAbrir);

      return () => clearTimeout(timer);
    }
  }, [autoAbrir, tecnicos.length, tiempoAutoAbrir]);

  if (tecnicos.length === 0 && !loading) {
    return null;
  }

  const posicionClases = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <div className={`fixed ${posicionClases[posicion]} z-40 max-w-sm`}>
      {/* Botón flotante minimizado */}
      {minimizado && !abierto && (
        <button
          onClick={() => {
            setAbierto(true);
            setMinimizado(false);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-2xl hover:scale-110 transition-all animate-bounce"
          title="Ver recomendaciones"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Tarjeta expandida */}
      {abierto && !minimizado && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold">Técnicos Recomendados</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMinimizado(true);
                  setAbierto(false);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Minimizar"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setAbierto(false);
                  setMinimizado(true);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <VisualizadorRecomendacionesRápido
              tecnicos={tecnicos}
              loading={loading}
              onClose={() => {
                setAbierto(false);
                setMinimizado(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
