// Espera a que loadComponents.js inserte el HTML del chat antes de buscar sus elementos.
document.addEventListener("componentsLoaded", () => {
  const launcher = document.getElementById("chatbotLauncher"); // Botón flotante que abre o cierra el asistente.
  const panel = document.getElementById("chatbotWindow"); // Ventana visible donde ocurre la conversación.
  const close = document.getElementById("chatbotClose"); // Botón X para cerrar la ventana.
  const form = document.getElementById("chatbotForm"); // Formulario que envía cada pregunta.
  const input = document.getElementById("chatbotInput"); // Campo donde la persona escribe.
  const messages = document.getElementById("chatbotMessages"); // Contenedor del historial del chat.
  if (!launcher || !panel || !form || !input || !messages) return; // Evita errores si el HTML no está disponible.

  // Respuestas locales: funcionan incluso sin API, internet o servidor backend.
  function localReply(message) {
    const q = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // Facilita reconocer palabras con o sin tildes.
    if (/hola|buenas|buenos dias|buenas tardes|buenas noches/.test(q)) return "¡Hola! Soy Bebi, el asistente de SaveBebi. Puedo contarte sobre productos, precios, pedidos, tapitas y nuestra misión solidaria. ¿Por dónde empezamos?";
    if (/tapita|tapa plastica|recoleccion|recicl/.test(q)) return "¡Cada tapita cuenta! Lava y seca las tapas plásticas, guárdalas en una bolsa limpia y entrégalas solo a un punto de recolección o fundación verificada. SaveBebi está planteando esta iniciativa; todavía no anunciamos un punto aliado confirmado.";
    if (/cancer|niñ|nino|niña|fundacion/.test(q)) return "Queremos impulsar una campaña de tapitas que pueda apoyar iniciativas para niños con cáncer. Antes de recibir material, verificaremos una fundación aliada y publicaremos el punto de entrega para que todo sea transparente.";
    if (/perro|perrito|calle|animal|mision|ayuda|donacion|impacto/.test(q)) return "La misión de SaveBebi es unir el emprendimiento con la solidaridad: promover el bienestar de animales en situación de calle y crear campañas responsables. Compartiremos avances reales y comprobables a medida que se concreten.";
    if (/precio|cuanto|vale|costo/.test(q)) return "Precios de referencia: ropa para perro $29.900, cama $19.900, collar $49.900 y correa trenzada $34.900 COP. Son valores de demostración: confirma disponibilidad y precio final antes de comprar.";
    if (/producto|collar|correa|ropa|cama|catalogo/.test(q)) return "En el catálogo encontrarás ropa para perro, camas, collares y correas. Pulsa “Conocer productos” o visita la sección Productos para ver las opciones disponibles.";
    if (/pedido|comprar|envio|entrega|pagar|carrito|whatsapp/.test(q)) return "Agrega los productos al carrito y usa la opción de pedido que aparece allí. El equipo debe confirmar existencias, costo de envío y forma de pago antes de cerrar la compra.";
    if (/gracias/.test(q)) return "¡Gracias a ti por apoyar una idea que quiere hacer el bien! ¿Quieres conocer los productos o aprender cómo prepararte para recolectar tapitas?";
    if (/ayuda|que puedes|puedes hacer/.test(q)) return "Puedo orientarte sobre productos, precios de referencia, pedidos, bienestar animal y la campaña propuesta de recolección de tapitas. También puedo explicarte cómo participar responsablemente.";
    if (/numero|celular|contacto|contactarme/.test(q)) return "Claro, puedes contactarte y recibir la informacion que necesites al numero: 311 6382548.";
    return "Quiero ayudarte. Por ahora puedo responder preguntas sobre productos, precios de referencia, pedidos, ayuda animal y recolección de tapitas. Prueba preguntando: “¿Cómo puedo recolectar tapitas?”";
  }

  // Muestra u oculta la ventana y actualiza el estado accesible del botón.
  const toggle = open => {
    panel.classList.toggle("abierto", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  };
  launcher.addEventListener("click", () => toggle(!panel.classList.contains("abierto")));
  close?.addEventListener("click", () => toggle(false));

  // Agrega un mensaje como texto seguro, sin interpretar el contenido como HTML.
  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight; // Desplaza el historial hasta el mensaje nuevo.
    return div;
  }

  // Envía la pregunta al backend si está disponible; si falla, responde con la ayuda local.
  form.addEventListener("submit", async event => {
    event.preventDefault(); // Evita que el navegador recargue la página al enviar.
    const message = input.value.trim();
    if (!message) return; // No permite enviar mensajes vacíos.
    addMessage(message, "user");
    input.value = "";
    input.disabled = true; // Evita envíos repetidos mientras se prepara la respuesta.
    const waiting = addMessage("Bebi está pensando…", "bot");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error("API no disponible");
      const data = await response.json();
      waiting.textContent = data.reply || localReply(message);
    } catch (error) {
      waiting.textContent = localReply(message); // Mantiene el chat útil sin el servidor.
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
});
