// js/chatbot.js

import { getUserPreferences, guardarPreferencias } from './profile.js';
import { GEMINI_API_KEY } from './config.js';

const chatContainer = document.getElementById('chat-container');
const inputField = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

let conversationHistory = [];

/**
 * Muestra un mensaje en el chat
 */
function displayMessage(text, sender = 'bot') {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.innerText = text;
  chatContainer.appendChild(message);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Envía la conversación a Gemini y obtiene respuesta
 */
async function sendToGemini(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error en la solicitud a Gemini');
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content || 'Lo siento, no entendí eso.';
    conversationHistory.push({ role: 'bot', content: botReply });

    displayMessage(botReply, 'bot');
    handleRecommendation(botReply);
  } catch (error) {
    console.error('Error al comunicarse con Gemini:', error);
    displayMessage('Hubo un problema al conectar con el asistente. Por favor, intenta nuevamente.', 'bot');
  }
}

/**
 * Detecta recomendaciones y crea botón para aplicar filtros
 */
function handleRecommendation(text) {
  const match = text.match(/Recomiendo.*?: (.*)/i);
  if (match) {
    const filters = match[1];

    // Eliminar botones anteriores
    const existingButton = document.querySelector('.recommendation-button');
    if (existingButton) existingButton.remove();

    const button = document.createElement('button');
    button.innerText = 'Ver recomendaciones';
    button.className = 'btn btn-primary mt-2 recommendation-button';
    button.onclick = () => applyFiltersFromChat(filters);
    chatContainer.appendChild(button);
  }
}

/**
 * Aplica filtros sugeridos por el chatbot
 */
function applyFiltersFromChat(filterText) {
  const preferences = parsePreferences(filterText);
  guardarPreferencias(preferences);

  // Aplicar filtros directamente en la página actual
  const categoriaSelect = document.querySelector('.filter-box select:nth-child(2)');
  const colorSelect = document.querySelector('.filter-box select:nth-child(4)');
  const tallaSelect = document.querySelector('.filter-box select:nth-child(6)');

  if (categoriaSelect && preferences.categoria) categoriaSelect.value = preferences.categoria;
  if (colorSelect && preferences.color) colorSelect.value = preferences.color;
  if (tallaSelect && preferences.talla) tallaSelect.value = preferences.talla;

  displayMessage('Filtros aplicados: ' + JSON.stringify(preferences), 'bot');
}

/**
 * Extrae preferencias desde texto
 */
function parsePreferences(text) {
  const categoria = text.match(/categoría (\w+)/i)?.[1] || '';
  const color = text.match(/color (\w+)/i)?.[1] || '';
  const talla = text.match(/talla (\w+)/i)?.[1] || '';
  return { categoria, color, talla };
}

// Evento de envío
sendButton.addEventListener('click', () => {
  const userMessage = inputField.value.trim();
  if (userMessage) {
    displayMessage(userMessage, 'user');
    sendToGemini(userMessage);
    inputField.value = '';
  }
});