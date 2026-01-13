import { KEY_PREFERENCIAS, KEY_CHAT_HISTORY, KEY_BUSQUEDA } from './config.js';

// guarda la ultima busqueda realizada
export function saveSearch(termino) {
  if (!termino) return;
  localStorage.setItem(KEY_BUSQUEDA, termino);
  console.log("Búsqueda guardada para contexto:", termino);
}

export function getLastSearch() {
  return localStorage.getItem(KEY_BUSQUEDA) || "";
}


// genera un texto con el contexto actual del usuario
export function getCurrentContext() {
  const prefs = getPreferences();
  const busqueda = getLastSearch();

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

// guarda las preferencias en localStorage
export function savePreferences(nuevasPreferencias) {
  const actuales = getPreferences();

  const actualizadas = { ...actuales, ...nuevasPreferencias };
  localStorage.setItem(KEY_PREFERENCIAS, JSON.stringify(actualizadas));
  console.log("Preferencias guardadas:", actualizadas);
}

export function getPreferences() {
  const stored = localStorage.getItem(KEY_PREFERENCIAS);
  return stored ? JSON.parse(stored) : {};
}


//  Lee las preferencias del usuario y las aplica a los selects 
export function applyPreferencesToFilters() {
  const prefs = getPreferences();
  
  const mapCampos = {
    categoria: "categorySelect",
    color: "colorSelect",
    talla: "sizeSelect",
    ocasion: "occasionSelect" 
  };

  Object.keys(mapCampos).forEach(key => {
    const element = document.getElementById(mapCampos[key]);
    if (element && prefs[key]) {
      element.value = prefs[key];
      element.dispatchEvent(new Event('change'));
    }
  });
}

//listeners para guardar preferencias al cambiar los filtros
export function setupFilterListeners() {
  const ids = ["categorySelect", "colorSelect", "sizeSelect", "occasionSelect"];
  
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {

        const key = id.replace("Select", "").toLowerCase().replace("occasion", "ocasion").replace("category", "categoria").replace("size", "talla");
        savePreferences({ [key]: el.value });
      });
    }
  });
}