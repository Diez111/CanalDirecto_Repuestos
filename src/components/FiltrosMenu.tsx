import React, { useState, useEffect } from 'react';
import { Filter, Calendar, MapPin, User, AlertTriangle, X } from 'lucide-react';
import { Filtros } from '../types';
import { dataService } from '../services/dataService';

interface FiltrosMenuProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  onCerrar: () => void;
  modoOscuro?: boolean;
}

const FiltrosMenu: React.FC<FiltrosMenuProps> = ({ filtros, onFiltrosChange, onCerrar, modoOscuro = false }) => {
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [, setTecnicos] = useState<string[]>([]);
  const [tiposFalla, setTiposFalla] = useState<string[]>([]);

  useEffect(() => {
    const cargarDatos = () => {
      const ubicacionesData = dataService.getUbicaciones();
      const incidentes = dataService.getIncidentes();
      
      setUbicaciones(ubicacionesData);
      
      // Extraer técnicos únicos
      const tecnicosUnicos = [...new Set(incidentes.map(i => i.tecnico))];
      setTecnicos(tecnicosUnicos);
      
      // Extraer tipos de falla únicos
      const tiposFallaUnicos = [...new Set(incidentes.map(i => i.tipoFalla))];
      setTiposFalla(tiposFallaUnicos);
    };

    cargarDatos();
  }, []);

  const handleFiltroChange = (campo: keyof Filtros, valor: any) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({});
  };

  const getInputClasses = () => `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    modoOscuro 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const getCheckboxClasses = () => `rounded text-blue-600 focus:ring-blue-500 ${
    modoOscuro ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
  }`;

  const getButtonClasses = (variant: 'primary' | 'secondary') => {
    const base = 'px-4 py-2 rounded-md transition-colors';
    if (variant === 'primary') {
      return `${base} ${modoOscuro 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`;
    }
    return `${base} ${modoOscuro 
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;
  };

  const dificultades = [
    { valor: 'baja', etiqueta: 'Baja', color: 'bg-green-100 text-green-800' },
    { valor: 'media', etiqueta: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { valor: 'alta', etiqueta: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { valor: 'critica', etiqueta: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${modoOscuro ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <h2 className={`text-xl font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>Filtros y Clasificación</h2>
          </div>
          <button
            onClick={onCerrar}
            className={`${modoOscuro ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtros por fecha */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              <Calendar className="w-4 h-4" />
              Rango de Fechas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${modoOscuro ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Desde</label>
                <input
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  className={getInputClasses()}
                />
              </div>
              <div>
                <label className={`block text-xs ${modoOscuro ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  className={getInputClasses()}
                />
              </div>
            </div>
          </div>

          {/* Filtros por dificultad */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              <AlertTriangle className="w-4 h-4" />
              Dificultad
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dificultades.map((dificultad) => (
                <label key={dificultad.valor} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.dificultad?.includes(dificultad.valor) || false}
                    onChange={(e) => {
                      const nuevasDificultades = filtros.dificultad || [];
                      if (e.target.checked) {
                        handleFiltroChange('dificultad', [...nuevasDificultades, dificultad.valor]);
                      } else {
                        handleFiltroChange('dificultad', nuevasDificultades.filter(d => d !== dificultad.valor));
                      }
                    }}
                    className={getCheckboxClasses()}
                  />
                  <span className={`px-2 py-1 rounded-full text-xs ${dificultad.color}`}>
                    {dificultad.etiqueta}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por ubicación */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              <MapPin className="w-4 h-4" />
              Ubicaciones
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
              {ubicaciones.map((ubicacion) => (
                <label key={ubicacion.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.ubicacion?.includes(ubicacion.id) || false}
                    onChange={(e) => {
                      const nuevasUbicaciones = filtros.ubicacion || [];
                      if (e.target.checked) {
                        handleFiltroChange('ubicacion', [...nuevasUbicaciones, ubicacion.id]);
                      } else {
                        handleFiltroChange('ubicacion', nuevasUbicaciones.filter(u => u !== ubicacion.id));
                      }
                    }}
                    className={getCheckboxClasses()}
                  />
                  <span className="text-sm">{ubicacion.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por tipo de falla */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              <AlertTriangle className="w-4 h-4" />
              Tipo de Falla
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
              {tiposFalla.map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.tipoFalla?.includes(tipo) || false}
                    onChange={(e) => {
                      const nuevosTipos = filtros.tipoFalla || [];
                      if (e.target.checked) {
                        handleFiltroChange('tipoFalla', [...nuevosTipos, tipo]);
                      } else {
                        handleFiltroChange('tipoFalla', nuevosTipos.filter(t => t !== tipo));
                      }
                    }}
                    className={getCheckboxClasses()}
                  />
                  <span className="text-sm">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por técnico */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              <User className="w-4 h-4" />
              Técnico
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre de técnico..."
              value={filtros.tecnico || ''}
              onChange={(e) => handleFiltroChange('tecnico', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={limpiarFiltros}
              className={getButtonClasses('secondary')}
            >
              Limpiar Filtros
            </button>
            <button
              onClick={onCerrar}
              className={getButtonClasses('primary')}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosMenu;
