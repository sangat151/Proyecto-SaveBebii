# SaveBebi

**Una tienda con propósito: collares que alimentan y no solo adornan.**

SaveBebi es un proyecto de emprendimiento digital que busca ofrecer productos para mascotas y contribuir al bienestar de los animales en situación de calle.

## ¿Qué es SaveBebi?

SaveBebi es una plataforma web que combina comercio electrónico con una iniciativa de impacto social.

## Funcionalidades

- Catálogo de productos para mascotas.
- Categorías para organizar los productos.
- Carrito de compras.
- Registro e inicio de sesión de clientes.
- Asistente virtual Bebi para orientar a los visitantes.
- Sección de donaciones y aportes.
- Sección de seguimiento de la iniciativa social.
- Panel de administración para gestionar productos y revisar información.
- Diseño adaptable a computadores, tabletas y celulares.

## Tecnologías utilizadas

**Frontend**
- HTML
- CSS
- JavaScript
- React
- Vite

**Backend**
- Node.js
- Express.js
- API REST

**Base de datos**
- MongoDB
- Mongoose

**Herramientas**
- Visual Studio Code
- Git
- GitHub

## Estructura del proyecto

- `public/`: imágenes y recursos visuales de la página.
- `server/`: servidor, rutas y conexión con MongoDB.
- `admin-react/`: aplicación del panel de administración.
- `css/`: estilos de la página.
- `js/`: funcionalidades JavaScript del sitio.

## Requisitos

Para ejecutar el proyecto localmente necesitas:

- Node.js.
- MongoDB Atlas o una instancia de MongoDB.
- Visual Studio Code.
- Git.

## Ejecutar el proyecto localmente

1. Descarga o clona el repositorio.
2. Abre la carpeta principal `SaveBebi` en Visual Studio Code.
3. Instala las dependencias necesarias.
4. Configura las variables de entorno en el archivo `.env`.
5. Verifica que la conexión con MongoDB esté configurada.
6. Inicia el servidor desde la carpeta correspondiente.
7. Abre la dirección local del proyecto en el navegador.

El servidor utiliza el puerto 3000.

## Base de datos

SaveBebi utiliza MongoDB para almacenar información del proyecto, como los productos y otros datos gestionados desde el servidor.

La conexión se configura mediante variables de entorno. Nunca publiques el archivo `.env`, contraseñas, tokens ni credenciales de acceso.

## Panel de administración

SaveBebi cuenta con un panel privado desde el que se pueden gestionar los productos y consultar información administrativa.

El acceso está protegido y utiliza autenticación mediante el servidor.

## Asistente virtual Bebi

Bebi es el asistente virtual de SaveBebi. Su propósito es orientar a los visitantes y responder preguntas relacionadas con la tienda y el proyecto.

Las funciones disponibles dependen de la configuración del servidor.

## Impacto social

SaveBebi busca apoyar iniciativas relacionadas con los animales en situación de calle y promover acciones solidarias.

Las cifras de impacto y las ayudas realizadas deben actualizarse únicamente cuando estén verificadas.

## Publicación

El proyecto puede publicar su frontend en un servicio de alojamiento web. Sin embargo, el backend de Node.js y la base de datos MongoDB necesitan servicios de alojamiento independientes.

GitHub Pages puede alojar páginas estáticas, pero no ejecuta el servidor ni sustituye la conexión con MongoDB.

## Autora y propósito

SaveBebi nace como un proyecto de emprendimiento digital desarrollado con el propósito de combinar tecnología, creatividad y responsabilidad social.