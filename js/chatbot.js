import { GEMINI_API_KEY, GEMINI_MODEL } from "./config.js";
import { savePreferences, getCurrentContext } from "./profile.js";
import { fetchProducts } from "./products.js";
import { completeProducts } from "./filters.js";

document.addEventListener("DOMContentLoaded", async () => {
  const chatMessages = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const imageBtn = document.getElementById("imageBtn");
  const imageUpload = document.getElementById("imageUpload");
  const chatInputContainer = document.querySelector(".chat-input");

  // cache en memoria de objetos de productos
  let productosGlobales = [];

  // resumen del inventario que se envía en los prompts a Gemini para que tenga en cuenta el inventario real
  let catalogoContexto = "";

  // Cargar y preparar el catálogo para el contexto de la IA
  async function loadCatalogForAI() {
    try {
      const data = await fetchProducts({ limit: 100 }); 
      productosGlobales = completeProducts(data.products); 

      // se crea el texto que leerá la IA (ID, título, categoría, precio, color, estilo, talla)
      catalogoContexto = productosGlobales.map(p => 
        `- ID: ${p.id} | Nombre: ${p.title} | Cat: ${p.category} | Precio: $${p.price} | Color: ${p.color} | Estilo: ${p.occasion} | Talla: ${p.size }`
      ).join("\n");

      console.log("Catálogo e imágenes cargados en memoria.");
    } catch (error) {
      console.error("Error cargando contexto:", error);
    }
  }

  await loadCatalogForAI();

  //mensaje "pensando..." mientras la IA responde
  let thinking = null;
  function showThinking() {
    if (thinking) return;
    thinking = document.createElement("div");
    thinking.className = "bot-message bot-thinking";
    thinking.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Pensando...';
    chatMessages.appendChild(thinking);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function hideThinking() {
    if (thinking && thinking.parentNode) {
      thinking.parentNode.removeChild(thinking);
    }
    thinking = null;
  }

  
  let pendingImageFile = null;
  let pendingImageBase64 = null;
  let attachmentBadge = null;
  // Muestra o quita el badge de imagen adjunta
  function renderAttachmentBadge() {
    if (!chatInputContainer) return;
    if (pendingImageFile) {
      if (!attachmentBadge) {
        attachmentBadge = document.createElement("div");
        attachmentBadge.id = "attachmentBadge";
        attachmentBadge.style.display = "flex";
        attachmentBadge.style.alignItems = "center";
        attachmentBadge.style.gap = "6px";
        attachmentBadge.style.marginTop = "6px";
        chatInputContainer.appendChild(attachmentBadge);
      }
      attachmentBadge.innerHTML = `
        <span class="badge rounded-pill text-bg-secondary">
          Imagen adjunta
          <button type="button" aria-label="Quitar imagen" class="btn btn-sm btn-link text-light p-0 ms-1" style="text-decoration:none;">✕</button>
        </span>
      `;
      const btn = attachmentBadge.querySelector("button");
      btn && btn.addEventListener("click", clearAttachment);
    } else if (attachmentBadge) {
      attachmentBadge.remove();
      attachmentBadge = null;
    }
  }
  // Adjunta imagen y la convierte a base64
  async function setAttachment(file) {
    pendingImageFile = file;
    pendingImageBase64 = null;
    renderAttachmentBadge();
    try {
      pendingImageBase64 = await toBase64(file);
    } catch (e) {
      console.error("No se pudo leer la imagen adjunta:", e);
      clearAttachment();
    }
  }
  //limpia la imagen adjunta
  function clearAttachment() {
    pendingImageFile = null;
    pendingImageBase64 = null;
    renderAttachmentBadge();
    if (imageUpload) imageUpload.value = "";
  }

  // Formatea markdown básico a HTML seguro (negrita, cursiva, código, saltos de línea)
  function formatMessage(texto) {
    if (!texto) return "";
    let formatted = texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Saltos de línea
    formatted = formatted.replace(/\n/g, '<br>');

    // Negrita **texto**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Cursiva *texto*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Código `texto`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    return formatted;
  }

  // Encuentra tokens y los reemplaza con tarjeta de producto
  function formatResponseWithProducts(texto) {
    const regex = /\[PRODUCT_ID:\s*(\d+)\]/g;

    return texto.replace(regex, (match, id) => {
      const producto = productosGlobales.find(p => p.id == id);
      if (!producto) return "";

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
  // Agrega un mensaje al chat
  function addMessage(text, sender = "user") {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "user-message" : "bot-message";

    if (sender === "bot") {
      const formatted = formatMessage(text);
      msg.innerHTML = formatResponseWithProducts(formatted);
    } else {
      msg.textContent = text;
    }

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Detecta filtros mencionados en el texto del usuario y los guarda como preferencias
  function detectFilters(texto) {
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
      savePreferences({ categoria, color });
    }
  }

  
  async function generateAIResponse(message, imageInlineData = null) {
    if (!catalogoContexto) await loadCatalogForAI();

    const contextoUsuario = getCurrentContext();

    try {
      showThinking();
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
                    
                    ${imageInlineData ? 'El usuario adjuntó una imagen. Analízala si es relevante.' : ''}
                    
                    El usuario dice: "${message}"`
                  },
                  ...(imageInlineData ? [{ inlineData: imageInlineData }] : [])
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No entendí.";
      hideThinking();
      addMessage(reply, "bot");
      detectFilters(message);

    } catch (error) {
      console.error(error);
      hideThinking();
      addMessage("Error de conexión.", "bot");
    }
  }

  // listener envio de mensajes, si hay imagen adjunta, se envia junto con el texto
  sendBtn.addEventListener("click", async () => {
    const text = (input.value || "").trim();
    if (!text && !pendingImageBase64) return; 
    if (text) addMessage(text, "user");
    input.value = "";
    const imageData = pendingImageBase64 && pendingImageFile ? { mimeType: pendingImageFile.type, data: pendingImageBase64 } : null;
    await generateAIResponse(text, imageData);
    clearAttachment();
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // listener al click abrir el selector de archivos
  imageBtn.addEventListener("click", () => imageUpload.click());

  // Al seleccionar una imagen, solo se adjunta sin enviar
  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await setAttachment(file);
  });

  // Convierte una imagen a base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});