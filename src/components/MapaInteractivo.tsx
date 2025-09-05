import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, AlertTriangle, Clock, Wrench, Package } from 'lucide-react';
import { Ubicacion, EstadisticasUbicacion } from '../types';
import { dataService } from '../services/dataService';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapaInteractivoProps {
  filtros?: any;
  onUbicacionSeleccionada?: (ubicacion: Ubicacion) => void;
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ filtros, onUbicacionSeleccionada }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasUbicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);

  useEffect(() => {
    const cargarDatos = () => {
      const ubicacionesData = dataService.getUbicaciones();
      const estadisticasData = dataService.getEstadisticasUbicacion();
      setUbicaciones(ubicacionesData);
      setEstadisticas(estadisticasData);
    };

    cargarDatos();
  }, [filtros]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Inicializar el mapa centrado en las ubicaciones reales
      const map = L.map(mapRef.current).setView([-34.7082840, -58.4888790], 11);
      
      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current.addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && ubicaciones.length > 0) {
      // Limpiar marcadores existentes
      markersRef.current.clearLayers();

      // Agregar marcadores para cada ubicación
      ubicaciones.forEach((ubicacion) => {
        const stats = estadisticas.find(s => s.ubicacionId === ubicacion.id);
        if (!stats) return;

        const color = getColorPorDificultad(stats.dificultadPromedio);
        const tamaño = getTamañoBurbuja(stats.totalIncidentes, stats.totalRepuestos);

        // Crear marcador personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: ${tamaño}px;
              height: ${tamaño}px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${Math.max(10, tamaño / 4)}px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              ${stats.totalIncidentes}
            </div>
          `,
          iconSize: [tamaño, tamaño],
          iconAnchor: [tamaño / 2, tamaño / 2]
        });

        const marker = L.marker([ubicacion.latitud, ubicacion.longitud], {
          icon: customIcon
        });

        // Crear popup con información detallada
        const popupContent = createPopupContent(ubicacion, stats);
        marker.bindPopup(popupContent);

        // Agregar evento de click
        marker.on('click', () => {
          setUbicacionSeleccionada(ubicacion);
          if (onUbicacionSeleccionada) {
            onUbicacionSeleccionada(ubicacion);
          }
        });

        markersRef.current.addLayer(marker);
      });

      // Ajustar vista del mapa para mostrar todos los marcadores
      if (ubicaciones.length > 0) {
        const group = L.featureGroup(markersRef.current.getLayers());
        if (group.getLayers().length > 0) {
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
      }
    }
  }, [ubicaciones, estadisticas, onUbicacionSeleccionada]);

  const getColorPorDificultad = (dificultadPromedio: number): string => {
    if (dificultadPromedio <= 1) return '#10B981'; // Verde
    if (dificultadPromedio <= 1.5) return '#84CC16'; // Verde-amarillo
    if (dificultadPromedio <= 2) return '#EAB308'; // Amarillo
    if (dificultadPromedio <= 2.5) return '#F59E0B'; // Amarillo-naranja
    if (dificultadPromedio <= 3) return '#F97316'; // Naranja
    if (dificultadPromedio <= 3.5) return '#EF4444'; // Naranja-rojo
    return '#DC2626'; // Rojo
  };

  const getTamañoBurbuja = (totalIncidentes: number, totalRepuestos: number): number => {
    const factor = Math.max(totalIncidentes, totalRepuestos / 5);
    return Math.min(Math.max(factor * 8, 30), 80);
  };

  const createPopupContent = (ubicacion: Ubicacion, stats: EstadisticasUbicacion): string => {
    const dificultadTexto = 
      stats.dificultadPromedio <= 1 ? 'Fácil' :
      stats.dificultadPromedio <= 2 ? 'Difícil' :
      stats.dificultadPromedio <= 3 ? 'Muy Difícil' :
      'No Pude Resolver';

    return `
      <div style="min-width: 250px; font-family: system-ui;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px; margin: -10px -10px 15px -10px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${ubicacion.nombre}</h3>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong>📍 Dirección:</strong><br>
          <span style="color: #6b7280; font-size: 14px;">${ubicacion.direccion}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="background: #fef2f2; padding: 8px; border-radius: 6px; text-align: center;">
            <div style="color: #dc2626; font-weight: bold; font-size: 18px;">${stats.totalIncidentes}</div>
            <div style="color: #6b7280; font-size: 12px;">Incidentes</div>
          </div>
          <div style="background: #f0f9ff; padding: 8px; border-radius: 6px; text-align: center;">
            <div style="color: #2563eb; font-weight: bold; font-size: 18px;">${stats.totalMaquinas}</div>
            <div style="color: #6b7280; font-size: 12px;">Máquinas</div>
          </div>
          <div style="background: #f0fdf4; padding: 8px; border-radius: 6px; text-align: center;">
            <div style="color: #16a34a; font-weight: bold; font-size: 18px;">${stats.totalRepuestos}</div>
            <div style="color: #6b7280; font-size: 12px;">Repuestos</div>
          </div>
          <div style="background: #fefce8; padding: 8px; border-radius: 6px; text-align: center;">
            <div style="color: #ca8a04; font-weight: bold; font-size: 18px;">${stats.tiempoPromedioReparacion.toFixed(1)}h</div>
            <div style="color: #6b7280; font-size: 12px;">Tiempo Prom.</div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <strong>📊 Total Repuestos:</strong> {stats.totalRepuestos}
        </div>

        <div style="margin-bottom: 12px;">
          <strong>⚠️ Dificultad:</strong> 
          <span style="
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            background: ${getColorPorDificultad(stats.dificultadPromedio)}; 
            border-radius: 50%; 
            margin-left: 8px;
            vertical-align: middle;
          "></span>
          <span style="margin-left: 8px;">${dificultadTexto} (${stats.dificultadPromedio.toFixed(1)})</span>
        </div>

        ${stats.ultimaVisita ? `
          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <strong>Última visita:</strong> ${stats.ultimaVisita}
          </div>
        ` : ''}
      </div>
    `;
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Controles del mapa */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.zoomIn();
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Acercar"
        >
          +
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.zoomOut();
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Alejar"
        >
          -
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current && ubicaciones.length > 0) {
              const group = L.featureGroup(markersRef.current.getLayers());
              mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
            }
          }}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title="Ver todas las ubicaciones"
        >
          🎯
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold mb-3 text-gray-800">Leyenda de Dificultad</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#10B981'}}></div>
            <span>Fácil (Verde)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#84CC16'}}></div>
            <span>Fácil-Medio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#EAB308'}}></div>
            <span>Difícil (Amarillo)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#F59E0B'}}></div>
            <span>Difícil-Medio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#F97316'}}></div>
            <span>Muy Difícil (Naranja)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#EF4444'}}></div>
            <span>Crítico-Medio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#DC2626'}}></div>
            <span>No Pude Resolver (Rojo)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
          <p><strong>Tamaño:</strong> Cantidad de incidentes</p>
          <p><strong>Color:</strong> Dificultad promedio</p>
          <p><strong>Click:</strong> Ver detalles</p>
        </div>
      </div>

      {/* Mapa de Leaflet */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Panel de información de ubicación seleccionada */}
      {ubicacionSeleccionada && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-800">{ubicacionSeleccionada.nombre}</h3>
            <button
              onClick={() => setUbicacionSeleccionada(null)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{ubicacionSeleccionada.direccion}</p>
          
          {(() => {
            const stats = estadisticas.find(s => s.ubicacionId === ubicacionSeleccionada.id);
            if (!stats) return null;

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">{stats.totalIncidentes} incidentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{stats.totalMaquinas} máquinas</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{stats.totalRepuestos} repuestos utilizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">{stats.tiempoPromedioReparacion.toFixed(1)}h promedio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{stats.totalRepuestos} repuestos</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{backgroundColor: getColorPorDificultad(stats.dificultadPromedio)}}
                    ></div>
                    <span className="text-sm">
                      Dificultad: {stats.dificultadPromedio.toFixed(1)} - {
                        stats.dificultadPromedio <= 1 ? 'Fácil' :
                        stats.dificultadPromedio <= 2 ? 'Difícil' :
                        stats.dificultadPromedio <= 3 ? 'Muy Difícil' :
                        'No Pude Resolver'
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Última visita: {stats.ultimaVisita || 'N/A'}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MapaInteractivo;