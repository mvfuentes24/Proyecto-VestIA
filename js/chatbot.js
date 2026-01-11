import { GEMINI_API_KEY, GEMINI_MODEL } from "./config.js";
import { guardarPreferencias, obtenerContextoActual } from "./profile.js";
import { fetchProducts } from "./products.js"; //
import { decorateProducts } from "./filters.js"; //

document.addEventListener("DOMContentLoaded", async () => {
  const chatMessages = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const imageBtn = document.getElementById("imageBtn");
  const imageUpload = document.getElementById("imageUpload");

  // Almacenamos los objetos completos de productos aquí para acceder a sus imágenes
  let productosGlobales = [];
  let catalogoContexto = "";

  // 1. Cargar y preparar el catálogo
  async function cargarCatalogoParaIA() {
    try {
      const data = await fetchProducts({ limit: 100 }); // Traemos suficientes productos
      productosGlobales = decorateProducts(data.products); // Decoramos con color/ocasión

      // Creamos el texto que leerá la IA
      catalogoContexto = productosGlobales.map(p => 
        `- ID: ${p.id} | Nombre: ${p.title} | Cat: ${p.category} | Precio: $${p.price} | Color: ${p.color} | Estilo: ${p.occasion} | Talla: ${p.size }`
      ).join("\n"); // Agregamos "| Talla: ${p.size}" al final

      console.log("Catálogo e imágenes cargados en memoria.");
    } catch (error) {
      console.error("Error cargando contexto:", error);
    }
  }

  await cargarCatalogoParaIA();

  // 2. Función para convertir IDs en Tarjetas HTML con imagen
  function formatearRespuestaConProductos(texto) {
    // Expresión regular para encontrar [PRODUCT_ID: 123]
    const regex = /\[PRODUCT_ID:\s*(\d+)\]/g;
    
    // Reemplaza el código por una tarjeta HTML
    return texto.replace(regex, (match, id) => {
      const producto = productosGlobales.find(p => p.id == id);
      
      if (!producto) return ""; // Si no encuentra el ID, no muestra nada

      return `
        <div class="chat-product-card" style="display: flex; gap: 10px; background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 10px; align-items: center; border: 1px solid #ddd;">
          <img src="${producto.thumbnail}" alt="${producto.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          <div style="text-align: left;">
            <strong style="font-size: 0.9rem; display: block;">${producto.title}</strong>
            <span style="font-size: 0.85rem; color: #555;">$${producto.price} - ${producto.color}</span>
            <a href="#catalogo" class="btn btn-sm btn-dark mt-1" style="font-size: 0.7rem; padding: 2px 8px;">Ver en catálogo</a>
          </div>
        </div>
      `;
    });
  }

  // 3. Mostrar mensajes (ahora soporta HTML)
  function addMessage(text, sender = "user") {
    const msg = document.createElement("div"); // Usamos div para permitir estructura interna
    msg.className = sender === "user" ? "user-message" : "bot-message";
    
    if (sender === "bot") {
      // Si es el bot, procesamos el HTML de los productos
      msg.innerHTML = formatearRespuestaConProductos(text);
    } else {
      msg.textContent = text;
    }
    
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function detectarFiltros(texto) {
     // (Mantenemos la misma lógica de filtros que tenías antes)
    const categorias = { blusa: "tops", blusas: "tops", pantalón: "pants", pantalones: "pants", vestido: "dresses", vestidos: "dresses", accesorio: "accessories", accesorios: "accessories" };
    const colores = { negro: "black", blanco: "white", beige: "beige", azul: "blue", rojo: "red" };
    
    let categoria = null, color = null;
    
    for (const [palabra, valor] of Object.entries(categorias)) {
      if (texto.toLowerCase().includes(palabra)) categoria = valor;
    }
    for (const [palabra, valor] of Object.entries(colores)) {
      if (texto.toLowerCase().includes(palabra)) color = valor;
    }

    if (categoria || color) {
      guardarPreferencias({ categoria, color });
    }
  }

  // 4. Llamada a la API de Gemini
  async function sendToGemini(message) {
  if (!catalogoContexto) await cargarCatalogoParaIA();

  // OBTENEMOS EL CONTEXTO DE FILTROS ACTUAL
  const contextoUsuario = obtenerContextoActual();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Eres VestIA, estilista de moda personal. 
                  
                  ${contextoUsuario} 

                  INVENTARIO DISPONIBLE (Usa SOLO esto):
                  ${catalogoContexto}

                  REGLA DE ORO:
                  Si el contexto indica que el usuario tiene filtros aplicados (como color, talla o categoría), prioriza productos que cumplan con esos requisitos en tus sugerencias.

                  REGLA DE FORMATO:
                  Cada vez que menciones un producto, escribe su ID así: [PRODUCT_ID: número].
                  
                  El usuario dice: "${message}"`
                }
              ]
            }
          ]
        })
      }
    );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No entendí.";
      
      addMessage(reply, "bot");
      detectarFiltros(message);

    } catch (error) {
      console.error(error);
      addMessage("Error de conexión.", "bot");
    }
  }

  // Event Listeners (sin cambios importantes)
  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    sendToGemini(text);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // Manejo de Imágenes
  imageBtn.addEventListener("click", () => imageUpload.click());

  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addMessage("📷 Analizando prenda...", "user");

    try {
      const base64 = await toBase64(file);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    text: `Analiza esta imagen. Sugiere un outfit completo usando el siguiente inventario.
                    IMPORTANTE: Incluye [PRODUCT_ID: numero] después de cada producto sugerido para mostrarlo.
                    
                    INVENTARIO:
                    ${catalogoContexto}` 
                  },
                  { inlineData: { mimeType: file.type, data: base64 } }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude analizar la imagen.";
      addMessage(reply, "bot");
    } catch (error) {
      console.error(error);
      addMessage("Error analizando imagen.", "bot");
    }
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});