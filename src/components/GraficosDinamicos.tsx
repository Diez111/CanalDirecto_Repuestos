import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Activity, Clock, Package, Brain, AlertTriangle } from 'lucide-react';
import { EstadisticasUbicacion, EstadisticasRepuesto } from '../types';
import { dataService } from '../services/dataService';
import { getCardClasses, getSubTextClasses, getChartColors, getBackgroundClasses, getTextClasses, getBorderClasses, getButtonClasses } from '../utils/colorUtils';

interface GraficosDinamicosProps {
  filtros?: any;
  modoOscuro?: boolean;
}

const GraficosDinamicos: React.FC<GraficosDinamicosProps> = ({ filtros, modoOscuro = false }) => {
  const [estadisticasUbicacion, setEstadisticasUbicacion] = useState<EstadisticasUbicacion[]>([]);
  const [estadisticasRepuestos, setEstadisticasRepuestos] = useState<EstadisticasRepuesto[]>([]);
  const [tipoGrafico, setTipoGrafico] = useState<'incidentes' | 'maquinas' | 'tiempo' | 'repuestos' | 'fallas'>('incidentes');
  const [analisisIA, setAnalisisIA] = useState<any>(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  useEffect(() => {
    const cargarDatos = () => {
      setEstadisticasUbicacion(dataService.getEstadisticasUbicacion());
      setEstadisticasRepuestos(dataService.getEstadisticasRepuestos());
    };
    cargarDatos();
  }, [filtros]);

  const analizarConIA = async () => {
    setCargandoIA(true);
    try {
      const incidentes = dataService.getIncidentes();
      const maquinas = dataService.getMaquinas();
      
      const prompt = `Analiza los siguientes datos de incidentes y máquinas para generar insights sobre patrones de fallas:

Datos de Incidentes: ${JSON.stringify(incidentes.slice(0, 10))}
Datos de Máquinas: ${JSON.stringify(maquinas.slice(0, 10))}

Genera un análisis JSON con:
1. modelosMasPropensos: Array de objetos con {modelo, frecuenciaFallas, severidadPromedio, repuestosCriticos}
2. patronesTemporales: Objeto con {horasPico, diasCriticos, tendencias}
3. ubicacionesCriticas: Array de objetos con {ubicacion, incidentes, dificultadPromedio}
4. recomendaciones: Array de strings con recomendaciones específicas

Responde SOLO con el JSON válido.`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-0ba4714c7ae44432939b432334a3e5b7'}`,
          'User-Agent': 'CanalDirecto-Repuestos/1.0'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`);
      }

      const data = await response.json();
      const contenido = data.choices[0].message.content;
      
      try {
        const analisis = JSON.parse(contenido);
        setAnalisisIA(analisis);
        localStorage.setItem('analisisGraficosIA', JSON.stringify(analisis));
      } catch (parseError) {
        console.error('Error al parsear respuesta IA:', parseError);
        setAnalisisIA({ error: 'Error al procesar análisis de IA' });
      }
    } catch (error) {
      console.error('Error en análisis IA:', error);
      setAnalisisIA({ error: 'Error al conectar con IA' });
    } finally {
      setCargandoIA(false);
    }
  };

  // Cargar análisis previo
  useEffect(() => {
    try {
      const analisisGuardado = localStorage.getItem('analisisGraficosIA');
      if (analisisGuardado) {
        setAnalisisIA(JSON.parse(analisisGuardado));
      }
    } catch (error) {
      console.error('Error al cargar análisis previo:', error);
    }
  }, []);

  const getColorPorDificultad = (dificultad: number): string => {
    if (dificultad <= 1) return '#10B981'; // green
    if (dificultad <= 2) return '#F59E0B'; // yellow
    if (dificultad <= 3) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getColorPorPosicion = (index: number): string => {
    const colores = getChartColors(modoOscuro);
    return colores[index % colores.length];
  };

  const renderGraficoXY = () => {
    if (!analisisIA?.modelosMasPropensos) {
      return (
        <div className={`text-center py-8 ${getTextClasses(modoOscuro)}`}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Ejecuta el análisis con IA para ver los modelos más propensos a fallar</p>
        </div>
      );
    }

    const datos = analisisIA.modelosMasPropensos.map((modelo: any, index: number) => ({
      x: modelo.frecuenciaFallas,
      y: modelo.severidadPromedio,
      modelo: modelo.modelo,
      color: getColorPorPosicion(index)
    }));

    const maxX = Math.max(...datos.map((d: any) => d.x));
    const maxY = Math.max(...datos.map((d: any) => d.y));

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Eje X:</span> Frecuencia de Fallas
          </div>
          <div className="text-sm">
            <span className="font-medium">Eje Y:</span> Severidad Promedio
          </div>
        </div>
        
        <div className="relative h-64">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Ejes */}
            <line x1="50" y1="250" x2="350" y2="250" stroke={modoOscuro ? "#374151" : "#D1D5DB"} strokeWidth="2"/>
            <line x1="50" y1="50" x2="50" y2="250" stroke={modoOscuro ? "#374151" : "#D1D5DB"} strokeWidth="2"/>
            
            {/* Puntos de datos */}
            {datos.map((dato: any, index: number) => {
              const x = 50 + (dato.x / maxX) * 300;
              const y = 250 - (dato.y / maxY) * 200;
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={dato.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className={`text-xs ${getTextClasses(modoOscuro)}`}
                  >
                    {dato.modelo.split(' ')[0]}
                  </text>
                </g>
              );
            })}
            
            {/* Etiquetas de ejes */}
            <text x="200" y="290" textAnchor="middle" className={`text-sm ${getSubTextClasses(modoOscuro)}`}>
              Frecuencia de Fallas
            </text>
            <text x="20" y="150" textAnchor="middle" transform="rotate(-90 20 150)" className={`text-sm ${getSubTextClasses(modoOscuro)}`}>
              Severidad Promedio
            </text>
          </svg>
        </div>
        
        {/* Leyenda de modelos */}
        <div className="grid grid-cols-2 gap-2">
          {datos.map((dato: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dato.color }}
              ></div>
              <span className={`truncate ${getTextClasses(modoOscuro)}`}>{dato.modelo}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
            <div className={`w-32 text-sm font-medium ${getSubTextClasses(modoOscuro)} truncate`}>
              {dato.nombre}
            </div>
            <div className={`flex-1 ${getCardClasses(modoOscuro)} rounded-full h-6 relative`}>
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
            // const porcentaje = (dato.valor / total) * 100;
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
            <div className={`text-2xl font-bold ${getTextClasses(modoOscuro)}`}>{total}</div>
            <div className={`text-sm ${getSubTextClasses(modoOscuro)}`}>Total</div>
          </div>
        </div>
      </div>
    );
  };

  // Función eliminada - renderGraficoLineas ya no se usa

  return (
    <div className={`${getBackgroundClasses(modoOscuro)} rounded-lg shadow-lg p-4 md:p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          <h2 className={`text-lg md:text-xl font-semibold ${getTextClasses(modoOscuro)}`}>Visualizaciones Dinámicas</h2>
        </div>
        
        <div className="flex gap-2">
          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value as any)}
            className={`px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${getBorderClasses(modoOscuro)} ${getBackgroundClasses(modoOscuro)} ${getTextClasses(modoOscuro)}`}
          >
            <option value="incidentes">Por Incidentes</option>
            <option value="maquinas">Por Máquinas</option>
            <option value="tiempo">Por Tiempo</option>
            <option value="repuestos">Por Repuestos</option>
            <option value="fallas">Modelos Propensos a Fallar</option>
          </select>
          
          <button
            onClick={analizarConIA}
            disabled={cargandoIA}
            className={`${getButtonClasses(modoOscuro, 'primary')} text-sm`}
          >
            <Brain className="w-4 h-4" />
            {cargandoIA ? 'Analizando...' : 'Análisis IA'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de barras por ubicación */}
        <div className={`${getCardClasses(modoOscuro)} rounded-lg p-3 md:p-4`}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <h3 className={`font-medium text-sm md:text-base ${getTextClasses(modoOscuro)}`}>
              {tipoGrafico === 'fallas' ? 'Modelos Propensos a Fallar' : 
               `Ubicaciones - ${tipoGrafico === 'incidentes' ? 'Incidentes' :
                tipoGrafico === 'maquinas' ? 'Máquinas' :
                tipoGrafico === 'tiempo' ? 'Tiempo Promedio' : 'Repuestos'}`}
            </h3>
          </div>
          {tipoGrafico === 'fallas' ? renderGraficoXY() : renderGraficoBarras()}
        </div>

        {/* Gráfico circular de repuestos */}
        <div className={`${getCardClasses(modoOscuro)} rounded-lg p-3 md:p-4`}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <PieChart className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <h3 className={`font-medium text-sm md:text-base ${getTextClasses(modoOscuro)}`}>Distribución de Repuestos</h3>
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
                <span className={`truncate ${getTextClasses(modoOscuro)}`}>{stat.nombre}</span>
                <span className={`ml-auto text-xs ${getSubTextClasses(modoOscuro)}`}>{stat.totalUtilizado}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Análisis con IA */}
        {analisisIA && !analisisIA.error && (
          <div className={`${getCardClasses(modoOscuro)} rounded-lg p-3 md:p-4 lg:col-span-2`}>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <h3 className={`font-medium text-sm md:text-base ${getTextClasses(modoOscuro)}`}>Análisis Inteligente</h3>
            </div>
            
            {analisisIA.recomendaciones && (
              <div className="space-y-3">
                <h4 className={`font-medium ${getTextClasses(modoOscuro)}`}>Recomendaciones:</h4>
                <ul className="space-y-2">
                  {analisisIA.recomendaciones.map((rec: string, index: number) => (
                    <li key={index} className={`text-sm ${getSubTextClasses(modoOscuro)} flex items-start gap-2`}>
                      <span className="text-blue-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Métricas rápidas */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <div className={`${modoOscuro ? 'bg-blue-900' : 'bg-blue-50'} p-3 md:p-4 rounded-lg text-center`}>
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
              <div className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-blue-100' : 'text-blue-900'}`}>
                {estadisticasUbicacion.reduce((sum, s) => sum + s.totalIncidentes, 0)}
              </div>
              <div className={`text-xs md:text-sm ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>Total Incidentes</div>
            </div>
            
            <div className={`${modoOscuro ? 'bg-green-900' : 'bg-green-50'} p-3 md:p-4 rounded-lg text-center`}>
              <Package className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2" />
              <div className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-green-100' : 'text-green-900'}`}>
                {estadisticasUbicacion.reduce((sum, s) => sum + s.totalMaquinas, 0)}
              </div>
              <div className={`text-xs md:text-sm ${modoOscuro ? 'text-green-300' : 'text-green-700'}`}>Total Máquinas</div>
            </div>
            
            <div className={`${modoOscuro ? 'bg-orange-900' : 'bg-orange-50'} p-3 md:p-4 rounded-lg text-center`}>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2" />
              <div className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-orange-100' : 'text-orange-900'}`}>
                {estadisticasUbicacion.length > 0 ? 
                  (estadisticasUbicacion.reduce((sum, s) => sum + s.tiempoPromedioReparacion, 0) / estadisticasUbicacion.length).toFixed(1) : 0}h
              </div>
              <div className={`text-xs md:text-sm ${modoOscuro ? 'text-orange-300' : 'text-orange-700'}`}>Tiempo Promedio</div>
            </div>
            
            <div className={`${modoOscuro ? 'bg-purple-900' : 'bg-purple-50'} p-3 md:p-4 rounded-lg text-center`}>
              <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
              <div className={`text-lg md:text-2xl font-bold ${modoOscuro ? 'text-purple-100' : 'text-purple-900'}`}>
                {estadisticasRepuestos.length}
              </div>
              <div className={`text-xs md:text-sm ${modoOscuro ? 'text-purple-300' : 'text-purple-700'}`}>Tipos de Repuestos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosDinamicos;
