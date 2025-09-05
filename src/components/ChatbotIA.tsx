import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'bot';
  contenido: string;
  timestamp: Date;
}

const ChatbotIA: React.FC = () => {
  const [abierto, setAbierto] = useState(false);
  const [mostrarPrompt, setMostrarPrompt] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      tipo: 'bot',
      contenido: '¡Hola! Soy tu asistente de IA especializado en reparación de impresoras. Puedo ayudarte con:\n\n• Análisis de incidentes de impresoras\n• Recomendaciones de repuestos específicos\n• Diagnóstico de fallas comunes\n• Optimización de mantenimiento\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [mensajeActual, setMensajeActual] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mensajesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || enviando) return;

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: mensajeActual,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);
    setMensajeActual('');
    setEnviando(true);

    try {
      // Obtener datos del sistema para contexto
      const estadisticasRepuestos = dataService.getEstadisticasRepuestos();
      const estadisticasUbicacion = dataService.getEstadisticasUbicacion();
      const incidentes = dataService.getIncidentes();
      const ubicaciones = dataService.getUbicaciones();
      const repuestos = dataService.getRepuestos();

      const contexto = `
Eres un experto técnico especializado en reparación de impresoras (Samsung, Lexmark, HP). Tienes acceso a los siguientes datos del sistema:

ESTADÍSTICAS DE REPUESTOS DE IMPRESORAS:
${JSON.stringify(estadisticasRepuestos.slice(0, 10), null, 2)}

ESTADÍSTICAS DE UBICACIONES:
${JSON.stringify(estadisticasUbicacion, null, 2)}

INCIDENTES RECIENTES DE IMPRESORAS:
${JSON.stringify(incidentes.slice(-5), null, 2)}

UBICACIONES:
${JSON.stringify(ubicaciones, null, 2)}

REPUESTOS DE IMPRESORAS DISPONIBLES:
${JSON.stringify(repuestos, null, 2)}

Pregunta del usuario: ${mensajeActual}

Responde de manera técnica pero accesible, enfocándote específicamente en:
1. Reparación de impresoras Samsung, Lexmark y HP
2. Componentes críticos: fusor, pickup, retard, clutch, low, controller
3. Consumibles: cartuchos, toner, gomas, rubber
4. Diagnóstico de fallas comunes en impresoras
5. Mantenimiento preventivo específico para impresoras
6. Análisis de patrones de fallas en los datos disponibles

Mantén la respuesta concisa pero completa (máximo 300 palabras) y enfocada únicamente en impresoras.
`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-0ba4714c7ae44432939b432334a3e5b7'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: contexto
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data = await response.json();
      const respuestaIA = data.choices[0].message.content;

      const respuestaMensaje: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        contenido: respuestaIA,
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, respuestaMensaje]);

    } catch (error) {
      console.error('Error en chatbot:', error);
      
      const errorMensaje: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        contenido: 'Lo siento, no pude procesar tu consulta en este momento. Puedo ayudarte con:\n\n• Análisis de repuestos de impresoras\n• Diagnóstico de fallas Samsung/Lexmark/HP\n• Recomendaciones de stock específicas\n• Patrones de fallas en impresoras\n• Mantenimiento preventivo\n\n¿Podrías reformular tu pregunta?',
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, errorMensaje]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(!abierto)}
        onDoubleClick={() => setMostrarPrompt(true)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          abierto 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } flex items-center justify-center text-white`}
        title="Click para abrir chat, doble click para ver prompt"
      >
        {abierto ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {abierto && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Asistente IA</h3>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div 
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    mensaje.tipo === 'usuario'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {mensaje.tipo === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {mensaje.tipo === 'usuario' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="text-sm whitespace-pre-wrap">{mensaje.contenido}</div>
                  </div>
                  <div className={`text-xs mt-1 ${
                    mensaje.tipo === 'usuario' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {mensaje.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {enviando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={mensajeActual}
                onChange={(e) => setMensajeActual(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={enviando}
              />
              <button
                onClick={enviarMensaje}
                disabled={!mensajeActual.trim() || enviando}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt oculto - Solo visible con doble click */}
      {mostrarPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Prompt de la IA</h3>
                <button
                  onClick={() => setMostrarPrompt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Comportamiento de la IA:</h4>
                <p className="text-sm text-gray-600 mb-4">
                  La IA está especializada en reparación de impresoras Samsung, Lexmark y HP. 
                  Analiza los datos de incidentes y proporciona recomendaciones específicas basadas en:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Patrones de fallas en tus datos reales</li>
                  <li>• Componentes más utilizados (fusor, pickup, retard, etc.)</li>
                  <li>• Ubicaciones con más incidentes</li>
                  <li>• Tiempo promedio de reparación</li>
                  <li>• Tipos de fallas más comunes</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <strong>Enfoque:</strong> Solo impresoras, sin costos, análisis práctico y recomendaciones de stock.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotIA;
