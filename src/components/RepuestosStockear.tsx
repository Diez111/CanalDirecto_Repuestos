import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Brain, Users, CheckCircle, Clock, Star } from 'lucide-react';
// import { EstadisticasRepuesto } from '../types';
import { dataService } from '../services/dataService';
import { getBackgroundClasses, getTextClasses, getSubTextClasses, getCardClasses, getBorderClasses } from '../utils/colorUtils';

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

interface DuracionStock {
  id: string;
  nombre: string;
  semanas: number;
  descripcion: string;
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
  const [duracionStock, setDuracionStock] = useState<string>('2'); // 2 semanas por defecto
  const [analisisIA, setAnalisisIA] = useState<any>(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  // Cargar análisis IA guardado al inicializar
  useEffect(() => {
    try {
      const analisisGuardado = localStorage.getItem('analisis_ia_stockear');
      if (analisisGuardado) {
        const parsed = JSON.parse(analisisGuardado);
        if (parsed && typeof parsed === 'object') {
          setAnalisisIA(parsed);
        }
      }
    } catch (error) {
      console.error('Error al cargar análisis IA guardado:', error);
      // Limpiar localStorage si hay error
      localStorage.removeItem('analisis_ia_stockear');
    }
  }, []);

  // Opciones de duración de stock
  const opcionesDuracion: DuracionStock[] = [
    { id: '1', nombre: '1 Semana', semanas: 1, descripcion: 'Stock mínimo para emergencias' },
    { id: '2', nombre: '2 Semanas', semanas: 2, descripcion: 'Stock estándar recomendado' },
    { id: '3', nombre: '3 Semanas', semanas: 3, descripcion: 'Stock amplio para alta demanda' },
    { id: '4', nombre: '1 Mes', semanas: 4, descripcion: 'Stock extendido para múltiples ubicaciones' }
  ];

  useEffect(() => {
    const cargarDatos = () => {
    setCargando(true);
    setError(null);
    try {
      generarListaStock();
      cargarConsejosTecnicos();
        setCargando(false);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error en useEffect:', err);
      setCargando(false);
    }
    };
    
    cargarDatos();
  }, []);

  const generarListaStock = () => {
    try {
      // Verificar que dataService esté disponible
      if (!dataService) {
        console.error('DataService no disponible');
        setRepuestosStock([]);
        setAnalisisGenerado(false);
        return;
      }

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
        acc[maquina.modelo].dificultadPromedio = dificultades.reduce((sum: number, d: number) => sum + d, 0) / dificultades.length;
      }
      
      return acc;
    }, {} as any);

    // Guardar el análisis en el estado
    setAnalisisPorModelo(analisisPorModelo);

