# Proyecto-VestIA
 Este es un proyecto de una plataforma web de comercio electrónico para la boutique "VestIA" que integre un asistente de estilo personalizado con inteligencia artificial, permitiendo a los usuarios encontrar prendas de manera intuitiva y recibir recomendaciones personalizadas basadas en sus preferencias.


# Características

- ✅ Integración completa con Gemini 2.5 Flash 
- ✅ Interfaz moderna y responsive
- ✅ Visualización en tiempo real de las respuestas
- ✅ Guardado automático del historial de conversación
- ✅ Manejo de errores robusto
- ✅ Configuración segura de API Key (almacenada con localStorage)
- ✅ Filtros por categoría, color, talla, ocasión y rango de precio con control de doble slider.
- ✅ Carrito de compras con persistencia en localStorage, control de cantidades y totales en vivo.
- ✅ Catálogo de ropa desde la API pública DummyJSON con paginación y tarjetas enriquecidas.
- ✅ UI responsive con Bootstrap 5 y Font Awesome; transiciones suaves en tarjetas de producto.


# Estructura de Archivos 
```
Proyecto-VestIA/
├── index.html          # Interfaz principal, navbar, catálogo, carrito y asistente IA.
├── js/
    └──  cart.js        # Estado del carrito, render y manejo de cantidades.
    └──  chatbot.js     # Lógica del chatbot IA, formateo de mensajes y adjuntos de imagen.
    └──  config.js      # Configuración (API keys, constantes)
    └──  filters.js     # Sistema de filtros y completa atributos de productos.
    └──  main.js        # Inicialización principal, orquestación del catálogo, filtros, paginación y eventos de UI.
    └──  products.js    # Gestión de productos, API y utilidades de productos.
    └──  profile.js     # Perfil, referencias del usuario, última búsqueda y contexto para la IA.
├── css/
    └──  styles.css     # Estilos personalizados, transiciones y responsive.
├── images/
    └──  navbarfoto.jpg # Imagenes para index.html
└── README.md           # Este archivo
```

# Requisitos

- Conexión a internet para DummyJSON y para la API de Gemini.
- Un navegador web moderno (Chrome, Firefox, Edge, Safari)
- Una API Key de Google Gemini (obtener en: https://ai.google.dev/)

# Tecnologías usadas
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5.3, Font Awesome 6
- APIs: DummyJSON (productos), Google Gemini (IA generativa)
- Almacenamiento: localStorage para carrito, preferencias y últimas búsquedas


# Cómo ejecutarlo localmente
La clave se define en js/config.js en GEMINI_API_KEY. 
1. Sustituye el valor por tu propia clave de Gemini (la creas en https://ai.google.dev/ ) antes de exponer el proyecto públicamente.
2. Haz clic en "Guardar"
3. Abre el archivo `index.html` en tu navegador
4. Ya puedes usar la platafroma!! 


## Uso rápido
1) Ajusta filtros o busca en la barra superior el nombre o descripción de un producto para acotar catálogo.
2) Añade y elimina productos del carrito, las cantidades se guardan en localStorage.
3) Conversa con el asistente IA, escribe tu consulta (o adjunta una imagen) y presiona Enviar, las respuestas pueden incluir tarjetas de productos disponibles, también te podrá dar sugerencias de outfits basadas en tus búsquedas.