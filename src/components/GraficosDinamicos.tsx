import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Clock, Package } from 'lucide-react';
import { EstadisticasUbicacion, EstadisticasRepuesto } from '../types';
import { dataService } from '../services/dataService';

interface GraficosDinamicosProps {
  filtros?: any;
}

const GraficosDinamicos: React.FC<GraficosDinamicosProps> = ({ filtros }) => {
  const [estadisticasUbicacion, setEstadisticasUbicacion] = useState<EstadisticasUbicacion[]>([]);
  const [estadisticasRepuestos, setEstadisticasRepuestos] = useState<EstadisticasRepuesto[]>([]);
  const [tipoGrafico, setTipoGrafico] = useState<'incidentes' | 'maquinas' | 'tiempo' | 'repuestos'>('incidentes');

  useEffect(() => {
    const cargarDatos = () => {
      setEstadisticasUbicacion(dataService.getEstadisticasUbicacion());
      setEstadisticasRepuestos(dataService.getEstadisticasRepuestos());
    };
    cargarDatos();
  }, [filtros]);

  const getColorPorDificultad = (dificultad: number): string => {
    if (dificultad <= 1) return '#10B981'; // green
    if (dificultad <= 2) return '#F59E0B'; // yellow
    if (dificultad <= 3) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getColorPorPosicion = (index: number): string => {
    const colores = [
      '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F59E0B'
    ];
    return colores[index % colores.length];
  };

  const renderGraficoBarras = () => {
    const datos = estadisticasUbicacion.map(stat => {
      const ubicacion = dataService.getUbicaciones().find(u => u.id === stat.ubicacionId);
      return {
        nombre: ubicacion?.nombre || 'Desconocida',
        valor: tipoGrafico === 'incidentes' ? stat.totalIncidentes :
               tipoGrafico === 'maquinas' ? stat.totalMaquinas :
               tipoGrafico === 'tiempo' ? stat.tiempoPromedioReparacion :
               stat.totalRepuestos,
        color: getColorPorDificultad(stat.dificultadPromedio)
      };
    });

    const maxValor = Math.max(...datos.map(d => d.valor));

    return (
      <div className="space-y-4">
        {datos.map((dato, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700 truncate">
              {dato.nombre}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2"
                style={{
                  width: `${(dato.valor / maxValor) * 100}%`,
                  backgroundColor: dato.color
                }}
              >
                <span className="text-white text-xs font-medium">
                  {tipoGrafico === 'maquinas' ? `${dato.valor} máquinas` : 
                   tipoGrafico === 'tiempo' ? `${dato.valor.toFixed(1)}h` :
                   dato.valor}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGraficoCircular = () => {
    const datos = estadisticasRepuestos.slice(0, 8).map((stat, index) => ({
      nombre: stat.nombre,
      valor: stat.totalUtilizado,
      color: getColorPorPosicion(index)
    }));

    const total = datos.reduce((sum, d) => sum + d.valor, 0);
    let acumulado = 0;

    return (
      <div className="relative w-64 h-64 mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {datos.map((dato, index) => {
            const porcentaje = (dato.valor / total) * 100;
            const anguloInicio = (acumulado / total) * 360;
            const anguloFinal = ((acumulado + dato.valor) / total) * 360;
            
            const x1 = 100 + 80 * Math.cos((anguloInicio - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((anguloInicio - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((anguloFinal - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((anguloFinal - 90) * Math.PI / 180);
            
            const largeArcFlag = anguloFinal - anguloInicio > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            acumulado += dato.valor;

            return (
              <path
                key={index}
                d={pathData}
                fill={dato.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderGraficoLineas = () => {
    // Simular datos de tendencia por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const datos = meses.map((mes, index) => ({
      mes,
      incidentes: Math.floor(Math.random() * 20) + 5,
      repuestos: Math.floor(Math.random() * 15) + 3
    }));

    const maxIncidentes = Math.max(...datos.map(d => d.incidentes));
    const maxRepuestos = Math.max(...datos.map(d => d.repuestos));

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Incidentes</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Repuestos</span>
        </div>
        
        <div className="relative h-48">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Línea de incidentes */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              points={datos.map((d, i) => 
                `${(i / (datos.length - 1)) * 350 + 25},${200 - (d.incidentes / maxIncidentes) * 150 + 25}`
              ).join(' ')}
            />
            
            {/* Línea de repuestos */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              points={datos.map((d, i) => 
                `${(i / (datos.length - 1)) * 350 + 25},${200 - (d.repuestos / maxRepuestos) * 150 + 25}`
              ).join(' ')}
            />
            
            {/* Puntos de datos */}
            {datos.map((d, i) => (
              <g key={i}>
                <circle
                  cx={(i / (datos.length - 1)) * 350 + 25}
                  cy={200 - (d.incidentes / maxIncidentes) * 150 + 25}
                  r="4"
                  fill="#3B82F6"
                />
                <circle
                  cx={(i / (datos.length - 1)) * 350 + 25}
                  cy={200 - (d.repuestos / maxRepuestos) * 150 + 25}
                  r="4"
                  fill="#10B981"
                />
              </g>
            ))}
            
            {/* Etiquetas de meses */}
            {datos.map((d, i) => (
              <text
                key={i}
                x={(i / (datos.length - 1)) * 350 + 25}
                y="195"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {d.mes}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          <h2 className="text-lg md:text-xl font-semibold">Visualizaciones Dinámicas</h2>
        </div>
        
        <div className="flex gap-2">
          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="incidentes">Por Incidentes</option>
            <option value="maquinas">Por Máquinas</option>
            <option value="tiempo">Por Tiempo</option>
            <option value="repuestos">Por Repuestos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de barras por ubicación */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <h3 className="font-medium text-sm md:text-base">Ubicaciones - {tipoGrafico === 'incidentes' ? 'Incidentes' :
                tipoGrafico === 'maquinas' ? 'Máquinas' :
                tipoGrafico === 'tiempo' ? 'Tiempo Promedio' : 'Repuestos'}</h3>
          </div>
          {renderGraficoBarras()}
        </div>

        {/* Gráfico circular de repuestos */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <PieChart className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <h3 className="font-medium text-sm md:text-base">Distribución de Repuestos</h3>
          </div>
          {renderGraficoCircular()}
          
          {/* Leyenda */}
          <div className="mt-3 md:mt-4 space-y-1">
            {estadisticasRepuestos.slice(0, 8).map((stat, index) => (
              <div key={stat.repuestoId} className="flex items-center gap-2 text-xs md:text-sm">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getColorPorPosicion(index) }}
                ></div>
                <span className="truncate">{stat.nombre}</span>
                <span className="text-gray-500 ml-auto text-xs">{stat.totalUtilizado}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de líneas - tendencias */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            <h3 className="font-medium text-sm md:text-base">Tendencias Mensuales</h3>
          </div>
          {renderGraficoLineas()}
        </div>

        {/* Métricas rápidas */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg md:text-2xl font-bold text-blue-900">
                {estadisticasUbicacion.reduce((sum, s) => sum + s.totalIncidentes, 0)}
              </div>
              <div className="text-xs md:text-sm text-blue-700">Total Incidentes</div>
            </div>
            
            <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg md:text-2xl font-bold text-green-900">
                {estadisticasUbicacion.reduce((sum, s) => sum + s.totalMaquinas, 0)}
              </div>
              <div className="text-xs md:text-sm text-green-700">Total Máquinas</div>
            </div>
            
            <div className="bg-orange-50 p-3 md:p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-lg md:text-2xl font-bold text-orange-900">
                {estadisticasUbicacion.length > 0 ? 
                  (estadisticasUbicacion.reduce((sum, s) => sum + s.tiempoPromedioReparacion, 0) / estadisticasUbicacion.length).toFixed(1) : 0}h
              </div>
              <div className="text-xs md:text-sm text-orange-700">Tiempo Promedio</div>
            </div>
            
            <div className="bg-purple-50 p-3 md:p-4 rounded-lg text-center">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg md:text-2xl font-bold text-purple-900">
                {estadisticasRepuestos.length}
              </div>
              <div className="text-xs md:text-sm text-purple-700">Tipos de Repuestos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosDinamicos;
