import { Incidente, Ubicacion, Maquina, Repuesto, EstadisticasUbicacion, EstadisticasRepuesto, Filtros } from '../types';

class DataService {
  private readonly STORAGE_KEYS = {
    INCIDENTES: 'incidentes_data',
    UBICACIONES: 'ubicaciones_data',
    MAQUINAS: 'maquinas_data',
    REPUESTOS: 'repuestos_data'
  };

  // Datos reales de impresoras
  private getDatosIniciales() {
    return {
      ubicaciones: [
        {
          id: '1',
          nombre: 'Mercado Central',
          direccion: 'Mercado Central, Buenos Aires',
          latitud: -34.7082840,
          longitud: -58.4888790,
          empresa: 'Diarco'
        },
        {
          id: '2',
          nombre: 'Esteban Echeverría',
          direccion: 'Esteban Echeverría, Buenos Aires',
          latitud: -34.7762620,
          longitud: -58.4720910,
          empresa: 'Catter meat S.A'
        },
        {
          id: '3',
          nombre: 'ADM Agro',
          direccion: 'Buenos Aires',
          latitud: -34.7678330,
          longitud: -58.3792530,
          empresa: 'ADM Agro S.R.L'
        },
        {
          id: '4',
          nombre: 'DHL Excel',
          direccion: 'Buenos Aires',
          latitud: -34.6722460,
          longitud: -58.4363080,
          empresa: 'DHL Excel'
        },
        {
          id: '5',
          nombre: 'Dia',
          direccion: 'Buenos Aires',
          latitud: -34.8372310,
          longitud: -58.4108440,
          empresa: 'Dia'
        },
        {
          id: '6',
          nombre: 'Molino Cañuelas SPEGAZZINI',
          direccion: 'Colect. Au. Ezeiza-Cañuelas Km 44',
          latitud: -34.900295,
          longitud: -58.616422,
          empresa: 'CARLOS SPEGAZZINI'
        },
        {
          id: '7',
          nombre: 'Exologistica Carrier',
          direccion: 'Lagos Garcia 4470',
          latitud: -34.76824,
          longitud: -58.480285,
          empresa: 'ESTEBAN ECHEVERRIA'
        },
        {
          id: '8',
          nombre: 'Exologistica PLEER',
          direccion: 'Ruta De La Tradicion 7732',
          latitud: -34.741992,
          longitud: -58.498072,
          empresa: 'ESTEBAN ECHEVERRIA'
        },
        {
          id: '9',
          nombre: 'Biogenesis Bago - Planta',
          direccion: '29 de abril 1251',
          latitud: -34.797531,
          longitud: -58.47131,
          empresa: 'MONTE GRANDE'
        },
        {
          id: '10',
          nombre: 'Saputo Versacold Mercado Central',
          direccion: 'Av. Circunvalación 2251',
          latitud: -34.714174,
          longitud: -58.492927,
          empresa: 'TAPIALES'
        }
      ] as Ubicacion[],
      maquinas: [
        { id: '1', nombre: 'Samsung 4020', tipo: 'Impresora', modelo: '4020', ubicacionId: '1', estado: 'operativa' },
        { id: '2', nombre: 'Lexmark x656', tipo: 'Impresora', modelo: 'x656', ubicacionId: '2', estado: 'operativa' },
        { id: '3', nombre: 'Samsung CLP 680N', tipo: 'Impresora', modelo: 'CLP 680N', ubicacionId: '3', estado: 'operativa' },
        { id: '4', nombre: 'Samsung Mono 4072', tipo: 'Impresora', modelo: 'Mono 4072', ubicacionId: '4', estado: 'operativa' },
        { id: '5', nombre: 'HP e52645dn', tipo: 'Impresora', modelo: 'e52645dn', ubicacionId: '5', estado: 'operativa' },
        { id: '6', nombre: 'Lexmark Optra X656de', tipo: 'MFP Mono', modelo: 'Optra X656de', ubicacionId: '6', estado: 'operativa' },
        { id: '7', nombre: 'Samsung SL-M4020ND', tipo: 'PRT Mono', modelo: 'SL-M4020ND', ubicacionId: '7', estado: 'operativa' },
        { id: '8', nombre: 'Samsung SL-M5370LX', tipo: 'MFP Mono', modelo: 'SL-M5370LX', ubicacionId: '8', estado: 'operativa' },
        { id: '9', nombre: 'Samsung SL-M5360RX', tipo: 'MFP Mono', modelo: 'SL-M5360RX', ubicacionId: '9', estado: 'operativa' },
        { id: '10', nombre: 'Samsung SL-M4020ND', tipo: 'PRT Mono', modelo: 'SL-M4020ND', ubicacionId: '10', estado: 'operativa' }
      ] as Maquina[],
      repuestos: [
        { id: '1', nombre: 'Fusor', codigo: 'FUS-001', categoria: 'Componentes', precio: 0 },
        { id: '2', nombre: 'Pickup', codigo: 'PIC-001', categoria: 'Componentes', precio: 0 },
        { id: '3', nombre: 'Retard', codigo: 'RET-001', categoria: 'Componentes', precio: 0 },
        { id: '4', nombre: 'Clutch', codigo: 'CLU-001', categoria: 'Componentes', precio: 0 },
        { id: '5', nombre: 'Low', codigo: 'LOW-001', categoria: 'Componentes', precio: 0 },
        { id: '6', nombre: 'Puerta Trasera', codigo: 'PUE-001', categoria: 'Componentes', precio: 0 },
        { id: '7', nombre: 'Tapa Delantera Verde', codigo: 'TAP-001', categoria: 'Componentes', precio: 0 },
        { id: '8', nombre: 'Switch', codigo: 'SWI-001', categoria: 'Componentes', precio: 0 },
        { id: '9', nombre: 'Recogedor de Hojas', codigo: 'REC-001', categoria: 'Componentes', precio: 0 },
        { id: '10', nombre: 'Controller', codigo: 'CON-001', categoria: 'Componentes', precio: 0 },
        { id: '11', nombre: 'Cartucho Magenta', codigo: 'CAR-001', categoria: 'Consumibles', precio: 0 },
        { id: '12', nombre: 'Rubber', codigo: 'RUB-001', categoria: 'Componentes', precio: 0 },
        { id: '13', nombre: 'Rodillo Pickup', codigo: 'ROD-001', categoria: 'Componentes', precio: 0 },
        { id: '14', nombre: 'Gomas', codigo: 'GOM-001', categoria: 'Componentes', precio: 0 },
        { id: '15', nombre: 'Toner', codigo: 'TON-001', categoria: 'Consumibles', precio: 0 },
        { id: '16', nombre: 'Rodillos Pick UP Tray 2', codigo: 'ROD-PU-002', categoria: 'Componentes', precio: 0 },
        { id: '17', nombre: 'Unidad de Imagen', codigo: 'UNI-IMG-001', categoria: 'Componentes', precio: 0 },
        { id: '18', nombre: 'Sensor CTD', codigo: 'SEN-CTD-001', categoria: 'Componentes', precio: 0 },
        { id: '19', nombre: 'Cover Cassette', codigo: 'COV-CAS-001', categoria: 'Componentes', precio: 0 },
        { id: '20', nombre: 'Duplex', codigo: 'DUP-001', categoria: 'Componentes', precio: 0 }
      ] as Repuesto[],
      incidentes: [
        {
          id: '1',
          fecha: '2025-08-12',
          ubicacionId: '1',
          maquinaId: '1',
          descripcion: 'Atasca papel, hace ruido (impresora)',
          tipoFalla: 'Mecánica',
          dificultad: 'media',
          tiempoReparacion: 3,
          repuestosUtilizados: [
            { repuestoId: '2', cantidad: 1 },
            { repuestoId: '3', cantidad: 1 },
            { repuestoId: '4', cantidad: 1 },
            { repuestoId: '1', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'limpieza equipo, limpieza unidad de imagen, lubricación, cambio pickup y retard, cambio del cluch y fusor (impresora)',
          serieEquipo: 'S4020-001'
        },
        {
          id: '2',
          fecha: '2025-09-04',
          ubicacionId: '1',
          maquinaId: '1',
          descripcion: 'impresora no imprime y olor a quemado (impresora)',
          tipoFalla: 'Eléctrica',
          dificultad: 'alta',
          tiempoReparacion: 4,
          repuestosUtilizados: [
            { repuestoId: '5', cantidad: 1 },
            { repuestoId: '1', cantidad: 1 },
            { repuestoId: '6', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'La low estaba quemada, salto fusible y el fusor de la impresora también se quemó aparte cambiamos la puerta trasera de la impresora porque estaba rota',
          serieEquipo: 'S4020-001'
        },
        {
          id: '3',
          fecha: '2025-09-03',
          ubicacionId: '2',
          maquinaId: '2',
          descripcion: 'no reconoce insumos, imprime de manera defectuosa',
          tipoFalla: 'Electrónica',
          dificultad: 'critica',
          tiempoReparacion: 6,
          repuestosUtilizados: [
            { repuestoId: '1', cantidad: 1 },
            { repuestoId: '7', cantidad: 1 },
            { repuestoId: '8', cantidad: 1 },
            { repuestoId: '9', cantidad: 1 },
            { repuestoId: '10', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'cambiamos fusor porque rompía la hoja, cambiamos lo verde de la tapa delantera porque estaba roto a la derecha, hicimos un puente del swith porque estaba roto y no teníamos así que cortamos el cable y hicimos que siempre lo detecte como cerrado, cambiamos el recogedor de hojas derecho de bandeja A4 y oficio, pero seguramente en algún momento cambiamos el izquierdo, cambiamos controller por descartar errores, pero al final descubrimos que una de las fallas era por el switch.',
          serieEquipo: 'LX656-001'
        },
        {
          id: '5',
          fecha: '2025-08-19',
          ubicacionId: '3',
          maquinaId: '3',
          descripcion: 'Falla en impresión',
          tipoFalla: 'Consumibles',
          dificultad: 'baja',
          tiempoReparacion: 1,
          repuestosUtilizados: [
            { repuestoId: '11', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'Cambio de cartucher magenta y limpieza equipo y limpieza rodillos',
          serieEquipo: 'SCLP680N-001'
        },
        {
          id: '6',
          fecha: '2025-08-18',
          ubicacionId: '4',
          maquinaId: '4',
          descripcion: 'No imprime duplex',
          tipoFalla: 'Mecánica',
          dificultad: 'baja',
          tiempoReparacion: 1,
          repuestosUtilizados: [
            { repuestoId: '12', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'Faltaba lubricar y cambiar rubber',
          serieEquipo: 'SM4072-001'
        },
        {
          id: '7',
          fecha: '2025-08-19',
          ubicacionId: '2',
          maquinaId: '2',
          descripcion: 'Mantenimiento preventivo',
          tipoFalla: 'Mantenimiento',
          dificultad: 'baja',
          tiempoReparacion: 2,
          repuestosUtilizados: [],
          tecnico: 'Técnico',
          observaciones: 'Limpieza equipo, limpieza de rodillo pickup, limpieza de escaner y reseteo contadores',
          serieEquipo: 'LX656-001'
        },
        {
          id: '8',
          fecha: '2025-08-19',
          ubicacionId: '2',
          maquinaId: '2',
          descripcion: 'Mantenimiento preventivo',
          tipoFalla: 'Mantenimiento',
          dificultad: 'baja',
          tiempoReparacion: 2,
          repuestosUtilizados: [],
          tecnico: 'Técnico',
          observaciones: 'Limpieza equipo, limpieza de rodillo pickup, limpieza de escaner, reseteo contadores',
          serieEquipo: 'LX656-001'
        },
        {
          id: '9',
          fecha: '2025-08-19',
          ubicacionId: '5',
          maquinaId: '5',
          descripcion: 'Arruga las hojas, atasca papel, mensaje de error',
          tipoFalla: 'Mecánica',
          dificultad: 'media',
          tiempoReparacion: 2,
          repuestosUtilizados: [
            { repuestoId: '14', cantidad: 1 },
            { repuestoId: '15', cantidad: 1 }
          ],
          tecnico: 'Técnico',
          observaciones: 'Gomas gastadas, toner en la zona de impresion y limpieza general',
          serieEquipo: 'HPE52645DN-001'
        },
        {
          id: '10',
          fecha: '2025-09-17',
          ubicacionId: '6',
          maquinaId: '6',
          descripcion: 'Cambio de fusor y rodillos pick UP tray 2(adicional), pruebas de impresion con el usuario',
          tipoFalla: 'Correctivo',
          dificultad: 'media',
          tiempoReparacion: 4,
          repuestosUtilizados: [
            { repuestoId: '1', cantidad: 1 },
            { repuestoId: '16', cantidad: 1 }
          ],
          tecnico: 'Cinthia Nieva',
          observaciones: 'Cambio de fusor y rodillos pick UP tray 2(adicional), pruebas de impresion con el usuario',
          serieEquipo: '7946PGC'
        },
        {
          id: '11',
          fecha: '2025-09-18',
          ubicacionId: '7',
          maquinaId: '7',
          descripcion: 'Limpieza del equipo, cambio de rubber, fusor y duplex',
          tipoFalla: 'Correctivo',
          dificultad: 'media',
          tiempoReparacion: 2,
          repuestosUtilizados: [
            { repuestoId: '12', cantidad: 1 },
            { repuestoId: '1', cantidad: 1 },
            { repuestoId: '20', cantidad: 1 }
          ],
          tecnico: 'Elias Vidal',
          observaciones: 'Limpieza del equipo, cambio de rubber, fusor y duplex',
          serieEquipo: 'ZDBXBJCH100058T'
        },
        {
          id: '12',
          fecha: '2025-09-19',
          ubicacionId: '8',
          maquinaId: '8',
          descripcion: 'Limpieza del equipo, cambio de fusor y pick UPs, reseteo de valores de mantenimiento, limpieza de sensor ctd',
          tipoFalla: 'Correctivo',
          dificultad: 'media',
          tiempoReparacion: 1,
          repuestosUtilizados: [
            { repuestoId: '1', cantidad: 1 },
            { repuestoId: '2', cantidad: 1 },
            { repuestoId: '18', cantidad: 1 }
          ],
          tecnico: 'Leonel',
          observaciones: 'Limpieza del equipo, cambio de fusor y pick UPs, reseteo de valores de mantenimiento, limpieza de sensor ctd',
          serieEquipo: '076UBJFG80006JV'
        },
        {
          id: '13',
          fecha: '2025-09-18',
          ubicacionId: '9',
          maquinaId: '9',
          descripcion: 'Se realizó cambio de cartucho y unidad de imagen. Falla: Imprime de manera defectuosa, muy clarito.',
          tipoFalla: 'Correctivo',
          dificultad: 'media',
          tiempoReparacion: 1,
          repuestosUtilizados: [
            { repuestoId: '17', cantidad: 1 }
          ],
          tecnico: 'Martiniano Rossetto',
          observaciones: 'Se realizó cambio de cartucho y unidad de imagen. Falla: Imprime de manera defectuosa, muy clarito.',
          serieEquipo: 'C52BJFK20000SX'
        },
        {
          id: '14',
          fecha: '2025-09-18',
          ubicacionId: '10',
          maquinaId: '10',
          descripcion: 'Limpieza, cambio de rubber rettard, cover cassette, lubricación de duplex, reseteo de mantenimiento. Se sacó etiqueta de tapa trasera porque tenía la serie de otro equipo.',
          tipoFalla: 'Correctivo',
          dificultad: 'media',
          tiempoReparacion: 3,
          repuestosUtilizados: [
            { repuestoId: '12', cantidad: 1 },
            { repuestoId: '3', cantidad: 1 },
            { repuestoId: '19', cantidad: 1 },
            { repuestoId: '20', cantidad: 1 }
          ],
          tecnico: 'Ariel Salas',
          observaciones: 'Limpieza, cambio de rubber rettard, cover cassette, lubricación de duplex, reseteo de mantenimiento. Se sacó etiqueta de tapa trasera porque tenía la serie de otro equipo.',
          serieEquipo: 'ZDBXBJCH2000QSF'
        }
      ] as Incidente[]
    };
  }

  // Inicializar datos si no existen
  private inicializarDatos() {
    try {
      // Solo inicializar si no existen datos
      const ubicacionesExistentes = localStorage.getItem(this.STORAGE_KEYS.UBICACIONES);
      const maquinasExistentes = localStorage.getItem(this.STORAGE_KEYS.MAQUINAS);
      const repuestosExistentes = localStorage.getItem(this.STORAGE_KEYS.REPUESTOS);
      const incidentesExistentes = localStorage.getItem(this.STORAGE_KEYS.INCIDENTES);
      
      if (!ubicacionesExistentes || !maquinasExistentes || !repuestosExistentes || !incidentesExistentes) {
        const datos = this.getDatosIniciales();
        
        localStorage.setItem(this.STORAGE_KEYS.UBICACIONES, JSON.stringify(datos.ubicaciones));
        localStorage.setItem(this.STORAGE_KEYS.MAQUINAS, JSON.stringify(datos.maquinas));
        localStorage.setItem(this.STORAGE_KEYS.REPUESTOS, JSON.stringify(datos.repuestos));
        localStorage.setItem(this.STORAGE_KEYS.INCIDENTES, JSON.stringify(datos.incidentes));
      }
    } catch (error) {
      console.error('Error al inicializar datos:', error);
    }
  }

  constructor() {
    console.log('DataService constructor ejecutándose...');
    try {
      this.inicializarDatos();
      console.log('DataService inicializado correctamente');
    } catch (error) {
      console.error('Error en DataService constructor:', error);
    }
  }

  // Métodos para obtener datos
  getUbicaciones(): Ubicacion[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.UBICACIONES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return [];
    }
  }

  getMaquinas(): Maquina[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.MAQUINAS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener máquinas:', error);
      return [];
    }
  }

  getRepuestos(): Repuesto[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.REPUESTOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener repuestos:', error);
      return [];
    }
  }

  getIncidentes(filtros?: Filtros): Incidente[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.INCIDENTES);
      let incidentes: Incidente[] = data ? JSON.parse(data) : [];

      if (filtros) {
        incidentes = this.aplicarFiltros(incidentes, filtros);
      }

      return incidentes;
    } catch (error) {
      console.error('Error al obtener incidentes:', error);
      return [];
    }
  }

  // Métodos para agregar datos
  agregarIncidente(incidente: Omit<Incidente, 'id'>): Incidente {
    const incidentes = this.getIncidentes();
    const nuevoIncidente: Incidente = {
      ...incidente,
      id: Date.now().toString()
    };
    
    incidentes.push(nuevoIncidente);
    localStorage.setItem(this.STORAGE_KEYS.INCIDENTES, JSON.stringify(incidentes));
    return nuevoIncidente;
  }

  agregarUbicacion(ubicacion: Omit<Ubicacion, 'id'>): Ubicacion {
    const ubicaciones = this.getUbicaciones();
    const nuevaUbicacion: Ubicacion = {
      ...ubicacion,
      id: Date.now().toString()
    };
    
    ubicaciones.push(nuevaUbicacion);
    localStorage.setItem(this.STORAGE_KEYS.UBICACIONES, JSON.stringify(ubicaciones));
    return nuevaUbicacion;
  }

  agregarMaquina(maquina: Omit<Maquina, 'id'>): Maquina {
    const maquinas = this.getMaquinas();
    const nuevaMaquina: Maquina = {
      ...maquina,
      id: Date.now().toString()
    };
    
    maquinas.push(nuevaMaquina);
    localStorage.setItem(this.STORAGE_KEYS.MAQUINAS, JSON.stringify(maquinas));
    return nuevaMaquina;
  }

  agregarRepuesto(repuesto: Omit<Repuesto, 'id'>): Repuesto {
    const repuestos = this.getRepuestos();
    const nuevoRepuesto: Repuesto = {
      ...repuesto,
      id: Date.now().toString()
    };
    
    repuestos.push(nuevoRepuesto);
    localStorage.setItem(this.STORAGE_KEYS.REPUESTOS, JSON.stringify(repuestos));
    return nuevoRepuesto;
  }

  // Aplicar filtros
  private aplicarFiltros(incidentes: Incidente[], filtros: Filtros): Incidente[] {
    return incidentes.filter(incidente => {
      if (filtros.fechaInicio && incidente.fecha < filtros.fechaInicio) return false;
      if (filtros.fechaFin && incidente.fecha > filtros.fechaFin) return false;
      if (filtros.dificultad && filtros.dificultad.length > 0 && !filtros.dificultad.includes(incidente.dificultad)) return false;
      if (filtros.tipoFalla && filtros.tipoFalla.length > 0 && !filtros.tipoFalla.includes(incidente.tipoFalla)) return false;
      if (filtros.ubicacion && filtros.ubicacion.length > 0 && !filtros.ubicacion.includes(incidente.ubicacionId)) return false;
      if (filtros.tecnico && !incidente.tecnico.toLowerCase().includes(filtros.tecnico.toLowerCase())) return false;
      return true;
    });
  }

  // Calcular estadísticas por ubicación
  getEstadisticasUbicacion(): EstadisticasUbicacion[] {
    console.log('getEstadisticasUbicacion ejecutándose...');
    try {
      const incidentes = this.getIncidentes();
      const ubicaciones = this.getUbicaciones();
      const maquinas = this.getMaquinas();
      
      console.log('Datos obtenidos:', { incidentes: incidentes.length, ubicaciones: ubicaciones.length, maquinas: maquinas.length });

    return ubicaciones.map(ubicacion => {
      const incidentesUbicacion = incidentes.filter(i => i.ubicacionId === ubicacion.id);
      const maquinasUbicacion = maquinas.filter(m => m.ubicacionId === ubicacion.id);
      
      const totalRepuestos = incidentesUbicacion.reduce((sum, i) => 
        sum + i.repuestosUtilizados.reduce((repSum, r) => repSum + r.cantidad, 0), 0
      );

      const dificultadNumerica = incidentesUbicacion.map(i => {
        switch (i.dificultad) {
          case 'baja': return 1;
          case 'media': return 2;
          case 'alta': return 3;
          case 'critica': return 4;
          default: return 0;
        }
      });

      const dificultadPromedio = dificultadNumerica.length > 0 
        ? dificultadNumerica.reduce((sum: number, d: number) => sum + d, 0) / dificultadNumerica.length 
        : 0;

      const tiempoPromedio = incidentesUbicacion.length > 0
        ? incidentesUbicacion.reduce((sum, i) => sum + i.tiempoReparacion, 0) / incidentesUbicacion.length
        : 0;

      // Costos eliminados según solicitud del usuario

      const ultimaVisita = incidentesUbicacion.length > 0
        ? Math.max(...incidentesUbicacion.map(i => new Date(i.fecha).getTime()))
        : 0;

      return {
        ubicacionId: ubicacion.id,
        totalIncidentes: incidentesUbicacion.length,
        totalMaquinas: maquinasUbicacion.length,
        totalRepuestos,
        dificultadPromedio,
        tiempoPromedioReparacion: tiempoPromedio,
        ultimaVisita: ultimaVisita > 0 ? new Date(ultimaVisita).toISOString().split('T')[0] : ''
      };
    });
    } catch (error) {
      console.error('Error en getEstadisticasUbicacion:', error);
      return [];
    }
  }

  // Calcular estadísticas de repuestos
  getEstadisticasRepuestos(): EstadisticasRepuesto[] {
    const incidentes = this.getIncidentes();
    const repuestos = this.getRepuestos();

    const repuestoStats = new Map<string, {
      totalUtilizado: number;
      ubicaciones: Set<string>;
      frecuencia: number;
    }>();

    incidentes.forEach(incidente => {
      incidente.repuestosUtilizados.forEach(repuesto => {
        const rep = repuestos.find(r => r.id === repuesto.repuestoId);
        if (rep) {
          const current = repuestoStats.get(repuesto.repuestoId) || {
            totalUtilizado: 0,
            ubicaciones: new Set(),
            frecuencia: 0
          };

          current.totalUtilizado += repuesto.cantidad;
          current.ubicaciones.add(incidente.ubicacionId);
          current.frecuencia += 1;

          repuestoStats.set(repuesto.repuestoId, current);
        }
      });
    });

    return Array.from(repuestoStats.entries()).map(([repuestoId, stats]) => {
      const repuesto = repuestos.find(r => r.id === repuestoId);
      return {
        repuestoId,
        nombre: repuesto?.nombre || 'Repuesto desconocido',
        totalUtilizado: stats.totalUtilizado,
        ubicaciones: Array.from(stats.ubicaciones),
        frecuencia: stats.frecuencia
      };
    }).sort((a, b) => b.totalUtilizado - a.totalUtilizado);
  }

}

export const dataService = new DataService();
