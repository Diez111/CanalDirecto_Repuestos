import React, { useState } from 'react';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, Database, Archive, Brain, Loader } from 'lucide-react';
import { dataService } from '../services/dataService';
import { getBackgroundClasses, getTextClasses, getSubTextClasses, getCardClasses, getBorderClasses, getButtonClasses, getInputClasses } from '../utils/colorUtils';

interface ExportarImportarProps {
  modoOscuro?: boolean;
  onDatosActualizados?: () => void;
}

const ExportarImportar: React.FC<ExportarImportarProps> = ({ modoOscuro = false, onDatosActualizados }) => {
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info', texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [textoIA, setTextoIA] = useState('');
  const [procesandoIA, setProcesandoIA] = useState(false);

  // Funciones de estilo para modo oscuro
  const getTextClasses = () => `${modoOscuro ? 'text-white' : 'text-gray-900'}`;
  const getSubTextClasses = () => `${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`;
  const getCardClasses = () => `${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`;
  const getButtonClasses = (variant: 'primary' | 'secondary' | 'success' | 'warning') => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2';
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${modoOscuro ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`;
      case 'secondary':
        return `${baseClasses} ${modoOscuro ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`;
      case 'success':
        return `${baseClasses} ${modoOscuro ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`;
      case 'warning':
        return `${baseClasses} ${modoOscuro ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`;
      default:
        return baseClasses;
    }
  };

  const mostrarMensaje = (tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const exportarDatos = () => {
    try {
      setCargando(true);
      
      // Obtener todos los datos del sistema
      const datosCompletos = {
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
        datos: {
          incidentes: dataService.getIncidentes(),
          ubicaciones: dataService.getUbicaciones(),
          repuestos: dataService.getRepuestos(),
          maquinas: dataService.getMaquinas()
        },
        estadisticas: {
          totalIncidentes: dataService.getIncidentes().length,
          totalUbicaciones: dataService.getUbicaciones().length,
          totalRepuestos: dataService.getRepuestos().length,
          totalMaquinas: dataService.getMaquinas().length
        }
      };

      // Crear archivo JSON
      const jsonString = JSON.stringify(datosCompletos, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `incidentes_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      mostrarMensaje('success', 'Datos exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar datos:', error);
      mostrarMensaje('error', 'Error al exportar los datos');
    } finally {
      setCargando(false);
    }
  };

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setCargando(true);
        const contenido = e.target?.result as string;
        const datosImportados = JSON.parse(contenido);

        // Validar estructura del archivo
        if (!datosImportados.datos || !datosImportados.version) {
          throw new Error('Formato de archivo inválido');
        }

        // Validar que contenga los datos necesarios
        const { incidentes, ubicaciones, repuestos, maquinas } = datosImportados.datos;
        
        if (!Array.isArray(incidentes) || !Array.isArray(ubicaciones) || 
            !Array.isArray(repuestos) || !Array.isArray(maquinas)) {
          throw new Error('Estructura de datos inválida');
        }

        // Limpiar datos actuales y cargar nuevos
        localStorage.clear();
        
        // Cargar datos en el sistema
        localStorage.setItem('incidentes_data', JSON.stringify(incidentes));
        localStorage.setItem('ubicaciones_data', JSON.stringify(ubicaciones));
        localStorage.setItem('repuestos_data', JSON.stringify(repuestos));
        localStorage.setItem('maquinas_data', JSON.stringify(maquinas));

        // Notificar actualización
        if (onDatosActualizados) {
          onDatosActualizados();
        }

        mostrarMensaje('success', `Datos importados exitosamente: ${datosImportados.estadisticas?.totalIncidentes || 0} incidentes, ${datosImportados.estadisticas?.totalUbicaciones || 0} ubicaciones`);
        
        // Limpiar el input
        event.target.value = '';
      } catch (error) {
        console.error('Error al importar datos:', error);
        mostrarMensaje('error', 'Error al importar los datos. Verifique que el archivo sea válido.');
      } finally {
        setCargando(false);
      }
    };

    reader.readAsText(file);
  };

  const limpiarDatos = () => {
    if (window.confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        setCargando(true);
        localStorage.clear();
        
        if (onDatosActualizados) {
          onDatosActualizados();
        }
        
        mostrarMensaje('info', 'Todos los datos han sido eliminados');
      } catch (error) {
        console.error('Error al limpiar datos:', error);
        mostrarMensaje('error', 'Error al limpiar los datos');
      } finally {
        setCargando(false);
      }
    }
  };

  const procesarTextoConIA = async () => {
    if (!textoIA.trim()) {
      mostrarMensaje('error', 'Por favor, ingrese el texto a procesar');
      return;
    }

    try {
      setProcesandoIA(true);
      
      const prompt = `Analiza el siguiente texto y extrae información sobre incidentes de impresoras, ubicaciones, máquinas y repuestos. 

TEXTO A ANALIZAR:
${textoIA}

INSTRUCCIONES:
1. Identifica incidentes de impresoras con: fecha, ubicación, máquina, descripción, tipo de falla, dificultad, tiempo de reparación, repuestos utilizados, técnico, observaciones
2. Identifica ubicaciones con: nombre, dirección, empresa, coordenadas (si están disponibles)
3. Identifica máquinas con: nombre, tipo, modelo, ubicación, estado
4. Identifica repuestos con: nombre, código, categoría, precio

Responde SOLO con un JSON válido en este formato:
{
  "incidentes": [
    {
      "id": "generar_id_unico",
      "fecha": "YYYY-MM-DD",
      "ubicacionId": "id_ubicacion",
      "maquinaId": "id_maquina", 
      "descripcion": "descripción del incidente",
      "tipoFalla": "tipo de falla",
      "dificultad": "baja|media|alta|critica",
      "tiempoReparacion": número_horas,
      "repuestosUtilizados": [{"repuestoId": "id", "cantidad": número}],
      "tecnico": "nombre técnico",
      "observaciones": "observaciones adicionales",
      "serieEquipo": "serie si está disponible"
    }
  ],
  "ubicaciones": [
    {
      "id": "generar_id_unico",
      "nombre": "nombre ubicación",
      "direccion": "dirección completa",
      "latitud": número_coordenada,
      "longitud": número_coordenada,
      "empresa": "nombre empresa"
    }
  ],
  "maquinas": [
    {
      "id": "generar_id_unico",
      "nombre": "nombre máquina",
      "tipo": "Impresora|MFP|etc",
      "modelo": "modelo específico",
      "ubicacionId": "id_ubicacion",
      "estado": "operativa|reparacion|fuera_servicio"
    }
  ],
  "repuestos": [
    {
      "id": "generar_id_unico",
      "nombre": "nombre repuesto",
      "codigo": "código del repuesto",
      "categoria": "categoría",
      "precio": número_precio
    }
  ]
}

IMPORTANTE: 
- Genera IDs únicos para cada elemento
- Si no encuentras información específica, omite ese campo
- Asegúrate de que las relaciones entre elementos sean consistentes
- Usa coordenadas aproximadas si no están disponibles
- Para dificultad, usa: "baja" (1-2 horas), "media" (2-4 horas), "alta" (4-8 horas), "critica" (más de 8 horas)`;

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
          temperature: 0.3,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`);
      }

      const data = await response.json();
      const contenido = data.choices[0].message.content;
      
      try {
        const datosProcesados = JSON.parse(contenido);
        
        // Validar estructura básica
        if (!datosProcesados.incidentes || !Array.isArray(datosProcesados.incidentes)) {
          throw new Error('Estructura de datos inválida');
        }

        // Obtener datos existentes
        const incidentesExistentes = dataService.getIncidentes();
        const ubicacionesExistentes = dataService.getUbicaciones();
        const maquinasExistentes = dataService.getMaquinas();
        const repuestosExistentes = dataService.getRepuestos();

        // Combinar datos existentes con nuevos
        const nuevosIncidentes = [...incidentesExistentes, ...datosProcesados.incidentes];
        const nuevasUbicaciones = [...ubicacionesExistentes, ...(datosProcesados.ubicaciones || [])];
        const nuevasMaquinas = [...maquinasExistentes, ...(datosProcesados.maquinas || [])];
        const nuevosRepuestos = [...repuestosExistentes, ...(datosProcesados.repuestos || [])];

        // Guardar en localStorage
        localStorage.setItem('incidentes_data', JSON.stringify(nuevosIncidentes));
        localStorage.setItem('ubicaciones_data', JSON.stringify(nuevasUbicaciones));
        localStorage.setItem('maquinas_data', JSON.stringify(nuevasMaquinas));
        localStorage.setItem('repuestos_data', JSON.stringify(nuevosRepuestos));

        // Notificar actualización
        if (onDatosActualizados) {
          onDatosActualizados();
        }

        const totalIncidentes = datosProcesados.incidentes.length;
        const totalUbicaciones = datosProcesados.ubicaciones?.length || 0;
        const totalMaquinas = datosProcesados.maquinas?.length || 0;
        const totalRepuestos = datosProcesados.repuestos?.length || 0;

        mostrarMensaje('success', 
          `Datos procesados exitosamente: ${totalIncidentes} incidentes, ${totalUbicaciones} ubicaciones, ${totalMaquinas} máquinas, ${totalRepuestos} repuestos`
        );

        // Limpiar el texto
        setTextoIA('');

      } catch (parseError) {
        console.error('Error al parsear respuesta IA:', parseError);
        mostrarMensaje('error', 'Error al procesar la respuesta de la IA. Verifique que el texto contenga información válida.');
      }

    } catch (error) {
      console.error('Error en procesamiento IA:', error);
      mostrarMensaje('error', 'Error al conectar con la IA. Intente nuevamente.');
    } finally {
      setProcesandoIA(false);
    }
  };

  const obtenerEstadisticas = () => {
    const incidentes = dataService.getIncidentes();
    const ubicaciones = dataService.getUbicaciones();
    const repuestos = dataService.getRepuestos();
    const maquinas = dataService.getMaquinas();

    return {
      totalIncidentes: incidentes.length,
      totalUbicaciones: ubicaciones.length,
      totalRepuestos: repuestos.length,
      totalMaquinas: maquinas.length,
      totalTecnicos: 0 // No hay datos de técnicos en el sistema actual
    };
  };

  const stats = obtenerEstadisticas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-500" />
          <h2 className={`text-xl font-semibold ${getTextClasses()}`}>
            Exportar e Importar Datos
          </h2>
        </div>
        <p className={`${getSubTextClasses()}`}>
          Respaldar y restaurar todos los datos del sistema de gestión de incidentes.
        </p>
      </div>

      {/* Estadísticas actuales */}
      <div className={`${getCardClasses()} rounded-lg p-6 border`}>
        <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
          <Archive className="w-5 h-5 text-green-500" />
          Datos Actuales
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${modoOscuro ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.totalIncidentes}
            </div>
            <div className={`text-sm ${getSubTextClasses()}`}>Incidentes</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${modoOscuro ? 'text-green-400' : 'text-green-600'}`}>
              {stats.totalUbicaciones}
            </div>
            <div className={`text-sm ${getSubTextClasses()}`}>Ubicaciones</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${modoOscuro ? 'text-orange-400' : 'text-orange-600'}`}>
              {stats.totalRepuestos}
            </div>
            <div className={`text-sm ${getSubTextClasses()}`}>Repuestos</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${modoOscuro ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats.totalMaquinas}
            </div>
            <div className={`text-sm ${getSubTextClasses()}`}>Máquinas</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${modoOscuro ? 'text-red-400' : 'text-red-600'}`}>
              {stats.totalTecnicos}
            </div>
            <div className={`text-sm ${getSubTextClasses()}`}>Técnicos</div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          mensaje.tipo === 'success' ? 'bg-green-100 border border-green-300' :
          mensaje.tipo === 'error' ? 'bg-red-100 border border-red-300' :
          'bg-blue-100 border border-blue-300'
        } ${modoOscuro ? 'bg-opacity-20' : ''}`}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : mensaje.tipo === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <FileText className="w-5 h-5 text-blue-600" />
          )}
          <span className={`${
            mensaje.tipo === 'success' ? 'text-green-800' :
            mensaje.tipo === 'error' ? 'text-red-800' :
            'text-blue-800'
          } ${modoOscuro ? 'text-opacity-90' : ''}`}>
            {mensaje.texto}
          </span>
        </div>
      )}

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exportar */}
        <div className={`${getCardClasses()} rounded-lg p-6 border`}>
          <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
            <Download className="w-5 h-5 text-green-500" />
            Exportar Datos
          </h3>
          <p className={`${getSubTextClasses()} mb-4`}>
            Descargar todos los datos del sistema en un archivo JSON para respaldo.
          </p>
          <button
            onClick={exportarDatos}
            disabled={cargando || stats.totalIncidentes === 0}
            className={getButtonClasses('success')}
          >
            <Download className="w-4 h-4" />
            {cargando ? 'Exportando...' : 'Exportar Datos'}
          </button>
          {stats.totalIncidentes === 0 && (
            <p className={`text-sm ${getSubTextClasses()} mt-2`}>
              No hay datos para exportar
            </p>
          )}
        </div>

        {/* Importar */}
        <div className={`${getCardClasses()} rounded-lg p-6 border`}>
          <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
            <Upload className="w-5 h-5 text-blue-500" />
            Importar Datos
          </h3>
          <p className={`${getSubTextClasses()} mb-4`}>
            Cargar datos desde un archivo JSON de respaldo.
          </p>
          <label className={getButtonClasses('primary')} style={{ cursor: 'pointer' }}>
            <Upload className="w-4 h-4" />
            {cargando ? 'Importando...' : 'Seleccionar Archivo'}
            <input
              type="file"
              accept=".json"
              onChange={importarDatos}
              disabled={cargando}
              className="hidden"
            />
          </label>
          <p className={`text-xs ${getSubTextClasses()} mt-2`}>
            Solo archivos .json válidos
          </p>
        </div>
      </div>

      {/* Importación con IA */}
      <div className={`${getCardClasses()} rounded-lg p-6 border`}>
        <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
          <Brain className="w-5 h-5 text-purple-500" />
          Importación Inteligente con IA
        </h3>
        <p className={`${getSubTextClasses()} mb-4`}>
          Ingrese texto con información de incidentes, ubicaciones, máquinas o repuestos. 
          La IA analizará y extraerá automáticamente los datos estructurados.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${getTextClasses()} mb-2`}>
              Texto a Procesar
            </label>
            <textarea
              value={textoIA}
              onChange={(e) => setTextoIA(e.target.value)}
              placeholder="Ejemplo: 'El 15/09/2024 en Mercado Central, la impresora Samsung 4020 tuvo una falla de fusor. El técnico Juan Pérez la reparó en 2 horas usando 1 fusor y 2 rodillos pickup...'"
              className={`${getInputClasses(modoOscuro)} w-full h-32 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
              disabled={procesandoIA}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={procesarTextoConIA}
              disabled={procesandoIA || !textoIA.trim()}
              className={getButtonClasses('primary')}
            >
              {procesandoIA ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Procesando con IA...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Procesar con IA
                </>
              )}
            </button>
            
            <button
              onClick={() => setTextoIA('')}
              disabled={procesandoIA}
              className={getButtonClasses('secondary')}
            >
              Limpiar
            </button>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-md ${modoOscuro ? 'bg-gray-800' : 'bg-blue-50'} border ${modoOscuro ? 'border-gray-600' : 'border-blue-200'}`}>
          <h4 className={`text-sm font-medium ${getTextClasses()} mb-2`}>
            💡 Ejemplos de texto que puede procesar:
          </h4>
          <ul className={`text-xs ${getSubTextClasses()} space-y-1`}>
            <li>• Reportes de incidentes con fechas, ubicaciones y técnicos</li>
            <li>• Listas de máquinas con modelos y ubicaciones</li>
            <li>• Inventarios de repuestos con códigos y precios</li>
            <li>• Información de empresas y direcciones</li>
            <li>• Cualquier texto estructurado con datos del sistema</li>
          </ul>
        </div>
      </div>

      {/* Acciones adicionales */}
      <div className={`${getCardClasses()} rounded-lg p-6 border`}>
        <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Acciones de Mantenimiento
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={limpiarDatos}
            disabled={cargando || stats.totalIncidentes === 0}
            className={getButtonClasses('warning')}
          >
            <AlertTriangle className="w-4 h-4" />
            {cargando ? 'Limpiando...' : 'Limpiar Todos los Datos'}
          </button>
          <div className={`text-sm ${getSubTextClasses()} flex items-center`}>
            ⚠️ Esta acción elimina permanentemente todos los datos
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className={`${getCardClasses()} rounded-lg p-6 border`}>
        <h3 className={`text-lg font-semibold ${getTextClasses()} mb-4 flex items-center gap-2`}>
          <FileText className="w-5 h-5 text-gray-500" />
          Información del Sistema
        </h3>
        <div className="space-y-2">
          <p className={`${getSubTextClasses()}`}>
            <strong>Formato de exportación:</strong> JSON con estructura completa del sistema
          </p>
          <p className={`${getSubTextClasses()}`}>
            <strong>Datos incluidos:</strong> Incidentes, ubicaciones, repuestos, máquinas y técnicos
          </p>
          <p className={`${getSubTextClasses()}`}>
            <strong>Importación IA:</strong> Procesa texto libre y extrae datos estructurados automáticamente
          </p>
          <p className={`${getSubTextClasses()}`}>
            <strong>Versión actual:</strong> 1.0
          </p>
          <p className={`${getSubTextClasses()}`}>
            <strong>Recomendación:</strong> Exportar datos regularmente para mantener respaldos actualizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportarImportar;
