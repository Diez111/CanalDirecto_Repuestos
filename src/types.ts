export interface Ubicacion {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  empresa: string;
}

export interface Maquina {
  id: string;
  nombre: string;
  tipo: string;
  modelo: string;
  ubicacionId: string;
  estado: 'operativa' | 'reparacion' | 'fuera_servicio';
}

export interface Repuesto {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  precio: number;
}

export interface Incidente {
  id: string;
  fecha: string;
  ubicacionId: string;
  maquinaId: string;
  descripcion: string;
  tipoFalla: string;
  dificultad: 'baja' | 'media' | 'alta' | 'critica';
  tiempoReparacion: number; // en horas
  repuestosUtilizados: {
    repuestoId: string;
    cantidad: number;
  }[];
  tecnico: string;
  observaciones: string;
  serieEquipo?: string; // Campo opcional para la serie del equipo
}

export interface EstadisticasUbicacion {
  ubicacionId: string;
  totalIncidentes: number;
  totalMaquinas: number;
  totalRepuestos: number;
  dificultadPromedio: number;
  tiempoPromedioReparacion: number;
  ultimaVisita: string;
}

export interface EstadisticasRepuesto {
  repuestoId: string;
  nombre: string;
  totalUtilizado: number;
  ubicaciones: string[];
  frecuencia: number;
}

export interface Filtros {
  fechaInicio?: string;
  fechaFin?: string;
  dificultad?: string[];
  tipoFalla?: string[];
  ubicacion?: string[];
  tecnico?: string;
}

export interface AnalisisResultado {
  repuestosCriticos: RepuestoCritico[];
  consejosTecnicos: ConsejoTecnico[];
  resumen: string;
}

export interface RepuestoCritico {
  repuestoId: string;
  nombre: string;
  cantidadRecomendada: number;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  razon: string;
}

export interface ConsejoTecnico {
  titulo: string;
  descripcion: string;
  categoria: string;
}