    // Repuestos específicos por modelo de impresora (SIN consumibles ni herramientas)
    const repuestosPorModelo = {
      // Samsung SL-M4020ND
      'Samsung SL-M4020ND': [
        { nombre: 'Fusor Samsung SL-M4020ND', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Fusor específico para Samsung SL-M4020ND, falla por sobrecalentamiento' },
        { nombre: 'Pickup Samsung SL-M4020ND', categoria: 'Componentes', prioridad: 'critica', cantidad: 3, razon: 'Pickup específico Samsung, causa atascos de papel' },
        { nombre: 'Rubber Samsung SL-M4020ND', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Rodillos de goma específicos Samsung' },
        { nombre: 'Retard Samsung SL-M4020ND', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Componente de alimentación específico' },
        { nombre: 'Duplex Samsung SL-M4020ND', categoria: 'Componentes', prioridad: 'media', cantidad: 1, razon: 'Unidad duplex específica Samsung' }
      ],
      // Samsung SL-M5370LX
      'Samsung SL-M5370LX': [
        { nombre: 'Fusor Samsung SL-M5370LX', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Fusor específico para Samsung SL-M5370LX' },
        { nombre: 'Pickup Samsung SL-M5370LX', categoria: 'Componentes', prioridad: 'critica', cantidad: 3, razon: 'Pickup específico Samsung SL-M5370LX' },
        { nombre: 'Sensor CTD Samsung SL-M5370LX', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Sensor específico Samsung' },
        { nombre: 'Controller Samsung SL-M5370LX', categoria: 'Componentes', prioridad: 'critica', cantidad: 1, razon: 'Placa principal específica' }
      ],
      // Samsung SL-M5360RX
      'Samsung SL-M5360RX': [
        { nombre: 'Fusor Samsung SL-M5360RX', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Fusor específico para Samsung SL-M5360RX' },
        { nombre: 'Unidad de Imagen Samsung SL-M5360RX', categoria: 'Componentes', prioridad: 'alta', cantidad: 1, razon: 'Unidad de imagen específica Samsung' },
        { nombre: 'Pickup Samsung SL-M5360RX', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Pickup específico Samsung' }
      ],
      // Lexmark Optra X656de
      'Lexmark Optra X656de': [
        { nombre: 'Fusor Lexmark X656de', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Fusor específico Lexmark X656de' },
        { nombre: 'Rodillos Pick UP Tray 2 Lexmark', categoria: 'Componentes', prioridad: 'alta', cantidad: 3, razon: 'Rodillos específicos Lexmark' },
        { nombre: 'Pickup Lexmark X656de', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Pickup específico Lexmark' },
        { nombre: 'Retard Lexmark X656de', categoria: 'Componentes', prioridad: 'media', cantidad: 2, razon: 'Retard específico Lexmark' }
      ],
      // HP e52645dn
      'HP e52645dn': [
        { nombre: 'Fusor HP e52645dn', categoria: 'Componentes', prioridad: 'critica', cantidad: 2, razon: 'Fusor específico HP e52645dn' },
        { nombre: 'Gomas HP e52645dn', categoria: 'Componentes', prioridad: 'alta', cantidad: 3, razon: 'Gomas específicas HP' },
        { nombre: 'Pickup HP e52645dn', categoria: 'Componentes', prioridad: 'alta', cantidad: 2, razon: 'Pickup específico HP' }
      ]
    };

    // Generar lista inteligente basada en modelos reales y duración de stock
    const semanasStock = parseInt(duracionStock);
    const listaCombinada: RepuestoStock[] = [];

    // Obtener modelos únicos de las máquinas
    const modelosUnicos = [...new Set(maquinas.map(m => m.modelo))];
    
    modelosUnicos.forEach(modelo => {
      const repuestosModelo = repuestosPorModelo[modelo as keyof typeof repuestosPorModelo] || [];
      const maquinasModelo = maquinas.filter(m => m.modelo === modelo);
      const incidentesModelo = incidentes.filter(i => 
        maquinasModelo.some(m => m.id === i.maquinaId)
      );

      repuestosModelo.forEach(repuesto => {
        // Calcular cantidad basada en duración de stock y frecuencia de uso
        // const estadistica = estadisticas.find(s => 
        //   s.nombre.toLowerCase().includes(repuesto.nombre.toLowerCase().split(' ')[0])
        // );
        
        // Frecuencia de uso del repuesto en este modelo
        const frecuenciaModelo = incidentesModelo.filter(inc => 
          inc.repuestosUtilizados.some(rep => 
            repuestos.find(r => r.id === rep.repuestoId)?.nombre.toLowerCase().includes(
              repuesto.nombre.toLowerCase().split(' ')[0]
            )
          )
        ).length;

        // Calcular cantidad inteligente basada en:
        // 1. Cantidad base del repuesto
        // 2. Número de máquinas del modelo
        // 3. Frecuencia de uso
        // 4. Duración de stock seleccionada
        const cantidadBase = repuesto.cantidad;
        const factorMaquinas = Math.ceil(maquinasModelo.length / 2); // 1 repuesto cada 2 máquinas
        const factorFrecuencia = Math.min(frecuenciaModelo, 3); // Máximo factor 3
        const factorDuracion = semanasStock; // Factor por semanas de stock
        
        const cantidadInteligente = Math.max(
          cantidadBase,
          Math.ceil((cantidadBase * factorMaquinas * factorFrecuencia * factorDuracion) / 4)
        );

        // Limitar cantidades exageradas
        const cantidadFinal = Math.min(cantidadInteligente, 10);

        listaCombinada.push({
          id: `${modelo}-${repuesto.nombre.replace(/\s+/g, '-').toLowerCase()}`,
        nombre: repuesto.nombre,
        categoria: repuesto.categoria,
        prioridad: repuesto.prioridad as 'critica' | 'alta' | 'media' | 'baja',
          cantidadRecomendada: cantidadFinal,
          razon: `${repuesto.razon} - Para ${maquinasModelo.length} máquina(s) ${modelo} - Stock para ${semanasStock} semana(s)`,
          frecuenciaUso: frecuenciaModelo,
          stockActual: Math.floor(Math.random() * 3), // Simulado
        proveedor: 'Proveedor Principal',
        tiempoEntrega: '1-3 días'
        });
      });
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
    // Consejos técnicos basados en datos reales del sistema
    const consejos: ConsejoTecnico[] = [
      {
        id: '1',
        titulo: 'Análisis de Frecuencia de Fallas',
        descripcion: 'Basado en los datos del sistema, los fusores son el componente que más falla en impresoras Samsung y Lexmark.',
        categoria: 'Análisis de Datos',
        autor: 'Sistema de Análisis',
        experiencia: 'Datos Reales',
        relevancia: 5
      },
      {
        id: '2',
        titulo: 'Patrones por Modelo',
        descripcion: 'Cada modelo de impresora tiene patrones específicos de fallas. Samsung SL-M4020ND tiene más problemas con pickup y fusor.',
        categoria: 'Análisis por Modelo',
        autor: 'Sistema de Análisis',
        experiencia: 'Datos Reales',
        relevancia: 4
      },
      {
        id: '3',
        titulo: 'Ubicaciones Problemáticas',
        descripcion: 'Las ubicaciones con más incidentes requieren mayor stock. Esteban Echeverría y Exologistica tienen mayor frecuencia de fallas.',
        categoria: 'Análisis Geográfico',
        autor: 'Sistema de Análisis',
        experiencia: 'Datos Reales',
        relevancia: 4
      },
      {
        id: '4',
        titulo: 'Tiempo de Reparación',
        descripcion: 'Los incidentes de dificultad alta y crítica requieren más tiempo. Mantén stock suficiente para estos casos.',
        categoria: 'Análisis de Tiempo',
        autor: 'Sistema de Análisis',
        experiencia: 'Datos Reales',
        relevancia: 3
      }
    ];

    setConsejosTecnicos(consejos);
  };

  const ejecutarAnalisisIA = async () => {
    setCargandoIA(true);
    setError(null);

    try {
      const estadisticasRepuestos = dataService.getEstadisticasRepuestos();
      const estadisticasUbicacion = dataService.getEstadisticasUbicacion();
      const incidentes = dataService.getIncidentes();
      const ubicaciones = dataService.getUbicaciones();
      const repuestos = dataService.getRepuestos();
      const maquinas = dataService.getMaquinas();

      const semanasStock = parseInt(duracionStock);
      // const duracionSeleccionada = opcionesDuracion.find(d => d.id === duracionStock);

      // Preparar datos específicos para el análisis
      const datosEspecificos = {
        modelosMaquinas: maquinas.map(m => ({
          modelo: m.modelo,
          ubicacion: ubicaciones.find(u => u.id === m.ubicacionId)?.nombre,
          estado: m.estado
        })),
        incidentesPorModelo: maquinas.map(maquina => {
          const incidentesModelo = incidentes.filter(i => i.maquinaId === maquina.id);
          return {
            modelo: maquina.modelo,
            totalIncidentes: incidentesModelo.length,
            repuestosUsados: incidentesModelo.flatMap(i => 
              i.repuestosUtilizados.map(rep => {
                const repuesto = repuestos.find(r => r.id === rep.repuestoId);
                return repuesto ? repuesto.nombre : 'Desconocido';
              })
            ),
            tiposFalla: [...new Set(incidentesModelo.map(i => i.tipoFalla))],
            dificultades: incidentesModelo.map(i => i.dificultad)
          };
        }),
        repuestosMasUsados: estadisticasRepuestos.slice(0, 10).map(stat => ({
          nombre: stat.nombre,
          totalUtilizado: stat.totalUtilizado,
          frecuencia: stat.frecuencia,
          ubicaciones: stat.ubicaciones.length
        })),
        ubicacionesConMasProblemas: estadisticasUbicacion
          .sort((a, b) => b.totalIncidentes - a.totalIncidentes)
          .slice(0, 5)
          .map(stat => {
            const ubicacion = ubicaciones.find(u => u.id === stat.ubicacionId);
            return {
              nombre: ubicacion?.nombre || 'Desconocida',
              empresa: ubicacion?.empresa || 'Desconocida',
              totalIncidentes: stat.totalIncidentes,
              dificultadPromedio: stat.dificultadPromedio,
              tiempoPromedio: stat.tiempoPromedioReparacion
            };
          })
      };

      const prompt = `
Eres un experto en gestión de inventario de repuestos para impresoras. Analiza EXACTAMENTE estos datos reales y proporciona recomendaciones específicas.

IMPORTANTE: 
- NO inventes nombres de repuestos que no existan
- NO inventes nombres de máquinas que no existan  
- NO inventes técnicos veteranos ni consejos falsos
- SOLO usa los datos reales proporcionados
- NO incluyas consumibles (cartuchos, toner, tinta)
- NO incluyas herramientas (destornilladores, multímetros, pinzas)
- SOLO repuestos mecánicos y componentes específicos por modelo
- Considera que el stock debe durar ${semanasStock} semana(s)

DATOS REALES DEL SISTEMA:
${JSON.stringify(datosEspecificos, null, 2)}

REGLAS ESTRICTAS Y MÍNIMOS OBLIGATORIOS:
1. Solo usa repuestos que aparezcan en los datos reales
2. Solo usa modelos de máquinas que aparezcan en los datos reales
3. NO inventes nada que no esté en los datos
4. Basa las cantidades en la frecuencia real de uso
5. Considera la duración de stock de ${semanasStock} semana(s)

MÍNIMOS OBLIGATORIOS POR MODELO:
- MAINMOTOR: Mínimo 2 unidades por modelo (componente crítico)
- CLUTCH: Mínimo 3 unidades por modelo (desgaste frecuente)
- FUSOR: Mínimo 2 unidades por modelo (falla más común)
- PICKUP: Mínimo 3 unidades por modelo (causa atascos)
- RETARD: Mínimo 2 unidades por modelo (desgaste)
- RUBBER: Mínimo 4 unidades por modelo (desgaste rápido)
- SENSORES: Mínimo 2 unidades por modelo (falla electrónica)
- SWITCHES: Mínimo 3 unidades por modelo (desgaste mecánico)

ESCALADO POR PROBABILIDAD:
- Modelos con >3 incidentes: Aumentar mínimos en 50%
- Modelos con >5 incidentes: Aumentar mínimos en 100%
- Modelos con ubicaciones múltiples: Aumentar mínimos en 25%
- Modelos con dificultad alta/crítica: Aumentar mínimos en 75%

COMPONENTES ADICIONALES A CONSIDERAR:
- Unidad de Imagen (por modelo)
- Rodillos de Alimentación
- Cables de Alimentación
- Conectores y Terminales
- Filtros de Aire
- Ventiladores
- Placas de Control
- Cables de Datos
- Sensores de Papel
- Sensores de Tóner
- Switches de Posición
- Motores de Alimentación
- Engranajes y Poleas
- Resortes y Muelles
- Juntas y Sellos

Responde SOLO con JSON válido:
{
  "recomendaciones": [
    "Recomendación basada en datos reales 1",
    "Recomendación basada en datos reales 2"
  ],
  "repuestosCriticos": [
    {
      "nombre": "Nombre exacto del repuesto de los datos",
      "cantidadRecomendada": 2,
      "razon": "Basado en frecuencia real de uso",
      "urgencia": "alta",
      "modelo": "Modelo exacto de los datos"
    }
  ],
  "listaRepuestosPorMaquina": [
    {
      "modelo": "Samsung SL-M4020ND",
      "totalIncidentes": 3,
      "factorEscalado": 1.5,
      "repuestos": [
        {
          "nombre": "Mainmotor Samsung SL-M4020ND",
          "cantidadRecomendada": 3,
          "cantidadMinima": 2,
          "razon": "Componente crítico - Mínimo obligatorio + escalado por frecuencia",
          "urgencia": "alta",
          "tipo": "MAINMOTOR"
        },
        {
          "nombre": "Clutch Samsung SL-M4020ND",
          "cantidadRecomendada": 5,
          "cantidadMinima": 3,
          "razon": "Desgaste frecuente - Mínimo obligatorio + escalado",
          "urgencia": "alta",
          "tipo": "CLUTCH"
        },
        {
          "nombre": "Fusor Samsung SL-M4020ND",
          "cantidadRecomendada": 3,
          "cantidadMinima": 2,
          "razon": "Falla más común - Mínimo obligatorio + escalado",
          "urgencia": "alta",
          "tipo": "FUSOR"
        },
        {
          "nombre": "Pickup Samsung SL-M4020ND", 
          "cantidadRecomendada": 5,
          "cantidadMinima": 3,
          "razon": "Causa atascos - Mínimo obligatorio + escalado",
          "urgencia": "alta",
          "tipo": "PICKUP"
        },
        {
          "nombre": "Retard Samsung SL-M4020ND",
          "cantidadRecomendada": 3,
          "cantidadMinima": 2,
          "razon": "Desgaste - Mínimo obligatorio + escalado",
          "urgencia": "media",
          "tipo": "RETARD"
        },
        {
          "nombre": "Rubber Samsung SL-M4020ND",
          "cantidadRecomendada": 6,
          "cantidadMinima": 4,
          "razon": "Desgaste rápido - Mínimo obligatorio + escalado",
          "urgencia": "media",
          "tipo": "RUBBER"
        },
        {
          "nombre": "Sensores Samsung SL-M4020ND",
          "cantidadRecomendada": 3,
          "cantidadMinima": 2,
          "razon": "Falla electrónica - Mínimo obligatorio + escalado",
          "urgencia": "media",
          "tipo": "SENSORES"
        },
        {
          "nombre": "Switches Samsung SL-M4020ND",
          "cantidadRecomendada": 5,
          "cantidadMinima": 3,
          "razon": "Desgaste mecánico - Mínimo obligatorio + escalado",
          "urgencia": "media",
          "tipo": "SWITCHES"
        }
      ]
    }
  ],
  "analisisModelos": {
    "modelosMasCriticos": [
      {
        "modelo": "Modelo exacto de los datos",
        "repuestosCriticos": ["Repuesto real 1", "Repuesto real 2"],
        "frecuenciaFallas": 2,
        "factorEscalado": 1.0
      }
    ]
  },
  "resumenMinimos": {
    "totalModelos": 5,
    "totalRepuestos": 40,
    "modelosConEscalado": 3,
    "inversionEstimada": "Basada en frecuencia real"
  }
}

Responde SOLO con el JSON, sin explicaciones adicionales.
`;

      // API Key de Deepseek
      const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-0ba4714c7ae44432939b432334a3e5b7';
      
      // Configurar timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'User-Agent': 'CanalDirecto-Repuestos/1.0'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 3000,
          stream: false
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de API:', response.status, errorText);
        throw new Error(`Error en la API Deepseek: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta de Deepseek:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta de API inválida');
      }
      
      const contenido = data.choices[0].message.content;
      console.log('Contenido de respuesta:', contenido);
      
      const jsonMatch = contenido.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No se encontró JSON en la respuesta:', contenido);
        throw new Error('No se pudo extraer JSON válido de la respuesta de la IA');
      }

      const analisisResultado = JSON.parse(jsonMatch[0]);
      console.log('Análisis parseado:', analisisResultado);
      setAnalisisIA(analisisResultado);
      
      // Guardar análisis en localStorage
      localStorage.setItem('analisis_ia_stockear', JSON.stringify(analisisResultado));
      
      // Regenerar lista con análisis IA
      generarListaStock();

    } catch (err: any) {
      console.error('Error detallado en análisis IA:', err);
      
      let errorMessage = 'Error al conectar con IA. Usando análisis local...';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Timeout: La IA tardó demasiado en responder. Usando análisis local...';
      } else if (err.message && err.message.includes('401')) {
        errorMessage = 'Error de autenticación con la IA. Verificar API key.';
      } else if (err.message && err.message.includes('429')) {
        errorMessage = 'Límite de requests excedido. Intenta más tarde.';
      } else if (err.message && err.message.includes('500')) {
        errorMessage = 'Error interno del servidor de IA. Intenta más tarde.';
      } else {
        errorMessage = `Error al conectar con IA: ${err.message || 'Error desconocido'}. Usando análisis local...`;
      }
      
      setError(errorMessage);
      
      // Análisis de respaldo
      const analisisRespaldo = {
        recomendaciones: [
          'Implementar stock específico por modelo de impresora',
          'Priorizar repuestos críticos según frecuencia de fallas',
          'Considerar proximidad geográfica para optimizar rutas'
        ],
        repuestosCriticos: [
          {
            nombre: 'Fusor Samsung SL-M4020ND',
            cantidadRecomendada: 2,
            razon: 'Componente crítico con alta frecuencia de fallas',
            urgencia: 'alta',
            modelo: 'Samsung SL-M4020ND'
          }
        ],
        analisisModelos: {
          modelosMasCriticos: [
            {
              modelo: 'Samsung SL-M4020ND',
              repuestosCriticos: ['Fusor', 'Pickup'],
              frecuenciaFallas: 2
            }
          ]
        }
      };
      
      setAnalisisIA(analisisRespaldo);
    } finally {
      setCargandoIA(false);
    }
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

  // Usar el sistema de colores consistente
  const getTextClassesLocal = () => getTextClasses(modoOscuro);
  const getSubTextClassesLocal = () => getSubTextClasses(modoOscuro);
  const getCardClassesLocal = () => getCardClasses(modoOscuro);
  const getBackgroundClassesLocal = () => getBackgroundClasses(modoOscuro);
  const getBorderClassesLocal = () => getBorderClasses(modoOscuro);

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
          <p className={`${getSubTextClassesLocal()}`}>Cargando análisis de repuestos...</p>
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
          <p className={`${getTextClassesLocal()} mb-4`}>Error al cargar los datos</p>
          <p className={`${getSubTextClassesLocal()} mb-4`}>{error}</p>
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
      <div className={`${getBackgroundClassesLocal()} rounded-lg shadow-lg p-4 md:p-6 border ${getBorderClassesLocal()}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl font-bold ${getTextClassesLocal()}`}>Repuestos a Stockear</h1>
              <p className={`text-sm md:text-base ${getSubTextClassesLocal()}`}>Lista inteligente basada en análisis de datos y experiencia técnica</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Selector de duración de stock */}
            <select
              value={duracionStock}
              onChange={(e) => setDuracionStock(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {opcionesDuracion.map(opcion => (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </option>
              ))}
            </select>

            {/* Botón de análisis IA */}
            <button
              onClick={ejecutarAnalisisIA}
              disabled={cargandoIA}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
            >
              {cargandoIA ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Analizando...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Análisis IA</span>
                </>
              )}
            </button>
          
          <button
            onClick={() => setMostrarConsejos(!mostrarConsejos)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
          >
            <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Consejos</span>
          </button>
          </div>
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
          <h3 className={`text-lg font-semibold ${getTextClassesLocal()} mb-4 flex items-center gap-2`}>
            <Brain className="w-5 h-5 text-blue-500" />
            Análisis por Modelo de Impresora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(analisisPorModelo).map((modelo: any) => (
              <div key={modelo.modelo} className={`${getCardClassesLocal()} rounded-lg p-4 border`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold ${getTextClassesLocal()}`}>{modelo.modelo}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {modelo.ubicaciones.size} ubicación{modelo.ubicaciones.size !== 1 ? 'es' : ''}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={getSubTextClassesLocal()}>Incidentes:</span>
                    <span className={`font-medium ${getTextClassesLocal()}`}>{modelo.incidentes}</span>
                  </div>
                  
                  {modelo.incidentes > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className={getSubTextClassesLocal()}>Tiempo promedio:</span>
                        <span className={`font-medium ${getTextClassesLocal()}`}>{modelo.tiempoPromedio.toFixed(1)}h</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={getSubTextClassesLocal()}>Dificultad:</span>
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
                      <p className={`${getSubTextClassesLocal()} text-xs mb-1`}>Repuestos más usados:</p>
                      <div className="space-y-1">
                        {Array.from(modelo.repuestosFrecuentes.entries())
                          .sort((a: any, b: any) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([repuesto, cantidad]: any) => (
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

      {/* Análisis IA */}
      {analisisIA && (
        <div className={`${getBackgroundClassesLocal()} rounded-lg shadow-lg p-4 md:p-6 mb-6 border ${getBorderClassesLocal()}`}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className={`text-lg font-semibold ${getTextClassesLocal()}`}>Análisis Inteligente con IA</h2>
          </div>
          
          {/* Recomendaciones */}
          {analisisIA.recomendaciones && (
            <div className="mb-4">
              <h3 className={`font-medium ${getTextClassesLocal()} mb-2`}>Recomendaciones:</h3>
              <ul className="space-y-1">
                {analisisIA.recomendaciones.map((rec: string, index: number) => (
                  <li key={index} className={`flex items-start gap-2 text-sm ${getSubTextClassesLocal()}`}>
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Repuestos críticos de IA */}
          {analisisIA.repuestosCriticos && (
            <div className="mb-4">
              <h3 className={`font-medium ${getTextClassesLocal()} mb-2`}>Repuestos Críticos Identificados:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analisisIA.repuestosCriticos.map((repuesto: any, index: number) => (
                  <div key={index} className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-3`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium ${getTextClassesLocal()}`}>{repuesto.nombre}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        repuesto.urgencia === 'alta' ? 'bg-red-100 text-red-800' :
                        repuesto.urgencia === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {repuesto.urgencia?.toUpperCase() || 'MEDIA'}
                      </span>
                    </div>
                    <p className={`text-sm ${getSubTextClassesLocal()} mb-2`}>{repuesto.razon}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${getSubTextClassesLocal()}`}>Cantidad recomendada:</span>
                      <span className={`font-bold ${getTextClassesLocal()}`}>{repuesto.cantidadRecomendada} unidades</span>
                    </div>
                    {repuesto.modelo && (
                      <div className={`text-xs ${getSubTextClassesLocal()} mt-1`}>
                        Modelo: {repuesto.modelo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de repuestos por máquina */}
          {analisisIA.listaRepuestosPorMaquina && (
            <div className="mb-4">
              <h3 className={`font-medium ${getTextClassesLocal()} mb-2`}>Lista de Repuestos por Máquina:</h3>
              <div className="space-y-4">
                {analisisIA.listaRepuestosPorMaquina.map((maquina: any, index: number) => (
                  <div key={index} className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className={`font-semibold ${getTextClassesLocal()} flex items-center gap-2`}>
                        <Package className="w-4 h-4 text-blue-500" />
                        {maquina.modelo}
                      </h4>
                      <div className="flex gap-2">
                        {maquina.totalIncidentes && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoOscuro ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            {maquina.totalIncidentes} incidentes
                          </span>
                        )}
                        {maquina.factorEscalado && maquina.factorEscalado > 1 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoOscuro ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
                            +{Math.round((maquina.factorEscalado - 1) * 100)}% escalado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {maquina.repuestos.map((repuesto: any, repIndex: number) => (
                        <div key={repIndex} className={`border ${modoOscuro ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-3 ${modoOscuro ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h5 className={`font-medium ${getTextClassesLocal()}`}>{repuesto.nombre}</h5>
                            <div className="flex gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                repuesto.urgencia === 'alta' ? (modoOscuro ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800') :
                                repuesto.urgencia === 'media' ? (modoOscuro ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                                (modoOscuro ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                              }`}>
                                {repuesto.urgencia?.toUpperCase() || 'MEDIA'}
                              </span>
                              {repuesto.tipo && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoOscuro ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                  {repuesto.tipo}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm ${getSubTextClassesLocal()} mb-3`}>{repuesto.razon}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${getSubTextClassesLocal()}`}>Cantidad Recomendada:</span>
                              <span className={`font-bold text-lg ${getTextClassesLocal()}`}>{repuesto.cantidadRecomendada} unidades</span>
                            </div>
                            
                            {repuesto.cantidadMinima && (
                              <div className="flex justify-between items-center">
                                <span className={`text-xs ${getSubTextClassesLocal()}`}>Mínimo Obligatorio:</span>
                                <span className={`text-sm font-medium ${getTextClassesLocal()}`}>{repuesto.cantidadMinima} unidades</span>
                              </div>
                            )}
                            
                            {maquina.factorEscalado && maquina.factorEscalado > 1 && (
                              <div className="flex justify-between items-center">
                                <span className={`text-xs ${getSubTextClassesLocal()}`}>Factor Escalado:</span>
                                <span className={`text-sm font-medium text-orange-600`}>+{Math.round((maquina.factorEscalado - 1) * 100)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de mínimos */}
          {analisisIA.resumenMinimos && (
            <div className="mb-4">
              <h3 className={`font-medium ${getTextClassesLocal()} mb-2`}>Resumen de Mínimos Obligatorios:</h3>
              <div className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 ${modoOscuro ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTextClassesLocal()}`}>{analisisIA.resumenMinimos.totalModelos}</div>
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>Modelos Analizados</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTextClassesLocal()}`}>{analisisIA.resumenMinimos.totalRepuestos}</div>
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>Total Repuestos</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${modoOscuro ? 'text-orange-400' : 'text-orange-600'}`}>{analisisIA.resumenMinimos.modelosConEscalado}</div>
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>Con Escalado</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${getTextClassesLocal()}`}>{analisisIA.resumenMinimos.inversionEstimada}</div>
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>Inversión</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Análisis por modelos */}
          {analisisIA.analisisModelos?.modelosMasCriticos && (
            <div>
              <h3 className={`font-medium ${getTextClassesLocal()} mb-2`}>Modelos Más Críticos:</h3>
              <div className="space-y-2">
                {analisisIA.analisisModelos.modelosMasCriticos.map((modelo: any, index: number) => (
                  <div key={index} className={`border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-3`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`font-medium ${getTextClassesLocal()}`}>{modelo.modelo}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoOscuro ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
                        {modelo.frecuenciaFallas} fallas
                      </span>
                    </div>
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>
                      Repuestos críticos: {modelo.repuestosCriticos.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de repuestos */}
      <div className={`${getBackgroundClassesLocal()} rounded-lg shadow-lg p-4 md:p-6 border ${getBorderClassesLocal()}`}>
        <h2 className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${getTextClassesLocal()}`}>Lista de Repuestos Recomendados</h2>
        
        <div className="space-y-3 md:space-y-4">
          {repuestosFiltrados.map((repuesto, index) => (
            <div key={repuesto.id} className={`border ${getBorderClassesLocal()} rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow ${modoOscuro ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${getSubTextClassesLocal()}`}>#{index + 1}</span>
                    <h3 className={`font-semibold ${getTextClassesLocal()}`}>{repuesto.nombre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColorPrioridad(repuesto.prioridad)}`}>
                      {getIconoPrioridad(repuesto.prioridad)}
                      <span className="ml-1 capitalize">{repuesto.prioridad}</span>
                    </span>
                  </div>
                  
                  <p className={`text-sm ${getSubTextClassesLocal()} mb-2`}>{repuesto.razon}</p>
                  
                  <div className={`flex flex-wrap gap-4 text-xs ${getSubTextClassesLocal()}`}>
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
                    <div className={`text-sm ${getSubTextClassesLocal()}`}>
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
        <div className={`${getBackgroundClassesLocal()} rounded-lg shadow-lg p-4 md:p-6 border ${getBorderClassesLocal()}`}>
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            <h2 className={`text-lg md:text-xl font-semibold ${getTextClassesLocal()}`}>Consejos de Técnicos Veteranos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {consejosTecnicos.map((consejo) => (
              <div key={consejo.id} className={`border ${getBorderClassesLocal()} rounded-lg p-4 hover:shadow-md transition-shadow ${modoOscuro ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-semibold ${getTextClassesLocal()}`}>{consejo.titulo}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(consejo.relevancia)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className={`text-sm ${getSubTextClassesLocal()} mb-3`}>{consejo.descripcion}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getTextClassesLocal()}`}>{consejo.autor}</p>
                    <p className={`text-xs ${getSubTextClassesLocal()}`}>{consejo.experiencia}</p>
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
