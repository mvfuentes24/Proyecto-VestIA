import { GEMINI_API_KEY, GEMINI_MODEL } from "./config.js";
import { guardarPreferencias } from "./profile.js";

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const imageBtn = document.getElementById("imageBtn");
  const imageUpload = document.getElementById("imageUpload");

  // Mostrar mensajes en el chat
  function addMessage(text, sender = "user") {
    const msg = document.createElement("p");
    msg.className = sender === "user" ? "user-message" : "bot-message";
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Detectar palabras clave y aplicar filtros
  function detectarFiltros(texto) {
    const categorias = {
      blusa: "tops",
      blusas: "tops",
      pantalón: "pants",
      pantalones: "pants",
      vestido: "dresses",
      vestidos: "dresses",
      accesorio: "accessories",
      accesorios: "accessories"
    };

    const colores = {
      negro: "black",
      blanco: "white",
      beige: "beige"
    };

    const tallas = ["S", "M", "L"];

    let categoria = null;
    let color = null;
    let talla = null;

    // Buscar coincidencias
    for (const [palabra, valor] of Object.entries(categorias)) {
      if (texto.toLowerCase().includes(palabra)) categoria = valor;
    }
    for (const [palabra, valor] of Object.entries(colores)) {
      if (texto.toLowerCase().includes(palabra)) color = valor;
    }
    for (const t of tallas) {
      if (texto.toUpperCase().includes(t)) talla = t;
    }

    if (categoria || color || talla) {
      guardarPreferencias({ categoria, color, talla });
      addMessage(
        `He aplicado tus filtros: ${categoria || "todos"}, ${color || "todos"}, ${talla || "todas"}`,
        "bot"
      );
    }
  }

  // Llamada a la API REST de Gemini
  async function sendToGemini(message) {
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
                    text: `Eres VestIA, un estilista virtual. 
                    El usuario dice: "${message}". 
                    Responde con sugerencias de moda y menciona productos del catálogo (blusas, pantalones, vestidos, accesorios).`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No entendí tu mensaje.";
      addMessage(reply, "bot");

      // Detectar filtros en el mensaje
      detectarFiltros(message);
    } catch (error) {
      console.error(error);
      addMessage("Error al conectar con el asistente.", "bot");
    }
  }

  // Botón enviar texto
  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    sendToGemini(text);
  });

  // Botón abrir selector de imagen
  imageBtn.addEventListener("click", () => {
    imageUpload.click();
  });

  // Subir imagen y analizar
  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addMessage("📷 Imagen subida, analizando...", "user");

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
                  { text: "Analiza esta prenda y sugiere combinaciones dentro del catálogo VestIA." },
                  { inlineData: { mimeType: file.type, data: base64 } }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No se pudo analizar la imagen.";
      addMessage(reply, "bot");
    } catch (error) {
      console.error(error);
      addMessage("Error al analizar la imagen.", "bot");
    }
  });

  // Convertir imagen a Base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});