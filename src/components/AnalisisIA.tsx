import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Package, DollarSign, Loader2, MapPin } from 'lucide-react';
import { EstadisticasRepuesto, EstadisticasUbicacion } from '../types';
import { dataService } from '../services/dataService';

interface AnalisisIAProps {
  filtros?: any;
  onDatosActualizados?: () => void;
}

interface AnalisisResultado {
  recomendaciones: string[];
  repuestosCriticos: Array<{
    nombre: string;
    razon: string;
    accion: string;
    urgencia: 'alta' | 'media' | 'baja';
    maquinasAfectadas?: string[];
    ubicacionesCriticas?: string[];
  }>;
  tendencias: string[];
  optimizaciones: string[];
  analisisMaquinas?: {
    maquinasMasRepetidas: Array<{
      modelo: string;
      cantidad: number;
      repuestosCriticos: string[];
      frecuenciaFallas: number;
    }>;
    patronesFallas: Array<{
      tipoFalla: string;
      frecuencia: number;
      repuestosComunes: string[];
    }>;
  };
  analisisUbicaciones?: {
    ubicacionesProblematicas: Array<{
      nombre: string;
      empresa: string;
      totalIncidentes: number;
      dificultadPromedio: number;
      problemasComunes: string[];
      recomendaciones: string[];
    }>;
    patronesGeograficos: Array<{
      region: string;
      totalIncidentes: number;
      problemasComunes: string[];
    }>;
  };
}

