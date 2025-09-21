import React, { useState } from 'react';
import { Menu, X, Map, BarChart3, Brain, Package, Database, Filter, Plus, RefreshCw } from 'lucide-react';
// import { getBackgroundClasses, getTextClasses, getSubTextClasses, getCardClasses, getBorderClasses, getButtonClasses } from '../utils/colorUtils';

interface NavegacionMovilProps {
  vistaActual: 'mapa' | 'estadisticas' | 'graficos' | 'analisis' | 'stockear' | 'exportar';
  onVistaChange: (vista: 'mapa' | 'estadisticas' | 'graficos' | 'analisis' | 'stockear' | 'exportar') => void;
  onMostrarFiltros: () => void;
  onMostrarFormulario: () => void;
  onRecargarDatos: () => void;
}

const NavegacionMovil: React.FC<NavegacionMovilProps> = ({
  vistaActual,
  onVistaChange,
  onMostrarFiltros,
  onMostrarFormulario,
  onRecargarDatos
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const vistas = [
    { id: 'mapa', nombre: 'Mapa', icono: Map },
    { id: 'estadisticas', nombre: 'Repuestos', icono: BarChart3 },
    { id: 'graficos', nombre: 'Gráficos', icono: BarChart3 },
    { id: 'analisis', nombre: 'IA', icono: Brain },
    { id: 'stockear', nombre: 'Stockear', icono: Package },
    { id: 'exportar', nombre: 'Datos', icono: Database }
  ] as const;

  const acciones = [
    { id: 'filtros', nombre: 'Filtros', icono: Filter, accion: onMostrarFiltros },
    { id: 'nuevo', nombre: 'Nuevo', icono: Plus, accion: onMostrarFormulario },
    { id: 'recargar', nombre: 'Recargar', icono: RefreshCw, accion: onRecargarDatos }
  ];

  return (
    <>
      {/* Botón de menú hamburguesa */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="lg:hidden fixed top-4 left-4 z-[9999] p-2 bg-white rounded-lg shadow-lg border"
      >
        {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay del menú móvil */}
      {menuAbierto && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Menú lateral móvil */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[9999] transform transition-transform duration-300 ${
        menuAbierto ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header del menú */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Incidentes
              </h1>
            </div>
            <button
              onClick={() => setMenuAbierto(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación de vistas */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Vistas
            </h3>
            <nav className="space-y-2">
              {vistas.map((vista) => {
                const Icono = vista.icono;
                const activa = vistaActual === vista.id;
                
                return (
                  <button
                    key={vista.id}
                    onClick={() => {
                      onVistaChange(vista.id);
                      setMenuAbierto(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      activa
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icono className="w-5 h-5" />
                    <span className="font-medium">{vista.nombre}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Acciones rápidas */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Acciones
            </h3>
            <div className="space-y-2">
              {acciones.map((accion) => {
                const Icono = accion.icono;
                
                return (
                  <button
                    key={accion.id}
                    onClick={() => {
                      accion.accion();
                      setMenuAbierto(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icono className="w-5 h-5" />
                    <span className="font-medium">{accion.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación inferior móvil - Más compacta para no tapar el mapa */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex">
          {vistas.map((vista) => {
            const Icono = vista.icono;
            const activa = vistaActual === vista.id;
            
            return (
              <button
                key={vista.id}
                onClick={() => onVistaChange(vista.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-1 ${
                  activa ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
                }`}
              >
                <Icono className="w-4 h-4 mb-0.5" />
                <span className="text-xs font-medium leading-tight">{vista.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default NavegacionMovil;
