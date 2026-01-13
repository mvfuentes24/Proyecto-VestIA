const CLAVE_PREFERENCIAS = 'vestia_user_preferencias';

export function guardarPreferencias(preferencias) {
  if (!preferencias || typeof preferencias !== 'object') {
    console.error('Preferencias inválidas:', preferencias);
    return;
  }
  try {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
    console.log('Preferencias guardadas:', preferencias);
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
  }
}

export function getUserPreferences() {
  try {
    const stored = localStorage.getItem(CLAVE_PREFERENCIAS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error al recuperar preferencias:', error);
    return null;
  }
}

export function applyPreferencesToFilters(applyFilters) {
  if (typeof applyFilters !== 'function') {
    console.error('applyFilters no es una función válida:', applyFilters);
    return;
  }
  const preferencias = getUserPreferences();
  if (preferencias) {
    applyFilters(preferencias);
  }
}