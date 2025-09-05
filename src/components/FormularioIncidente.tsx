import React, { useState, useEffect } from 'react';
import { Plus, Save, X, AlertTriangle, MapPin, Wrench, Package } from 'lucide-react';
import { Incidente, Ubicacion, Maquina, Repuesto } from '../types';
import { dataService } from '../services/dataService';

interface FormularioIncidenteProps {
  onCerrar: () => void;
  onGuardar: (incidente: Omit<Incidente, 'id'>) => void;
  modoOscuro?: boolean;
}

const FormularioIncidente: React.FC<FormularioIncidenteProps> = ({ onCerrar, onGuardar, modoOscuro = false }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    ubicacionId: '',
    maquinaId: '',
    descripcion: '',
    tipoFalla: '',
    dificultad: 'media' as 'baja' | 'media' | 'alta' | 'critica',
    tiempoReparacion: 0,
    repuestosUtilizados: [] as { repuestoId: string; cantidad: number }[],
    tecnico: '',
    observaciones: '',
    serieEquipo: ''
  });

  const [nuevaUbicacion, setNuevaUbicacion] = useState({
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    empresa: ''
  });
  const [crearNuevaUbicacion, setCrearNuevaUbicacion] = useState(false);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [maquinasFiltradas, setMaquinasFiltradas] = useState<Maquina[]>([]);
  const [nuevoRepuesto, setNuevoRepuesto] = useState({ repuestoId: '', cantidad: 1 });

  useEffect(() => {
    const cargarDatos = () => {
      setUbicaciones(dataService.getUbicaciones());
      setMaquinas(dataService.getMaquinas());
      setRepuestos(dataService.getRepuestos());
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.ubicacionId) {
      const maquinasUbicacion = maquinas.filter(m => m.ubicacionId === formData.ubicacionId);
      setMaquinasFiltradas(maquinasUbicacion);
      setFormData(prev => ({ ...prev, maquinaId: '' }));
    } else {
      setMaquinasFiltradas([]);
    }
  }, [formData.ubicacionId, maquinas]);

  const handleInputChange = (campo: string, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleNuevaUbicacionChange = (campo: string, valor: string) => {
    setNuevaUbicacion(prev => ({ ...prev, [campo]: valor }));
  };

  const crearUbicacion = () => {
    if (nuevaUbicacion.nombre && nuevaUbicacion.latitud && nuevaUbicacion.longitud) {
      const ubicacionData = {
        nombre: nuevaUbicacion.nombre,
        direccion: nuevaUbicacion.direccion,
        latitud: parseFloat(nuevaUbicacion.latitud),
        longitud: parseFloat(nuevaUbicacion.longitud),
        empresa: nuevaUbicacion.empresa
      };
      
      const nuevaUbicacionCreada = dataService.agregarUbicacion(ubicacionData);
      setUbicaciones(prev => [...prev, nuevaUbicacionCreada]);
      setFormData(prev => ({ ...prev, ubicacionId: nuevaUbicacionCreada.id }));
      setCrearNuevaUbicacion(false);
      setNuevaUbicacion({ nombre: '', direccion: '', latitud: '', longitud: '', empresa: '' });
    }
  };

  const agregarRepuesto = () => {
    if (nuevoRepuesto.repuestoId && nuevoRepuesto.cantidad > 0) {
      const repuestoExistente = formData.repuestosUtilizados.find(r => r.repuestoId === nuevoRepuesto.repuestoId);
      
      if (repuestoExistente) {
        setFormData(prev => ({
          ...prev,
          repuestosUtilizados: prev.repuestosUtilizados.map(r =>
            r.repuestoId === nuevoRepuesto.repuestoId
              ? { ...r, cantidad: r.cantidad + nuevoRepuesto.cantidad }
              : r
          )
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          repuestosUtilizados: [...prev.repuestosUtilizados, { ...nuevoRepuesto }]
        }));
      }
      
      setNuevoRepuesto({ repuestoId: '', cantidad: 1 });
    }
  };

  const removerRepuesto = (repuestoId: string) => {
    setFormData(prev => ({
      ...prev,
      repuestosUtilizados: prev.repuestosUtilizados.filter(r => r.repuestoId !== repuestoId)
    }));
  };

  // Función de costos eliminada según solicitud del usuario

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incidente: Omit<Incidente, 'id'> = {
      ...formData
    };
    
    onGuardar(incidente);
    onCerrar();
  };

  const tiposFalla = ['Eléctrica', 'Mecánica', 'Hidráulica', 'Neumática', 'Electrónica', 'Software', 'Otro'];

  // Helper para clases de modo oscuro
  const getInputClasses = () => `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
    modoOscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const getLabelClasses = () => `flex items-center gap-2 text-sm font-medium mb-2 transition-colors duration-300 ${
    modoOscuro ? 'text-gray-300' : 'text-gray-700'
  }`;

  const getButtonClasses = (variant: 'primary' | 'secondary') => {
    const base = 'px-4 py-2 rounded-md transition-colors duration-300';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        modoOscuro ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          modoOscuro ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              modoOscuro ? 'text-white' : 'text-gray-900'
            }`}>Nuevo Incidente</h2>
          </div>
          <button
            onClick={onCerrar}
            className={`transition-colors duration-300 ${
              modoOscuro ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={getLabelClasses()}>
                <AlertTriangle className="w-4 h-4" />
                Fecha del Incidente
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                required
                className={getInputClasses()}
              />
            </div>

            <div>
              <label className={getLabelClasses()}>
                <MapPin className="w-4 h-4" />
                Ubicación
              </label>
              <select
                value={formData.ubicacionId}
                onChange={(e) => handleInputChange('ubicacionId', e.target.value)}
                required
                className={getInputClasses()}
              >
                <option value="">Seleccionar ubicación</option>
                {ubicaciones.map(ubicacion => (
                  <option key={ubicacion.id} value={ubicacion.id}>
                    {ubicacion.nombre} - {ubicacion.empresa}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => setCrearNuevaUbicacion(!crearNuevaUbicacion)}
                className={`mt-2 px-3 py-1 text-xs rounded-md transition-colors ${
                  modoOscuro 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {crearNuevaUbicacion ? 'Cancelar' : '+ Nueva Ubicación'}
              </button>
            </div>

            {/* Formulario para nueva ubicación */}
            {crearNuevaUbicacion && (
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                modoOscuro ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-3 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                  Crear Nueva Ubicación
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={getLabelClasses()}>Nombre de la Ubicación</label>
                    <input
                      type="text"
                      value={nuevaUbicacion.nombre}
                      onChange={(e) => handleNuevaUbicacionChange('nombre', e.target.value)}
                      placeholder="Ej: Oficina Central"
                      className={getInputClasses()}
                    />
                  </div>
                  
                  <div>
                    <label className={getLabelClasses()}>Empresa</label>
                    <input
                      type="text"
                      value={nuevaUbicacion.empresa}
                      onChange={(e) => handleNuevaUbicacionChange('empresa', e.target.value)}
                      placeholder="Ej: Empresa S.A."
                      className={getInputClasses()}
                    />
                  </div>
                  
                  <div>
                    <label className={getLabelClasses()}>Dirección</label>
                    <input
                      type="text"
                      value={nuevaUbicacion.direccion}
                      onChange={(e) => handleNuevaUbicacionChange('direccion', e.target.value)}
                      placeholder="Ej: Av. Corrientes 1234, CABA"
                      className={getInputClasses()}
                    />
                  </div>
                  
                  <div>
                    <label className={getLabelClasses()}>Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={nuevaUbicacion.latitud}
                      onChange={(e) => handleNuevaUbicacionChange('latitud', e.target.value)}
                      placeholder="Ej: -34.7082840"
                      className={getInputClasses()}
                    />
                  </div>
                  
                  <div>
                    <label className={getLabelClasses()}>Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={nuevaUbicacion.longitud}
                      onChange={(e) => handleNuevaUbicacionChange('longitud', e.target.value)}
                      placeholder="Ej: -58.4888790"
                      className={getInputClasses()}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={crearUbicacion}
                      disabled={!nuevaUbicacion.nombre || !nuevaUbicacion.latitud || !nuevaUbicacion.longitud}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        modoOscuro 
                          ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600' 
                          : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400'
                      }`}
                    >
                      Crear Ubicación
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className={getLabelClasses()}>
                <Wrench className="w-4 h-4" />
                Máquina
              </label>
              <select
                value={formData.maquinaId}
                onChange={(e) => handleInputChange('maquinaId', e.target.value)}
                required
                disabled={!formData.ubicacionId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccionar máquina</option>
                {maquinasFiltradas.map(maquina => (
                  <option key={maquina.id} value={maquina.id}>
                    {maquina.nombre} - {maquina.tipo} ({maquina.modelo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={getLabelClasses()}>
                <AlertTriangle className="w-4 h-4" />
                Tipo de Falla
              </label>
              <select
                value={formData.tipoFalla}
                onChange={(e) => handleInputChange('tipoFalla', e.target.value)}
                required
                className={getInputClasses()}
              >
                <option value="">Seleccionar tipo</option>
                {tiposFalla.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={getLabelClasses()}>
                <AlertTriangle className="w-4 h-4" />
                Dificultad de Reparación
              </label>
              
              {/* Semáforo de dificultad */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('dificultad', 'baja')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dificultad === 'baja'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-green-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Fácil</span>
                    <span className="text-xs text-gray-500">Baja</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('dificultad', 'media')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dificultad === 'media'
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Difícil</span>
                    <span className="text-xs text-gray-500">Media</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('dificultad', 'alta')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dificultad === 'alta'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-orange-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Muy Difícil</span>
                    <span className="text-xs text-gray-500">Alta</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('dificultad', 'critica')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dificultad === 'critica'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-red-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">No Pude Resolver</span>
                    <span className="text-xs text-gray-500">Crítica</span>
                  </div>
                </button>
              </div>
              
              {/* Indicador de dificultad seleccionada */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  formData.dificultad === 'baja' ? 'bg-green-500' :
                  formData.dificultad === 'media' ? 'bg-yellow-500' :
                  formData.dificultad === 'alta' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-700">
                  Dificultad seleccionada: {
                    formData.dificultad === 'baja' ? 'Fácil (Verde)' :
                    formData.dificultad === 'media' ? 'Difícil (Amarillo)' :
                    formData.dificultad === 'alta' ? 'Muy Difícil (Naranja)' :
                    'No Pude Resolver (Rojo)'
                  }
                </span>
              </div>
            </div>

            <div>
              <label className={getLabelClasses()}>
                <AlertTriangle className="w-4 h-4" />
                Tiempo de Reparación (horas)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.tiempoReparacion}
                onChange={(e) => handleInputChange('tiempoReparacion', Number(e.target.value))}
                required
                className={getInputClasses()}
              />
            </div>

            <div>
              <label className={getLabelClasses()}>
                <AlertTriangle className="w-4 h-4" />
                Técnico Responsable
              </label>
              <input
                type="text"
                value={formData.tecnico}
                onChange={(e) => handleInputChange('tecnico', e.target.value)}
                required
                placeholder="Nombre del técnico"
                className={getInputClasses()}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className={getLabelClasses()}>
              <AlertTriangle className="w-4 h-4" />
              Descripción del Problema
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              required
              rows={3}
              placeholder="Describe el problema encontrado..."
              className={getInputClasses()}
            />
          </div>

          {/* Repuestos utilizados */}
          <div>
            <label className={getLabelClasses()}>
              <Package className="w-4 h-4" />
              Repuestos Utilizados
            </label>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                <select
                  value={nuevoRepuesto.repuestoId}
                  onChange={(e) => setNuevoRepuesto(prev => ({ ...prev, repuestoId: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar repuesto</option>
                  {repuestos.map(repuesto => (
                    <option key={repuesto.id} value={repuesto.id}>
                      {repuesto.nombre} - ${repuesto.precio} ({repuesto.categoria})
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  value={nuevoRepuesto.cantidad}
                  onChange={(e) => setNuevoRepuesto(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cant."
                />
                
                <button
                  type="button"
                  onClick={agregarRepuesto}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Agregar
                </button>
              </div>

              {/* Lista de repuestos agregados */}
              {formData.repuestosUtilizados.length > 0 && (
                <div className="space-y-2">
                  {formData.repuestosUtilizados.map((repuesto) => {
                    const repuestoData = repuestos.find(r => r.id === repuesto.repuestoId);
                    return (
                      <div key={repuesto.repuestoId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div>
                          <span className="font-medium">{repuestoData?.nombre}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            x{repuesto.cantidad} - ${repuestoData ? (repuestoData.precio * repuesto.cantidad).toLocaleString() : 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerRepuesto(repuesto.repuestoId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700">
                      Total de repuestos: {formData.repuestosUtilizados.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Serie del Equipo */}
          <div>
            <label className={getLabelClasses()}>
              <Wrench className="w-4 h-4" />
              Serie del Equipo (Opcional)
            </label>
            <input
              type="text"
              value={formData.serieEquipo}
              onChange={(e) => handleInputChange('serieEquipo', e.target.value)}
              placeholder="Ej: S4020-001, LX656-001..."
              className={getInputClasses()}
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className={getLabelClasses()}>
              <AlertTriangle className="w-4 h-4" />
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={3}
              placeholder="Observaciones adicionales, recomendaciones, etc..."
              className={getInputClasses()}
            />
          </div>

          {/* Botones */}
          <div className={`flex gap-3 pt-4 border-t transition-colors duration-300 ${
            modoOscuro ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onCerrar}
              className={`flex-1 ${getButtonClasses('secondary')}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 ${getButtonClasses('primary')} flex items-center justify-center gap-2`}
            >
              <Save className="w-4 h-4" />
              Guardar Incidente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioIncidente;
