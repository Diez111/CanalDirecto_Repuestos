import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
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

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ onUbicacionSeleccionada }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasUbicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
  const [leyendaPlegada, setLeyendaPlegada] = useState(false);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);

  useEffect(() => {
    const cargarDatos = () => {
      const ubicacionesData = dataService.getUbicaciones();
      const estadisticasData = dataService.getEstadisticasUbicacion();
      setUbicaciones(ubicacionesData);
      setEstadisticas(estadisticasData);
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inicializar mapa centrado en Mercado Central
    const map = L.map(mapRef.current).setView([-34.7082840, -58.4888790], 10);
    mapInstanceRef.current = map;

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar grupo de marcadores
    markersRef.current.addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !ubicaciones.length || !estadisticas.length) return;

    // Limpiar marcadores existentes
    markersRef.current.clearLayers();

    const group = L.featureGroup();

    ubicaciones.forEach(ubicacion => {
      const stat = estadisticas.find(s => s.ubicacionId === ubicacion.id);
      if (!stat) return;

      // Calcular color basado en dificultad promedio
      const color = getColorPorDificultad(stat.dificultadPromedio);
      
      // Calcular tamaño basado en número de incidentes
      const size = Math.max(15, Math.min(40, 15 + (stat.totalIncidentes * 2)));

      // Crear marcador personalizado
      const marker = L.circleMarker([ubicacion.latitud, ubicacion.longitud], {
        radius: size,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Crear popup con información
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-lg mb-2">${ubicacion.nombre}</h3>
          <p class="text-sm text-gray-600 mb-2">${ubicacion.empresa}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Incidentes:</span>
              <span class="font-medium">${stat.totalIncidentes}</span>
            </div>
            <div class="flex justify-between">
              <span>Máquinas:</span>
              <span class="font-medium">${stat.totalMaquinas}</span>
            </div>
            <div class="flex justify-between">
              <span>Repuestos:</span>
              <span class="font-medium">${stat.totalRepuestos}</span>
            </div>
            <div class="flex justify-between">
              <span>Tiempo Promedio:</span>
              <span class="font-medium">${stat.tiempoPromedioReparacion}h</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(markersRef.current);
      group.addLayer(marker);

      // Evento de clic
      marker.on('click', () => {
        setUbicacionSeleccionada(ubicacion);
        if (onUbicacionSeleccionada) {
          onUbicacionSeleccionada(ubicacion);
        }
      });
    });

    // Ajustar vista para mostrar todos los marcadores
    if (group.getLayers().length > 0) {
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [ubicaciones, estadisticas, onUbicacionSeleccionada]);

  const getColorPorDificultad = (dificultad: number): string => {
    if (dificultad <= 1.5) return '#10B981'; // Verde - Fácil
    if (dificultad <= 2.5) return '#84CC16'; // Verde claro - Fácil-Medio
    if (dificultad <= 3.5) return '#EAB308'; // Amarillo - Difícil
    if (dificultad <= 4.5) return '#F59E0B'; // Naranja claro - Difícil-Medio
    if (dificultad <= 5.5) return '#F97316'; // Naranja - Muy Difícil
    if (dificultad <= 6.5) return '#EF4444'; // Rojo claro - Crítico-Medio
    return '#DC2626'; // Rojo - No Pude Resolver
  };

  const centrarMapa = () => {
    if (mapInstanceRef.current && ubicaciones.length > 0) {
      const group = L.featureGroup();
      ubicaciones.forEach(ubicacion => {
        const marker = L.circleMarker([ubicacion.latitud, ubicacion.longitud], { radius: 1 });
        group.addLayer(marker);
      });
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Botón de centrar */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <button
          onClick={centrarMapa}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
          title="Centrar mapa en todas las ubicaciones"
        >
          🎯
        </button>
      </div>

      {/* Controles de la leyenda */}
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
        {/* Botón para mostrar/ocultar leyenda */}
        <button
          onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
          className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
          title={mostrarLeyenda ? "Ocultar leyenda" : "Mostrar leyenda"}
        >
          {mostrarLeyenda ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Leyenda */}
      {mostrarLeyenda && (
        <div className={`absolute top-2 right-12 z-[1000] bg-white rounded-lg shadow-lg transition-all duration-300 ${
          leyendaPlegada ? 'p-2' : 'p-4'
        } max-w-xs`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-gray-800 ${leyendaPlegada ? 'text-sm' : ''}`}>
              {leyendaPlegada ? 'Leyenda' : 'Leyenda de Dificultad'}
            </h3>
            <button
              onClick={() => setLeyendaPlegada(!leyendaPlegada)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={leyendaPlegada ? "Expandir" : "Plegar"}
            >
              {leyendaPlegada ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          
          {!leyendaPlegada && (
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
          )}
        </div>
      )}

      {/* Información de ubicación seleccionada */}
      {ubicacionSeleccionada && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{ubicacionSeleccionada.nombre}</h3>
            <button
              onClick={() => setUbicacionSeleccionada(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{ubicacionSeleccionada.empresa}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{ubicacionSeleccionada.direccion}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>Lat: {ubicacionSeleccionada.latitud.toFixed(6)}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>Lng: {ubicacionSeleccionada.longitud.toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaInteractivo;