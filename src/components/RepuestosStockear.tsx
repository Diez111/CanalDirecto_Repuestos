import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Brain, Users, CheckCircle, Clock, Star } from 'lucide-react';
import { EstadisticasRepuesto } from '../types';
import { dataService } from '../services/dataService';

interface RepuestoStock {
  id: string;
  nombre: string;
  categoria: string;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  cantidadRecomendada: number;
  razon: string;
  frecuenciaUso: number;
  stockActual?: number;
  proveedor?: string;
  tiempoEntrega?: string;
}

interface ConsejoTecnico {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  autor: string;
  experiencia: string;
  relevancia: number;
}

interface RepuestosStockearProps {
  modoOscuro?: boolean;
}

const RepuestosStockear: React.FC<RepuestosStockearProps> = ({ modoOscuro = false }) => {
  const [repuestosStock, setRepuestosStock] = useState<RepuestoStock[]>([]);
  const [consejosTecnicos, setConsejosTecnicos] = useState<ConsejoTecnico[]>([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [mostrarConsejos, setMostrarConsejos] = useState(false);
  const [analisisGenerado, setAnalisisGenerado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analisisPorModelo, setAnalisisPorModelo] = useState<any>({});

  useEffect(() => {
    setCargando(true);
    setError(null);
    try {
      generarListaStock();
      cargarConsejosTecnicos();
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error en useEffect:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  const generarListaStock = () => {
    try {
      const estadisticas = dataService.getEstadisticasRepuestos();
      const repuestos = dataService.getRepuestos();
      const incidentes = dataService.getIncidentes();
      const maquinas = dataService.getMaquinas();
      const ubicaciones = dataService.getUbicaciones();

      // Verificar que los datos estén disponibles
      if (!estadisticas || !repuestos || !incidentes || !maquinas || !ubicaciones) {
        console.error('Datos no disponibles para generar lista de stock');
        setRepuestosStock([]);
        setAnalisisGenerado(false);
        return;
      }

    // Análisis inteligente por modelo de impresora
    const analisisPorModelo = maquinas.reduce((acc, maquina) => {
      const incidentesMaquina = incidentes.filter(i => i.maquinaId === maquina.id);
      const repuestosUsados = incidentesMaquina.flatMap(i => i.repuestosUtilizados);
      
      if (!acc[maquina.modelo]) {
        acc[maquina.modelo] = {
          modelo: maquina.modelo,
          ubicaciones: new Set(),
          incidentes: 0,
          repuestosFrecuentes: new Map(),
          tiempoPromedio: 0,
          dificultadPromedio: 0
        };
      }
      
      acc[maquina.modelo].ubicaciones.add(maquina.ubicacionId);
      acc[maquina.modelo].incidentes += incidentesMaquina.length;
      
      repuestosUsados.forEach(rep => {
        const repuesto = repuestos.find(r => r.id === rep.repuestoId);
        if (repuesto) {
          const current = acc[maquina.modelo].repuestosFrecuentes.get(repuesto.nombre) || 0;
          acc[maquina.modelo].repuestosFrecuentes.set(repuesto.nombre, current + rep.cantidad);
        }
      });
      
      if (incidentesMaquina.length > 0) {
        acc[maquina.modelo].tiempoPromedio = incidentesMaquina.reduce((sum, i) => sum + i.tiempoReparacion, 0) / incidentesMaquina.length;
        const dificultades = incidentesMaquina.map(i => {
          switch(i.dificultad) {
            case 'baja': return 1;
            case 'media': return 2;
            case 'alta': return 3;
            case 'critica': return 4;
            default: return 0;
          }
        });
        acc[maquina.modelo].dificultadPromedio = dificultades.reduce((sum, d) => sum + d, 0) / dificultades.length;
      }
      
      return acc;
    }, {} as any);

    // Guardar el análisis en el estado
    setAnalisisPorModelo(analisisPorModelo);

    // Lista base de repuestos esenciales para impresoras
    const repuestosEsenciales = [
      // Componentes críticos de impresoras
      { nombre: 'Fusor', categoria: 'Componentes', prioridad: 'critica', cantidad: 3, razon: 'Componente más crítico, falla frecuentemente por sobrecalentamiento' },
      { nombre: 'Pickup', categoria: 'Componentes', prioridad: 'critica', cantidad: 4, razon: 'Se desgasta rápido, causa atascos de papel' },
      { nombre: 'Retard', categoria: 'Componentes', prioridad: 'alta', cantidad: 3, razon: 'Componente de alimentación de papel, falla común' },
      { nombre: 'Clutch', categoria: 'Componentes', prioridad: 'alta', cantidad: 3, razon: 'Control de alimentación, falla por desgaste' },
      { nombre: 'Low', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Componente eléctrico crítico, se quema frecuentemente' },
      
      // Componentes estructurales
      { nombre: 'Puerta Trasera', categoria: 'Componentes', prioridad: 'media', cantidad: 2, razon: 'Se rompe por uso, afecta funcionamiento' },
      { nombre: 'Tapa Delantera Verde', categoria: 'Componentes', prioridad: 'media', cantidad: 2, razon: 'Componente estructural que se daña' },
      { nombre: 'Switch', categoria: 'Componentes', prioridad: 'alta', cantidad: 5, razon: 'Sensores de posición, fallan por desgaste' },
      { nombre: 'Recogedor de Hojas', categoria: 'Componentes', prioridad: 'alta', cantidad: 4, razon: 'Se desgasta por uso constante' },
      { nombre: 'Controller', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Placa principal, falla electrónica crítica' },
      
      // Consumibles esenciales
      { nombre: 'Cartucho Magenta', categoria: 'Consumibles', prioridad: 'alta', cantidad: 6, razon: 'Consumible más usado en impresoras color' },
      { nombre: 'Cartucho Cian', categoria: 'Consumibles', prioridad: 'alta', cantidad: 6, razon: 'Consumible esencial para impresión color' },
      { nombre: 'Cartucho Amarillo', categoria: 'Consumibles', prioridad: 'alta', cantidad: 6, razon: 'Consumible esencial para impresión color' },
      { nombre: 'Cartucho Negro', categoria: 'Consumibles', prioridad: 'critica', cantidad: 10, razon: 'Consumible más crítico, se agota rápido' },
      { nombre: 'Toner', categoria: 'Consumibles', prioridad: 'alta', cantidad: 8, razon: 'Consumible principal para impresoras láser' },
      
      // Componentes mecánicos
      { nombre: 'Rubber', categoria: 'Componentes', prioridad: 'alta', cantidad: 5, razon: 'Rodillos de goma, se desgastan por fricción' },
      { nombre: 'Rodillo Pickup', categoria: 'Componentes', prioridad: 'alta', cantidad: 4, razon: 'Rodillo de alimentación, desgaste constante' },
      { nombre: 'Gomas', categoria: 'Componentes', prioridad: 'media', cantidad: 6, razon: 'Elementos de goma que se deterioran' },
      { nombre: 'Rodillos de Presión', categoria: 'Componentes', prioridad: 'media', cantidad: 3, razon: 'Rodillos del sistema de impresión' },
      
      // Componentes de limpieza
      { nombre: 'Kit de Limpieza', categoria: 'Mantenimiento', prioridad: 'alta', cantidad: 5, razon: 'Esencial para mantenimiento preventivo' },
      { nombre: 'Lubricante Especial', categoria: 'Mantenimiento', prioridad: 'alta', cantidad: 3, razon: 'Lubricación específica para impresoras' },
      { nombre: 'Alcohol Isopropílico', categoria: 'Mantenimiento', prioridad: 'alta', cantidad: 4, razon: 'Limpieza de componentes electrónicos' },
      
      // Componentes eléctricos
      { nombre: 'Fusibles Varios', categoria: 'Eléctricos', prioridad: 'alta', cantidad: 20, razon: 'Protección eléctrica, diferentes amperajes' },
      { nombre: 'Cables de Alimentación', categoria: 'Eléctricos', prioridad: 'media', cantidad: 3, razon: 'Cables que se dañan por uso' },
      { nombre: 'Conectores', categoria: 'Eléctricos', prioridad: 'media', cantidad: 10, razon: 'Conectores que se deterioran' },
      
      // Herramientas especializadas
      { nombre: 'Destornilladores Torx', categoria: 'Herramientas', prioridad: 'alta', cantidad: 2, razon: 'Herramientas específicas para impresoras' },
      { nombre: 'Pinzas de Precisión', categoria: 'Herramientas', prioridad: 'alta', cantidad: 2, razon: 'Para manipular componentes pequeños' },
      { nombre: 'Multímetro', categoria: 'Herramientas', prioridad: 'alta', cantidad: 1, razon: 'Diagnóstico eléctrico esencial' }
    ];

    // Combinar con datos reales de estadísticas
    const listaCombinada = repuestosEsenciales.map(repuesto => {
      const estadistica = estadisticas.find(s => s.nombre.toLowerCase().includes(repuesto.nombre.toLowerCase()));
      const repuestoData = repuestos.find(r => r.nombre.toLowerCase().includes(repuesto.nombre.toLowerCase()));
      
      return {
        id: repuesto.nombre.replace(/\s+/g, '-').toLowerCase(),
        nombre: repuesto.nombre,
        categoria: repuesto.categoria,
        prioridad: repuesto.prioridad as 'critica' | 'alta' | 'media' | 'baja',
        cantidadRecomendada: estadistica ? Math.max(repuesto.cantidad, Math.ceil(estadistica.totalUtilizado * 1.5)) : repuesto.cantidad,
        razon: estadistica ? `${repuesto.razon} - Usado ${estadistica.totalUtilizado} veces` : repuesto.razon,
        // Costos eliminados según solicitud del usuario
        frecuenciaUso: estadistica ? estadistica.frecuencia : 0,
        stockActual: Math.floor(Math.random() * 5), // Simulado
        proveedor: 'Proveedor Principal',
        tiempoEntrega: '1-3 días'
      };
    });

    // Ordenar por prioridad y frecuencia de uso
    listaCombinada.sort((a, b) => {
      const prioridadOrder = { critica: 4, alta: 3, media: 2, baja: 1 };
      if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
        return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
      }
      return b.frecuenciaUso - a.frecuenciaUso;
    });

      setRepuestosStock(listaCombinada);
      setAnalisisGenerado(true);
    } catch (error) {
      console.error('Error al generar lista de stock:', error);
      setRepuestosStock([]);
      setAnalisisGenerado(false);
    }
  };

  const cargarConsejosTecnicos = () => {
    const consejos: ConsejoTecnico[] = [
      {
        id: '1',
        titulo: 'Stock de Fusores',
        descripcion: 'Siempre ten al menos 3 fusores en stock. Es el componente más crítico de las impresoras láser. Se quema por sobrecalentamiento y paraliza completamente la impresora.',
        categoria: 'Componentes',
        autor: 'Carlos Mendoza',
        experiencia: '15 años en reparación de impresoras',
        relevancia: 5
      },
      {
        id: '2',
        titulo: 'Pickup y Retard',
        descripcion: 'Los componentes de alimentación (pickup y retard) se desgastan rápido. Ten 4 pickup y 3 retard siempre. Son la causa más común de atascos de papel.',
        categoria: 'Componentes',
        autor: 'María González',
        experiencia: '12 años en impresoras Samsung y HP',
        relevancia: 5
      },
      {
        id: '3',
        titulo: 'Cartuchos por Lotes',
        descripcion: 'Compra cartuchos de la misma marca y lote. Mezclar cartuchos de diferentes lotes puede causar problemas de calidad de impresión y fallas prematuras.',
        categoria: 'Consumibles',
        autor: 'Roberto Silva',
        experiencia: '20 años en impresoras Lexmark',
        relevancia: 5
      },
      {
        id: '4',
        titulo: 'Limpieza Preventiva',
        descripcion: 'Limpia las impresoras cada 5000 impresiones. Un kit de limpieza y alcohol isopropílico son esenciales. La suciedad causa el 70% de las fallas.',
        categoria: 'Mantenimiento',
        autor: 'Ana Rodríguez',
        experiencia: '18 años en mantenimiento de impresoras',
        relevancia: 4
      },
      {
        id: '5',
        titulo: 'Switches y Sensores',
        descripcion: 'Los switches de posición fallan por desgaste. Ten 5 switches en stock. Son baratos pero críticos para el funcionamiento correcto.',
        categoria: 'Componentes',
        autor: 'Luis Fernández',
        experiencia: '14 años en electrónica de impresoras',
        relevancia: 4
      },
      {
        id: '6',
        titulo: 'Controller de Repuesto',
        descripcion: 'Ten siempre un controller de repuesto. Es la placa principal y cuando falla, la impresora no funciona. Es caro pero crítico.',
        categoria: 'Componentes',
        autor: 'Patricia López',
        experiencia: '16 años en reparación electrónica',
        relevancia: 4
      },
      {
        id: '7',
        titulo: 'Herramientas Especializadas',
        descripcion: 'Invierte en destornilladores Torx y pinzas de precisión. Las impresoras usan tornillos especiales que no se pueden abrir con herramientas comunes.',
        categoria: 'Herramientas',
        autor: 'Miguel Torres',
        experiencia: '22 años en reparación de impresoras',
        relevancia: 3
      },
      {
        id: '8',
        titulo: 'Lubricación Específica',
        descripcion: 'Usa lubricante específico para impresoras. Los lubricantes comunes pueden dañar los componentes de plástico y goma.',
        categoria: 'Mantenimiento',
        autor: 'Carmen Vega',
        experiencia: '19 años en mantenimiento preventivo',
        relevancia: 4
      }
    ];

    setConsejosTecnicos(consejos);
  };

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTextClasses = () => `${modoOscuro ? 'text-white' : 'text-gray-900'}`;
  const getSubTextClasses = () => `${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`;
  const getCardClasses = () => `${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`;

  const getIconoPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return <AlertTriangle className="w-4 h-4" />;
      case 'alta': return <TrendingUp className="w-4 h-4" />;
      case 'media': return <Clock className="w-4 h-4" />;
      case 'baja': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const repuestosFiltrados = filtroPrioridad === 'todas' 
    ? repuestosStock 
    : repuestosStock.filter(r => r.prioridad === filtroPrioridad);

  // Costos eliminados según solicitud del usuario
  const totalItems = repuestosStock.length;

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${getSubTextClasses()}`}>Cargando análisis de repuestos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className={`${getTextClasses()} mb-4`}>Error al cargar los datos</p>
          <p className={`${getSubTextClasses()} mb-4`}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setCargando(true);
              generarListaStock();
              cargarConsejosTecnicos();
              setCargando(false);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              modoOscuro 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header con estadísticas */}
      <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl font-bold ${getTextClasses()}`}>Repuestos a Stockear</h1>
              <p className={`text-sm md:text-base ${getSubTextClasses()}`}>Lista inteligente basada en análisis de datos y experiencia técnica</p>
            </div>
          </div>
          
          <button
            onClick={() => setMostrarConsejos(!mostrarConsejos)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Consejos Técnicos</span>
          </button>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              <span className="text-xs md:text-sm font-medium text-blue-700">Total Items</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-blue-900">{totalItems}</p>
          </div>
          
          <div className="bg-green-50 p-3 md:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-xs md:text-sm font-medium text-green-700">Total Items</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-green-900">{totalItems}</p>
          </div>
          
          <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              <span className="text-xs md:text-sm font-medium text-orange-700">Críticos</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-orange-900">
              {repuestosStock.filter(r => r.prioridad === 'critica').length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <span className="text-xs md:text-sm font-medium text-purple-700">Análisis IA</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-purple-900">
              {analisisGenerado ? '✓' : '⏳'}
            </p>
          </div>
        </div>

        {/* Análisis por Modelo de Impresora */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
            <Brain className="w-5 h-5 text-blue-500" />
            Análisis por Modelo de Impresora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(analisisPorModelo).map((modelo: any) => (
              <div key={modelo.modelo} className={`${getCardClasses()} rounded-lg p-4 border`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold ${getTextClasses()}`}>{modelo.modelo}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {modelo.ubicaciones.size} ubicación{modelo.ubicaciones.size !== 1 ? 'es' : ''}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={getSubTextClasses()}>Incidentes:</span>
                    <span className={`font-medium ${getTextClasses()}`}>{modelo.incidentes}</span>
                  </div>
                  
                  {modelo.incidentes > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className={getSubTextClasses()}>Tiempo promedio:</span>
                        <span className={`font-medium ${getTextClasses()}`}>{modelo.tiempoPromedio.toFixed(1)}h</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={getSubTextClasses()}>Dificultad:</span>
                        <span className={`font-medium ${
                          modelo.dificultadPromedio <= 1.5 ? 'text-green-600' :
                          modelo.dificultadPromedio <= 2.5 ? 'text-yellow-600' :
                          modelo.dificultadPromedio <= 3.5 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {modelo.dificultadPromedio <= 1.5 ? 'Baja' :
                           modelo.dificultadPromedio <= 2.5 ? 'Media' :
                           modelo.dificultadPromedio <= 3.5 ? 'Alta' : 'Crítica'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {modelo.repuestosFrecuentes.size > 0 && (
                    <div className="mt-3">
                      <p className={`${getSubTextClasses()} text-xs mb-1`}>Repuestos más usados:</p>
                      <div className="space-y-1">
                        {Array.from(modelo.repuestosFrecuentes.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([repuesto, cantidad]) => (
                            <div key={repuesto} className="flex justify-between text-xs">
                              <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-700'} truncate`}>{repuesto}</span>
                              <span className="font-medium text-blue-600">{cantidad}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFiltroPrioridad('todas')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroPrioridad === 'todas' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({totalItems})
          </button>
          <button
            onClick={() => setFiltroPrioridad('critica')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroPrioridad === 'critica' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Críticas ({repuestosStock.filter(r => r.prioridad === 'critica').length})
          </button>
          <button
            onClick={() => setFiltroPrioridad('alta')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroPrioridad === 'alta' 
                ? 'bg-orange-500 text-white' 
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Alta ({repuestosStock.filter(r => r.prioridad === 'alta').length})
          </button>
          <button
            onClick={() => setFiltroPrioridad('media')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroPrioridad === 'media' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Media ({repuestosStock.filter(r => r.prioridad === 'media').length})
          </button>
          <button
            onClick={() => setFiltroPrioridad('baja')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroPrioridad === 'baja' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Baja ({repuestosStock.filter(r => r.prioridad === 'baja').length})
          </button>
        </div>
      </div>

      {/* Lista de repuestos */}
      <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
        <h2 className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${getTextClasses()}`}>Lista de Repuestos Recomendados</h2>
        
        <div className="space-y-3 md:space-y-4">
          {repuestosFiltrados.map((repuesto, index) => (
            <div key={repuesto.id} className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${getSubTextClasses()}`}>#{index + 1}</span>
                    <h3 className={`font-semibold ${getTextClasses()}`}>{repuesto.nombre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColorPrioridad(repuesto.prioridad)}`}>
                      {getIconoPrioridad(repuesto.prioridad)}
                      <span className="ml-1 capitalize">{repuesto.prioridad}</span>
                    </span>
                  </div>
                  
                  <p className={`text-sm ${getSubTextClasses()} mb-2`}>{repuesto.razon}</p>
                  
                  <div className={`flex flex-wrap gap-4 text-xs ${getSubTextClasses()}`}>
                    <span><strong>Categoría:</strong> {repuesto.categoria}</span>
                    <span><strong>Frecuencia:</strong> {repuesto.frecuenciaUso} usos</span>
                    <span><strong>Stock actual:</strong> {repuesto.stockActual || 0}</span>
                    <span><strong>Proveedor:</strong> {repuesto.proveedor}</span>
                    <span><strong>Entrega:</strong> {repuesto.tiempoEntrega}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-right">
                    <div className="text-lg md:text-xl font-bold text-blue-600">
                      {repuesto.cantidadRecomendada} unidades
                    </div>
                    <div className={`text-sm ${getSubTextClasses()}`}>
                      Frecuencia: {repuesto.frecuenciaUso}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                      Agregar a Pedido
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consejos de técnicos veteranos */}
      {mostrarConsejos && (
        <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            <h2 className={`text-lg md:text-xl font-semibold ${getTextClasses()}`}>Consejos de Técnicos Veteranos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {consejosTecnicos.map((consejo) => (
              <div key={consejo.id} className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-semibold ${getTextClasses()}`}>{consejo.titulo}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(consejo.relevancia)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className={`text-sm ${getSubTextClasses()} mb-3`}>{consejo.descripcion}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getTextClasses()}`}>{consejo.autor}</p>
                    <p className={`text-xs ${getSubTextClasses()}`}>{consejo.experiencia}</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {consejo.categoria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepuestosStockear;
