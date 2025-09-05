import { useState, useEffect } from 'react';
import { Map, Filter, Plus, BarChart3, RefreshCw, Package, Moon, Sun, Database } from 'lucide-react';
import MapaInteractivo from './components/MapaInteractivo';
import FiltrosMenu from './components/FiltrosMenu';
import FormularioIncidente from './components/FormularioIncidente';
import EstadisticasRepuestos from './components/EstadisticasRepuestos';
import GraficosDinamicos from './components/GraficosDinamicos';
import AnalisisIA from './components/AnalisisIA';
import RepuestosStockear from './components/RepuestosStockear';
import ChatbotIA from './components/ChatbotIA';
import NavegacionMovil from './components/NavegacionMovil';
import ExportarImportar from './components/ExportarImportar';
import { Filtros, Ubicacion, Incidente } from './types';
import { dataService } from './services/dataService';

function App() {
  const [vistaActual, setVistaActual] = useState<'mapa' | 'estadisticas' | 'graficos' | 'analisis' | 'stockear' | 'exportar'>('mapa');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [versionDatos, setVersionDatos] = useState(0);

  useEffect(() => {
    const cargarEstadisticas = () => {
      const stats = dataService.getEstadisticasUbicacion();
      setEstadisticas(stats);
    };
    cargarEstadisticas();
  }, [filtros]);

  const handleAgregarIncidente = (incidente: Omit<Incidente, 'id'>) => {
    dataService.agregarIncidente(incidente);
    // Recargar estadísticas
    const stats = dataService.getEstadisticasUbicacion();
    setEstadisticas(stats);
  };

  const handleUbicacionSeleccionada = (ubicacion: Ubicacion) => {
    setUbicacionSeleccionada(ubicacion);
  };

  const recargarDatos = () => {
    const stats = dataService.getEstadisticasUbicacion();
    setEstadisticas(stats);
  };

  const actualizarTodosLosDatos = () => {
    // Recargar estadísticas de ubicación
    const stats = dataService.getEstadisticasUbicacion();
    setEstadisticas(stats);
    
    // Incrementar versión para forzar re-render de componentes
    setVersionDatos(prev => prev + 1);
    
    console.log('Datos actualizados después del análisis IA');
  };

  // Debug: mostrar vista actual
  console.log('Vista actual:', vistaActual);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${modoOscuro ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navegación móvil */}
      <NavegacionMovil
        vistaActual={vistaActual}
        onVistaChange={setVistaActual}
        onMostrarFiltros={() => setMostrarFiltros(true)}
        onMostrarFormulario={() => setMostrarFormulario(true)}
        onRecargarDatos={recargarDatos}
      />

      {/* Header - Visible en todas las pantallas */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setModoOscuro(!modoOscuro)}
                className={`p-2 rounded-lg transition-colors ${
                  modoOscuro 
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {modoOscuro ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              
              <button
                onClick={recargarDatos}
                className={`p-2 rounded-lg transition-colors ${
                  modoOscuro 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Recargar datos"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <button
                onClick={() => setVistaActual('stockear')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium"
                title="Repuestos a Stockear"
              >
                <Package className="w-4 h-4" />
                <span className="hidden xs:inline">Stockear</span>
              </button>
              
              <button
                onClick={() => setVistaActual('exportar')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-xs sm:text-sm font-medium"
                title="Exportar/Importar Datos"
              >
                <Database className="w-4 h-4" />
                <span className="hidden xs:inline">Datos</span>
              </button>
              
              <button
                onClick={() => setVistaActual('analisis')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium"
                title="Análisis con IA"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden xs:inline">IA</span>
              </button>
              
              <button
                onClick={() => setMostrarFiltros(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden xs:inline">Filtros</span>
              </button>
              
              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Nuevo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de vistas - Solo visible en desktop */}
      <nav className={`hidden lg:block border-b transition-colors duration-300 ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setVistaActual('mapa')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'mapa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="w-4 h-4" />
              Mapa Interactivo
            </button>
            
            <button
              onClick={() => setVistaActual('estadisticas')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'estadisticas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas de Repuestos
            </button>
            
            <button
              onClick={() => setVistaActual('graficos')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'graficos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Gráficos Dinámicos
            </button>

            <button
              onClick={() => setVistaActual('analisis')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'analisis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Análisis con IA
            </button>

            <button
              onClick={() => setVistaActual('stockear')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'stockear'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4" />
              Repuestos a Stockear
            </button>

            <button
              onClick={() => setVistaActual('exportar')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActual === 'exportar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Exportar/Importar
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
        {vistaActual === 'mapa' && (
          <div className="space-y-4 lg:space-y-6">
            {/* Resumen de estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
              <div className={`${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 lg:p-4 rounded-lg shadow border`}>
                <div className="text-lg lg:text-2xl font-bold text-blue-600">
                  {estadisticas.reduce((sum, s) => sum + s.totalIncidentes, 0)}
                </div>
                <div className={`text-xs lg:text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total Incidentes</div>
              </div>
              
              <div className={`${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 lg:p-4 rounded-lg shadow border`}>
                <div className="text-lg lg:text-2xl font-bold text-green-600">
                  {estadisticas.length}
                </div>
                <div className={`text-xs lg:text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Ubicaciones</div>
              </div>
              
              <div className={`${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 lg:p-4 rounded-lg shadow border`}>
                <div className="text-lg lg:text-2xl font-bold text-orange-600">
                  {estadisticas.reduce((sum, s) => sum + s.totalMaquinas, 0)}
                </div>
                <div className={`text-xs lg:text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total Máquinas</div>
              </div>
              
              <div className={`${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 lg:p-4 rounded-lg shadow border`}>
                <div className="text-lg lg:text-2xl font-bold text-purple-600">
                  {estadisticas.reduce((sum, s) => sum + s.totalRepuestos, 0)}
                </div>
                <div className={`text-xs lg:text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Repuestos Utilizados</div>
              </div>
            </div>

            {/* Mapa interactivo */}
            <div className={`${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg overflow-hidden border`}>
              <div className={`p-4 border-b ${modoOscuro ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <h2 className={`text-lg font-semibold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                  <Map className="w-5 h-5 text-blue-500" />
                  Mapa de Incidentes
                </h2>
                <p className={`text-sm mt-1 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                  Visualiza las ubicaciones y su nivel de dificultad
                </p>
              </div>
              <div className="relative" style={{ height: '500px' }}>
                <MapaInteractivo
                  key={versionDatos}
                  filtros={filtros}
                  onUbicacionSeleccionada={handleUbicacionSeleccionada}
                />
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'estadisticas' && (
          <EstadisticasRepuestos key={versionDatos} filtros={filtros} />
        )}

        {vistaActual === 'graficos' && (
          <GraficosDinamicos key={versionDatos} filtros={filtros} />
        )}

        {vistaActual === 'analisis' && (
          <AnalisisIA key={versionDatos} filtros={filtros} onDatosActualizados={actualizarTodosLosDatos} />
        )}

        {vistaActual === 'stockear' && (
          <RepuestosStockear key={versionDatos} modoOscuro={modoOscuro} />
        )}

        {vistaActual === 'exportar' && (
          <ExportarImportar key={versionDatos} modoOscuro={modoOscuro} onDatosActualizados={actualizarTodosLosDatos} />
        )}
      </main>

      {/* Modales */}
      {mostrarFiltros && (
        <FiltrosMenu
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onCerrar={() => setMostrarFiltros(false)}
          modoOscuro={modoOscuro}
        />
      )}

      {mostrarFormulario && (
        <FormularioIncidente
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={handleAgregarIncidente}
          modoOscuro={modoOscuro}
        />
      )}

      {/* Chatbot IA flotante */}
      <ChatbotIA />
    </div>
  );
}

export default App;
