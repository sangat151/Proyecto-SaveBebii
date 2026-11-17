# SaveBebi: frontend + backend inicial

## Qué incluye
- Sitio web modular en HTML, CSS y JavaScript.
- Carrito de compras del lado del navegador.
- Chatbot de preguntas frecuentes conectado a `POST /api/chat`.
- API de productos en `GET /api/products`.
- Endpoint inicial para validar pedidos en `POST /api/orders`.
- Modelos de MongoDB para productos y pedidos.
- Modo demostración si aún no has conectado MongoDB.

## Requisitos
Instala Node.js LTS desde https://nodejs.org/. Para MongoDB puedes crear una base gratuita en MongoDB Atlas: https://www.mongodb.com/atlas/database.

## Iniciar en tu computador
1. Descomprime la carpeta y ábrela en VS Code.
2. Abre una terminal dentro de la carpeta principal `SaveBebi`.
3. Ejecuta `npm install`.
4. (Opcional al comienzo) Copia `.env.example` como `.env` y reemplaza la URI con la de tu base de MongoDB Atlas. Nunca compartas ese archivo ni publiques contraseñas.
5. Ejecuta `npm run dev` o `npm start`.
6. Abre `http://localhost:3000` en el navegador. No abras `index.html` con doble clic: el chatbot llama al servidor.
7. Comprueba el estado visitando `http://localhost:3000/api/health`.

## Importante
- El chatbot actual es de preguntas frecuentes, no una IA generativa. Sirve como primera versión sin una clave de API.
- El modo demostración no guarda pedidos de forma permanente. Para guardarlos, configura `MONGODB_URI`.
- Los productos de ejemplo y precios deben revisarse y confirmarse antes de publicar.
- Para que el botón de WhatsApp funcione, agrega tu número de negocio en `WHATSAPP` dentro de `js/carrito.js`, con código de país y sin `+`, espacios ni guiones.
- Antes de recibir pedidos reales, añade validaciones adicionales, protección contra abuso, política de privacidad y revisión de seguridad.

## Mejoras de la versión actual
- El asistente Bebi intenta consultar `POST /api/chat` y tiene respuestas locales de respaldo si la API no está disponible.
- El asistente reconoce preguntas sobre tapitas plásticas, reciclaje e iniciativas para niños con cáncer.
- El hero incluye un saludo animado del perrito y la campaña de tapitas incluye un contador demostrativo guardado solo en el navegador.
- Los comentarios en español explican la responsabilidad de las secciones y funciones principales para facilitar la exposición del código.

## Sobre la IA y la campaña de tapitas
El asistente actual es un bot de preguntas frecuentes con reglas, no un modelo de IA generativa conectado a un proveedor externo. Responde a preguntas frecuentes sin clave secreta y sigue funcionando en modo local cuando el servidor no está activo. Para integrar una IA generativa real se necesitaría elegir un proveedor, configurar una clave privada en el servidor y revisar costos y privacidad.

La campaña de tapitas es una propuesta en desarrollo. No se deben anunciar puntos de entrega, fundaciones aliadas, cifras recolectadas ni ayudas realizadas hasta verificarlas. El contador de la página es solo demostrativo y no representa una donación real.

## Donaciones y seguimiento
- El formulario de `#donacion` registra nombre, tipo de aporte y detalle.
- `POST /api/donations` guarda el aporte en MongoDB cuando `MONGODB_URI` está conectada.
- `GET /api/donations` alimenta el botón **Ver seguimiento**.
- Sin MongoDB, Express usa una lista temporal en memoria (se pierde al reiniciar el servidor). Si abres la web sin servidor, el formulario y seguimiento usan `localStorage` en ese navegador.
- El tipo “Aporte económico (intención)” solo registra interés: no cobra ni transfiere dinero. El formulario tampoco confirma que un aporte físico haya sido entregado o recibido.


## Panel de administración y seguimiento

- Abre `http://localhost:3000/admin.html` para entrar al panel privado.
- Configura `ADMIN_PASSWORD` en tu archivo `.env` con una contraseña propia. No publiques ni compartas ese archivo.
- Desde el panel puedes revisar aportes, cambiar su estado (pendiente, recibido o verificado) y actualizar las cifras públicas de perritos ayudados y tapitas recolectadas.
- Las cifras públicas empiezan en cero: actualízalas únicamente cuando tengas evidencia de la ayuda o recolección. Las ilustraciones de perritos y caneca son decorativas, no representan resultados reales.
- Para guardar cambios de forma permanente y compartirlos entre dispositivos, conecta MongoDB con `MONGODB_URI`. Sin MongoDB, los datos del modo demostración se pierden al reiniciar el servidor.
- El acceso de administración usa una sesión temporal del servidor separada del formulario de clientes. El login de clientes existente no se modifica en esta entrega.
