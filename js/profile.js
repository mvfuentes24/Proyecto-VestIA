import { KEY_PREFERENCIAS, KEY_CHAT_HISTORY, KEY_BUSQUEDA } from './config.js';

// guardarBusqueda
//  Guarda la última búsqueda del usuario en localStorage
export function guardarBusqueda(termino) {
  if (!termino) return;
  localStorage.setItem(KEY_BUSQUEDA, termino);
  console.log("Búsqueda guardada para contexto:", termino);
}

export function getUltimaBusqueda() {
  return localStorage.getItem(KEY_BUSQUEDA) || "";
}


// obtenerContextoActual
//  Genera un string resumido del estado actual del usuario (última búsqueda y filtros aplicados). 
export function obtenerContextoActual() {
  const prefs = getPreferencias();
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

// guardarPreferencias
//  Fusiona las preferencias recibidas con las almacenadas
export function guardarPreferencias(nuevasPreferencias) {
  const actuales = getPreferencias();

  const actualizadas = { ...actuales, ...nuevasPreferencias };
  localStorage.setItem(KEY_PREFERENCIAS, JSON.stringify(actualizadas));
  console.log("Preferencias guardadas:", actualizadas);
}

export function getPreferencias() {
  const stored = localStorage.getItem(KEY_PREFERENCIAS);
  return stored ? JSON.parse(stored) : {};
}


// applyPreferencesToFilters
//  Lee las preferencias del usuario y las aplica a los selects del DOM
export function applyPreferencesToFilters() {
  const prefs = getPreferencias();
  
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


export function setupFilterListeners() {
  const ids = ["categorySelect", "colorSelect", "sizeSelect", "occasionSelect"];
  
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {
        // Mapea el id del select a la clave de preferencia y guarda el valor
        const key = id.replace("Select", "").toLowerCase().replace("occasion", "ocasion").replace("category", "categoria").replace("size", "talla");
        guardarPreferencias({ [key]: el.value });
      });
    }
  });
}