Aplicación web estática que combina catálogo de moda, filtros avanzados, carrito con persistencia local y un asistente IA (Gemini) que sugiere productos usando el inventario real.

Características
Catálogo de ropa desde la API pública DummyJSON con paginación y tarjetas enriquecidas.
Filtros por categoría, color, talla, ocasión y rango de precio con control de doble slider.
Buscador en la barra superior; la última búsqueda se guarda para reutilizarla en el contexto de la IA.
Carrito de compras con persistencia en localStorage, control de cantidades y totales en vivo.
Asistente de estilo con Gemini que entiende texto e imágenes; puede insertar productos concretos en las respuestas.
Preferencias de usuario (filtros y últimas búsquedas) persistentes en localStorage para mantener el estado entre sesiones.
Estructura del proyecto
index.html: layout principal (navbar, filtros, catálogo, carrito y asistente IA).
css/styles.css: estilos base, hero, tarjetas, filtros, chat y carrito.
js/main.js: orquestación de catálogo, búsqueda, paginación, render de tarjetas y listeners.
js/products.js: obtención de productos desde DummyJSON y whitelist de categorías de moda.
js/filters.js: definición de filtros, listeners, normalización de rangos y aplicación de filtros en memoria.
js/cart.js: lógica del carrito (add/remove/update, render, persistencia en localStorage).
js/profile.js: guardado de preferencias, última búsqueda y aplicación automática a los selects.
js/chatbot.js: carga del catálogo para contexto, detección de filtros en texto, envío a Gemini y render de respuestas con tarjetas de producto.
js/config.js: constantes de configuración (API base, modelo Gemini, claves de almacenamiento local y API key).
Requisitos
Navegador moderno.
Conexión a internet para DummyJSON y para la API de Gemini.
Servidor estático simple (evita abrir el archivo directamente con file:// para no tener problemas de CORS).
Puesta en marcha local
Clona el repositorio y ubícate en la carpeta del proyecto.
(Opcional) Instala un servidor estático, por ejemplo: npm install -g serve.
Inicia el servidor: serve . o python -m http.server 5500.
Abre http://localhost:3000 (o el puerto indicado) en el navegador.
Configuración del asistente IA (Gemini)
La clave se define en js/config.js en GEMINI_API_KEY. Sustituye el valor por tu propia clave de Gemini antes de exponer el proyecto públicamente.
El modelo actual es gemini-2.5-flash; puedes ajustarlo en la misma configuración.
El asistente usa un resumen del inventario cargado desde DummyJSON para limitar las sugerencias a productos reales.
Flujo de uso
Usa los filtros y la búsqueda para acotar el catálogo; las preferencias se guardan automáticamente.
Haz clic en “Agregar al carrito” en cualquier tarjeta; el carrito se actualiza y se guarda en local.
Abre el asistente IA, escribe qué buscas (o sube una foto). El bot responde con texto y, cuando corresponde, tarjetas clicables de productos disponibles.