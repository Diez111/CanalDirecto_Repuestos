import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, MapPin } from 'lucide-react';
import { EstadisticasRepuesto } from '../types';
import { dataService } from '../services/dataService';
import { getCardClasses, getTextClasses, getSelectClasses, getBackgroundClasses, getSubTextClasses, getBorderClasses } from '../utils/colorUtils';

interface EstadisticasRepuestosProps {
  filtros?: any;
  modoOscuro?: boolean;
}

const EstadisticasRepuestos: React.FC<EstadisticasRepuestosProps> = ({ filtros, modoOscuro = false }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasRepuesto[]>([]);
  const [ordenamiento, setOrdenamiento] = useState<'cantidad' | 'frecuencia'>('cantidad');
  const [limite, setLimite] = useState(10);

  useEffect(() => {
    const cargarEstadisticas = () => {
      const stats = dataService.getEstadisticasRepuestos();
      setEstadisticas(stats);
    };

    cargarEstadisticas();
  }, [filtros]);

  const estadisticasOrdenadas = [...estadisticas].sort((a, b) => {
    switch (ordenamiento) {
      case 'cantidad':
        return b.totalUtilizado - a.totalUtilizado;
      case 'frecuencia':
        return b.frecuencia - a.frecuencia;
      default:
        return 0;
    }
  }).slice(0, limite);

  const getColorPorPosicion = (index: number): string => {
    const colores = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-gray-500'
    ];
    return colores[index % colores.length];
  };

  const getMaximo = (): number => {
    switch (ordenamiento) {
      case 'cantidad':
        return Math.max(...estadisticas.map(s => s.totalUtilizado));
      case 'frecuencia':
        return Math.max(...estadisticas.map(s => s.frecuencia));
      default:
        return 1;
    }
  };

  const getValor = (stat: EstadisticasRepuesto): number => {
    switch (ordenamiento) {
      case 'cantidad':
        return stat.totalUtilizado;
      case 'frecuencia':
        return stat.frecuencia;
      default:
        return 0;
    }
  };

  const getEtiqueta = (): string => {
    switch (ordenamiento) {
      case 'cantidad':
        return 'Cantidad Total';
      case 'frecuencia':
        return 'Frecuencia de Uso';
      default:
        return '';
    }
  };

  const maximo = getMaximo();

  return (
    <div className={`${getBackgroundClasses(modoOscuro)} rounded-lg shadow-lg p-4 md:p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          <h2 className={`text-lg md:text-xl font-semibold ${getTextClasses(modoOscuro)}`}>Estadísticas de Repuestos</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value as any)}
            className={`${getSelectClasses(modoOscuro)} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="cantidad">Por Cantidad</option>
            <option value="frecuencia">Por Frecuencia</option>
          </select>
          
          <select
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className={`${getSelectClasses(modoOscuro)} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className={`${modoOscuro ? 'bg-blue-900' : 'bg-blue-50'} p-3 md:p-4 rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <span className={`text-xs md:text-sm font-medium ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>Total Repuestos</span>
          </div>
          <p className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-blue-100' : 'text-blue-900'}`}>{estadisticas.length}</p>
        </div>
        
        <div className={`${modoOscuro ? 'bg-green-900' : 'bg-green-50'} p-3 md:p-4 rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <span className={`text-xs md:text-sm font-medium ${modoOscuro ? 'text-green-300' : 'text-green-700'}`}>Total Utilizados</span>
          </div>
          <p className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-green-100' : 'text-green-900'}`}>
            {estadisticas.reduce((sum, s) => sum + s.totalUtilizado, 0)}
          </p>
        </div>
        
        <div className={`${modoOscuro ? 'bg-yellow-900' : 'bg-yellow-50'} p-3 md:p-4 rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className={`text-xs md:text-sm font-medium ${modoOscuro ? 'text-yellow-300' : 'text-yellow-700'}`}>Promedio por Repuesto</span>
          </div>
          <p className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-yellow-100' : 'text-yellow-900'}`}>
            {estadisticas.length > 0 ? Math.round(estadisticas.reduce((sum, s) => sum + s.totalUtilizado, 0) / estadisticas.length) : 0}
          </p>
        </div>
        
        <div className={`${modoOscuro ? 'bg-purple-900' : 'bg-purple-50'} p-3 md:p-4 rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            <span className={`text-xs md:text-sm font-medium ${modoOscuro ? 'text-purple-300' : 'text-purple-700'}`}>Ubicaciones</span>
          </div>
          <p className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-purple-100' : 'text-purple-900'}`}>
            {new Set(estadisticas.flatMap(s => s.ubicaciones)).size}
          </p>
        </div>
      </div>

      {/* Lista de repuestos */}
      <div className="space-y-3">
        <h3 className={`text-lg font-medium ${getTextClasses(modoOscuro)} mb-4`}>
          Top {limite} Repuestos - {getEtiqueta()}
        </h3>
        
        {estadisticasOrdenadas.map((stat, index) => {
          const valor = getValor(stat);
          const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;
          const color = getColorPorPosicion(index);
          
          return (
            <div key={stat.repuestoId} className={`border ${getBorderClasses(modoOscuro)} rounded-lg p-4 hover:shadow-md transition-shadow ${getCardClasses(modoOscuro)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className={`font-medium ${getTextClasses(modoOscuro)}`}>{stat.nombre}</h4>
                    <p className={`text-sm ${getSubTextClasses(modoOscuro)}`}>ID: {stat.repuestoId}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTextClasses(modoOscuro)}`}>
                    {valor}
                  </p>
                  <p className={`text-sm ${getSubTextClasses(modoOscuro)}`}>{getEtiqueta()}</p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className={`w-full ${modoOscuro ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                <div
                  className={`h-2 rounded-full ${color.replace('bg-', 'bg-').replace('-500', '-400')}`}
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
              
              {/* Detalles adicionales */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={getSubTextClasses(modoOscuro)}>Cantidad:</span>
                  <span className={`ml-1 font-medium ${getTextClasses(modoOscuro)}`}>{stat.totalUtilizado}</span>
                </div>
                <div>
                  <span className={getSubTextClasses(modoOscuro)}>Frecuencia:</span>
                  <span className={`ml-1 font-medium ${getTextClasses(modoOscuro)}`}>{stat.frecuencia}</span>
                </div>
              </div>
              
              {/* Ubicaciones donde se usa */}
              <div className={`mt-3 pt-3 border-t ${getBorderClasses(modoOscuro)}`}>
                <p className={`text-xs ${getSubTextClasses(modoOscuro)} mb-1`}>Ubicaciones donde se utiliza:</p>
                <div className="flex flex-wrap gap-1">
                  {stat.ubicaciones.slice(0, 3).map((ubicacionId) => {
                    const ubicacion = dataService.getUbicaciones().find(u => u.id === ubicacionId);
                    return (
                      <span
                        key={ubicacionId}
                        className={`px-2 py-1 ${modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-full text-xs`}
                      >
                        {ubicacion?.nombre || `Ubicación ${ubicacionId}`}
                      </span>
                    );
                  })}
                  {stat.ubicaciones.length > 3 && (
                    <span className={`px-2 py-1 ${modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-full text-xs`}>
                      +{stat.ubicaciones.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {estadisticasOrdenadas.length === 0 && (
        <div className={`text-center py-8 ${getSubTextClasses(modoOscuro)}`}>
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay datos de repuestos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default EstadisticasRepuestos;