const AnalisisIA: React.FC<AnalisisIAProps> = ({ filtros, onDatosActualizados }) => {
  const [analisis, setAnalisis] = useState<AnalisisResultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generarAnalisis = async () => {
    setCargando(true);
    setError(null);

    try {
      const estadisticasRepuestos = dataService.getEstadisticasRepuestos();
      const estadisticasUbicacion = dataService.getEstadisticasUbicacion();
      const incidentes = dataService.getIncidentes();
      const ubicaciones = dataService.getUbicaciones();
      const repuestos = dataService.getRepuestos();

      // Preparar datos para el análisis
      const datosAnalisis = {
        repuestos: estadisticasRepuestos.map(stat => ({
          nombre: stat.nombre,
          totalUtilizado: stat.totalUtilizado,
          frecuencia: stat.frecuencia,
          ubicaciones: stat.ubicaciones.length
        })),
        ubicaciones: estadisticasUbicacion.map(stat => {
          const ubicacion = ubicaciones.find(u => u.id === stat.ubicacionId);
          return {
            nombre: ubicacion?.nombre || 'Desconocida',
            empresa: ubicacion?.empresa || 'Desconocida',
            direccion: ubicacion?.direccion || 'Desconocida',
            latitud: ubicacion?.latitud || 0,
            longitud: ubicacion?.longitud || 0,
            totalIncidentes: stat.totalIncidentes,
            dificultadPromedio: stat.dificultadPromedio,
            tiempoPromedio: stat.tiempoPromedioReparacion,
            totalRepuestos: stat.totalRepuestos,
            totalMaquinas: stat.totalMaquinas
          };
        }),
        incidentes: incidentes.map(inc => ({
          fecha: inc.fecha,
          tipoFalla: inc.tipoFalla,
          dificultad: inc.dificultad,
          tiempoReparacion: inc.tiempoReparacion,
          repuestosUtilizados: inc.repuestosUtilizados.length,
          serieEquipo: inc.serieEquipo,
          tecnico: inc.tecnico
        })),
        maquinas: dataService.getMaquinas().map(maquina => {
          const ubicacion = ubicaciones.find(u => u.id === maquina.ubicacionId);
          const incidentesMaquina = incidentes.filter(i => i.maquinaId === maquina.id);
          return {
            modelo: maquina.modelo,
            tipo: maquina.tipo,
            ubicacion: ubicacion?.nombre || 'Desconocida',
            estado: maquina.estado,
            totalIncidentes: incidentesMaquina.length,
            repuestosUsados: incidentesMaquina.flatMap(i => i.repuestosUtilizados.map(r => r.repuestoId))
          };
        })
      };

      const prompt = `
Eres un experto en mantenimiento de impresoras y equipos de oficina. Analiza estos datos y proporciona recomendaciones específicas sobre qué repuestos necesito pedir urgentemente.

IMPORTANTE: NO consideres cartuchos de tinta, toner o consumibles en las recomendaciones. Solo enfócate en repuestos mecánicos y componentes.

DATOS DE REPUESTOS:
${JSON.stringify(datosAnalisis.repuestos, null, 2)}

DATOS DE UBICACIONES:
${JSON.stringify(datosAnalisis.ubicaciones, null, 2)}

DATOS DE INCIDENTES:
${JSON.stringify(datosAnalisis.incidentes, null, 2)}

ANÁLISIS REQUERIDO:
1. Identifica las máquinas más repetidas y sus repuestos específicos
2. Analiza la frecuencia de fallas por tipo de máquina (Samsung, Lexmark, HP)
3. Considera la ubicación geográfica de los incidentes y patrones regionales
4. Calcula qué repuestos se agotarán pronto basado en el patrón de uso
5. Sugiere cantidades específicas considerando el stock actual y la demanda
6. Analiza qué ubicaciones tienen más problemas y por qué
7. Identifica patrones de fallas por técnico y ubicación
8. Considera la proximidad geográfica entre ubicaciones para optimizar rutas

REGLAS ESPECÍFICAS:
- Cada máquina tiene sus propios repuestos específicos (fusor, retard, rodillos, pickup, etc.)
- Las máquinas Samsung tienen componentes diferentes a Lexmark
- Considera la cantidad de máquinas por ubicación
- Analiza patrones de fallas por ubicación geográfica
- Identifica ubicaciones problemáticas que requieren más atención
- Considera la experiencia del técnico en el análisis
- NO incluyas cartuchos, toner o consumibles en las recomendaciones

Responde SOLO con JSON válido en esta estructura exacta:
{
  "recomendaciones": [
    "Recomendación específica 1",
    "Recomendación específica 2", 
    "Recomendación específica 3"
  ],
  "repuestosCriticos": [
    {
      "nombre": "Nombre exacto del repuesto",
      "razon": "Por qué es crítico (ej: alto uso en máquinas Samsung, agotamiento inminente)",
      "accion": "Acción específica (ej: pedir 15 unidades para Samsung SL-M4020ND)",
      "urgencia": "alta",
      "maquinasAfectadas": ["Samsung SL-M4020ND", "Samsung SL-M5370LX"],
      "ubicacionesCriticas": ["Esteban Echeverría", "Exologistica"]
    }
  ],
  "tendencias": [
    "Tendencia observada 1",
    "Tendencia observada 2"
  ],
  "optimizaciones": [
    "Optimización específica 1",
    "Optimización específica 2"
  ],
  "analisisMaquinas": {
    "maquinasMasRepetidas": [
      {
        "modelo": "Samsung SL-M4020ND",
        "cantidad": 2,
        "repuestosCriticos": ["Fusor", "Rubber", "Pickup"],
        "frecuenciaFallas": 3
      }
    ],
    "patronesFallas": [
      {
        "tipoFalla": "Correctivo",
        "frecuencia": 5,
        "repuestosComunes": ["Fusor", "Rubber"]
      }
    ]
  }
}

Responde SOLO con el JSON, sin explicaciones adicionales.
`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-0ba4714c7ae44432939b432334a3e5b7'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data = await response.json();
      const contenido = data.choices[0].message.content;
      
      // Limpiar y parsear el JSON
      const jsonMatch = contenido.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON válido de la respuesta');
      }

      const analisisResultado = JSON.parse(jsonMatch[0]);
      setAnalisis(analisisResultado);
      
      // Notificar que los datos se han actualizado
      if (onDatosActualizados) {
        onDatosActualizados();
      }

    } catch (err) {
      console.error('Error en análisis IA:', err);
      setError('Error al conectar con IA. Usando análisis local...');
      
      // Análisis de respaldo con datos locales
      const analisisRespaldo = generarAnalisisLocal();
      setAnalisis(analisisRespaldo);
      
      // Notificar que los datos se han actualizado
      if (onDatosActualizados) {
        onDatosActualizados();
      }
    } finally {
      setCargando(false);
    }
  };

  const generarAnalisisLocal = (): AnalisisResultado => {
    const estadisticasRepuestos = dataService.getEstadisticasRepuestos();
    const estadisticasUbicacion = dataService.getEstadisticasUbicacion();
    
    const repuestosCriticos = estadisticasRepuestos
      .filter(stat => stat.totalUtilizado > 5 || stat.frecuencia > 3)
      .slice(0, 5)
      .map(stat => ({
        nombre: stat.nombre,
        razon: `Alto uso: ${stat.totalUtilizado} unidades en ${stat.frecuencia} incidentes`,
        accion: 'Revisar stock y considerar reabastecimiento',
        urgencia: stat.totalUtilizado > 10 ? 'alta' : 'media' as 'alta' | 'media' | 'baja'
      }));

    return {
      recomendaciones: [
        'Implementar mantenimiento preventivo en ubicaciones con alta frecuencia de incidentes',
        'Establecer stock mínimo para repuestos críticos',
        'Capacitar técnicos en las fallas más comunes',
        'Optimizar rutas de mantenimiento para reducir tiempos de respuesta'
      ],
      repuestosCriticos,
      tendencias: [
        'Aumento en el uso de repuestos eléctricos',
        'Mayor concentración de incidentes en ubicaciones específicas',
        'Tendencia a fallas mecánicas en equipos antiguos'
      ],
      optimizaciones: [
        'Centralizar inventario de repuestos más utilizados',
        'Implementar sistema de alertas para stock bajo',
        'Establecer acuerdos con proveedores para entrega rápida'
      ]
    };
  };

  const getColorUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Análisis Inteligente con IA</h2>
            <p className="text-sm text-gray-600">Descubre qué repuestos necesitas pedir urgentemente</p>
          </div>
        </div>
        
        <button
          onClick={generarAnalisis}
          disabled={cargando}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 text-sm md:text-base font-medium shadow-lg"
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analizando con IA...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Generar Análisis IA</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {analisis && (
        <div className="space-y-4 md:space-y-6">
          {/* Repuestos Críticos */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800">Repuestos Críticos</h3>
            </div>
            <div className="space-y-2">
              {analisis.repuestosCriticos.map((repuesto, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getColorUrgencia(repuesto.urgencia)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{repuesto.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      repuesto.urgencia === 'alta' ? 'bg-red-200 text-red-800' :
                      repuesto.urgencia === 'media' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {repuesto.urgencia.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{repuesto.razon}</p>
                  <p className="text-sm font-medium mb-2">{repuesto.accion}</p>
                  {repuesto.maquinasAfectadas && repuesto.maquinasAfectadas.length > 0 && (
                    <div className="text-xs text-gray-600 mb-1">
                      <strong>Máquinas afectadas:</strong> {repuesto.maquinasAfectadas.join(', ')}
                    </div>
                  )}
                  {repuesto.ubicacionesCriticas && repuesto.ubicacionesCriticas.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <strong>Ubicaciones críticas:</strong> {repuesto.ubicacionesCriticas.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-blue-800">Recomendaciones</h3>
            </div>
            <ul className="space-y-2">
              {analisis.recomendaciones.map((recomendacion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{recomendacion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tendencias */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-green-800">Tendencias Detectadas</h3>
            </div>
            <ul className="space-y-2">
              {analisis.tendencias.map((tendencia, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{tendencia}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Optimizaciones */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-800">Optimizaciones de Costos</h3>
            </div>
            <ul className="space-y-2">
              {analisis.optimizaciones.map((optimizacion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{optimizacion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Análisis de Máquinas */}
          {analisis.analisisMaquinas && (
            <>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-indigo-800">Máquinas Más Repetidas</h3>
                </div>
                <div className="space-y-3">
                  {analisis.analisisMaquinas.maquinasMasRepetidas.map((maquina, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-indigo-900">{maquina.modelo}</h4>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                          {maquina.cantidad} unidades
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Fallas: {maquina.frecuenciaFallas} | Repuestos críticos: {maquina.repuestosCriticos.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cyan-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-cyan-800">Patrones de Fallas</h3>
                </div>
                <div className="space-y-2">
                  {analisis.analisisMaquinas.patronesFallas.map((patron, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-cyan-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-cyan-900">{patron.tipoFalla}</span>
                        <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full text-xs font-medium">
                          {patron.frecuencia} veces
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Repuestos comunes: {patron.repuestosComunes.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Análisis de Ubicaciones */}
          {analisis.analisisUbicaciones && (
            <>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-800">Ubicaciones Problemáticas</h3>
                </div>
                <div className="space-y-3">
                  {analisis.analisisUbicaciones.ubicacionesProblematicas.map((ubicacion, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-red-900">{ubicacion.nombre}</h4>
                          <p className="text-sm text-gray-600">{ubicacion.empresa}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {ubicacion.totalIncidentes} incidentes
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Dificultad: {ubicacion.dificultadPromedio.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Problemas comunes:</strong> {ubicacion.problemasComunes.join(', ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Recomendaciones:</strong> {ubicacion.recomendaciones.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  <h3 className="font-semibold text-teal-800">Patrones Geográficos</h3>
                </div>
                <div className="space-y-2">
                  {analisis.analisisUbicaciones.patronesGeograficos.map((patron, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-teal-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-teal-900">{patron.region}</span>
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                          {patron.totalIncidentes} incidentes
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Problemas comunes: {patron.problemasComunes.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!analisis && !cargando && (
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Análisis Inteligente Disponible</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 max-w-md mx-auto">
            La IA analizará tus datos de mantenimiento para identificar qué repuestos necesitas pedir urgentemente y darte consejos de optimización.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs text-gray-500">
            <span>• Identifica repuestos críticos</span>
            <span>• Sugiere cantidades a pedir</span>
            <span>• Analiza patrones de fallas</span>
            <span>• Optimiza inventario</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisIA;
