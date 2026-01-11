/* js/profile.js */

// Claves para LocalStorage
const KEY_PREFERENCIAS = "vestia_user_prefs";
const KEY_CHAT_HISTORY = "vestia_chat_history";
const KEY_BUSQUEDA = "vestia_last_search";

// --- GESTIÓN DE PREFERENCIAS (FILTROS) ---

export function guardarBusqueda(termino) {
  if (!termino) return;
  localStorage.setItem(KEY_BUSQUEDA, termino);
  console.log("Búsqueda guardada para contexto:", termino);
}

export function getUltimaBusqueda() {
  return localStorage.getItem(KEY_BUSQUEDA) || "";
}

// --- NUEVO: Generador de Contexto para el Bot ---
// Esta función crea un texto resumen de lo que el usuario está viendo/haciendo
export function obtenerContextoActual() {
  const prefs = getUserPreferences();
  const busqueda = getUltimaBusqueda();
  
  let contexto = "CONTEXTO ACTUAL DEL USUARIO EN LA TIENDA:\n";
  
  if (busqueda) {
    contexto += `- El usuario buscó recientemente: "${busqueda}"\n`;
  }
  
  const filtrosActivos = [];
  if (prefs.categoria) filtrosActivos.push(`Categoría: ${prefs.categoria}`);
  if (prefs.color) filtrosActivos.push(`Color: ${prefs.color}`);
  if (prefs.talla) filtrosActivos.push(`Talla: ${prefs.talla}`);
  if (prefs.ocasion) filtrosActivos.push(`Ocasión: ${prefs.ocasion}`);
  
  if (filtrosActivos.length > 0) {
    contexto += `- Filtros aplicados actualmente: ${filtrosActivos.join(", ")}.\n`;
    contexto += "NOTA: Si sugieres productos, prioriza estos filtros sobre otros.";
  } else {
    contexto += "- El usuario está navegando sin filtros específicos por ahora.";
  }
  
  return contexto;
}

export function guardarPreferencias(nuevasPreferencias) {
  const actuales = getUserPreferences();
  // Fusionamos las actuales con las nuevas para no borrar datos previos
  const actualizadas = { ...actuales, ...nuevasPreferencias };
  localStorage.setItem(KEY_PREFERENCIAS, JSON.stringify(actualizadas));
  console.log("Preferencias guardadas:", actualizadas);
}

export function getUserPreferences() {
  const stored = localStorage.getItem(KEY_PREFERENCIAS);
  return stored ? JSON.parse(stored) : {};
}

// Aplica los valores guardados a los selectores HTML al cargar la página
export function applyPreferencesToFilters() {
  const prefs = getUserPreferences();
  
  const mapCampos = {
    categoria: "categorySelect",
    color: "colorSelect",
    talla: "sizeSelect",
    ocasion: "occasionSelect" // Agregado para cumplir con estilo/ocasión
  };

  // Recorremos y asignamos si existe el elemento y la preferencia
  Object.keys(mapCampos).forEach(key => {
    const element = document.getElementById(mapCampos[key]);
    if (element && prefs[key]) {
      element.value = prefs[key];
      // Disparamos el evento 'change' manualmente para que los filtros se activen visualmente
      element.dispatchEvent(new Event('change'));
    }
  });
}

// Escucha cambios en los selects para guardar automáticamente
export function setupFilterListeners() {
  const ids = ["categorySelect", "colorSelect", "sizeSelect", "occasionSelect"];
  
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {
        // Mapeamos el ID del input a la clave de preferencia
        const key = id.replace("Select", "").toLowerCase().replace("occasion", "ocasion").replace("category", "categoria").replace("size", "talla");
        guardarPreferencias({ [key]: el.value });
      });
    }
  });
}

// --- GESTIÓN DEL HISTORIAL DEL CHAT (REQUERIMIENTO 55) ---

export function getChatHistory() {
  const stored = localStorage.getItem(KEY_CHAT_HISTORY);
  return stored ? JSON.parse(stored) : [];
}

export function saveChatMessage(text, sender) {
  const history = getChatHistory();
  // Agregamos el nuevo mensaje
  history.push({ text, sender, timestamp: new Date().toISOString() });
  // Limitamos el historial a los últimos 50 mensajes para no llenar la memoria
  if (history.length > 50) history.shift(); 
  
  localStorage.setItem(KEY_CHAT_HISTORY, JSON.stringify(history));
}

export function clearChatHistory() {
  localStorage.removeItem(KEY_CHAT_HISTORY);
}