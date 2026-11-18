
import { useState, useRef, useEffect } from 'react'

// Respuestas locales de Bebi.
function localReply(message) {
  const q = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (/hola|buenas|buenos dias|buenas tardes|buenas noches/.test(q))
    return '¡Hola! Soy Bebi, el asistente de SaveBebi. Puedo contarte sobre productos, precios, pedidos, tapitas y nuestra misión solidaria. ¿Por dónde empezamos?'

  if (/tapita|tapa plastica|recoleccion|recicl/.test(q))
    return '¡Cada tapita cuenta! Lava y seca las tapas plásticas, guárdalas en una bolsa limpia y entrégalas solo a un punto de recolección o fundación verificada. SaveBebi está planteando esta iniciativa; todavía no anunciamos un punto aliado confirmado.'

  if (/cancer|niñ|nino|niña|fundacion/.test(q))
    return 'Queremos impulsar una campaña de tapitas que pueda apoyar iniciativas para niños con cáncer. Antes de recibir material, verificaremos una fundación aliada y publicaremos el punto de entrega para que todo sea transparente.'

  if (/perro|perrito|calle|animal|mision|ayuda|donacion|impacto/.test(q))
    return 'La misión de SaveBebi es unir el emprendimiento con la solidaridad: promover el bienestar de animales en situación de calle y crear campañas responsables. Compartiremos avances reales y comprobables a medida que se concreten.'

  if (/precio|cuanto|vale|costo/.test(q))
    return 'Precios de referencia: ropa para perro $29.900, cama $19.900, collar $49.900 y correa trenzada $34.900 COP. Son valores de demostración: confirma disponibilidad y precio final antes de comprar.'

  if (/producto|collar|correa|ropa|cama|catalogo/.test(q))
    return 'En el catálogo encontrarás ropa para perro, camas, collares y correas. Visita la sección Productos para ver las opciones disponibles.'

  if (/pedido|comprar|envio|entrega|pagar|carrito|whatsapp/.test(q))
    return 'Agrega los productos al carrito y usa la opción de pedido que aparece allí. El equipo debe confirmar existencias, costo de envío y forma de pago antes de cerrar la compra.'

  if (/gracias/.test(q))
    return '¡Gracias a ti por apoyar una idea que quiere hacer el bien! ¿Quieres conocer los productos o aprender cómo prepararte para recolectar tapitas?'

  if (/ayuda|que puedes|puedes hacer/.test(q))
    return 'Puedo orientarte sobre productos, precios de referencia, pedidos, bienestar animal y la campaña propuesta de recolección de tapitas.'

  if (/numero|celular|contacto|contactarme/.test(q))
    return 'Puedes contactarte y recibir la información que necesites al número: 311 6382548.'

  return 'Quiero ayudarte. Por ahora puedo responder preguntas sobre productos, precios de referencia, pedidos, ayuda animal y recolección de tapitas.'
}

function Chatbot() {
  const [chatAbierto, setChatAbierto] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState([
    {
      texto: '¡Hola! Soy Bebi, el asistente de SaveBebi. Pregúntame por nuestros productos o por nuestra misión de ayudar a los perritos en situación de calle.',
      autor: 'bot'
    }
  ])
  const [enviando, setEnviando] = useState(false)

  const inputRef = useRef(null)
  const mensajesRef = useRef(null)

  // Lleva el chat hasta el último mensaje.
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  // Enfoca el campo cuando se abre el chat.
  useEffect(() => {
    if (chatAbierto) {
      inputRef.current?.focus()
    }
  }, [chatAbierto])

  // Envía preguntas y recibe respuestas.
  const manejarEnvio = async (event) => {
    event.preventDefault()

    const pregunta = mensaje.trim()

    if (!pregunta || enviando) return

    setMensajes(actuales => [
      ...actuales,
      { texto: pregunta, autor: 'user' },
      { texto: 'Bebi está pensando...', autor: 'bot', esperando: true }
    ])

    setMensaje('')
    setEnviando(true)

    try {
      const respuesta = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: pregunta })
      })

      if (!respuesta.ok) {
        throw new Error('API no disponible')
      }

      const datos = await respuesta.json()

      setMensajes(actuales => {
        const nuevos = [...actuales]
        nuevos[nuevos.length - 1] = {
          texto: datos.reply || localReply(pregunta),
          autor: 'bot'
        }
        return nuevos
      })
    } catch (error) {
      setMensajes(actuales => {
        const nuevos = [...actuales]
        nuevos[nuevos.length - 1] = {
          texto: localReply(pregunta),
          autor: 'bot'
        }
        return nuevos
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        className="chatbot-launcher"
        id="chatbotLauncher"
        type="button"
        aria-expanded={chatAbierto}
        onClick={() => setChatAbierto(!chatAbierto)}
      >
        🐾 ¿Te ayudo?
      </button>

      <section
        className={`chatbot-window ${chatAbierto ? 'abierto' : ''}`}
        id="chatbotWindow"
        aria-label="Chat de SaveBebi"
        aria-hidden={!chatAbierto}
      >
        <div className="chatbot-head">
          <div>
            <strong>Asistente SaveBebi</strong>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Productos y ayuda animal
            </div>
          </div>

          <button
            id="chatbotClose"
            type="button"
            aria-label="Cerrar chat"
            onClick={() => setChatAbierto(false)}
          >
            ×
          </button>
        </div>

        <div
          className="chatbot-messages"
          id="chatbotMessages"
          aria-live="polite"
          ref={mensajesRef}
        >
          {mensajes.map((item, indice) => (
            <div
              className={`chat-msg ${item.autor}`}
              key={indice}
            >
              {item.texto}
            </div>
          ))}
        </div>

        <form className="chatbot-form" id="chatbotForm" onSubmit={manejarEnvio}>
          <input
            ref={inputRef}
            id="chatbotInput"
            type="text"
            maxLength={500}
            placeholder="Escribe tu pregunta..."
            autoComplete="off"
            value={mensaje}
            onChange={event => setMensaje(event.target.value)}
            disabled={enviando}
            required
          />

          <button type="submit" disabled={enviando}>
            Enviar
          </button>
        </form>
      </section>
    </>
  )
}

export default Chatbot
